# Screenshots

This directory contains screenshots demonstrating the deployed microservices application.

## Required Screenshots

### 1. kubernetes-deployment.png
**Description:** Kubernetes deployment status showing all running pods and services

**Should show:**
- Output of `kubectl get all -n chat-app`
- All pods in Running state (1/1 or 2/2 READY)
- LoadBalancer services with EXTERNAL-IP
- ClusterIP services for internal communication
- All deployments with 2/2 replicas ready

**Example command to capture:**
```bash
kubectl get all -n chat-app
```

### 2. application-running.png
**Description:** Live application demonstrating real-time chat functionality

**Should show:**
- Connected status (green indicator)
- Chat interface with messages
- Multiple users chatting (e.g., "Joe" and "Mike")
- Online users list (showing count)
- Real-time message synchronization

**To capture:**
1. Open the application at http://192.168.139.2
2. Open two browser windows
3. Join with different usernames (e.g., Joe and Mike)
4. Send messages between users
5. Take screenshot showing the chat conversation

---

## How to Add Screenshots

1. Take the screenshots as described above
2. Save them in this directory with the exact names:
   - `kubernetes-deployment.png`
   - `application-running.png`
3. Commit and push to the repository

---

**Note:** These screenshots are deliverables for the CMPE 272 Kubernetes Microservices Assignment.
