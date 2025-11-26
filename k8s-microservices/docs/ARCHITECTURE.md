# Chat Application - Architecture Documentation

## Executive Summary

This document outlines the transformation of a monolithic chat application into a microservices-based architecture deployed on Kubernetes. The application enables real-time communication between users through WebSocket connections, with services decomposed for scalability, maintainability, and independent deployment.

---

## 1. Original Architecture (Before)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Host                          │
│                                                         │
│  ┌──────────────────────┐      ┌──────────────────┐   │
│  │   React Frontend     │      │  Node.js Backend │   │
│  │   (Port 3000)        │◄─────►│  WebSocket       │   │
│  │   - UI Components    │      │  (Port 8080)     │   │
│  │   - WebSocket Client │      │  - Message Broker│   │
│  └──────────────────────┘      │  - User Mgmt     │   │
│                                 │  - In-Memory Store│   │
│                                 └──────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │                              │
         └──────────► HTTP/WebSocket ◄──┘
```

### Components

**Frontend Container:**
- React 18 application
- WebSocket client for real-time communication
- Served by Nginx
- Port: 3000

**Backend Container:**
- Node.js/Express server
- WebSocket server (ws library)
- In-memory user and message storage
- Port: 8080

### Limitations

1. **Single Point of Failure**: Both frontend and backend are single containers
2. **No Scalability**: Cannot scale components independently
3. **Tight Coupling**: All functionality in one backend service
4. **No Persistence**: In-memory storage only, data lost on restart
5. **Limited Availability**: No load balancing or redundancy
6. **Monolithic Deployment**: Must redeploy entire application for any change

---

## 2. Microservices Architecture (After)

### Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                            Kubernetes Cluster (OrbStack)                          │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                              Namespace: chat-app                             │ │
│  │                                                                               │ │
│  │  ┌────────────────┐                                                          │ │
│  │  │   Frontend     │  LoadBalancer                                            │ │
│  │  │   (Nginx)      │◄────────────── Port 80 (External)                       │ │
│  │  │   Replicas: 2  │                                                          │ │
│  │  └────────┬───────┘                                                          │ │
│  │           │                                                                   │ │
│  │           │ WebSocket/HTTP                                                    │ │
│  │           ▼                                                                   │ │
│  │  ┌────────────────┐                                                          │ │
│  │  │  API Gateway   │  LoadBalancer                                            │ │
│  │  │  (Node.js)     │◄────────────── Port 8080 (External)                     │ │
│  │  │  Replicas: 2   │                                                          │ │
│  │  └────────┬───────┘                                                          │ │
│  │           │                                                                   │ │
│  │           │ Routes Traffic                                                    │ │
│  │           ├─────────────────┬─────────────────┬─────────────────┐           │ │
│  │           │                 │                 │                 │           │ │
│  │           ▼                 ▼                 ▼                 ▼           │ │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌──────────┐   │ │
│  │  │  WebSocket Svc │ │   User Service │ │ Message Service│ │  Redis   │   │ │
│  │  │  (Node.js)     │ │   (Node.js)    │ │  (Node.js)     │ │          │   │ │
│  │  │  Replicas: 2   │ │   Replicas: 2  │ │  Replicas: 2   │ │ Port:6379│   │ │
│  │  │  Port: 8080    │ │   Port: 3001   │ │  Port: 3002    │ └─────▲────┘   │ │
│  │  └────────┬───────┘ └────────┬───────┘ └────────┬───────┘       │         │ │
│  │           │                  │                  │                │         │ │
│  │           └──────────────────┴──────────────────┴────────────────┘         │ │
│  │                                  Pub/Sub & Data Storage                     │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────┘

External Access:
  - Frontend: http://localhost (via LoadBalancer)
  - API Gateway: http://localhost:8080 (via LoadBalancer)
  - WebSocket: ws://localhost:8080 (via API Gateway)
```

### Microservices Breakdown

#### 1. Frontend Service
**Technology**: React 18 + Nginx
**Replicas**: 2
**Port**: 80
**Purpose**: Serves the static React application

**Responsibilities**:
- Serve React application bundle
- Handle client-side routing
- WebSocket client management
- UI rendering and user interactions

**Resources**:
- CPU Request: 50m, Limit: 100m
- Memory Request: 64Mi, Limit: 128Mi

---

#### 2. API Gateway Service
**Technology**: Node.js + Express + http-proxy-middleware
**Replicas**: 2
**Port**: 8080
**Service Type**: LoadBalancer

**Responsibilities**:
- Route HTTP requests to appropriate microservices
- Proxy WebSocket connections to WebSocket Service
- Rate limiting (100 requests per 15 minutes per IP)
- Request logging and monitoring
- CORS handling

**Routes**:
- `/api/users/*` → User Service (port 3001)
- `/api/messages/*` → Message Service (port 3002)
- WebSocket upgrade → WebSocket Service (port 8080)
- `/health` → Health check endpoint

**Resources**:
- CPU Request: 100m, Limit: 200m
- Memory Request: 128Mi, Limit: 256Mi

---

#### 3. WebSocket Service
**Technology**: Node.js + ws library
**Replicas**: 2
**Port**: 8080
**Service Type**: ClusterIP

**Responsibilities**:
- Manage WebSocket connections
- Handle real-time message broadcasting
- Publish/Subscribe via Redis for multi-instance coordination
- Communicate with User Service for presence management
- Communicate with Message Service for message persistence

**Key Features**:
- Automatic reconnection handling
- Redis pub/sub for horizontal scaling
- Graceful connection handling
- Fallback to local broadcast if Redis unavailable

**Environment Variables**:
- `REDIS_HOST`: redis
- `USER_SERVICE_URL`: http://user-service:3001
- `MESSAGE_SERVICE_URL`: http://message-service:3002

**Resources**:
- CPU Request: 100m, Limit: 200m
- Memory Request: 128Mi, Limit: 256Mi

---

#### 4. User Service
**Technology**: Node.js + Express
**Replicas**: 2
**Port**: 3001
**Service Type**: ClusterIP

**Responsibilities**:
- Manage online user presence
- Store user sessions in Redis
- Validate username availability
- Track user join/leave events
- Provide user list to clients

**API Endpoints**:
- `GET /api/users` - Get all online users
- `GET /api/users/count` - Get user count
- `GET /api/users/:username` - Get specific user info
- `GET /api/users/check/:username` - Check username availability
- `POST /api/users/join` - User join event
- `POST /api/users/leave` - User leave event

**Storage**:
- Primary: Redis (hash set: `online-users`)
- Fallback: In-memory Map

**Resources**:
- CPU Request: 100m, Limit: 200m
- Memory Request: 128Mi, Limit: 256Mi

---

#### 5. Message Service
**Technology**: Node.js + Express
**Replicas**: 2
**Port**: 3002
**Service Type**: ClusterIP

**Responsibilities**:
- Persist chat messages
- Store messages in Redis sorted set
- Provide message history with pagination
- Support message search and filtering
- Maintain message retention policy (max 1000 messages)

**API Endpoints**:
- `GET /api/messages` - Get messages with pagination
- `GET /api/messages/count` - Get message count
- `GET /api/messages/recent` - Get recent messages
- `GET /api/messages/user/:username` - Get messages by user
- `POST /api/messages` - Save a new message
- `DELETE /api/messages` - Clear all messages (admin)

**Storage**:
- Primary: Redis (sorted set: `chat-messages`)
- Fallback: In-memory Array

**Resources**:
- CPU Request: 100m, Limit: 200m
- Memory Request: 128Mi, Limit: 256Mi

---

#### 6. Redis Service
**Technology**: Redis 7 Alpine
**Replicas**: 1
**Port**: 6379
**Service Type**: ClusterIP

**Responsibilities**:
- Pub/Sub messaging between WebSocket instances
- User session storage
- Message persistence
- Cache for application data

**Data Structures**:
- Hash: `online-users` (username → user data)
- Sorted Set: `chat-messages` (timestamp → message JSON)
- Pub/Sub Channel: `chat-messages` (real-time events)

**Resources**:
- CPU Request: 100m, Limit: 200m
- Memory Request: 64Mi, Limit: 128Mi

---

## 3. Communication Flow

### User Join Flow
```
1. User enters username in Frontend
2. Frontend establishes WebSocket connection to API Gateway
3. API Gateway upgrades and proxies to WebSocket Service
4. WebSocket Service sends join message to User Service
5. User Service:
   - Validates username
   - Stores user in Redis
   - Returns updated user list
6. WebSocket Service publishes join event to Redis
7. All WebSocket instances receive event and broadcast to clients
8. All connected clients update their user lists
```

### Message Send Flow
```
1. User types message in Frontend
2. Frontend sends message via WebSocket to API Gateway
3. API Gateway proxies to WebSocket Service
4. WebSocket Service:
   - Sends message to Message Service for storage
   - Publishes message to Redis pub/sub
5. Message Service stores message in Redis sorted set
6. All WebSocket instances receive message from Redis
7. All WebSocket instances broadcast to connected clients
8. All clients display the new message
```

---

## 4. Key Benefits of Microservices Architecture

### Scalability
- Each service can scale independently based on load
- WebSocket Service can scale to handle more concurrent connections
- User/Message Services scale based on request volume

### Availability
- Multiple replicas ensure high availability
- Service failures don't bring down entire application
- LoadBalancer distributes traffic across replicas

### Maintainability
- Services can be updated independently
- Easier to understand and debug individual services
- Clear separation of concerns

### Technology Flexibility
- Each service can use the best technology for its purpose
- Easy to replace or upgrade individual services
- Can add new services without affecting existing ones

### Deployment
- Independent deployment of services
- Kubernetes handles rolling updates
- Zero-downtime deployments possible

### Resilience
- Services have fallback mechanisms (Redis → in-memory)
- Health checks and automatic restarts
- Graceful degradation when services are unavailable

---

## 5. Service Dependencies

```
Frontend
  └─► API Gateway
       ├─► WebSocket Service
       │    ├─► User Service ──► Redis
       │    ├─► Message Service ──► Redis
       │    └─► Redis (pub/sub)
       ├─► User Service ──► Redis
       └─► Message Service ──► Redis
```

---

## 6. Data Flow Diagram

```
┌──────────┐     WebSocket      ┌──────────────┐
│  Client  │◄──────────────────►│ API Gateway  │
│ Browser  │                     └──────┬───────┘
└──────────┘                            │
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
            ┌───────────────┐   ┌─────────────┐   ┌──────────────┐
            │   WebSocket   │   │    User     │   │   Message    │
            │    Service    │   │   Service   │   │   Service    │
            └───────┬───────┘   └──────┬──────┘   └──────┬───────┘
                    │                  │                  │
                    └──────────────────┼──────────────────┘
                                       │
                                       ▼
                                ┌──────────┐
                                │  Redis   │
                                │  - Pub/Sub
                                │  - Storage│
                                └──────────┘
```

---

## 7. Kubernetes Resources

### Namespace
- **Name**: chat-app
- **Purpose**: Isolate all chat application resources

### Deployments
- frontend: 2 replicas
- api-gateway: 2 replicas
- websocket-service: 2 replicas
- user-service: 2 replicas
- message-service: 2 replicas
- redis: 1 replica

### Services
- frontend: LoadBalancer (port 80)
- api-gateway: LoadBalancer (port 8080)
- websocket-service: ClusterIP (port 8080)
- user-service: ClusterIP (port 3001)
- message-service: ClusterIP (port 3002)
- redis: ClusterIP (port 6379)

### Health Checks
All services include:
- **Liveness Probe**: Ensures container is running
- **Readiness Probe**: Ensures service is ready to accept traffic
- **Health Endpoint**: `/health` returns service status

---

## 8. Comparison Matrix

| Aspect | Before (Monolithic) | After (Microservices) |
|--------|---------------------|------------------------|
| **Scalability** | Manual, all-or-nothing | Automatic, per-service |
| **Availability** | Single container | Multiple replicas + LB |
| **Deployment** | Full app redeploy | Independent services |
| **Technology** | Single stack | Best tool per service |
| **Persistence** | In-memory only | Redis with fallback |
| **Fault Tolerance** | None | Service isolation |
| **Development** | Tight coupling | Loose coupling |
| **Testing** | Full integration | Service-level + integration |
| **Monitoring** | Basic logs | Per-service metrics |
| **Horizontal Scaling** | Not possible | Supported via K8s |

---

## 9. Deployment Strategy

### Build Process
1. Build Docker images for each microservice
2. Tag images appropriately
3. Push to local Docker daemon (for OrbStack)

### Deployment Process
1. Create namespace
2. Deploy Redis (stateful service)
3. Deploy backend services (User, Message, WebSocket)
4. Deploy API Gateway
5. Deploy Frontend
6. Verify all pods are running
7. Access via LoadBalancer IPs

### Rollback Strategy
- Kubernetes maintains previous ReplicaSets
- Can rollback using: `kubectl rollout undo deployment/[name] -n chat-app`

---

## 10. Monitoring and Observability

### Health Checks
- All services expose `/health` endpoint
- Returns service status and dependency health

### Metrics Endpoints
- WebSocket Service: `/metrics` (connection count, Redis status)
- User Service: `/api/users/count`
- Message Service: `/api/messages/count`

### Logs
- Centralized logging via `kubectl logs`
- Structured JSON logging in services
- Request/response logging in API Gateway

---

## 11. Security Considerations

### Network Security
- Services communicate over internal ClusterIP network
- Only Frontend and API Gateway exposed externally
- Redis not exposed outside cluster

### Rate Limiting
- API Gateway implements rate limiting
- 100 requests per 15 minutes per IP

### CORS
- Configured at API Gateway level
- Allows necessary origins only

### Future Enhancements
- Add authentication/authorization service
- Implement JWT tokens
- Add TLS/SSL termination
- Implement network policies
- Add service mesh (Istio/Linkerd)

---

## 12. Conclusion

The transformation from a monolithic architecture to microservices provides significant benefits in scalability, maintainability, and resilience. The Kubernetes deployment ensures high availability through replica management and health monitoring. The Redis-based pub/sub mechanism enables horizontal scaling of the WebSocket service, allowing the application to handle increased load efficiently.

This architecture demonstrates modern cloud-native application design principles and provides a solid foundation for future enhancements and scale.
