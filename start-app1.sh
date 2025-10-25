#!/bin/bash

echo "========================================="
echo "Starting Chat App 1 (React + Node.js)"
echo "========================================="
echo ""
echo "Building and starting containers..."
echo "Client will be available at: http://localhost:3000"
echo "Server will be available at: http://localhost:8080"
echo ""

cd chat-app-1
docker-compose up --build
