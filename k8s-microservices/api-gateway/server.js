const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 8080;

// Service URLs from environment variables
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const MESSAGE_SERVICE_URL = process.env.MESSAGE_SERVICE_URL || 'http://message-service:3002';
const WEBSOCKET_SERVICE_URL = process.env.WEBSOCKET_SERVICE_URL || 'http://websocket-service:8080';

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Gateway info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    service: 'Chat Application API Gateway',
    version: '1.0.0',
    endpoints: {
      users: '/api/users/*',
      messages: '/api/messages/*',
      websocket: 'ws://localhost:8080 (direct connection)'
    }
  });
});

// Proxy configuration for User Service
app.use('/api/users', createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users'
  },
  onError: (err, req, res) => {
    console.error('User Service Proxy Error:', err);
    res.status(503).json({
      error: 'User service unavailable',
      message: err.message
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying to User Service: ${req.method} ${req.url}`);
  }
}));

// Proxy configuration for Message Service
app.use('/api/messages', createProxyMiddleware({
  target: MESSAGE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/messages': '/api/messages'
  },
  onError: (err, req, res) => {
    console.error('Message Service Proxy Error:', err);
    res.status(503).json({
      error: 'Message service unavailable',
      message: err.message
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying to Message Service: ${req.method} ${req.url}`);
  }
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.url} not found`,
    availableRoutes: [
      'GET /health',
      'GET /api/info',
      'GET /api/users',
      'POST /api/users/join',
      'POST /api/users/leave',
      'GET /api/messages',
      'POST /api/messages',
      'WebSocket: ws://host:port/'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
  console.log(`Proxying requests to:`);
  console.log(`  - User Service: ${USER_SERVICE_URL}`);
  console.log(`  - Message Service: ${MESSAGE_SERVICE_URL}`);
  console.log(`  - WebSocket Service: ${WEBSOCKET_SERVICE_URL}`);
});

// WebSocket proxy configuration
const wsProxy = createProxyMiddleware({
  target: WEBSOCKET_SERVICE_URL,
  ws: true,
  changeOrigin: true,
  logLevel: 'debug',
  onError: (err, req, socket) => {
    console.error('WebSocket Proxy Error:', err);
    socket.end();
  },
  onProxyReqWs: (proxyReq, req, socket, options, head) => {
    console.log('WebSocket connection upgrade - proxying to:', WEBSOCKET_SERVICE_URL);
  },
  onOpen: (proxySocket) => {
    console.log('WebSocket proxy connection opened');
  },
  onClose: (res, socket, head) => {
    console.log('WebSocket proxy connection closed');
  }
});

// Handle WebSocket upgrade requests
server.on('upgrade', (request, socket, head) => {
  console.log('WebSocket upgrade request received from:', request.headers.origin);
  console.log('Upgrade URL:', request.url);

  // Use the proxy middleware to handle the upgrade
  wsProxy.upgrade(request, socket, head);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');

  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
