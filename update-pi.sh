#!/bin/bash

echo "🔄 Updating Skyfall Bot..."
echo ""

# Pull latest changes
echo "📥 Pulling latest code from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed!"
    exit 1
fi

echo ""
echo "🔄 Restarting bot..."
pm2 restart skyfall-bot

echo ""
echo "⏳ Waiting for bot to start..."
sleep 3

echo ""
echo "📊 Bot Status:"
pm2 status skyfall-bot

echo ""
echo "📝 Recent Logs:"
pm2 logs skyfall-bot --lines 20 --nostream

echo ""
echo "✅ Update complete!"
echo ""
echo "To watch live logs, run:"
echo "  pm2 logs skyfall-bot"
echo ""
