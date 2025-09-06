#!/bin/bash

# Pi API Server Startup Script
# This script starts the API server for dashboard integration

echo "🚀 Starting Pi API Server for Skyfall Bot Dashboard Integration..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 for process management..."
    npm install -g pm2
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install express cors dotenv
fi

# Set environment variables
export NODE_ENV=production
export API_PORT=3001

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file..."
    cat > .env << EOF
# Discord Bot Token
DISCORD_TOKEN=your_discord_bot_token_here

# Pi Bot API Configuration
PI_BOT_TOKEN=95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af
API_PORT=3001

# Discord Bot Token (for API access)
DISCORD_BOT_TOKEN=your_discord_bot_token_here
EOF
    echo "🔧 Please edit .env file with your actual Discord bot token"
fi

# Stop existing processes
echo "🛑 Stopping existing processes..."
pm2 stop sapphire-bot-api 2>/dev/null || true
pm2 stop sapphire-bot 2>/dev/null || true

# Start the API server
echo "🚀 Starting API server..."
pm2 start pi-api-server.js --name "sapphire-bot-api" --watch --ignore-watch="node_modules logs temp"

# Start the main bot
echo "🤖 Starting main bot..."
pm2 start index.js --name "sapphire-bot" --watch --ignore-watch="node_modules logs temp"

# Save PM2 configuration
pm2 save

# Setup PM2 startup (so processes restart on boot)
pm2 startup

echo "✅ Pi API Server started successfully!"
echo "🔗 API Server: http://192.168.1.62:3001"
echo "📊 Dashboard can now connect to your Pi bot"
echo ""
echo "📋 Commands:"
echo "  pm2 status           - Check process status"
echo "  pm2 logs             - View logs"
echo "  pm2 restart all      - Restart all processes"
echo "  pm2 stop all         - Stop all processes"
echo ""
echo "🔧 Next steps:"
echo "1. Make sure .env file has your Discord bot token"
echo "2. Verify Vercel environment variables are set:"
echo "   - PI_BOT_API_URL=http://192.168.1.62:3001"
echo "   - PI_BOT_TOKEN=95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af"
