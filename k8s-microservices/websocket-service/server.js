const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const redis = require('redis');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configuration from environment variables
const PORT = process.env.PORT || 8080;
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const MESSAGE_SERVICE_URL = process.env.MESSAGE_SERVICE_URL || 'http://message-service:3002';

// Redis clients for pub/sub
let redisPublisher;
let redisSubscriber;
let isRedisConnected = false;

// Store connected clients
const clients = new Map();

// Initialize Redis connections
async function initRedis() {
  try {
    redisPublisher = redis.createClient({
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
      }
    });

    redisSubscriber = redis.createClient({
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
      }
    });

    redisPublisher.on('error', (err) => {
      console.error('Redis Publisher Error:', err);
      isRedisConnected = false;
    });

    redisSubscriber.on('error', (err) => {
      console.error('Redis Subscriber Error:', err);
      isRedisConnected = false;
    });

    await redisPublisher.connect();
    await redisSubscriber.connect();

    // Subscribe to chat channel
    await redisSubscriber.subscribe('chat-messages', (message) => {
      try {
        const data = JSON.parse(message);
        broadcastToClients(data);
      } catch (err) {
        console.error('Error processing Redis message:', err);
      }
    });

    isRedisConnected = true;
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    isRedisConnected = false;
    // Retry connection after 5 seconds
    setTimeout(initRedis, 5000);
  }
}

// Broadcast message to all connected clients
function broadcastToClients(data) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Publish message to Redis
async function publishMessage(data) {
  if (isRedisConnected) {
    try {
      await redisPublisher.publish('chat-messages', JSON.stringify(data));
    } catch (err) {
      console.error('Error publishing to Redis:', err);
      // Fallback to local broadcast if Redis fails
      broadcastToClients(data);
    }
  } else {
    // Fallback to local broadcast if Redis is not connected
    broadcastToClients(data);
  }
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  const clientId = generateClientId();
  clients.set(clientId, ws);
  console.log(`Client connected: ${clientId}`);

  let username = null;

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join':
          username = data.username;
          await handleUserJoin(username, clientId);
          break;

        case 'message':
          await handleMessage(data);
          break;

        case 'leave':
          await handleUserLeave(username, clientId);
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  ws.on('close', async () => {
    clients.delete(clientId);
    if (username) {
      await handleUserLeave(username, clientId);
    }
    console.log(`Client disconnected: ${clientId}`);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
  });
});

// Handle user join
async function handleUserJoin(username, clientId) {
  try {
    // Register user with user service
    await axios.post(`${USER_SERVICE_URL}/api/users/join`, {
      username,
      clientId
    });

    // Get list of online users
    const response = await axios.get(`${USER_SERVICE_URL}/api/users`);
    const users = response.data;

    // Send user list to the joining user
    const client = clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'userList',
        users: users
      }));
    }

    // Broadcast join message
    await publishMessage({
      type: 'userJoined',
      username: username,
      content: `${username} joined the chat`,
      timestamp: new Date().toISOString()
    });

    // Broadcast updated user list
    await publishMessage({
      type: 'userList',
      users: users
    });

    console.log(`User joined: ${username}`);
  } catch (error) {
    console.error('Error handling user join:', error);
  }
}

// Handle chat message
async function handleMessage(data) {
  try {
    // Save message to message service
    await axios.post(`${MESSAGE_SERVICE_URL}/api/messages`, {
      username: data.username,
      content: data.content,
      timestamp: data.timestamp
    });

    // Publish message to all clients via Redis
    await publishMessage({
      type: 'message',
      username: data.username,
      content: data.content,
      timestamp: data.timestamp
    });

    console.log(`Message from ${data.username}: ${data.content}`);
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

// Handle user leave
async function handleUserLeave(username, clientId) {
  if (!username) return;

  try {
    // Remove user from user service
    await axios.post(`${USER_SERVICE_URL}/api/users/leave`, {
      username,
      clientId
    });

    // Get updated user list
    const response = await axios.get(`${USER_SERVICE_URL}/api/users`);
    const users = response.data;

    // Broadcast leave message
    await publishMessage({
      type: 'userLeft',
      username: username,
      content: `${username} left the chat`,
      timestamp: new Date().toISOString()
    });

    // Broadcast updated user list
    await publishMessage({
      type: 'userList',
      users: users
    });

    console.log(`User left: ${username}`);
  } catch (error) {
    console.error('Error handling user leave:', error);
  }
}

// Generate unique client ID
function generateClientId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    redis: isRedisConnected,
    connections: clients.size
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.status(200).json({
    activeConnections: clients.size,
    redisConnected: isRedisConnected
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`WebSocket service listening on port ${PORT}`);
  initRedis();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');

  // Close all WebSocket connections
  clients.forEach((client) => {
    client.close();
  });

  // Close Redis connections
  if (redisPublisher) await redisPublisher.quit();
  if (redisSubscriber) await redisSubscriber.quit();

  // Close HTTP server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
