# 🚀 How to Start Your Pi Bot for Real Data

## 📋 Quick Start Guide

### 1. Connect to Your Raspberry Pi
```bash
# SSH into your Pi
ssh pi@192.168.1.62

# Or if you have a different username:
ssh your_username@192.168.1.62
```

### 2. Navigate to Bot Directory
```bash
# Go to your bot folder
cd /home/pi/sapphire-bot
# or wherever your bot is located
```

### 3. Start the Bot with API Server
```bash
# Install dependencies if needed
npm install

# Start with PM2 (recommended)
pm2 start index.js --name "sapphire-bot"

# Or start directly
node index.js
```

### 4. Check if Bot is Running
```bash
# Check PM2 processes
pm2 list

# Check if API is responding
curl http://localhost:3001/api/status

# Check what's running on port 3001
netstat -tulpn | grep 3001
```

## 🔧 Troubleshooting Commands

### If Bot Won't Start:
```bash
# Kill any existing processes on port 3001
sudo fuser -k 3001/tcp

# Stop all PM2 processes
pm2 stop all
pm2 delete all

# Restart fresh
pm2 start index.js --name "sapphire-bot"
```

### Check Bot Status:
```bash
# View bot logs
pm2 logs sapphire-bot

# Monitor in real-time
pm2 monit

# Restart if needed
pm2 restart sapphire-bot
```

### Network Issues:
```bash
# Check Pi IP address
hostname -I

# Test network connectivity
ping google.com

# Check firewall (if using ufw)
sudo ufw status
```

## 🌐 Required Bot Features

Your bot needs these API endpoints for the dashboard:

### Essential Endpoints:
- `GET /api/status` - Bot status and uptime
- `GET /api/guilds` - Discord server list and stats
- `GET /api/commands` - Available commands and usage
- `GET /api/logs` - Activity logs
- `GET /api/appeals` - User appeals

### Bot Requirements:
- Express.js server on port 3001
- CORS enabled for dashboard access
- Discord.js integration
- Proper error handling

## 🔑 Environment Variables

Make sure these are set on your Pi:
```bash
export DISCORD_TOKEN="your_bot_token"
export PORT=3001
export NODE_ENV=production
```

## 📱 Dashboard Connection

Once bot is running:
1. Visit: https://skyfall-omega.vercel.app
2. Login with Discord
3. Dashboard will show real data from your Pi bot
4. If bot is offline, you'll see error message with retry option

## 🆘 Need Help?

If you're having issues:
1. Check bot logs: `pm2 logs sapphire-bot`
2. Verify network: `curl http://localhost:3001/api/status`
3. Restart bot: `pm2 restart sapphire-bot`
4. Check dashboard for connection status
