# Real-Time Chat Application - CMPE 272 Assignment

This repository contains two implementations of a real-time chat application, each built with different technology stacks to demonstrate various application framework approaches.

## Project Overview

Both applications provide the same core functionality:
- Real-time messaging across multiple browser sessions
- User identification with usernames
- WebSocket-based communication
- Clean, responsive UI
- Docker containerization

## Technology Stacks

### Chat App 1: React + Node.js/Express
- **Frontend**: React 18 with functional components and hooks
- **Backend**: Node.js with Express and native WebSocket (ws library)
- **Communication**: Raw WebSocket protocol
- **Port**: Client on 3000, Server on 8080

### Chat App 2: Vue.js + Spring Boot
- **Frontend**: Vue.js 3 with Composition API
- **Backend**: Spring Boot 3 with STOMP/WebSocket support
- **Communication**: STOMP over WebSocket with SockJS fallback
- **Port**: Client on 3001, Server on 8081

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed
- Ports 3000, 3001, 8080, and 8081 available

## Running the Applications

### Option 1: Run Both Applications Simultaneously

From the project root directory:

```bash
# Start Chat App 1 (React + Node.js)
cd chat-app-1
docker-compose up --build

# In a new terminal, start Chat App 2 (Vue.js + Spring Boot)
cd chat-app-2
docker-compose up --build
```

### Option 2: Run Individual Applications

#### Chat App 1 (React + Node.js)

```bash
cd chat-app-1
docker-compose up --build
```

Access at: http://localhost:3000

#### Chat App 2 (Vue.js + Spring Boot)

```bash
cd chat-app-2
docker-compose up --build
```

Access at: http://localhost:3001

## Using the Applications

1. Open the application URL in your browser
2. Enter a username and click "Join Chat"
3. Type messages in the input field and click "Send"
4. Open additional browser windows/tabs to the same URL to see real-time synchronization
5. Messages will appear in all connected sessions instantly

## Project Structure

```
Application-Frameworks/
├── chat-app-1/                 # React + Node.js implementation
│   ├── client/                 # React frontend
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── App.js         # Main React component
│   │   │   ├── App.css        # Styling
│   │   │   └── index.js       # Entry point
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── package.json
│   ├── server/                 # Node.js/Express backend
│   │   ├── server.js          # WebSocket server
│   │   ├── Dockerfile
│   │   └── package.json
│   └── docker-compose.yml
│
├── chat-app-2/                 # Vue.js + Spring Boot implementation
│   ├── client/                 # Vue.js frontend
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── App.vue        # Main Vue component
│   │   │   └── main.js        # Entry point
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   ├── vue.config.js
│   │   └── package.json
│   ├── server/                 # Spring Boot backend
│   │   ├── src/
│   │   │   └── main/
│   │   │       └── java/
│   │   │           └── com/example/chat/
│   │   │               ├── ChatApplication.java
│   │   │               ├── config/
│   │   │               │   └── WebSocketConfig.java
│   │   │               ├── controller/
│   │   │               │   ├── ChatController.java
│   │   │               │   └── HealthController.java
│   │   │               ├── listener/
│   │   │               │   └── WebSocketEventListener.java
│   │   │               └── model/
│   │   │                   └── ChatMessage.java
│   │   ├── Dockerfile
│   │   └── pom.xml
│   └── docker-compose.yml
│
├── README.md
└── WRITEUP.md
```

## Development Mode (Without Docker)

### Chat App 1

**Server:**
```bash
cd chat-app-1/server
npm install
npm start
```

**Client:**
```bash
cd chat-app-1/client
npm install
npm start
```

### Chat App 2

**Server:**
```bash
cd chat-app-2/server
mvn spring-boot:run
```

**Client:**
```bash
cd chat-app-2/client
npm install
npm run serve
```

## Stopping the Applications

Press `Ctrl+C` in the terminal running docker-compose, then:

```bash
docker-compose down
```

## Troubleshooting

### Port Already in Use
If you get port conflicts, ensure no other applications are using ports 3000, 3001, 8080, or 8081.

```bash
# Check what's using a port (macOS/Linux)
lsof -i :3000
lsof -i :8080

# Kill process if needed
kill -9 <PID>
```

### Docker Build Issues
```bash
# Clean up Docker resources
docker-compose down -v
docker system prune -f

# Rebuild from scratch
docker-compose up --build --force-recreate
```

### WebSocket Connection Failed
- Ensure both client and server containers are running
- Check browser console for error messages
- Verify firewall settings aren't blocking WebSocket connections

## Key Features Demonstrated

1. **Real-time Communication**: Bidirectional communication using WebSockets
2. **State Management**: Client-side state handling in React (useState, useEffect) and Vue.js (reactive data)
3. **Connection Handling**: Automatic reconnection on disconnect
4. **Message Broadcasting**: Server broadcasts messages to all connected clients
5. **Containerization**: Complete Docker setup for easy deployment
6. **RESTful Health Checks**: Both servers expose /health endpoints

## Testing the Real-Time Functionality

1. Start either application
2. Open the app in Browser Window 1
3. Join with username "Alice"
4. Open the app in Browser Window 2 (new window or incognito)
5. Join with username "Bob"
6. Send messages from Alice - they appear in Bob's window instantly
7. Send messages from Bob - they appear in Alice's window instantly
8. Open a third window to see all messages synchronized across all sessions

## Architecture Highlights

### Chat App 1 (React + Node.js)
- **Model**: ChatMessage (JSON format in WebSocket messages)
- **View**: React components with CSS styling
- **Controller**: WebSocket message handlers in server.js and App.js event handlers

### Chat App 2 (Vue.js + Spring Boot)
- **Model**: ChatMessage POJO with Spring Data
- **View**: Vue.js single-file components
- **Controller**: Spring @Controller with @MessageMapping annotations

## License

This project is created for educational purposes as part of CMPE 272 coursework.

## Author

Created for CMPE 272 - Enterprise Application Development
Fall 2025 - San Jose State University
