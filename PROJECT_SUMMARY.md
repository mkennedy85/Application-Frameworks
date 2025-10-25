# Project Summary - Real-Time Chat Applications

## Overview
This repository contains two fully functional real-time chat applications built with different technology stacks as part of CMPE 272 coursework. Both applications demonstrate WebSocket-based real-time communication with Docker containerization.

## What Has Been Created

### Chat Application 1: React + Node.js/Express
**Technology Stack:**
- Frontend: React 18 with hooks (useState, useEffect, useRef)
- Backend: Node.js with Express and native WebSocket (ws library)
- Real-time Protocol: Raw WebSocket
- Containerization: Docker with multi-stage builds
- Web Server: Nginx for production serving

**Key Files:**
- `chat-app-1/client/src/App.js` - Main React component with WebSocket logic
- `chat-app-1/client/src/App.css` - Responsive styling with animations
- `chat-app-1/server/server.js` - Express server with WebSocket broadcasting
- `chat-app-1/docker-compose.yml` - Container orchestration

**Architecture:**
- Client connects via WebSocket to server
- Server broadcasts messages to all connected clients
- React state management for messages and connection status
- Automatic reconnection on disconnect

### Chat Application 2: Vue.js + Spring Boot
**Technology Stack:**
- Frontend: Vue.js 3 with single-file components
- Backend: Spring Boot 3 with STOMP/WebSocket support
- Real-time Protocol: STOMP over WebSocket with SockJS fallback
- Build Tool: Maven for Java compilation
- Containerization: Docker with multi-stage builds

**Key Files:**
- `chat-app-2/client/src/App.vue` - Vue single-file component
- `chat-app-2/server/src/main/java/com/example/chat/ChatApplication.java` - Spring Boot entry point
- `chat-app-2/server/src/main/java/com/example/chat/config/WebSocketConfig.java` - WebSocket configuration
- `chat-app-2/server/src/main/java/com/example/chat/controller/ChatController.java` - Message handling
- `chat-app-2/server/src/main/java/com/example/chat/model/ChatMessage.java` - Data model
- `chat-app-2/server/src/main/java/com/example/chat/listener/WebSocketEventListener.java` - Connection events

**Architecture:**
- STOMP protocol for pub/sub messaging
- Spring annotations for declarative routing (@MessageMapping, @SendTo)
- Event-driven architecture with listeners
- Java POJOs for type-safe data models

## Documentation Files

1. **README.md** - Complete documentation including:
   - Project overview
   - Technology stack details
   - Running instructions (Docker & development mode)
   - Troubleshooting guide
   - Project structure
   - Testing instructions

2. **WRITEUP.md** - One-page academic writeup containing:
   - Framework comparison (strengths & weaknesses)
   - MVC architecture analysis for both apps
   - Justification for design decisions
   - Technology selection rationale

3. **QUICKSTART.md** - Quick reference guide:
   - Fast start commands
   - Port information
   - Common troubleshooting
   - Development setup

4. **.gitignore** - Excludes:
   - node_modules, target directories
   - Build artifacts
   - IDE files
   - Environment files

5. **Convenience Scripts:**
   - `start-app1.sh` - One-command launcher for React app
   - `start-app2.sh` - One-command launcher for Vue app

## Features Implemented

### Core Functionality
- Real-time message broadcasting across all connected sessions
- Username-based identification
- Join/leave notifications
- Message timestamps
- Connection status indicators
- Automatic reconnection on disconnect

### UI Features
- Clean, modern interface with gradient designs
- Responsive layout
- Message animations
- Scrollable message history
- Auto-scroll to latest message
- Visual distinction between own messages and others
- System messages for join/leave events
- Disabled state when disconnected

### Technical Features
- WebSocket connections for real-time communication
- Docker containerization for easy deployment
- Multi-stage Docker builds for optimized images
- Health check endpoints
- CORS configuration
- Production-ready nginx configuration
- Error handling and reconnection logic

## How to Run

**Quick Start (Docker):**
```bash
# Chat App 1
./start-app1.sh
# Visit http://localhost:3000

# Chat App 2
./start-app2.sh
# Visit http://localhost:3001
```

**Manual Start:**
```bash
# Chat App 1
cd chat-app-1
docker-compose up --build

# Chat App 2
cd chat-app-2
docker-compose up --build
```

## Testing the Applications

1. Start either application
2. Open the application URL in a browser
3. Enter a username and join the chat
4. Open 2-3 more browser windows/tabs to the same URL
5. Enter different usernames in each window
6. Send messages from any window
7. Observe real-time synchronization across all windows

## Key Differences Between Implementations

| Aspect | React + Node.js | Vue.js + Spring Boot |
|--------|----------------|---------------------|
| **Language** | JavaScript | JavaScript + Java |
| **Backend Framework** | Express (minimal) | Spring Boot (comprehensive) |
| **WebSocket Protocol** | Native WebSocket | STOMP over WebSocket |
| **Architecture** | Lightweight, flexible | Enterprise, structured |
| **Type Safety** | Runtime only | Compile-time (Java) |
| **Learning Curve** | Gentle | Steeper |
| **Build Time** | Fast | Slower (Maven) |
| **Image Size** | Smaller | Larger |
| **Best For** | Startups, rapid dev | Enterprise, large teams |

## Project Structure

```
Application-Frameworks/
├── chat-app-1/                          # React + Node.js Implementation
│   ├── client/                          # React Frontend
│   │   ├── public/
│   │   │   └── index.html              # HTML template
│   │   ├── src/
│   │   │   ├── App.js                  # Main React component
│   │   │   ├── App.css                 # Styling
│   │   │   ├── index.js                # React entry point
│   │   │   └── index.css               # Global styles
│   │   ├── Dockerfile                  # Multi-stage build
│   │   ├── nginx.conf                  # Production server config
│   │   ├── package.json                # Dependencies
│   │   └── .env                        # Environment variables
│   ├── server/                          # Node.js Backend
│   │   ├── server.js                   # WebSocket server
│   │   ├── Dockerfile                  # Container config
│   │   └── package.json                # Dependencies
│   └── docker-compose.yml              # Orchestration
│
├── chat-app-2/                          # Vue.js + Spring Boot Implementation
│   ├── client/                          # Vue.js Frontend
│   │   ├── public/
│   │   │   └── index.html              # HTML template
│   │   ├── src/
│   │   │   ├── App.vue                 # Main Vue component
│   │   │   └── main.js                 # Vue entry point
│   │   ├── Dockerfile                  # Multi-stage build
│   │   ├── nginx.conf                  # Production server config
│   │   ├── vue.config.js               # Vue configuration
│   │   ├── package.json                # Dependencies
│   │   └── .env                        # Environment variables
│   ├── server/                          # Spring Boot Backend
│   │   ├── src/main/
│   │   │   ├── java/com/example/chat/
│   │   │   │   ├── ChatApplication.java          # Main class
│   │   │   │   ├── config/
│   │   │   │   │   └── WebSocketConfig.java      # WebSocket setup
│   │   │   │   ├── controller/
│   │   │   │   │   ├── ChatController.java       # Message handlers
│   │   │   │   │   └── HealthController.java     # Health endpoint
│   │   │   │   ├── listener/
│   │   │   │   │   └── WebSocketEventListener.java  # Event handling
│   │   │   │   └── model/
│   │   │   │       └── ChatMessage.java          # Data model
│   │   │   └── resources/
│   │   │       └── application.properties        # Spring config
│   │   ├── Dockerfile                  # Multi-stage build
│   │   └── pom.xml                     # Maven dependencies
│   └── docker-compose.yml              # Orchestration
│
├── README.md                            # Complete documentation
├── WRITEUP.md                          # Academic analysis
├── QUICKSTART.md                       # Quick reference
├── PROJECT_SUMMARY.md                  # This file
├── .gitignore                          # Git exclusions
├── start-app1.sh                       # App 1 launcher
└── start-app2.sh                       # App 2 launcher
```

## Deliverables Checklist

- [x] Two functioning chat applications with different frameworks
- [x] React + Node.js/Express implementation
- [x] Vue.js + Spring Boot implementation
- [x] Real-time message synchronization across sessions
- [x] Docker containerization for both applications
- [x] docker-compose.yml files for easy deployment
- [x] Complete README with running instructions
- [x] One-page writeup comparing frameworks
- [x] MVC architecture analysis
- [x] Design decision justification
- [x] .gitignore file
- [x] Quick start scripts
- [x] Health check endpoints
- [x] Clean, functional UI

## Technologies Used

**Frontend:**
- React 18
- Vue.js 3
- HTML5/CSS3
- JavaScript ES6+
- WebSocket API
- SockJS-client
- webstomp-client

**Backend:**
- Node.js 18
- Express 4
- WebSocket (ws library)
- Java 17
- Spring Boot 3
- Spring WebSocket
- STOMP protocol
- Maven

**DevOps:**
- Docker
- Docker Compose
- Nginx
- Multi-stage builds

## Learning Outcomes Demonstrated

1. **Framework Understanding**: Hands-on experience with different web frameworks and their design philosophies
2. **Real-time Communication**: Implementation of WebSocket-based bidirectional communication
3. **Full-Stack Development**: Complete applications from frontend to backend
4. **Containerization**: Docker best practices and multi-stage builds
5. **Architecture Patterns**: MVC pattern implementation in different contexts
6. **Comparative Analysis**: Critical evaluation of framework strengths and weaknesses
7. **Documentation**: Comprehensive technical documentation and setup guides

## Future Enhancements (Not Implemented)

Potential improvements for learning purposes:
- User authentication and session management
- Message persistence (database integration)
- Private messaging between users
- Typing indicators
- Read receipts
- File/image sharing
- Message editing/deletion
- User avatars
- Room/channel support
- Message encryption
- Rate limiting
- Unit and integration tests

## Contact & Support

This project was created for CMPE 272 - Enterprise Application Development at San Jose State University (Fall 2025).

For questions or issues with running the applications, refer to:
1. QUICKSTART.md for quick commands
2. README.md for detailed instructions
3. Troubleshooting section in README.md
4. Docker logs: `docker-compose logs -f`
