#!/bin/bash

# Build script for all microservices
# This script builds Docker images for all services

set -e

echo "Building Docker images for Chat Application Microservices..."
echo "=================================================="

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Build Frontend
echo ""
echo "Building Frontend..."
docker build -t chat-frontend:latest ./frontend

# Build API Gateway
echo ""
echo "Building API Gateway..."
docker build -t chat-api-gateway:latest ./api-gateway

# Build WebSocket Service
echo ""
echo "Building WebSocket Service..."
docker build -t chat-websocket-service:latest ./websocket-service

# Build User Service
echo ""
echo "Building User Service..."
docker build -t chat-user-service:latest ./user-service

# Build Message Service
echo ""
echo "Building Message Service..."
docker build -t chat-message-service:latest ./message-service

echo ""
echo "=================================================="
echo "All images built successfully!"
echo ""
echo "Built images:"
docker images | grep "chat-"

echo ""
echo "To deploy to Kubernetes, run: ./deploy.sh"
