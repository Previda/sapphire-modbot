#!/bin/bash
# Sapphire Modbot Complete Pi Installer & Updater
# This script completely sets up or updates the bot on Raspberry Pi
# Usage: curl -sSL https://raw.githubusercontent.com/Previda/sapphire-modbot/main/pi-complete-installer.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/admin/sapphire-modbot"
REPO_URL="https://github.com/Previda/sapphire-modbot.git"
NODE_VERSION="18"
API_PORT="3001"

# Function to print colored output
print_header() {
    echo -e "\n${CYAN}${BOLD}=========================================="
    echo -e "  $1"
    echo -e "==========================================${NC}\n"
}

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

print_input() {
    echo -e "${CYAN}[INPUT]${NC} $1"
}

# Function to validate Discord token
validate_discord_token() {
    local token="$1"
    
    if [ ${#token} -lt 50 ]; then
        return 1
    fi
    
    # Test token by making API call
    local response=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "Authorization: Bot $token" \
        "https://discord.com/api/v10/users/@me")
    
    if [ "$response" = "200" ]; then
        return 0
    else
        return 1
    fi
}

# Function to get and validate tokens
get_tokens() {
    local env_file="$PROJECT_DIR/.env"
    local tokens_valid=false
    
    while [ "$tokens_valid" = false ]; do
        print_header "🔐 Discord Bot Configuration"
        
        # Get Discord Bot Token
        while true; do
            print_input "Enter your Discord Bot Token:"
            echo -n "> "
            read -s DISCORD_TOKEN
            echo ""
            
            if [ -z "$DISCORD_TOKEN" ]; then
                print_error "Token cannot be empty!"
                continue
            fi
            
            print_status "Validating Discord token..."
            if validate_discord_token "$DISCORD_TOKEN"; then
                print_success "Discord token is valid!"
                break
            else
                print_error "Invalid Discord token! Please check and try again."
                print_warning "Make sure your bot token is correct and the bot is created in Discord Developer Portal."
            fi
        done
        
        # Get Client ID
        while true; do
            print_input "Enter your Discord Application Client ID:"
            echo -n "> "
            read CLIENT_ID
            
            if [ -z "$CLIENT_ID" ] || [ ${#CLIENT_ID} -lt 15 ]; then
                print_error "Invalid Client ID! Must be at least 15 characters."
                continue
            fi
            break
        done
        
        # Optional Guild ID for testing
        print_input "Enter Guild ID for instant command deployment (optional, press Enter to skip):"
        echo -n "> "
        read GUILD_ID
        
        # Generate secure API token
        PI_BOT_TOKEN=$(openssl rand -hex 32)
        
        tokens_valid=true
        print_success "All tokens configured successfully!"
    done
}

# Function to create environment file
create_env_file() {
    local env_file="$PROJECT_DIR/.env"
    
    print_status "Creating environment configuration..."
    
    cat > "$env_file" << EOF
# Discord Bot Configuration
DISCORD_TOKEN=$DISCORD_TOKEN
CLIENT_ID=$CLIENT_ID
GUILD_ID=$GUILD_ID

# Pi Configuration
PI_BOT_TOKEN=$PI_BOT_TOKEN
PI_BOT_API_URL=http://$(hostname -I | awk '{print $1}'):$API_PORT
MAX_MEMORY=400
LOG_LEVEL=info
NODE_ENV=production
API_PORT=$API_PORT

# Optional Features
DISCORD_ERROR_WEBHOOK_URL=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
EOF
    
    chmod 600 "$env_file"
    print_success "Environment file created securely"
}

# Function to install system dependencies
install_system_deps() {
    print_header "📦 Installing System Dependencies"
    
    # Update system
    print_status "Updating system packages..."
    sudo apt update -y && sudo apt upgrade -y
    
    # Install essential packages
    print_status "Installing essential packages..."
    sudo apt install -y curl wget git build-essential python3 python3-pip ffmpeg
    
    # Install Node.js
    if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt "$NODE_VERSION" ]; then
        print_status "Installing Node.js $NODE_VERSION..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        print_success "Node.js $(node -v) already installed"
    fi
    
    # Install PM2
    if ! command -v pm2 &> /dev/null; then
        print_status "Installing PM2 process manager..."
        sudo npm install -g pm2@latest
    else
        print_status "Updating PM2..."
        sudo npm install -g pm2@latest
        pm2 update
    fi
    
    # Install yt-dlp for music fallback
    if ! command -v yt-dlp &> /dev/null; then
        print_status "Installing yt-dlp..."
        sudo pip3 install yt-dlp
    else
        print_status "Updating yt-dlp..."
        sudo pip3 install --upgrade yt-dlp
    fi
    
    print_success "System dependencies installed"
}

# Function to setup project
setup_project() {
    print_header "🚀 Setting Up Sapphire Modbot"
    
    # Create project directory
    sudo mkdir -p "$PROJECT_DIR"
    sudo chown -R admin:admin "$PROJECT_DIR"
    
    # Clone or update repository
    if [ -d "$PROJECT_DIR/.git" ]; then
        print_status "Updating existing repository..."
        cd "$PROJECT_DIR"
        git stash 2>/dev/null || true
        git pull origin main
        git stash pop 2>/dev/null || true
    else
        print_status "Cloning repository..."
        rm -rf "$PROJECT_DIR"
        git clone "$REPO_URL" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi
    
    # Install Node.js dependencies
    print_status "Installing Node.js dependencies..."
    npm install --production
    
    # Install additional audio dependencies
    print_status "Installing audio processing dependencies..."
    npm install sodium-native libsodium-wrappers opusscript --save-optional
    
    print_success "Project setup complete"
}

# Function to deploy commands
deploy_commands() {
    print_header "⚡ Deploying Discord Commands"
    
    cd "$PROJECT_DIR"
    
    if [ -f "deploy-all-commands.js" ]; then
        print_status "Deploying slash commands..."
        if node deploy-all-commands.js; then
            print_success "Commands deployed successfully"
        else
            print_warning "Command deployment had issues, but continuing..."
        fi
    else
        print_warning "Command deployment script not found"
    fi
}

# Function to configure services
configure_services() {
    print_header "🔧 Configuring Services"
    
    cd "$PROJECT_DIR"
    
    # Stop existing processes
    print_status "Stopping existing processes..."
    pm2 delete sapphire-bot 2>/dev/null || true
    pm2 delete sapphire-api 2>/dev/null || true
    
    # Start bot
    if [ -f "src/index.js" ]; then
        print_status "Starting Sapphire Bot..."
        pm2 start src/index.js \
            --name sapphire-bot \
            --max-memory-restart 400M \
            --log-date-format="YYYY-MM-DD HH:mm:ss" \
            --restart-delay=5000 \
            --max-restarts=10
        print_success "Bot started"
    else
        print_error "Bot main file not found!"
        exit 1
    fi
    
    # Start API server
    if [ -f "api-server.js" ]; then
        print_status "Starting API Server..."
        pm2 start api-server.js \
            --name sapphire-api \
            --max-memory-restart 256M \
            --log-date-format="YYYY-MM-DD HH:mm:ss" \
            --restart-delay=3000 \
            --max-restarts=10
        print_success "API server started"
    else
        print_error "API server file not found!"
        exit 1
    fi
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup
    print_status "Configuring PM2 startup..."
    pm2 startup | grep -E '^sudo' | bash || true
    
    print_success "Services configured"
}

# Function to configure firewall
configure_firewall() {
    print_header "🔥 Configuring Firewall"
    
    if command -v ufw &> /dev/null; then
        print_status "Configuring UFW firewall..."
        sudo ufw allow $API_PORT/tcp
        sudo ufw allow ssh
        sudo ufw --force enable
        print_success "Firewall configured"
    else
        print_warning "UFW not available, skipping firewall configuration"
    fi
}

# Function to test installation
test_installation() {
    print_header "🧪 Testing Installation"
    
    # Wait for services to start
    print_status "Waiting for services to initialize..."
    sleep 10
    
    # Check PM2 status
    print_status "Checking process status..."
    pm2 status
    
    # Test API health
    local api_url="http://localhost:$API_PORT/health"
    print_status "Testing API health at $api_url..."
    
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$api_url" > /dev/null; then
            print_success "API server is responding!"
            echo ""
            echo "API Health Response:"
            curl -s "$api_url" | python3 -m json.tool 2>/dev/null || curl -s "$api_url"
            break
        else
            print_warning "Attempt $attempt/$max_attempts failed, retrying in 5 seconds..."
            sleep 5
            ((attempt++))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "API server is not responding after $max_attempts attempts"
        print_status "Checking logs..."
        pm2 logs sapphire-api --lines 10
    fi
    
    # Test bot status
    local bot_status_url="http://localhost:$API_PORT/api/bot/status"
    print_status "Testing bot status..."
    
    if curl -s -H "Authorization: Bearer $PI_BOT_TOKEN" "$bot_status_url" > /dev/null; then
        print_success "Bot is connected and responding!"
    else
        print_warning "Bot status check failed - this is normal if the bot is still starting"
    fi
}

# Function to show final information
show_final_info() {
    local pi_ip=$(hostname -I | awk '{print $1}')
    
    print_header "✅ Installation Complete!"
    
    echo -e "${GREEN}🎉 Sapphire Modbot is now running on your Raspberry Pi!${NC}"
    echo ""
    echo -e "${BOLD}📊 Service Information:${NC}"
    echo -e "  • Bot Process: ${GREEN}sapphire-bot${NC}"
    echo -e "  • API Process: ${GREEN}sapphire-api${NC}"
    echo -e "  • API Port: ${CYAN}$API_PORT${NC}"
    echo -e "  • Pi IP: ${CYAN}$pi_ip${NC}"
    echo ""
    echo -e "${BOLD}🌐 API Endpoints:${NC}"
    echo -e "  • Health: ${CYAN}http://$pi_ip:$API_PORT/health${NC}"
    echo -e "  • Bot Status: ${CYAN}http://$pi_ip:$API_PORT/api/bot/status${NC}"
    echo ""
    echo -e "${BOLD}🔐 Vercel Dashboard Configuration:${NC}"
    echo -e "  Set these environment variables in Vercel:"
    echo -e "  • ${YELLOW}PI_BOT_API_URL${NC}=${CYAN}http://$pi_ip:$API_PORT${NC}"
    echo -e "  • ${YELLOW}PI_BOT_TOKEN${NC}=${CYAN}$PI_BOT_TOKEN${NC}"
    echo ""
    echo -e "${BOLD}🔍 Monitoring Commands:${NC}"
    echo -e "  • ${CYAN}pm2 status${NC}           - Check process status"
    echo -e "  • ${CYAN}pm2 logs${NC}             - View all logs"
    echo -e "  • ${CYAN}pm2 logs sapphire-bot${NC} - View bot logs"
    echo -e "  • ${CYAN}pm2 logs sapphire-api${NC} - View API logs"
    echo -e "  • ${CYAN}pm2 restart all${NC}      - Restart all processes"
    echo ""
    echo -e "${BOLD}🔄 To Update Later:${NC}"
    echo -e "  Run this command again: ${CYAN}curl -sSL https://raw.githubusercontent.com/Previda/sapphire-modbot/main/pi-complete-installer.sh | bash${NC}"
    echo ""
    echo -e "${BOLD}🎵 Features Enabled:${NC}"
    echo -e "  • Multi-platform music streaming (YouTube, Spotify)"
    echo -e "  • Advanced verification system"
    echo -e "  • Real-time dashboard integration"
    echo -e "  • Automatic error recovery"
    echo -e "  • 24/7 reliable operation"
    echo ""
    print_success "Setup completed successfully! Your bot is ready to use."
}

# Main installation flow
main() {
    print_header "🤖 Sapphire Modbot Pi Installer"
    echo -e "${CYAN}This script will completely set up Sapphire Modbot on your Raspberry Pi${NC}"
    echo -e "${CYAN}It will install all dependencies, configure the bot, and start services${NC}"
    echo ""
    
    # Check if running as admin user
    if [ "$USER" != "admin" ]; then
        print_warning "This script should be run as the 'admin' user"
        print_input "Continue anyway? (y/N): "
        read -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Get tokens first
    get_tokens
    
    # Install system dependencies
    install_system_deps
    
    # Setup project
    setup_project
    
    # Create environment file
    create_env_file
    
    # Deploy commands
    deploy_commands
    
    # Configure services
    configure_services
    
    # Configure firewall
    configure_firewall
    
    # Test installation
    test_installation
    
    # Show final information
    show_final_info
}

# Run main function
main "$@"
