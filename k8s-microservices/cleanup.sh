#!/bin/bash

# Cleanup script for Kubernetes deployment
# This script removes all deployed resources

set -e

echo "Cleaning up Chat Application from Kubernetes..."
echo "=================================================="

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo ""
echo "Deleting all resources..."
kubectl delete -f k8s/frontend.yaml --ignore-not-found=true
kubectl delete -f k8s/api-gateway.yaml --ignore-not-found=true
kubectl delete -f k8s/websocket-service.yaml --ignore-not-found=true
kubectl delete -f k8s/message-service.yaml --ignore-not-found=true
kubectl delete -f k8s/user-service.yaml --ignore-not-found=true
kubectl delete -f k8s/redis.yaml --ignore-not-found=true

echo ""
echo "Deleting namespace..."
kubectl delete namespace chat-app --ignore-not-found=true

echo ""
echo "=================================================="
echo "Cleanup complete!"
