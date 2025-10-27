#!/bin/bash

# Optimized startup script for Raspberry Pi 2
# 900MHz ARM Cortex-A7, 1GB RAM

echo "🍓 Starting Skyfall Bot on Raspberry Pi 2..."
echo "================================================"
echo ""

# Navigate to bot directory
cd ~/sapphire-modbot

# Check system resources
echo "📊 System Resources:"
echo "   CPU: $(grep -c ^processor /proc/cpuinfo) cores @ $(awk '/cpu MHz/ {print $4; exit}' /proc/cpuinfo 2>/dev/null || echo '900')MHz"
echo "   RAM: $(free -h | awk '/^Mem:/ {print $2}') total, $(free -h | awk '/^Mem:/ {print $7}') available"
echo "   Disk: $(df -h ~ | awk 'NR==2 {print $4}') free"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Please run the setup wizard first:"
    echo "  node setup-bot.js"
    echo ""
    exit 1
fi

# Validate token in .env
if grep -q "YOUR.*TOKEN\|<paste\|REPLACE_WITH" .env; then
    echo "❌ Invalid token detected in .env file!"
    echo ""
    echo "Your .env file contains placeholder text."
    echo "Please run: node setup-bot.js"
    echo ""
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "⚠️  Warning: Node.js version $(node -v) detected"
    echo "   Recommended: Node.js 14+ for better performance"
    echo ""
fi

# Check if node_modules exists and install if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (this may take a while on Pi 2)..."
    npm install --production --no-optional
    echo ""
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Check for port conflicts
echo "🔍 Checking for port conflicts..."
PORT_PID=$(lsof -ti:3001 2>/dev/null)
if [ ! -z "$PORT_PID" ]; then
    echo "⚠️  Port 3001 is in use by process $PORT_PID"
    echo "🔪 Killing process..."
    kill -9 $PORT_PID 2>/dev/null
    sleep 2
fi

# Stop existing bot instances
echo "🛑 Stopping existing bot instances..."
pm2 stop skyfall-bot 2>/dev/null
pm2 delete skyfall-bot 2>/dev/null
pm2 stop discord-bot 2>/dev/null
pm2 delete discord-bot 2>/dev/null

# Clear PM2 logs to save disk space
echo "🧹 Clearing old PM2 logs..."
pm2 flush

# Optimize system for Pi 2 before starting
echo "⚡ Optimizing system for Pi 2..."

# Increase swap priority if swap exists
if [ -f /swapfile ] || [ -f /var/swap ]; then
    echo "   ✓ Swap file detected"
fi

# Check available memory
AVAILABLE_MEM=$(free -m | awk '/^Mem:/ {print $7}')
if [ "$AVAILABLE_MEM" -lt 200 ]; then
    echo "⚠️  Warning: Low available memory (${AVAILABLE_MEM}MB)"
    echo "   Consider closing other applications"
    echo ""
fi

# Start bot with PM2 ecosystem config (optimized for Pi 2)
echo "▶️  Starting bot with Pi 2 optimizations..."
pm2 start ecosystem.config.js

# Save PM2 configuration for auto-restart on boot
pm2 save

# Setup PM2 startup script (run once)
if ! pm2 startup | grep -q "already"; then
    echo ""
    echo "💡 To enable auto-start on boot, run:"
    echo "   sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME"
    echo ""
fi

echo ""
echo "✅ Bot started with Pi 2 optimizations!"
echo ""
echo "📋 Optimizations enabled:"
echo "   • Memory limit: 400MB (auto-restart if exceeded)"
echo "   • Heap size: 384MB"
echo "   • Cache limits: Reduced for low memory"
echo "   • GC interval: Aggressive (every minute)"
echo "   • Thread pool: 2 (reduced from 4)"
echo "   • Daily restart: 4:00 AM (clears memory leaks)"
echo ""

echo "📊 Current status:"
pm2 status

echo ""
echo "💾 Memory usage:"
pm2 describe skyfall-bot | grep -A 5 "memory"

echo ""
echo "📝 Showing logs (press Ctrl+C to exit)..."
sleep 3
pm2 logs skyfall-bot --lines 30
