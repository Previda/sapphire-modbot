#!/bin/bash

echo "🔧 Fixing voice dependencies..."
echo ""

# Install system dependencies
echo "📦 Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y ffmpeg libtool autoconf automake

# Remove problematic sodium package
echo "🗑️ Removing old sodium..."
npm uninstall sodium

# Install correct dependencies
echo "📥 Installing voice dependencies..."
npm install libsodium-wrappers
npm install @discordjs/opus
npm install ffmpeg-static

# Verify installations
echo ""
echo "✅ Checking installations..."
echo ""

if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg installed: $(ffmpeg -version | head -n1)"
else
    echo "❌ FFmpeg not found"
fi

if [ -d "node_modules/libsodium-wrappers" ]; then
    echo "✅ libsodium-wrappers installed"
else
    echo "❌ libsodium-wrappers not found"
fi

if [ -d "node_modules/@discordjs/opus" ]; then
    echo "✅ @discordjs/opus installed"
else
    echo "❌ @discordjs/opus not found"
fi

echo ""
echo "🔄 Restarting bot..."
pm2 restart skyfall-bot

echo ""
echo "📊 Bot status:"
pm2 status skyfall-bot

echo ""
echo "✅ Setup complete! Test with /play command"
echo ""
echo "Watch logs with: pm2 logs skyfall-bot"
