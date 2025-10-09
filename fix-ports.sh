#!/bin/bash

echo "🔧 Fixing Port Conflicts"
echo "======================="

# Kill all processes on common ports
echo "🔪 Killing processes on ports 3001, 3002, 3003..."
sudo fuser -k 3001/tcp 2>/dev/null || true
sudo fuser -k 3002/tcp 2>/dev/null || true
sudo fuser -k 3003/tcp 2>/dev/null || true

# Stop all PM2 processes
echo "🛑 Stopping PM2 processes..."
pm2 delete all 2>/dev/null || true

# Set new port
echo "⚙️ Setting API port to 3004..."
echo "API_PORT=3004" >> .env

# Wait a moment
sleep 2

echo "✅ Port conflicts resolved!"
echo "🚀 Ready to start bot on port 3004"
