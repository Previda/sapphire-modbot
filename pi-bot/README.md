# Skyfall Pi Bot Setup

## Installation on Pi

### 1. Install Node.js
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (version 18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Copy Bot Files to Pi
```bash
# Create directory on Pi
mkdir -p ~/skyfall-bot
cd ~/skyfall-bot

# Copy files (you'll need to transfer bot.js, package.json from Windows to Pi)
# Use SCP or copy manually
```

### 3. Install Dependencies
```bash
cd ~/skyfall-bot
npm install
```

### 4. Setup Environment
```bash
# Copy example and edit
cp .env.example .env
nano .env

# Add your bot token:
DISCORD_BOT_TOKEN=your_actual_bot_token_here
PORT=3001
API_TOKEN=your_secure_random_token
```

### 5. Start Bot
```bash
# Test run
npm start

# For production (keeps running)
npm install -g pm2
npm run pm2

# Check status
pm2 status
pm2 logs sapphire-bot
```

## API Endpoints

- `GET /api/status` - Bot status and uptime
- `GET /api/live/:serverId` - Live server data for dashboard

## Dashboard Integration

Add to Vercel environment variables:
- `PI_BOT_API_URL=http://your-pi-ip:3001`  
- `PI_BOT_TOKEN=your_secure_random_token`

## Features

✅ Real Discord server data  
✅ Live member counts  
✅ Audit log tracking  
✅ Command statistics  
✅ API for dashboard integration  
✅ Simple bot commands (!ping, !help, !stats)
