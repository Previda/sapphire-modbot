#!/bin/bash

# Skyfall Pi Update Script - Complete Version
echo "🔄 Updating Skyfall Bot on Pi..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the right directory?"
    print_error "Run: cd ~/sapphire-modbot"
    exit 1
fi

print_step "1. Stopping existing bot processes..."
pm2 stop skyfall-bot 2>/dev/null || print_warning "Bot was not running"
pm2 delete skyfall-bot 2>/dev/null || print_warning "No existing PM2 process"

# Kill any processes on port 3001
print_step "2. Clearing port 3001..."
sudo kill -9 $(sudo lsof -t -i:3001) 2>/dev/null || print_warning "No processes on port 3001"

print_step "3. Backing up local changes..."
if [ -f ".env" ]; then
    cp .env .env.backup
    print_status "Backed up .env file"
fi

print_step "4. Resetting git repository..."
git stash 2>/dev/null || true
git reset --hard origin/main
git clean -fd

print_step "5. Pulling latest changes from GitHub..."
git fetch origin
git pull origin main

if [ $? -ne 0 ]; then
    print_error "Failed to pull from GitHub"
    exit 1
fi

print_step "6. Restoring environment file..."
if [ -f ".env.backup" ]; then
    cp .env.backup .env
    print_status "Restored .env file"
elif [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating from example..."
    cp env.example .env
    print_warning "Please edit .env with your bot token!"
fi

print_step "7. Cleaning and installing dependencies..."
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_step "8. Creating src directory if needed..."
mkdir -p src

print_step "9. Starting bot with PM2..."
pm2 start src/index.js --name skyfall-bot --watch --ignore-watch="node_modules"

if [ $? -ne 0 ]; then
    print_error "Failed to start bot"
    print_error "Check if src/index.js exists and is valid"
    exit 1
fi

print_step "10. Configuring PM2..."
pm2 save
pm2 startup 2>/dev/null || true

print_step "11. Testing bot connection..."
sleep 10
echo "📊 Bot Status:"
pm2 status skyfall-bot

echo ""
echo "📋 Recent Logs:"
pm2 logs skyfall-bot --lines 15 --nostream

echo ""
print_status "✅ Update Complete!"
echo "✅ Update Complete!"
echo ""
echo "🔧 Available Commands:"
echo "  pm2 status          - Check bot status"
echo "  pm2 logs skyfall-bot - View logs"
echo "  pm2 restart skyfall-bot - Restart bot"
echo "  curl localhost:3001/api/status - Test API"
echo ""

# Check if bot is online
if pm2 jlist | grep -q '"status":"online"'; then
    echo "🎉 Bot is ONLINE and running!"
else
    echo "⚠️ Bot may not be online - check logs above"
    echo "Common fixes:"
    echo "  - Verify Discord token in .env"
    echo "  - Check network connectivity"
    echo "  - View full logs: pm2 logs sapphire-bot"
fi
