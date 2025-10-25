#!/bin/bash

echo "========================================="
echo "Starting Chat App 2 (Vue.js + Spring Boot)"
echo "========================================="
echo ""
echo "Building and starting containers..."
echo "Client will be available at: http://localhost:3001"
echo "Server will be available at: http://localhost:8081"
echo ""

cd chat-app-2
docker-compose up --build
