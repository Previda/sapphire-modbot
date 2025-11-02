#!/bin/bash

echo "🔧 Fixing Music Audio Issues"
echo "=============================="
echo ""

cd ~/sapphire-modbot

# Update code
echo "📥 Step 1: Updating code..."
git pull origin main
echo "✅ Code updated"
echo ""

# Update ytdl-core to latest version
echo "📦 Step 2: Updating ytdl-core..."
npm install @distube/ytdl-core@latest
echo "✅ ytdl-core updated"
echo ""

# Ensure all audio packages are installed
echo "🔊 Step 3: Installing audio packages..."
npm install opusscript --save
npm install @discordjs/voice@latest --save
npm install @snazzah/davey --save
npm install libsodium-wrappers --save
echo "✅ Audio packages installed"
echo ""

# Check FFmpeg
echo "🎬 Step 4: Checking FFmpeg..."
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg installed: $(ffmpeg -version | head -n1)"
else
    echo "⚠️ FFmpeg not found, installing..."
    sudo apt-get update
    sudo apt-get install -y ffmpeg
    echo "✅ FFmpeg installed"
fi
echo ""

# Clear PM2 logs
echo "🗑️ Step 5: Clearing old logs..."
pm2 flush skyfall-bot
echo "✅ Logs cleared"
echo ""

# Restart bot
echo "🔄 Step 6: Restarting bot..."
pm2 restart skyfall-bot
echo "✅ Bot restarted"
echo ""

# Wait for startup
echo "⏳ Waiting for bot to start..."
sleep 3
echo ""

# Show status
echo "📊 Bot Status:"
pm2 status skyfall-bot
echo ""

echo "✅ MUSIC AUDIO FIX COMPLETE!"
echo ""
echo "🧪 Test with a WORKING video:"
echo "   /play https://www.youtube.com/watch?v=dQw4w9WgXcQ"
echo ""
echo "❌ AVOID this video (it's restricted):"
echo "   Escape - Nemzzz (Remix by AJ)"
echo ""
echo "📊 Watch logs:"
echo "   pm2 logs skyfall-bot --lines 50"
echo ""
echo "💡 If still no audio:"
echo "   1. Check Discord volume slider (right-click bot)"
echo "   2. Check your output device"
echo "   3. Try a different video"
echo ""
