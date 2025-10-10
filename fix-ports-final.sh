#!/bin/bash
echo "🔧 FIXING ALL PORT ISSUES"
echo "========================"

# Kill processes on all relevant ports
for port in {3001..3010}; do
    sudo fuser -k ${port}/tcp 2>/dev/null || true
done

# Stop PM2
pm2 delete all 2>/dev/null || true

# Set new port
echo "API_PORT=3005" > .env

# Start bot on new port
pm2 start index.js --name "skyfall-bot"

echo "✅ Bot restarted on port 3005"
echo "🌐 API: http://192.168.1.62:3005"