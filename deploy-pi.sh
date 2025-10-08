#!/bin/bash

echo "🚀 Deploying Sapphire Bot to Raspberry Pi"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're on the Pi
if [[ ! -f "/etc/rpi-issue" ]]; then
    print_warning "This script is designed for Raspberry Pi"
fi

# Navigate to bot directory
cd /home/admin/sapphire-modbot || {
    print_error "Bot directory not found!"
    exit 1
}

print_status "Updating bot code..."

# Pull latest changes (if using git)
if [[ -d ".git" ]]; then
    git pull origin main
    print_status "Code updated from git"
fi

# Install/update dependencies
print_status "Installing dependencies..."
npm install --production

# Run fix scripts
print_status "Running fix scripts..."
if [[ -f "fix-bot.js" ]]; then
    node fix-bot.js
fi

if [[ -f "fix-ticket-system.js" ]]; then
    node fix-ticket-system.js
fi

# Deploy commands
print_status "Deploying Discord commands..."
if [[ -f "deploy-commands-clean.js" ]]; then
    node deploy-commands-clean.js
fi

# Restart PM2 processes
print_status "Restarting bot services..."

# Stop existing processes
pm2 stop sapphire-bot 2>/dev/null || true
pm2 stop sapphire-api 2>/dev/null || true

# Start bot
pm2 start index.js --name "sapphire-bot" --max-memory-restart 200M --log-date-format="YYYY-MM-DD HH:mm:ss"

# Start API server if it exists
if [[ -f "api-server.js" ]]; then
    pm2 start api-server.js --name "sapphire-api" --max-memory-restart 100M
fi

# Save PM2 configuration
pm2 save
pm2 startup

print_status "Checking bot status..."
pm2 status

print_status "Deployment completed!"
print_status "Bot should now be online and responding to commands"

echo ""
echo "📋 Next steps:"
echo "1. Test bot in Discord: /ping"
echo "2. Check logs: pm2 logs sapphire-bot"
echo "3. Monitor status: pm2 monit"
