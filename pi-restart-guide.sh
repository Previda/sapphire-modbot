#!/bin/bash

echo "🔧 Checking Pi Bot Status..."

# Check PM2 status
pm2 status

echo ""
echo "📋 Checking what's running..."
pm2 list

echo ""
echo "🔍 Checking logs for errors..."
pm2 logs discord-bot --lines 20 --nostream

echo ""
echo "🔍 Checking Pi Bot API logs..."
pm2 logs pi-bot-api --lines 20 --nostream

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 RESTART COMMANDS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Option 1: Restart Discord Bot"
echo "  pm2 restart discord-bot"
echo ""
echo "Option 2: Restart Pi Bot API"
echo "  pm2 restart pi-bot-api"
echo ""
echo "Option 3: Restart Both"
echo "  pm2 restart all"
echo ""
echo "Option 4: Full Restart (if errors)"
echo "  cd ~/sapphire-modbot"
echo "  git pull origin main"
echo "  pm2 delete all"
echo "  pm2 start src/bot-with-api.js --name discord-bot"
echo "  pm2 start pi-bot-api.js --name pi-bot-api"
echo "  pm2 save"
echo ""
echo "Option 5: Check ngrok"
echo "  screen -r ngrok"
echo "  (If not running: screen -S ngrok && ngrok http 3004)"
echo ""
