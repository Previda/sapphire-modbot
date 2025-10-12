#!/bin/bash
# 🚀 Pi Bot Startup Script - Run this on your Raspberry Pi

echo "🤖 Starting Skyfall Pi Bot with API Server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Bot directory (adjust if different)
BOT_DIR="/home/pi/sapphire-bot"
PORT=3001

echo -e "${BLUE}📍 Bot Directory: $BOT_DIR${NC}"

# Check if directory exists
if [ ! -d "$BOT_DIR" ]; then
    echo -e "${RED}❌ Bot directory not found: $BOT_DIR${NC}"
    echo -e "${YELLOW}Please update BOT_DIR in this script${NC}"
    exit 1
fi

cd "$BOT_DIR"

echo -e "${BLUE}🔍 Checking current processes...${NC}"

# Kill any existing processes on port 3001
echo -e "${YELLOW}🔪 Killing processes on port $PORT...${NC}"
sudo fuser -k $PORT/tcp 2>/dev/null || echo "No processes found on port $PORT"

# Stop existing PM2 processes
echo -e "${YELLOW}🛑 Stopping existing PM2 processes...${NC}"
pm2 stop sapphire-bot 2>/dev/null || echo "No existing PM2 process found"
pm2 delete sapphire-bot 2>/dev/null || echo "No PM2 process to delete"

# Install/update dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Check if index.js exists
if [ ! -f "index.js" ]; then
    echo -e "${RED}❌ index.js not found in $BOT_DIR${NC}"
    echo -e "${YELLOW}Make sure your bot files are in the correct directory${NC}"
    exit 1
fi

# Set environment variables
export NODE_ENV=production
export PORT=$PORT

# Start bot with PM2
echo -e "${GREEN}🚀 Starting bot with PM2...${NC}"
pm2 start index.js --name "sapphire-bot" --env production

# Wait a moment for startup
sleep 3

# Check if bot started successfully
echo -e "${BLUE}🔍 Checking bot status...${NC}"
pm2 list

# Test API endpoint
echo -e "${BLUE}🌐 Testing API endpoint...${NC}"
if curl -s http://localhost:$PORT/api/status > /dev/null; then
    echo -e "${GREEN}✅ API server is responding on port $PORT${NC}"
else
    echo -e "${RED}❌ API server not responding${NC}"
    echo -e "${YELLOW}Check bot logs: pm2 logs sapphire-bot${NC}"
fi

# Show network info
echo -e "${BLUE}🌐 Network Information:${NC}"
echo -e "Pi IP Address: $(hostname -I | awk '{print $1}')"
echo -e "API URL: http://$(hostname -I | awk '{print $1}'):$PORT"

# Show useful commands
echo -e "${BLUE}📋 Useful Commands:${NC}"
echo -e "View logs: ${YELLOW}pm2 logs sapphire-bot${NC}"
echo -e "Monitor: ${YELLOW}pm2 monit${NC}"
echo -e "Restart: ${YELLOW}pm2 restart sapphire-bot${NC}"
echo -e "Stop: ${YELLOW}pm2 stop sapphire-bot${NC}"

echo -e "${GREEN}🎉 Bot startup complete!${NC}"
echo -e "${BLUE}Dashboard: https://skyfall-omega.vercel.app${NC}"
