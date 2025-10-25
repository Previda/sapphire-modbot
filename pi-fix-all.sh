#!/bin/bash

echo "========================================"
echo "   Complete Bot Fix & Deployment"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}[1/6] Pulling latest code...${NC}"
cd ~/sapphire-modbot
git pull origin main

echo ""
echo -e "${BLUE}[2/6] Installing dependencies...${NC}"
npm install

echo ""
echo -e "${BLUE}[3/6] Clearing old command cache...${NC}"
# Clear require cache by restarting
pm2 delete skyfall-bot 2>/dev/null || true

echo ""
echo -e "${BLUE}[4/6] Starting bot with fresh state...${NC}"
pm2 start src/bot-with-api.js --name skyfall-bot --max-memory-restart 200M

echo ""
echo -e "${BLUE}[5/6] Saving PM2 configuration...${NC}"
pm2 save

echo ""
echo -e "${BLUE}[6/6] Showing logs...${NC}"
sleep 2
pm2 logs skyfall-bot --lines 30 --nostream

echo ""
echo "========================================"
echo -e "${GREEN}   ✅ Deployment Complete!${NC}"
echo "========================================"
echo ""
echo "Bot Status:"
pm2 status

echo ""
echo "Next steps in Discord:"
echo "  1. /verify setup"
echo "  2. /verify method type:captcha"
echo "  3. /verify lockdown"
echo ""
echo "  4. /ticket setup"
echo "  5. /ticket category name:Support emoji:🆘 description:Get help"
echo "  6. /ticket panel"
echo ""
echo "Monitor logs: pm2 logs skyfall-bot"
echo ""
