# Quick Start Guide

## Running the Applications

### Using the convenience scripts:

**Chat App 1 (React + Node.js):**
```bash
./start-app1.sh
```
Access at: http://localhost:3000

**Chat App 2 (Vue.js + Spring Boot):**
```bash
./start-app2.sh
```
Access at: http://localhost:3001

### Manual Docker Compose commands:

**Chat App 1:**
```bash
cd chat-app-1
docker-compose up --build
```

**Chat App 2:**
```bash
cd chat-app-2
docker-compose up --build
```

### Stopping applications:
Press `Ctrl+C` and then run:
```bash
docker-compose down
```

## Quick Test

1. Start either application
2. Open browser to the app URL
3. Enter username (e.g., "Alice") and join
4. Open a second browser window (or incognito)
5. Enter different username (e.g., "Bob") and join
6. Send messages from either window
7. Watch messages appear instantly in both windows!

## Ports Used

- Chat App 1: Client 3000, Server 8080
- Chat App 2: Client 3001, Server 8081

## Troubleshooting

**Port conflict?**
```bash
# macOS/Linux - Check what's using a port
lsof -i :3000

# Kill if needed
kill -9 <PID>
```

**Docker issues?**
```bash
docker-compose down -v
docker system prune -f
docker-compose up --build --force-recreate
```

**Connection issues?**
- Check both containers are running: `docker ps`
- Check browser console for errors (F12)
- Verify firewall isn't blocking WebSocket connections

## Development Without Docker

### Chat App 1
**Server:**
```bash
cd chat-app-1/server
npm install
npm start
```

**Client (new terminal):**
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

**Client (new terminal):**
```bash
cd chat-app-2/client
npm install
npm run serve
```

## File Structure

```
Application-Frameworks/
├── chat-app-1/          # React + Node.js
│   ├── client/          # React frontend
│   ├── server/          # Express backend
│   └── docker-compose.yml
├── chat-app-2/          # Vue.js + Spring Boot
│   ├── client/          # Vue.js frontend
│   ├── server/          # Spring Boot backend
│   └── docker-compose.yml
├── README.md            # Full documentation
├── WRITEUP.md          # Framework comparison
├── QUICKSTART.md       # This file
├── start-app1.sh       # App 1 launcher
└── start-app2.sh       # App 2 launcher
```

## Next Steps

- Read `README.md` for complete documentation
- Read `WRITEUP.md` for framework comparison and MVC analysis
- Experiment with both applications to see the differences
- Try opening 3+ browser windows to test multi-user chat
