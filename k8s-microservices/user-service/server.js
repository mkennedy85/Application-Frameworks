const express = require('express');
const cors = require('cors');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3001;
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

// Middleware
app.use(cors());
app.use(express.json());

// Redis client
let redisClient;
let isRedisConnected = false;

// In-memory fallback storage
const inMemoryUsers = new Map();

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

// Add user to online users
async function addUser(username, clientId) {
  const userData = {
    username,
    clientId,
    joinedAt: new Date().toISOString()
  };

  if (isRedisConnected) {
    try {
      await redisClient.hSet('online-users', username, JSON.stringify(userData));
    } catch (err) {
      console.error('Redis error, using in-memory:', err);
      inMemoryUsers.set(username, userData);
    }
  } else {
    inMemoryUsers.set(username, userData);
  }
}

// Remove user from online users
async function removeUser(username) {
  if (isRedisConnected) {
    try {
      await redisClient.hDel('online-users', username);
    } catch (err) {
      console.error('Redis error, using in-memory:', err);
      inMemoryUsers.delete(username);
    }
  } else {
    inMemoryUsers.delete(username);
  }
}

// Get all online users
async function getOnlineUsers() {
  if (isRedisConnected) {
    try {
      const users = await redisClient.hGetAll('online-users');
      return Object.keys(users);
    } catch (err) {
      console.error('Redis error, using in-memory:', err);
      return Array.from(inMemoryUsers.keys());
    }
  } else {
    return Array.from(inMemoryUsers.keys());
  }
}

// Get user count
async function getUserCount() {
  if (isRedisConnected) {
    try {
      return await redisClient.hLen('online-users');
    } catch (err) {
      console.error('Redis error, using in-memory:', err);
      return inMemoryUsers.size;
    }
  } else {
    return inMemoryUsers.size;
  }
}

// Check if user exists
async function userExists(username) {
  if (isRedisConnected) {
    try {
      return await redisClient.hExists('online-users', username);
    } catch (err) {
      console.error('Redis error, using in-memory:', err);
      return inMemoryUsers.has(username);
    }
  } else {
    return inMemoryUsers.has(username);
  }
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

// Get all online users
app.get('/api/users', async (req, res) => {
  try {
    const users = await getOnlineUsers();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user count
app.get('/api/users/count', async (req, res) => {
  try {
    const count = await getUserCount();
    res.json({ count });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ error: 'Failed to get user count' });
  }
});

// Check if username is available
app.get('/api/users/check/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const exists = await userExists(username);
    res.json({ available: !exists });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Failed to check username' });
  }
});

// User join
app.post('/api/users/join', async (req, res) => {
  try {
    const { username, clientId } = req.body;

    if (!username || !clientId) {
      return res.status(400).json({ error: 'Username and clientId are required' });
    }

    // Check if username is already taken
    const exists = await userExists(username);
    if (exists) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    await addUser(username, clientId);
    console.log(`User joined: ${username}`);

    res.status(201).json({
      message: 'User joined successfully',
      username
    });
  } catch (error) {
    console.error('Error handling user join:', error);
    res.status(500).json({ error: 'Failed to join user' });
  }
});

// User leave
app.post('/api/users/leave', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    await removeUser(username);
    console.log(`User left: ${username}`);

    res.json({
      message: 'User left successfully',
      username
    });
  } catch (error) {
    console.error('Error handling user leave:', error);
    res.status(500).json({ error: 'Failed to remove user' });
  }
});

// Get specific user info
app.get('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;

    if (isRedisConnected) {
      const userData = await redisClient.hGet('online-users', username);
      if (userData) {
        res.json(JSON.parse(userData));
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      const userData = inMemoryUsers.get(username);
      if (userData) {
        res.json(userData);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`User service listening on port ${PORT}`);
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
