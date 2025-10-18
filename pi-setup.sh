#!/bin/bash

# Skyfall Bot - Raspberry Pi 2 Optimized Setup
# This script installs and configures everything for Raspberry Pi 2

set -e  # Exit on error

echo "🚀 Skyfall Bot - Raspberry Pi 2 Setup"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running on Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Warning: This doesn't appear to be a Raspberry Pi${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check Node.js version
echo -e "${BLUE}📦 Checking Node.js version...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js 18+ required. Current: $(node -v)${NC}"
        echo -e "${YELLOW}Install Node.js 18+ first:${NC}"
        echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "sudo apt-get install -y nodejs"
        exit 1
    else
        echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"
    fi
else
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

# Check npm
echo -e "${BLUE}📦 Checking npm...${NC}"
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Install PM2 if not present
echo -e "${BLUE}📦 Checking PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed${NC}"
else
    echo -e "${GREEN}✅ PM2 $(pm2 -v) detected${NC}"
fi

# Navigate to project directory
cd ~/sapphire-modbot || {
    echo -e "${RED}❌ Project directory not found${NC}"
    echo "Clone the repository first:"
    echo "git clone https://github.com/Previda/sapphire-modbot.git ~/sapphire-modbot"
    exit 1
}

echo -e "${BLUE}📂 Project directory: $(pwd)${NC}"

# Pull latest code
echo -e "${BLUE}🔄 Pulling latest code...${NC}"
git pull origin main || {
    echo -e "${YELLOW}⚠️  Git pull failed, continuing anyway...${NC}"
}

# Clean old installations
echo -e "${BLUE}🧹 Cleaning old installations...${NC}"
rm -rf node_modules package-lock.json
npm cache clean --force

# Install dependencies (optimized for Pi 2)
echo -e "${BLUE}📦 Installing dependencies (this may take 5-10 minutes on Pi 2)...${NC}"
echo -e "${YELLOW}⏳ Please be patient, Raspberry Pi 2 is slower...${NC}"

# Use --legacy-peer-deps to avoid conflicts
# Use --no-optional to skip optional dependencies
# Use --prefer-offline to use cache when possible
npm install --legacy-peer-deps --no-optional --prefer-offline || {
    echo -e "${RED}❌ npm install failed${NC}"
    echo -e "${YELLOW}Trying alternative installation...${NC}"
    npm install --legacy-peer-deps --force
}

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Create data directories
echo -e "${BLUE}📁 Creating data directories...${NC}"
mkdir -p data/transcripts
mkdir -p logs

# Check .env file
echo -e "${BLUE}🔐 Checking environment variables...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo -e "${BLUE}Creating .env template...${NC}"
    cat > .env << 'EOF'
# Discord Bot Token
DISCORD_BOT_TOKEN=your_bot_token_here

# Discord Application
DISCORD_CLIENT_ID=1358527215020544222
DISCORD_CLIENT_SECRET=your_client_secret_here

# API Configuration
API_URL=http://localhost:3004
PORT=3004

# Optional: Database
DATABASE_URL=

# Optional: Logging
LOG_LEVEL=info
EOF
    echo -e "${GREEN}✅ .env template created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and add your bot token!${NC}"
    echo "nano .env"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Stop existing PM2 processes
echo -e "${BLUE}🛑 Stopping existing processes...${NC}"
pm2 stop discord-bot 2>/dev/null || true
pm2 stop pi-bot-api 2>/dev/null || true
pm2 delete discord-bot 2>/dev/null || true
pm2 delete pi-bot-api 2>/dev/null || true

# Start bot with PM2
echo -e "${BLUE}🚀 Starting Discord bot...${NC}"
pm2 start src/bot-with-api.js --name discord-bot --max-memory-restart 200M

# Start API server
echo -e "${BLUE}🌐 Starting API server...${NC}"
pm2 start src/pi-bot-api.js --name pi-bot-api --max-memory-restart 150M

# Save PM2 configuration
pm2 save

# Setup PM2 startup
echo -e "${BLUE}⚙️  Setting up PM2 startup...${NC}"
pm2 startup systemd -u $USER --hp $HOME | tail -n 1 | sudo bash || {
    echo -e "${YELLOW}⚠️  PM2 startup setup failed (may need manual setup)${NC}"
}

# Wait for services to start
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 5

# Check status
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
pm2 status

echo ""
echo -e "${BLUE}📝 Recent Logs:${NC}"
pm2 logs discord-bot --lines 10 --nostream

echo ""
echo -e "${GREEN}🎉 Skyfall Bot is now running!${NC}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  pm2 status              - Check service status"
echo "  pm2 logs discord-bot    - View bot logs"
echo "  pm2 logs pi-bot-api     - View API logs"
echo "  pm2 restart discord-bot - Restart bot"
echo "  pm2 stop discord-bot    - Stop bot"
echo "  pm2 monit               - Monitor resources"
echo ""
echo -e "${YELLOW}📌 Next Steps:${NC}"
echo "  1. Make sure .env has your bot token"
echo "  2. Setup ngrok: screen -S ngrok && ngrok http 3004"
echo "  3. Update Vercel with ngrok URL"
echo "  4. Test bot in Discord: /ping"
echo ""
echo -e "${GREEN}✨ Enjoy your bot!${NC}"
