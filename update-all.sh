#!/bin/bash
set -e

echo "=========================================="
echo "  🚀 Sapphire Modbot Complete Update"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Updating project dependencies..."

# Update Node.js packages
npm install

print_success "Dependencies updated"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
    print_success "PM2 installed"
else
    print_status "PM2 already installed, updating..."
    pm2 update
fi

# Deploy Discord commands
print_status "Deploying Discord slash commands..."
if [ -f "deploy-all-commands.js" ]; then
    node deploy-all-commands.js
    print_success "Commands deployed"
else
    print_warning "deploy-all-commands.js not found, skipping command deployment"
fi

# Stop existing processes
print_status "Stopping existing processes..."
pm2 delete sapphire-bot 2>/dev/null || print_warning "sapphire-bot process not found"
pm2 delete sapphire-api 2>/dev/null || print_warning "sapphire-api process not found"

# Start bot and API server
print_status "Starting Sapphire Modbot services..."

if [ -f "src/index.js" ]; then
    pm2 start src/index.js --name sapphire-bot --max-memory-restart 400M --log-date-format="YYYY-MM-DD HH:mm:ss"
    print_success "Bot started"
else
    print_error "src/index.js not found"
    exit 1
fi

if [ -f "api-server.js" ]; then
    pm2 start api-server.js --name sapphire-api --max-memory-restart 256M --log-date-format="YYYY-MM-DD HH:mm:ss"
    print_success "API server started"
else
    print_error "api-server.js not found"
    exit 1
fi

# Save PM2 configuration
pm2 save
print_success "PM2 configuration saved"

# Configure firewall if ufw is available
if command -v ufw &> /dev/null; then
    print_status "Configuring firewall..."
    sudo ufw allow 3001/tcp 2>/dev/null || print_warning "Could not configure firewall"
    print_success "Firewall configured"
fi

# Wait for services to start
print_status "Waiting for services to initialize..."
sleep 5

# Check service status
print_status "Checking service status..."
pm2 status

# Test API health
print_status "Testing API health..."
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "API server is responding"
    
    # Show health check result
    echo ""
    echo "API Health Check:"
    curl -s http://localhost:3001/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3001/health
else
    print_error "API server is not responding"
fi

echo ""
echo "=========================================="
echo "  ✅ Update Complete!"
echo "=========================================="
echo ""
echo "🔍 Monitor with:"
echo "  pm2 logs           - View all logs"
echo "  pm2 logs sapphire-bot  - View bot logs"
echo "  pm2 logs sapphire-api  - View API logs"
echo "  pm2 status         - Check process status"
echo ""
echo "🌐 API Endpoints:"
echo "  Health: http://$(hostname -I | awk '{print $1}'):3001/health"
echo "  Bot Status: http://$(hostname -I | awk '{print $1}'):3001/api/bot/status"
echo ""
echo "📊 Dashboard Integration:"
echo "  Set PI_BOT_API_URL=http://$(hostname -I | awk '{print $1}'):3001"
echo "  Set PI_BOT_TOKEN=95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af"
echo ""
echo "🎵 Music Features:"
echo "  - Multi-fallback streaming (play-dl, ytdl-core, yt-dlp)"
echo "  - YouTube, Spotify support"
echo "  - Enhanced error handling"
echo ""
echo "🔐 Verification System:"
echo "  - Button verification"
echo "  - Captcha verification"
echo "  - Dashboard logging"
echo ""
echo "=========================================="
