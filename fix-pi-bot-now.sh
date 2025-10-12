#!/bin/bash
# 🚨 EMERGENCY PI BOT FIX - Run this on your Pi

echo "🚨 FIXING CRASHING PI BOT..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Stop the crashing bot immediately
echo -e "${RED}🛑 STOPPING CRASHING BOT (6971 restarts!)${NC}"
pm2 stop skyfall-bot
pm2 delete skyfall-bot

# Kill any processes on port 3001
echo -e "${YELLOW}🔪 Killing processes on port 3001...${NC}"
sudo fuser -k 3001/tcp 2>/dev/null

# Find the bot directory
echo -e "${BLUE}🔍 Looking for bot files...${NC}"

# Common locations to check
POSSIBLE_DIRS=(
    "/home/admin/skyfall-bot"
    "/home/admin/sapphire-bot" 
    "/home/admin/discord-bot"
    "/home/admin/bot"
    "/home/pi/skyfall-bot"
    "/home/pi/sapphire-bot"
    "/opt/skyfall-bot"
    "/var/www/skyfall-bot"
)

BOT_DIR=""
for dir in "${POSSIBLE_DIRS[@]}"; do
    if [ -d "$dir" ] && [ -f "$dir/index.js" ]; then
        BOT_DIR="$dir"
        echo -e "${GREEN}✅ Found bot at: $BOT_DIR${NC}"
        break
    fi
done

# If not found, search for index.js files
if [ -z "$BOT_DIR" ]; then
    echo -e "${YELLOW}🔍 Searching for bot files...${NC}"
    find /home -name "index.js" -type f 2>/dev/null | head -5
    echo -e "${RED}❌ Bot directory not found automatically${NC}"
    echo -e "${YELLOW}Please manually navigate to your bot directory and run:${NC}"
    echo -e "${BLUE}cd /path/to/your/bot${NC}"
    echo -e "${BLUE}pm2 start index.js --name skyfall-bot${NC}"
    exit 1
fi

cd "$BOT_DIR"
echo -e "${BLUE}📍 Working in: $(pwd)${NC}"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ No package.json found${NC}"
    echo -e "${YELLOW}Creating basic package.json...${NC}"
    cat > package.json << EOF
{
  "name": "skyfall-bot",
  "version": "1.0.0",
  "description": "Skyfall Discord Bot",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "discord.js": "^14.0.0",
    "express": "^4.18.0",
    "cors": "^2.8.5"
  }
}
EOF
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install --production

# Check if index.js has API server
echo -e "${BLUE}🔍 Checking index.js for API server...${NC}"
if ! grep -q "express" index.js; then
    echo -e "${YELLOW}⚠️ Adding API server to index.js...${NC}"
    
    # Backup original
    cp index.js index.js.backup
    
    # Add API server code
    cat >> index.js << 'EOF'

// API Server for Dashboard
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Basic status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        status: 'online',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Guilds endpoint
app.get('/api/guilds', (req, res) => {
    if (client && client.guilds) {
        const guilds = client.guilds.cache.map(guild => ({
            id: guild.id,
            name: guild.name,
            members: guild.memberCount,
            status: 'online',
            icon: '🏢'
        }));
        
        res.json({
            success: true,
            guilds: guilds,
            guildCount: guilds.length,
            totalUsers: guilds.reduce((sum, g) => sum + g.members, 0)
        });
    } else {
        res.json({
            success: false,
            error: 'Bot not ready'
        });
    }
});

// Start API server
app.listen(PORT, () => {
    console.log(`🌐 API Server running on port ${PORT}`);
});
EOF
fi

# Set environment variables
export NODE_ENV=production
export PORT=3001

# Start bot with proper error handling
echo -e "${GREEN}🚀 Starting fixed bot...${NC}"
pm2 start index.js --name "skyfall-bot" --max-restarts 3 --restart-delay 5000

# Wait and check
sleep 5
pm2 list

# Test API
echo -e "${BLUE}🌐 Testing API...${NC}"
sleep 2
if curl -s http://localhost:3001/api/status > /dev/null; then
    echo -e "${GREEN}✅ API is working!${NC}"
    curl -s http://localhost:3001/api/status | python3 -m json.tool
else
    echo -e "${RED}❌ API not responding${NC}"
    echo -e "${YELLOW}Check logs: pm2 logs skyfall-bot${NC}"
fi

echo -e "${GREEN}🎉 Bot fix complete!${NC}"
echo -e "${BLUE}Dashboard: https://skyfall-omega.vercel.app${NC}"
EOF
