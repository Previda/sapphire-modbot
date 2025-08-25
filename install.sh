#!/bin/bash

# Sapphire Bot - Pi Installation Script
# Completely Firebase-free, secure standalone deployment

set -e

echo "🚀 Installing Sapphire Bot for Raspberry Pi..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 16+."
    exit 1
fi

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Create necessary directories
mkdir -p logs data/tickets data/transcripts

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Setup environment
if [ ! -f .env ]; then
    echo "⚙️ Creating environment file..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your Discord token:"
    echo "   DISCORD_TOKEN=your_actual_discord_token_here"
    echo ""
    echo "🔧 Optional: Set MONGODB_URI if you want to use MongoDB"
    echo "   (Bot works fine with local storage by default)"
fi

# Set proper permissions
chmod +x scripts/*.sh 2>/dev/null || true

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Discord token"
echo "2. Run: npm start"
echo "   OR"
echo "   Run: npm run pm2 (for production with PM2)"
echo ""
echo "🔧 Available commands:"
echo "   npm start       - Start bot normally"
echo "   npm run pm2     - Start with PM2"
echo "   npm run restart - Restart PM2 bot"
echo "   npm run logs    - View PM2 logs"
echo "   npm run update  - Update and restart"
echo ""
