#!/bin/bash

# Sapphire Modbot Raspberry Pi Deployment Script
# Run this on your Raspberry Pi

set -e

echo "🍓 Sapphire Modbot Pi Deployment"
echo "================================"

# Check if we're on Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    echo "⚠️ Warning: This doesn't appear to be a Raspberry Pi"
fi

# Update system packages
echo "📦 Updating system packages..."
sudo apt update

# Install required packages
echo "🔧 Installing required packages..."
sudo apt install -y nodejs npm git python3 python3-pip ffmpeg

# Install yt-dlp for better YouTube support
echo "🎵 Installing yt-dlp..."
sudo pip3 install yt-dlp

# Check if directory exists
if [ ! -d "sapphire-modbot" ]; then
    echo "📁 Cloning repository..."
    git clone https://github.com/YOUR_USERNAME/sapphire-modbot.git
    cd sapphire-modbot
else
    cd sapphire-modbot
    
    # Handle potential merge conflicts
    echo "🔄 Updating repository..."
    
    # Stash any local changes
    git stash push -m "Auto-stash before deployment $(date)"
    
    # Force reset to clean state
    git reset --hard HEAD
    git clean -fd
    
    # Pull latest changes
    git pull origin main
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Set up environment if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Setting up environment..."
    cp .env.example .env
    echo ""
    echo "🔑 IMPORTANT: Edit .env file with your bot token:"
    echo "nano .env"
    echo ""
    echo "Required variables:"
    echo "- DISCORD_TOKEN=your_bot_token_here"
    echo "- CLIENT_ID=1358527215020544222"
    echo "- GUILD_ID=your_server_id (optional)"
    echo ""
    read -p "Press Enter after editing .env file..."
fi

# Deploy commands
echo "🎯 Deploying Discord commands..."
node deploy-all-commands.js

# Install PM2 for process management
echo "⚡ Installing PM2..."
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: 'sapphire-bot',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '400M',
    env: {
      NODE_ENV: 'production'
    }
  }, {
    name: 'pi-api-server',
    script: 'pi-api-server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOL

# Start services with PM2
echo "🚀 Starting bot services..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service status:"
pm2 status

echo ""
echo "🎯 Useful commands:"
echo "pm2 status          - Check service status"
echo "pm2 logs            - View logs"
echo "pm2 restart all     - Restart services"
echo "pm2 stop all        - Stop services"
echo ""
echo "🎵 Test the bot with: /ping, /play never gonna give you up"
echo ""
