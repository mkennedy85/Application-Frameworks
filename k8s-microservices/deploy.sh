#!/bin/bash

# Deploy script for Kubernetes
# This script deploys all services to Kubernetes

set -e

echo "Deploying Chat Application to Kubernetes..."
echo "=================================================="

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if Kubernetes cluster is running
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: Cannot connect to Kubernetes cluster. Please ensure your cluster is running."
    exit 1
fi

echo ""
echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

echo ""
echo "Deploying Redis..."
kubectl apply -f k8s/redis.yaml

echo ""
echo "Waiting for Redis to be ready..."
kubectl wait --for=condition=ready pod -l app=redis -n chat-app --timeout=60s

echo ""
echo "Deploying User Service..."
kubectl apply -f k8s/user-service.yaml

echo ""
echo "Deploying Message Service..."
kubectl apply -f k8s/message-service.yaml

echo ""
echo "Deploying WebSocket Service..."
kubectl apply -f k8s/websocket-service.yaml

echo ""
echo "Deploying API Gateway..."
kubectl apply -f k8s/api-gateway.yaml

echo ""
echo "Deploying Frontend..."
kubectl apply -f k8s/frontend.yaml

echo ""
echo "=================================================="
echo "Deployment complete!"
echo ""
echo "Waiting for all pods to be ready..."
kubectl wait --for=condition=ready pod --all -n chat-app --timeout=120s

echo ""
echo "Deployment Status:"
kubectl get all -n chat-app

echo ""
echo "=================================================="
echo "Application is now running!"
echo ""
echo "To access the application:"
echo "1. Get the Frontend LoadBalancer IP:"
echo "   kubectl get svc frontend -n chat-app"
echo ""
echo "2. Get the API Gateway LoadBalancer IP:"
echo "   kubectl get svc api-gateway -n chat-app"
echo ""
echo "3. Access the application in your browser using the Frontend IP"
echo ""
echo "To view logs:"
echo "   kubectl logs -f deployment/frontend -n chat-app"
echo "   kubectl logs -f deployment/api-gateway -n chat-app"
echo "   kubectl logs -f deployment/websocket-service -n chat-app"
echo ""
echo "To delete the application:"
echo "   ./cleanup.sh"
