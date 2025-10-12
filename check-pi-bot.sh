#!/bin/bash
# 🔍 Check Pi Bot Status Script

echo "🔍 Checking Skyfall Pi Bot Status..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PORT=3001
PI_IP="192.168.1.62"

echo -e "${BLUE}📡 Checking Pi Bot Connection...${NC}"

# Check if Pi is reachable
if ping -c 1 $PI_IP &> /dev/null; then
    echo -e "${GREEN}✅ Pi is reachable at $PI_IP${NC}"
else
    echo -e "${RED}❌ Cannot reach Pi at $PI_IP${NC}"
    echo -e "${YELLOW}Check network connection and Pi IP address${NC}"
    exit 1
fi

# Check if API is responding
echo -e "${BLUE}🌐 Testing API endpoint...${NC}"
if curl -s --connect-timeout 5 http://$PI_IP:$PORT/api/status > /dev/null; then
    echo -e "${GREEN}✅ API server is responding on port $PORT${NC}"
    
    # Get API response
    echo -e "${BLUE}📊 API Response:${NC}"
    curl -s http://$PI_IP:$PORT/api/status | python3 -m json.tool 2>/dev/null || echo "Raw response received"
    
else
    echo -e "${RED}❌ API server not responding${NC}"
    echo -e "${YELLOW}Bot may be offline or not serving API${NC}"
fi

# Check dashboard connection
echo -e "${BLUE}🌐 Dashboard Status:${NC}"
echo -e "Dashboard URL: ${YELLOW}https://skyfall-omega.vercel.app${NC}"
echo -e "Expected Pi URL: ${YELLOW}http://$PI_IP:$PORT${NC}"

# SSH command suggestion
echo -e "${BLUE}🔧 To connect to Pi:${NC}"
echo -e "${YELLOW}ssh pi@$PI_IP${NC}"

# Useful commands
echo -e "${BLUE}📋 Pi Bot Commands (run on Pi):${NC}"
echo -e "Check status: ${YELLOW}pm2 list${NC}"
echo -e "View logs: ${YELLOW}pm2 logs sapphire-bot${NC}"
echo -e "Restart bot: ${YELLOW}pm2 restart sapphire-bot${NC}"
echo -e "Start bot: ${YELLOW}pm2 start index.js --name sapphire-bot${NC}"
