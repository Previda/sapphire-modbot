#!/bin/bash

echo "========================================"
echo "   Quick Deploy & Restart"
echo "========================================"
echo ""

cd ~/sapphire-modbot

echo "📥 Pulling latest code..."
git pull origin main

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔄 Restarting bot..."
pm2 restart skyfall-bot

echo ""
echo "⏳ Waiting for bot to start..."
sleep 3

echo ""
echo "📋 Bot status:"
pm2 status

echo ""
echo "📝 Recent logs:"
pm2 logs skyfall-bot --lines 20 --nostream

echo ""
echo "========================================"
echo "   ✅ Deployment Complete!"
echo "========================================"
echo ""
echo "Bot is now running with all new commands!"
echo ""
echo "Try in Discord:"
echo "  /roblox setup"
echo ""
echo "Monitor logs: pm2 logs skyfall-bot"
echo ""
