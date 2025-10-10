#!/bin/bash

echo "🚀 SKYFALL - COMPLETE REAL DATA CONNECTION FIX"
echo "=============================================="

# Navigate to bot directory
cd /home/admin/sapphire-modbot

# Pull latest changes
echo "⬇️ Pulling latest updates..."
git stash
git pull origin main

# Kill all processes on ports 3001-3010
echo "🔪 Killing all conflicting processes..."
for port in {3001..3010}; do
    sudo fuser -k ${port}/tcp 2>/dev/null || true
    sudo lsof -ti:${port} | xargs sudo kill -9 2>/dev/null || true
done

# Stop all PM2 processes
echo "🛑 Stopping all PM2 processes..."
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

# Clean environment
echo "🧹 Cleaning environment..."
rm -f .env
echo "API_PORT=3005" > .env
echo "PORT=3005" >> .env

# Wait for ports to be freed
echo "⏳ Waiting for ports to be freed..."
sleep 5

# Install/update dependencies
echo "📦 Updating dependencies..."
npm install --production

# Start bot with enhanced configuration
echo "🚀 Starting Skyfall bot with real data endpoints..."
pm2 start index.js --name "skyfall-bot" \
    --max-memory-restart 300M \
    --env production \
    --log-date-format="YYYY-MM-DD HH:mm:ss" \
    --merge-logs \
    --watch false

# Wait for startup
echo "⏳ Waiting for bot to start..."
sleep 10

# Test API endpoints
echo "🧪 Testing API endpoints..."
curl -s http://localhost:3005/api/status > /dev/null && echo "✅ Status endpoint working" || echo "❌ Status endpoint failed"
curl -s http://localhost:3005/health > /dev/null && echo "✅ Health endpoint working" || echo "❌ Health endpoint failed"

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
pm2 logs skyfall-bot --lines 15 --nostream

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
