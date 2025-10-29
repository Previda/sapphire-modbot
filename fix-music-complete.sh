#!/bin/bash

echo "🎵 Complete Music System Fix"
echo "============================"
echo ""

cd ~/sapphire-modbot

# Step 1: Update code
echo "📥 Step 1: Updating code..."
git pull origin main
echo "✅ Code updated"
echo ""

# Step 2: Install Opus encoder
echo "🔊 Step 2: Installing Opus encoder..."
npm install opusscript
echo "✅ Opus encoder installed"
echo ""

# Step 3: Install ytdl-core
echo "📺 Step 3: Installing ytdl-core..."
npm install @distube/ytdl-core
echo "✅ ytdl-core installed"
echo ""

# Step 4: Install voice dependencies
echo "🎤 Step 4: Installing voice dependencies..."
npm install @discordjs/voice@latest
npm install @snazzah/davey
npm install libsodium-wrappers
echo "✅ Voice dependencies installed"
echo ""

# Step 5: Install FFmpeg if not present
echo "🎬 Step 5: Checking FFmpeg..."
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg already installed: $(ffmpeg -version | head -n1)"
else
    echo "📦 Installing FFmpeg..."
    sudo apt-get update
    sudo apt-get install -y ffmpeg
    echo "✅ FFmpeg installed"
fi
echo ""

# Step 6: Restart bot
echo "🔄 Step 6: Restarting bot..."
pm2 restart skyfall-bot
echo "✅ Bot restarted"
echo ""

# Step 7: Wait and check logs
echo "📊 Step 7: Checking bot status..."
sleep 3
pm2 status skyfall-bot
echo ""

echo "✅ MUSIC SYSTEM FIX COMPLETE!"
echo ""
echo "🧪 Test with:"
echo "   /play https://www.youtube.com/watch?v=dQw4w9WgXcQ"
echo ""
echo "📊 Watch logs with:"
echo "   pm2 logs skyfall-bot"
echo ""
