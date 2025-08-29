#!/bin/bash

echo "🚀 Deploying All Bot Fixes to Pi..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Git operations
print_status "Step 1: Committing and pushing all local changes..."
git add .
git commit -m "Fix all bot errors: appeal submit, undo commands, duplicate timeouts" || print_warning "No changes to commit"
git push origin main

if [ $? -eq 0 ]; then
    print_success "Local changes pushed to repository"
else
    print_error "Failed to push changes"
    exit 1
fi

# Step 2: SSH to Pi and deploy
print_status "Step 2: Connecting to Pi and deploying..."

# Pi connection details (adjust as needed)
PI_USER="admin"
PI_HOST="skyfall.local"  # or IP address
BOT_DIR="/home/admin/sapphire-modbot"

ssh $PI_USER@$PI_HOST << 'EOF'
    set -e
    
    echo "🔄 Updating bot on Pi..."
    
    # Navigate to bot directory
    cd /home/admin/sapphire-modbot || { echo "❌ Bot directory not found"; exit 1; }
    
    # Stop the bot first
    echo "⏹️  Stopping bot..."
    pm2 stop sapphire-bot || echo "Bot was not running"
    
    # Backup current version
    echo "💾 Creating backup..."
    cp -r . ../sapphire-modbot-backup-$(date +%Y%m%d_%H%M%S) || echo "Backup failed, continuing..."
    
    # Reset any local changes and pull latest
    echo "📥 Pulling latest changes..."
    git reset --hard HEAD
    git clean -fd
    git pull origin main
    
    # Install/update dependencies
    echo "📦 Installing dependencies..."
    npm install --production
    
    # Ensure data directory exists
    mkdir -p data
    
    # Register commands with Discord
    echo "🔧 Registering commands..."
    node scripts/register-commands.js
    
    if [ $? -eq 0 ]; then
        echo "✅ Commands registered successfully"
    else
        echo "❌ Command registration failed"
        exit 1
    fi
    
    # Start the bot
    echo "🚀 Starting bot..."
    pm2 start sapphire-bot || pm2 restart sapphire-bot
    
    # Wait a moment and check status
    sleep 3
    pm2 status sapphire-bot
    
    # Show recent logs
    echo "📋 Recent bot logs:"
    pm2 logs sapphire-bot --lines 10 --nostream
    
    echo "✅ Deployment complete!"
    
EOF

if [ $? -eq 0 ]; then
    print_success "Bot successfully deployed and restarted on Pi!"
    print_status "You can now test the fixed commands:"
    echo "  • /appeal submit case_id:YOUR_CASE_ID"
    echo "  • /undo timeout case:YOUR_CASE_ID"
    echo "  • /undo mute user:@username"
else
    print_error "Deployment failed. Check the logs above."
    exit 1
fi

print_success "All fixes deployed! 🎉"
