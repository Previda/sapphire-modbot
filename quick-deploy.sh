#!/bin/bash
# Complete deployment script for Sapphire Modbot with all fixes

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

print_header() {
    echo -e "\n${CYAN}${BOLD}=========================================="
    echo -e "  $1"
    echo -e "==========================================${NC}\n"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header " Sapphire Modbot Complete Deployment"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run from project root."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    print_error ".env file not found. Running environment setup..."
    node setup-environment.js
fi

# Update system packages if on Linux
if command -v apt &> /dev/null; then
    print_status "Updating system packages..."
    sudo apt update -y
    
    # Install required system packages
    print_status "Installing system dependencies..."
    sudo apt install -y ffmpeg python3-pip build-essential
    
    # Install/update yt-dlp
    if ! command -v yt-dlp &> /dev/null; then
        print_status "Installing yt-dlp..."
        sudo pip3 install yt-dlp
    else
        print_status "Updating yt-dlp..."
        sudo pip3 install --upgrade yt-dlp
    fi
fi

# Install/update PM2
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2@latest
else
    print_status "Updating PM2..."
    sudo npm install -g pm2@latest
    pm2 update
fi

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

# Install optional audio dependencies
print_status "Installing audio processing dependencies..."
npm install sodium-native libsodium-wrappers opusscript --save-optional || print_status "Some optional dependencies failed (this is normal)"

# Deploy Discord commands
print_status "Deploying Discord commands..."
if [ -f "deploy-all-commands.js" ]; then
    node deploy-all-commands.js
    print_success "Commands deployed"
else
    print_error "deploy-all-commands.js not found"
    exit 1
fi

# Stop existing processes
print_status "Stopping existing processes..."
pm2 delete sapphire-bot 2>/dev/null || true
pm2 delete sapphire-api 2>/dev/null || true

# Start bot
if [ -f "src/index.js" ]; then
    print_status "Starting Sapphire Bot..."
    pm2 start src/index.js \
        --name sapphire-bot \
        --max-memory-restart 400M \
        --log-date-format="YYYY-MM-DD HH:mm:ss" \
        --restart-delay=5000 \
        --max-restarts=10
    print_success "Bot started"
else
    print_error "src/index.js not found"
    exit 1
fi

# Start API server
if [ -f "api-server.js" ]; then
    print_status "Starting API Server..."
    pm2 start api-server.js \
        --name sapphire-api \
        --max-memory-restart 256M \
        --log-date-format="YYYY-MM-DD HH:mm:ss" \
        --restart-delay=3000 \
        --max-restarts=10
    print_success "API server started"
else
    print_error "api-server.js not found"
    exit 1
fi

# Save PM2 configuration
pm2 save

# Setup PM2 startup if not already done
print_status "Configuring PM2 startup..."
pm2 startup | grep -E '^sudo' | bash || true

# Configure firewall if available
if command -v ufw &> /dev/null; then
    print_status "Configuring firewall..."
    sudo ufw allow 3001/tcp 2>/dev/null || true
    sudo ufw allow ssh 2>/dev/null || true
fi

# Wait for services to start
print_status "Waiting for services to initialize..."
sleep 5

# Check status
print_status "Checking service status..."
pm2 status

# Test API health
print_status "Testing API health..."
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "API server is responding!"
    echo ""
    echo "API Health Response:"
    curl -s http://localhost:3001/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3001/health
else
    print_error "API server is not responding"
fi

print_header " Deployment Complete!"

echo -e "${GREEN} Sapphire Modbot is now running!${NC}"
echo ""
echo -e "${BOLD} Monitoring Commands:${NC}"
echo -e "  • ${CYAN}pm2 status${NC}           - Check process status"
echo -e "  • ${CYAN}pm2 logs${NC}             - View all logs"
echo -e "  • ${CYAN}pm2 logs sapphire-bot${NC} - View bot logs"
echo -e "  • ${CYAN}pm2 logs sapphire-api${NC} - View API logs"
echo -e "  • ${CYAN}pm2 restart all${NC}      - Restart all processes"
echo ""
echo -e "${BOLD} API Endpoints:${NC}"
echo -e "  • Health: ${CYAN}http://$(hostname -I | awk '{print $1}'):3001/health${NC}"
echo -e "  • Bot Status: ${CYAN}http://$(hostname -I | awk '{print $1}'):3001/api/bot/status${NC}"
echo ""
echo -e "${BOLD} Features Ready:${NC}"
echo -e "  • Multi-platform music streaming (YouTube, Spotify)"
echo -e "  • Advanced verification system with dashboard integration"
echo -e "  • Real-time dashboard connectivity"
echo -e "  • Automatic error recovery and logging"
echo -e "  • 24/7 reliable operation with PM2"
echo ""
print_success "Your bot is ready to use!" --lines 5 --nostream

echo " Deployment complete!"
