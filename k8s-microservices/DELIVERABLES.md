# Assignment Deliverables

This document links to all deliverables required for the CMPE 272 Kubernetes Microservices Assignment.

## 📋 Table of Contents
- [Architecture Documentation](#architecture-documentation)
- [Screenshots](#screenshots)
- [Kubernetes Manifests](#kubernetes-manifests)
- [Source Code](#source-code)

---

## 📐 Architecture Documentation

### Before and After Architecture
**Location:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

This comprehensive document includes:
- **Before Architecture:** Monolithic Docker Compose setup
- **After Architecture:** Microservices on Kubernetes
- Detailed architecture diagrams (ASCII art)
- Complete service breakdown
- Communication flow diagrams
- Comparison matrix
- Deployment strategy

---

## 📸 Screenshots

### 1. Kubernetes Deployment Status
**Location:** `screenshots/kubernetes-deployment.png`

Shows:
- All pods running (2/2 replicas for each service)
- All services with proper LoadBalancer and ClusterIP configurations
- Healthy deployments for all microservices
- Redis, API Gateway, Frontend, WebSocket, User, and Message services

### 2. Running Application
**Location:** `screenshots/application-running.png`

Demonstrates:
- Connected status (green indicator)
- Real-time chat between multiple users (Joe and Mike)
- Online users list showing 2 active users
- Message synchronization across browser sessions
- Working WebSocket connection through API Gateway

---

## ☸️ Kubernetes Manifests

All Kubernetes YAML files are located in the [`k8s/`](k8s/) directory:

| File | Description |
|------|-------------|
| [`namespace.yaml`](k8s/namespace.yaml) | Chat-app namespace |
| [`redis.yaml`](k8s/redis.yaml) | Redis deployment and service |
| [`user-service.yaml`](k8s/user-service.yaml) | User service deployment (2 replicas) |
| [`message-service.yaml`](k8s/message-service.yaml) | Message service deployment (2 replicas) |
| [`websocket-service.yaml`](k8s/websocket-service.yaml) | WebSocket service deployment (2 replicas) |
| [`api-gateway.yaml`](k8s/api-gateway.yaml) | API Gateway deployment (2 replicas) |
| [`frontend.yaml`](k8s/frontend.yaml) | Frontend deployment (2 replicas) |

---

## 💻 Source Code

### Microservices Structure

```
k8s-microservices/
├── frontend/                  # React + Nginx
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── api-gateway/               # API Gateway + WebSocket Proxy
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── websocket-service/         # WebSocket Connection Manager
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── user-service/              # User Presence Management
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── message-service/           # Message Persistence
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
└── k8s/                       # Kubernetes Manifests
```

### GitHub Repository
**Link:** [Application-Frameworks/k8s-microservices](https://github.com/yourusername/Application-Frameworks/tree/main/k8s-microservices)

---

## 🚀 Deployment Scripts

| Script | Purpose |
|--------|---------|
| [`build.sh`](build.sh) | Build all Docker images |
| [`deploy.sh`](deploy.sh) | Deploy to Kubernetes |
| [`cleanup.sh`](cleanup.sh) | Remove all resources |

---

## 📊 Key Metrics

- **Total Microservices:** 5 (+ Redis)
- **Total Pods:** 11 (with replicas)
- **High Availability:** 2 replicas per service
- **Load Balancing:** Kubernetes Services
- **Persistence:** Redis for messages and user sessions
- **Real-time Communication:** WebSocket with Redis pub/sub

---

## ✅ Assignment Requirements Met

- [x] **Containerized Application:** All services containerized with Docker
- [x] **Microservices Architecture:** Broken down into 5 independent services
- [x] **Architecture Diagrams:** Before/After diagrams in ARCHITECTURE.md
- [x] **Kubernetes Deployment:** All services deployed on Kubernetes (OrbStack)
- [x] **Kubernetes YAMLs:** Complete manifests in k8s/ directory
- [x] **GitHub Repository:** All code committed and pushed
- [x] **Screenshots:** Pods/services status and running application
- [x] **Documentation:** Comprehensive README and ARCHITECTURE docs

---

## 📝 Additional Documentation

- **Main README:** [`README.md`](README.md) - Complete deployment guide
- **Architecture Guide:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - Technical deep dive
- **Troubleshooting:** Included in main README

---

**Created for CMPE 272 - Enterprise Application Development**
**Fall 2025 - San Jose State University**
