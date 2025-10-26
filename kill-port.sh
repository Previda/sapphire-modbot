#!/bin/bash

# Kill process on port 3001
PORT=${1:-3001}

echo "🔍 Checking for processes on port $PORT..."

# Find process using the port
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
    echo "✅ No process found on port $PORT"
    exit 0
fi

echo "⚠️  Found process $PID using port $PORT"
echo "🔪 Killing process..."

kill -9 $PID 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Successfully killed process on port $PORT"
else
    echo "❌ Failed to kill process. Try: sudo kill -9 $PID"
    exit 1
fi
