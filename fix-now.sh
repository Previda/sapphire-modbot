#!/bin/bash

# Emergency fix script for token issues
# Run this on your Pi to quickly fix authentication problems

echo "🚨 Emergency Bot Fix Script"
echo "=============================="
echo ""

# Stop the bot immediately
echo "1️⃣  Stopping bot to prevent crash loop..."
pm2 stop skyfall-bot 2>/dev/null
pm2 delete skyfall-bot 2>/dev/null
echo "   ✅ Bot stopped"
echo ""

# Check if .env exists
if [ ! -f ~/sapphire-modbot/.env ]; then
    echo "2️⃣  No .env file found. Creating template..."
    cat > ~/sapphire-modbot/.env << 'EOF'
DISCORD_BOT_TOKEN=REPLACE_WITH_YOUR_TOKEN
DISCORD_CLIENT_ID=1358527215020544222
PORT=3001
API_PORT=3001
EOF
    echo "   ✅ Template created"
else
    echo "2️⃣  .env file exists"
fi

echo ""
echo "3️⃣  Current .env contents:"
echo "   ----------------------------------------"
cat ~/sapphire-modbot/.env | sed 's/DISCORD_BOT_TOKEN=.*/DISCORD_BOT_TOKEN=***HIDDEN***/'
echo "   ----------------------------------------"
echo ""

# Check for placeholder text
if grep -q "REPLACE_WITH\|YOUR.*TOKEN\|<paste\|YOUR_NEW_TOKEN" ~/sapphire-modbot/.env; then
    echo "⚠️  WARNING: .env file contains placeholder text!"
    echo ""
    echo "You need to update it with your REAL Discord bot token."
    echo ""
    echo "Quick fix options:"
    echo ""
    echo "A) Run the setup wizard (RECOMMENDED):"
    echo "   cd ~/sapphire-modbot && node setup-bot.js"
    echo ""
    echo "B) Edit manually:"
    echo "   nano ~/sapphire-modbot/.env"
    echo "   Replace DISCORD_BOT_TOKEN with your actual token from:"
    echo "   https://discord.com/developers/applications"
    echo ""
    echo "After updating, run:"
    echo "   bash ~/sapphire-modbot/start-bot.sh"
    echo ""
    exit 1
fi

echo "4️⃣  Token validation:"
cd ~/sapphire-modbot
TOKEN_LENGTH=$(node -e "require('dotenv').config(); console.log(process.env.DISCORD_BOT_TOKEN?.length || 0);" 2>/dev/null)

if [ "$TOKEN_LENGTH" -lt 50 ]; then
    echo "   ❌ Token is too short ($TOKEN_LENGTH characters)"
    echo "   Expected: 70+ characters"
    echo ""
    echo "   Please get a new token from Discord and update .env"
    exit 1
else
    echo "   ✅ Token length OK ($TOKEN_LENGTH characters)"
fi

echo ""
echo "5️⃣  Starting bot with new authentication system..."
pm2 start ~/sapphire-modbot/src/index.js --name skyfall-bot
sleep 3

echo ""
echo "6️⃣  Checking status..."
pm2 status skyfall-bot

echo ""
echo "7️⃣  Recent logs:"
echo "   ----------------------------------------"
pm2 logs skyfall-bot --lines 20 --nostream

echo ""
echo "=============================="
echo "Fix script complete!"
echo ""
echo "If you see '✅ Successfully logged in to Discord!' above, you're good!"
echo "If you see errors, read them carefully - they include solutions."
echo ""
echo "To watch live logs: pm2 logs skyfall-bot"
echo "=============================="
