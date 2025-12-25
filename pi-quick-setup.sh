#!/bin/bash

# Sapphire Modbot - Raspberry Pi Quick Setup Script
# Run this on your Raspberry Pi to set up the bot

set -e

echo "=========================================="
echo "  Sapphire Modbot - Raspberry Pi Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on Raspberry Pi
if [[ $(uname -m) == arm* ]] || [[ $(uname -m) == aarch64 ]]; then
    echo -e "${GREEN}✓${NC} Raspberry Pi detected"
else
    echo -e "${YELLOW}⚠${NC} Not running on Raspberry Pi (detected: $(uname -m))"
fi

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗${NC} Node.js is not installed!"
    echo ""
    echo "Please install Node.js first:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION installed"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗${NC} npm is not installed!"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓${NC} npm $NPM_VERSION installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠${NC} .env file not found!"
    echo ""
    echo "Creating .env file from template..."
    
    if [ -f .env.template ]; then
        cp .env.template .env
        echo -e "${GREEN}✓${NC} .env file created"
    else
        cat > .env << 'EOF'
# Required Discord Bot Settings
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
CLIENT_ID=your_client_id_here

# Optional
MYSQL_URL=
MONGODB_URI=
MOD_LOG_CHANNEL_ID=
APPEALS_CHANNEL_ID=
MAX_MEMORY=200
PORT=3001
EOF
        echo -e "${GREEN}✓${NC} .env file created"
    fi
    
    echo ""
    echo -e "${YELLOW}IMPORTANT:${NC} Edit .env file and add your Discord bot credentials:"
    echo "  nano .env"
    echo ""
    echo "Get your credentials from: https://discord.com/developers/applications"
    echo ""
    read -p "Press Enter after you've edited .env file..."
fi

echo -e "${GREEN}✓${NC} .env file exists"
echo ""

# Check if credentials are set
if grep -q "your_bot_token_here" .env 2>/dev/null; then
    echo -e "${RED}✗${NC} Bot token not configured in .env file!"
    echo ""
    echo "Please edit .env and replace 'your_bot_token_here' with your actual bot token"
    echo "  nano .env"
    echo ""
    exit 1
fi

if grep -q "your_client_id_here" .env 2>/dev/null; then
    echo -e "${RED}✗${NC} Client ID not configured in .env file!"
    echo ""
    echo "Please edit .env and replace 'your_client_id_here' with your actual client ID"
    echo "  nano .env"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} Bot credentials configured"
echo ""

# Install dependencies
echo "Installing dependencies..."
echo "This may take several minutes on Raspberry Pi..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓${NC} Dependencies installed successfully"
else
    echo ""
    echo -e "${RED}✗${NC} Failed to install dependencies"
    exit 1
fi

echo ""

# Ask if user wants to deploy commands
read -p "Deploy commands to Discord now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Deploying commands to Discord..."
    npm run deploy-all
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓${NC} Commands deployed successfully"
    else
        echo ""
        echo -e "${RED}✗${NC} Failed to deploy commands"
        echo "You can try again later with: npm run deploy-all"
    fi
fi

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "To start the bot:"
echo "  npm run bot"
echo ""
echo "Or use PM2 for auto-restart:"
echo "  npm run pi:pm2"
echo "  npm run pi:logs"
echo ""
echo "Raspberry Pi optimizations are enabled automatically."
echo ""
echo "Memory usage target: ~85MB"
echo "Commands: 51+ slash commands ready"
echo ""
echo -e "${GREEN}Happy moderating! 🚀${NC}"
echo ""
