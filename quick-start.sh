#!/bin/bash

# Quick start script for Raspberry Pi 2
# Handles common issues and starts the bot

echo "🚀 Quick Start - Skyfall Bot"
echo "=============================="
echo ""

cd ~/sapphire-modbot

# Stop any existing instances
echo "1️⃣  Stopping existing instances..."
pm2 stop all 2>/dev/null
pm2 delete all 2>/dev/null
echo "   ✅ Stopped"
echo ""

# Check .env file
echo "2️⃣  Checking configuration..."
if [ ! -f ".env" ]; then
    echo "   ❌ No .env file found!"
    echo ""
    echo "   Please create .env file with:"
    echo "   DISCORD_BOT_TOKEN=your_actual_token_here"
    echo "   DISCORD_CLIENT_ID=1358527215020544222"
    echo "   PORT=3001"
    echo "   API_PORT=3001"
    echo ""
    echo "   Or run: node setup-bot.js"
    exit 1
fi

# Check for placeholder text
if grep -qi "YOUR.*TOKEN\|<paste\|REPLACE" .env; then
    echo "   ❌ .env contains placeholder text!"
    echo ""
    echo "   Current .env content:"
    cat .env | sed 's/DISCORD_BOT_TOKEN=.*/DISCORD_BOT_TOKEN=***HIDDEN***/'
    echo ""
    echo "   You need to replace the placeholder with your REAL Discord bot token."
    echo ""
    echo "   Get your token from:"
    echo "   https://discord.com/developers/applications"
    echo "   → Your Bot → Bot → Reset Token"
    echo ""
    echo "   Then edit .env:"
    echo "   nano .env"
    echo ""
    exit 1
fi

echo "   ✅ Configuration looks good"
echo ""

# Check token length
echo "3️⃣  Validating token..."
TOKEN_LEN=$(grep "DISCORD_BOT_TOKEN=" .env | cut -d'=' -f2 | tr -d ' \n\r' | wc -c)
if [ "$TOKEN_LEN" -lt 50 ]; then
    echo "   ❌ Token is too short ($TOKEN_LEN characters)"
    echo "   Expected: 70+ characters"
    echo ""
    echo "   Please get a new token from Discord Developer Portal"
    exit 1
fi
echo "   ✅ Token length OK ($TOKEN_LEN characters)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "4️⃣  Installing dependencies..."
    npm install --production --no-optional
    echo ""
else
    echo "4️⃣  Dependencies already installed ✅"
    echo ""
fi

# Create logs directory
mkdir -p logs

# Start with ecosystem config
echo "5️⃣  Starting bot..."
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    # Fallback to direct start
    pm2 start src/index.js --name skyfall-bot \
        --max-memory-restart 400M \
        --node-args="--max-old-space-size=384"
fi

echo ""
echo "✅ Bot started!"
echo ""

# Wait a moment for startup
sleep 3

# Check status
echo "📊 Status:"
pm2 status

echo ""
echo "📝 Recent logs:"
pm2 logs skyfall-bot --lines 20 --nostream

echo ""
echo "=============================="
echo "✅ Startup complete!"
echo ""
echo "Useful commands:"
echo "  pm2 logs skyfall-bot    - View live logs"
echo "  pm2 restart skyfall-bot - Restart bot"
echo "  pm2 stop skyfall-bot    - Stop bot"
echo "  pm2 monit              - Monitor resources"
echo ""
