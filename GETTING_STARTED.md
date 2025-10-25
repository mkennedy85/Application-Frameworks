# Getting Started - First Steps

Welcome to the Real-Time Chat Applications project! This guide will get you up and running in just a few minutes.

## What You Have

Two complete real-time chat applications:
1. **Chat App 1**: React + Node.js (ports 3000/8080)
2. **Chat App 2**: Vue.js + Spring Boot (ports 3001/8081)

## Fastest Way to Run

### Option 1: Use the Scripts (Recommended)

**Start Chat App 1:**
```bash
./start-app1.sh
```
Then open: http://localhost:3000

**Start Chat App 2:**
```bash
./start-app2.sh
```
Then open: http://localhost:3001

### Option 2: Use Docker Compose Directly

**Chat App 1:**
```bash
cd chat-app-1
docker-compose up --build
```
Open: http://localhost:3000

**Chat App 2:**
```bash
cd chat-app-2
docker-compose up --build
```
Open: http://localhost:3001

## First Time Testing

1. Start one of the applications using the commands above
2. Wait for "Server is running" messages in the terminal
3. Open your browser to the appropriate URL
4. Enter any username and click "Join Chat"
5. Type a message and click "Send"
6. Open a second browser window to the same URL
7. Enter a different username and join
8. Send messages from either window
9. Watch them appear instantly in both windows!

## Need Help?

- **Quick commands**: See `QUICKSTART.md`
- **Complete guide**: See `README.md`
- **Troubleshooting**: See `README.md` troubleshooting section
- **Assignment details**: See `WRITEUP.md`
- **Full overview**: See `PROJECT_SUMMARY.md`
- **Before submitting**: See `CHECKLIST.md`

## Common Issues

**Port already in use?**
```bash
# macOS: Find what's using the port
lsof -i :3000
# Kill it
kill -9 <PID>
```

**Docker not starting?**
```bash
docker-compose down
docker system prune -f
docker-compose up --build
```

**Connection issues?**
- Make sure both client and server containers are running
- Check firewall settings
- Look at browser console (F12) for errors

## Next Steps

1. Test both applications to see the differences
2. Read `WRITEUP.md` for the framework comparison
3. Check `CHECKLIST.md` before submission
4. Review code to understand implementation differences

## Project Structure at a Glance

```
Application-Frameworks/
├── chat-app-1/          # React + Node.js app
├── chat-app-2/          # Vue.js + Spring Boot app
├── README.md            # Full documentation
├── WRITEUP.md          # Framework analysis (required for assignment)
├── QUICKSTART.md       # Quick reference
├── start-app1.sh       # Launch App 1
└── start-app2.sh       # Launch App 2
```

## That's It!

You're ready to run the applications. Start with the scripts above and explore!

For detailed information, see the other documentation files.
