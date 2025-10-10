#!/bin/bash

echo "🚀 SKYFALL - FINAL PI DEPLOYMENT FIX"
echo "===================================="

# Navigate to bot directory
cd /home/admin/sapphire-modbot

# Clean up conflicting files
echo "🧹 Cleaning up conflicting files..."
rm -f deploy-real-data-fix.sh
rm -f deploy-skyfall-complete.sh
rm -f fix-ports-final.sh
rm -f restart-skyfall.sh

# Reset git state
echo "🔄 Resetting git state..."
git reset --hard HEAD
git clean -fd

# Pull latest changes
echo "⬇️ Pulling latest updates..."
git pull origin main --force

# Kill all processes on ports 3001-3010 (using netstat instead of lsof)
echo "🔪 Killing all conflicting processes..."
for port in {3001..3010}; do
    # Use netstat to find processes and kill them
    PID=$(netstat -tlnp 2>/dev/null | grep ":${port} " | awk '{print $7}' | cut -d'/' -f1)
    if [ ! -z "$PID" ]; then
        echo "Killing process $PID on port $port"
        sudo kill -9 $PID 2>/dev/null || true
    fi
    
    # Also try fuser if available
    sudo fuser -k ${port}/tcp 2>/dev/null || true
done

# Stop all PM2 processes
echo "🛑 Stopping all PM2 processes..."
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

# Clean PM2 logs
echo "🧹 Cleaning PM2 logs..."
pm2 flush 2>/dev/null || true

# Clean environment
echo "🔧 Setting up environment..."
rm -f .env
echo "API_PORT=3005" > .env
echo "PORT=3005" >> .env
echo "NODE_ENV=production" >> .env

# Wait for ports to be freed
echo "⏳ Waiting for ports to be freed..."
sleep 5

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install --production --silent

# Start bot with enhanced configuration
echo "🚀 Starting Skyfall bot with real data endpoints..."
pm2 start index.js --name "skyfall-bot" \
    --max-memory-restart 300M \
    --env production \
    --log-date-format="YYYY-MM-DD HH:mm:ss" \
    --merge-logs \
    --watch false \
    --restart-delay=5000

# Wait for startup
echo "⏳ Waiting for bot to start..."
sleep 15

# Test API endpoints
echo "🧪 Testing API endpoints..."
if curl -s --connect-timeout 5 http://localhost:3005/api/status > /dev/null; then
    echo "✅ Status endpoint working"
else
    echo "❌ Status endpoint failed"
fi

if curl -s --connect-timeout 5 http://localhost:3005/health > /dev/null; then
    echo "✅ Health endpoint working"
else
    echo "❌ Health endpoint failed"
fi

# Show final status
echo ""
echo "📊 FINAL STATUS:"
echo "==============="
pm2 status

echo ""
echo "🔍 Port check:"
netstat -tlnp | grep :3005 || echo "Port 3005 not found"

echo ""
echo "📋 Recent logs:"
pm2 logs skyfall-bot --lines 10 --nostream

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo "✅ Bot: Skyfall running on port 3005"
echo "✅ API: http://192.168.1.62:3005"
echo "✅ Status: http://192.168.1.62:3005/api/status"
echo "✅ Health: http://192.168.1.62:3005/health"
echo ""
echo "🌐 Your dashboard should now show LIVE data!"
echo "🔗 Test: https://skyfall-omega.vercel.app"
echo ""
echo "🧪 Test commands in Discord:"
echo "• /ping - Should respond with latency"
echo "• /help - Should show Skyfall commands"
echo "• /ban @user reason - Should work with Administrator permissions"
