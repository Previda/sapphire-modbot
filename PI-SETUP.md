# 🍓 Raspberry Pi Setup Guide

## Quick Start

### Option 1: Using the Start Script (Recommended)
```bash
bash start-bot.sh
```

This script will:
- ✅ Check for port conflicts
- ✅ Kill any processes using port 3001
- ✅ Stop existing bot instances
- ✅ Start the bot with PM2
- ✅ Show logs

### Option 2: Manual PM2 Commands

**Stop existing instances:**
```bash
pm2 stop skyfall-bot
pm2 delete skyfall-bot
```

**Kill port 3001 if in use:**
```bash
npm run kill-port
# or manually:
lsof -ti:3001 | xargs kill -9
```

**Start the bot:**
```bash
pm2 start src/index.js --name skyfall-bot
pm2 save
```

**View logs:**
```bash
pm2 logs skyfall-bot
```

### Option 3: Direct Node (for testing)
```bash
# Make sure port 3001 is free first
npm run kill-port
node src/index.js
```

## Common Issues

### ❌ Error: Port 3001 already in use

**Solution 1 - Kill the process:**
```bash
npm run kill-port
```

**Solution 2 - Find and kill manually:**
```bash
lsof -ti:3001
kill -9 <PID>
```

**Solution 3 - Use a different port:**
Create/edit `.env` file:
```env
PORT=3002
```

### ❌ PM2 bot won't stop

```bash
pm2 delete skyfall-bot
pm2 kill
pm2 start src/index.js --name skyfall-bot
```

### ❌ Bot crashes immediately

Check logs:
```bash
pm2 logs skyfall-bot --lines 100
```

Common causes:
- Missing `.env` file with `DISCORD_BOT_TOKEN`
- Port already in use
- Missing dependencies (run `npm install`)

## PM2 Commands Reference

```bash
# View status
pm2 status

# View logs
pm2 logs skyfall-bot

# Restart bot
pm2 restart skyfall-bot

# Stop bot
pm2 stop skyfall-bot

# Delete bot from PM2
pm2 delete skyfall-bot

# Save PM2 configuration
pm2 save

# View detailed info
pm2 info skyfall-bot

# Monitor in real-time
pm2 monit
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Required
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=1358527215020544222

# Optional
PORT=3001
API_PORT=3001
MAX_MEMORY=200

# For dashboard integration
PI_BOT_TOKEN=your_secure_token_here
```

## After Pushing to Git

On your Pi, run:
```bash
cd ~/sapphire-modbot
git pull
npm install  # if dependencies changed
bash start-bot.sh
```

## Health Check

```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-26T..."
}
```

## Troubleshooting

### Check if bot is running:
```bash
pm2 status
```

### Check what's using port 3001:
```bash
lsof -i:3001
```

### View full error logs:
```bash
pm2 logs skyfall-bot --err --lines 200
```

### Restart everything:
```bash
pm2 delete all
npm run kill-port
bash start-bot.sh
```
