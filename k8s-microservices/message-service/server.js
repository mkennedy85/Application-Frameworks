const express = require('express');
const cors = require('cors');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3002;
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const MAX_MESSAGES = process.env.MAX_MESSAGES || 1000;

// Middleware
app.use(cors());
app.use(express.json());

// Redis client
let redisClient;
let isRedisConnected = false;

// In-memory fallback storage
const inMemoryMessages = [];

// Initialize Redis
async function initRedis() {
  try {
    redisClient = redis.createClient({
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis Error:', err);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
      isRedisConnected = true;
    });

    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    isRedisConnected = false;
    console.log('Using in-memory storage as fallback');
    setTimeout(initRedis, 5000);
  }
}

// Save message
async function saveMessage(message) {
  const messageData = {
    id: generateMessageId(),
    username: message.username,
    content: message.content,
    timestamp: message.timestamp || new Date().toISOString()
  };

  if (isRedisConnected) {
    try {
      // Add message to sorted set with timestamp as score
      await redisClient.zAdd('chat-messages', {
        score: Date.now(),
        value: JSON.stringify(messageData)
      });

      // Keep only the latest MAX_MESSAGES messages
      const count = await redisClient.zCard('chat-messages');
      if (count > MAX_MESSAGES) {
        const removeCount = count - MAX_MESSAGES;
        await redisClient.zPopMin('chat-messages', removeCount);
      }
    } catch (err) {
      console.error('Redis error, using in-memory:', err);
      addToInMemory(messageData);
    }
  } else {
    addToInMemory(messageData);
  }

  return messageData;
}

// Add message to in-memory storage
function addToInMemory(message) {
  inMemoryMessages.push(message);
  if (inMemoryMessages.length > MAX_MESSAGES) {
    inMemoryMessages.shift();
  }
}

// Get messages with pagination
async function getMessages(limit = 50, offset = 0) {
  if (isRedisConnected) {
    try {
      // Get messages from sorted set (newest first)
      const messages = await redisClient.zRange('chat-messages', -limit - offset, -1 - offset, {
        REV: true
      });
      return messages.map(msg => JSON.parse(msg)).reverse();
    } catch (err) {
      console.error('Redis error, using in-memory:', err);
      return getFromInMemory(limit, offset);
    }
  } else {
    return getFromInMemory(limit, offset);
  }
}

// Get messages from in-memory storage
function getFromInMemory(limit, offset) {
  const start = Math.max(0, inMemoryMessages.length - limit - offset);
  const end = inMemoryMessages.length - offset;
  return inMemoryMessages.slice(start, end);
}

// Get message count
async function getMessageCount() {
  if (isRedisConnected) {
    try {
      return await redisClient.zCard('chat-messages');
    } catch (err) {
      console.error('Redis error, using in-memory:', err);
      return inMemoryMessages.length;
    }
  } else {
    return inMemoryMessages.length;
  }
}

// Generate unique message ID
function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    redis: isRedisConnected,
    storage: isRedisConnected ? 'redis' : 'in-memory'
  });
});

// Save a message
app.post('/api/messages', async (req, res) => {
  try {
    const { username, content, timestamp } = req.body;

    if (!username || !content) {
      return res.status(400).json({ error: 'Username and content are required' });
    }

    const message = await saveMessage({ username, content, timestamp });
    console.log(`Message saved from ${username}`);

    res.status(201).json({
      message: 'Message saved successfully',
      data: message
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Get messages with pagination
app.get('/api/messages', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const messages = await getMessages(limit, offset);

    res.json({
      messages,
      count: messages.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Get message count
app.get('/api/messages/count', async (req, res) => {
  try {
    const count = await getMessageCount();
    res.json({ count });
  } catch (error) {
    console.error('Error getting message count:', error);
    res.status(500).json({ error: 'Failed to get message count' });
  }
});

// Get recent messages (convenience endpoint)
app.get('/api/messages/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const messages = await getMessages(limit, 0);

    res.json(messages);
  } catch (error) {
    console.error('Error getting recent messages:', error);
    res.status(500).json({ error: 'Failed to get recent messages' });
  }
});

// Clear all messages (for testing/admin purposes)
app.delete('/api/messages', async (req, res) => {
  try {
    if (isRedisConnected) {
      await redisClient.del('chat-messages');
    }
    inMemoryMessages.length = 0;

    console.log('All messages cleared');
    res.json({ message: 'All messages cleared successfully' });
  } catch (error) {
    console.error('Error clearing messages:', error);
    res.status(500).json({ error: 'Failed to clear messages' });
  }
});

// Get messages by username
app.get('/api/messages/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const allMessages = await getMessages(1000, 0);
    const userMessages = allMessages
      .filter(msg => msg.username === username)
      .slice(-limit);

    res.json({
      username,
      messages: userMessages,
      count: userMessages.length
    });
  } catch (error) {
    console.error('Error getting user messages:', error);
    res.status(500).json({ error: 'Failed to get user messages' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Message service listening on port ${PORT}`);
  initRedis();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');

  if (redisClient) {
    await redisClient.quit();
  }

  process.exit(0);
});
