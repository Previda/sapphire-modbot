#!/bin/bash
# Sapphire Modbot Complete Pi Factory Installer
# This script completely sets up a fresh Raspberry Pi from scratch
# Usage: curl -sSL https://raw.githubusercontent.com/Previda/sapphire-modbot/main/pi-factory-installer.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration for Raspberry Pi 2
PROJECT_DIR="/home/admin/sapphire-modbot"
REPO_URL="https://github.com/Previda/sapphire-modbot.git"
NODE_VERSION="16"  # Use Node 16 for better Pi 2 compatibility
API_PORT="3001"
SERVICE_USER="admin"

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

# Function to get network IP
get_network_ip() {
    hostname -I | awk '{print $1}'
}

# Function to get and validate tokens
get_tokens() {
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
    local pi_ip=$(get_network_ip)
    
    print_status "Creating environment configuration..."
    
    cat > "$env_file" << EOF
# Discord Bot Configuration
DISCORD_TOKEN=$DISCORD_TOKEN
CLIENT_ID=$CLIENT_ID
GUILD_ID=$GUILD_ID

# Pi Configuration (optimized for Pi 2)
PI_BOT_TOKEN=$PI_BOT_TOKEN
PI_BOT_API_URL=http://$pi_ip:$API_PORT
MAX_MEMORY=200
LOG_LEVEL=warn
NODE_ENV=production
API_PORT=$API_PORT

# Optional Features
DISCORD_ERROR_WEBHOOK_URL=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
EOF
    
    chmod 600 "$env_file"
    print_success "Environment file created securely"
    
    # Save connection info for easy access
    cat > "/home/$SERVICE_USER/sapphire-info.txt" << EOF
Sapphire Modbot Connection Information
=====================================
Pi IP Address: $pi_ip
API URL: http://$pi_ip:$API_PORT
API Token: $PI_BOT_TOKEN

For Vercel Dashboard:
PI_BOT_API_URL=http://$pi_ip:$API_PORT
PI_BOT_TOKEN=$PI_BOT_TOKEN

Commands:
- Start: sudo systemctl start sapphire-bot
- Stop: sudo systemctl stop sapphire-bot
- Status: sudo systemctl status sapphire-bot
- Logs: journalctl -u sapphire-bot -f
- Update: cd $PROJECT_DIR && ./update.sh
EOF
    
    print_success "Connection info saved to /home/$SERVICE_USER/sapphire-info.txt"
}

# Function to update system
update_system() {
    print_header "🔄 System Update & Preparation"
    
    # Update package lists
    print_status "Updating package lists..."
    sudo apt update -y
    
    # Upgrade system packages
    print_status "Upgrading system packages..."
    sudo apt upgrade -y
    
    # Install essential packages
    print_status "Installing essential packages..."
    sudo apt install -y curl wget git build-essential python3 python3-pip \
        ffmpeg software-properties-common apt-transport-https ca-certificates \
        gnupg lsb-release ufw htop nano vim unzip zip
    
    print_success "System updated successfully"
}

# Function to install Node.js
install_nodejs() {
    print_header "📦 Installing Node.js $NODE_VERSION"
    
    # Remove any existing Node.js
    sudo apt remove -y nodejs npm 2>/dev/null || true
    
    # Install Node.js from NodeSource
    print_status "Adding NodeSource repository..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    
    print_status "Installing Node.js..."
    sudo apt-get install -y nodejs
    
    # Verify installation
    node_version=$(node -v)
    npm_version=$(npm -v)
    
    print_success "Node.js $node_version installed"
    print_success "npm $npm_version installed"
}

# Function to install PM2
install_pm2() {
    print_header "⚙️ Installing PM2 Process Manager"
    
    # Install PM2 globally
    print_status "Installing PM2..."
    sudo npm install -g pm2@latest
    
    # Setup PM2 startup
    print_status "Configuring PM2 startup..."
    sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $SERVICE_USER --hp /home/$SERVICE_USER
    
    print_success "PM2 installed and configured"
}

# Function to install additional tools
install_tools() {
    print_header "🛠️ Installing Additional Tools"
    
    # Install yt-dlp for music fallback
    print_status "Installing yt-dlp..."
    sudo pip3 install yt-dlp
    
    # Install FFmpeg (already installed but ensure it's there)
    print_status "Verifying FFmpeg installation..."
    if ! command -v ffmpeg &> /dev/null; then
        sudo apt install -y ffmpeg
    fi
    
    print_success "Additional tools installed"
}

# Function to setup project
setup_project() {
    print_header "🚀 Setting Up Sapphire Modbot Project"
    
    # Create project directory
    print_status "Creating project directory..."
    sudo mkdir -p "$PROJECT_DIR"
    sudo chown -R $SERVICE_USER:$SERVICE_USER "$PROJECT_DIR"
    
    # Clone repository
    print_status "Cloning Sapphire Modbot repository..."
    cd /home/$SERVICE_USER
    if [ -d "$PROJECT_DIR" ] && [ "$(ls -A $PROJECT_DIR)" ]; then
        print_status "Removing existing project files..."
        rm -rf "$PROJECT_DIR"
    fi
    
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    
    # Set ownership
    sudo chown -R $SERVICE_USER:$SERVICE_USER "$PROJECT_DIR"
    
    print_success "Project cloned successfully"
}

# Function to install dependencies
install_dependencies() {
    print_header "📚 Installing Project Dependencies"
    
    cd "$PROJECT_DIR"
    
    # Install Node.js dependencies
    print_status "Installing Node.js dependencies..."
    npm install --production
    
    # Install optional audio dependencies
    print_status "Installing audio processing dependencies..."
    npm install sodium-native libsodium-wrappers opusscript --save-optional || print_warning "Some optional dependencies failed (this is normal)"
    
    print_success "Dependencies installed"
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

# Function to create systemd service
create_systemd_service() {
    print_header "🔧 Creating System Service"
    
    # Create systemd service file
    sudo tee /etc/systemd/system/sapphire-bot.service > /dev/null << EOF
[Unit]
Description=Sapphire Modbot Discord Bot
After=network.target
Wants=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=sapphire-bot
KillMode=mixed
TimeoutStopSec=30

# Resource limits for Pi 2
MemoryMax=250M
CPUQuota=30%

[Install]
WantedBy=multi-user.target
EOF

    # Create API service file
    sudo tee /etc/systemd/system/sapphire-api.service > /dev/null << EOF
[Unit]
Description=Sapphire Modbot API Server
After=network.target sapphire-bot.service
Wants=network.target
Requires=sapphire-bot.service

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/node api-server.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=sapphire-api
KillMode=mixed
TimeoutStopSec=30

# Resource limits for Pi 2
MemoryMax=128M
CPUQuota=20%

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable services
    sudo systemctl daemon-reload
    sudo systemctl enable sapphire-bot
    sudo systemctl enable sapphire-api
    
    print_success "System services created and enabled"
}

# Function to create update script
create_update_script() {
    print_header "🔄 Creating Update System"
    
    cat > "$PROJECT_DIR/update.sh" << 'EOF'
#!/bin/bash
# Sapphire Modbot Update Script

set -e

echo "🔄 Updating Sapphire Modbot..."

# Stop services
sudo systemctl stop sapphire-api sapphire-bot

# Backup current .env
cp .env .env.backup

# Pull latest changes
git stash
git pull origin main
git stash pop 2>/dev/null || true

# Restore .env if it was overwritten
if [ -f .env.backup ]; then
    if [ ! -f .env ] || [ ! -s .env ]; then
        cp .env.backup .env
        echo "✅ Restored environment configuration"
    fi
    rm .env.backup
fi

# Update dependencies
npm install --production

# Deploy commands
node deploy-all-commands.js

# Restart services
sudo systemctl start sapphire-bot sapphire-api

echo "✅ Update complete!"
echo "📊 Check status: sudo systemctl status sapphire-bot sapphire-api"
EOF
    
    chmod +x "$PROJECT_DIR/update.sh"
    
    # Create quick start script
    cat > "/home/$SERVICE_USER/start-sapphire.sh" << EOF
#!/bin/bash
# Quick start script for Sapphire Modbot

echo "🚀 Starting Sapphire Modbot..."
sudo systemctl start sapphire-bot sapphire-api
echo "✅ Services started!"
echo "📊 Status:"
sudo systemctl status sapphire-bot --no-pager -l
sudo systemctl status sapphire-api --no-pager -l
EOF
    
    chmod +x "/home/$SERVICE_USER/start-sapphire.sh"
    
    print_success "Update and start scripts created"
}

# Function to configure firewall
configure_firewall() {
    print_header "🔥 Configuring Firewall"
    
    # Install UFW if not present
    if ! command -v ufw &> /dev/null; then
        print_status "Installing UFW firewall..."
        sudo apt install -y ufw
    fi
    
    print_status "Configuring firewall rules..."
    sudo ufw --force reset
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow $API_PORT/tcp
    sudo ufw --force enable
    
    print_success "Firewall configured"
}

# Function to optimize system for lightweight operation
optimize_system() {
    print_header "⚡ Optimizing System for Lightweight Operation"
    
    # Disable unnecessary services
    print_status "Disabling unnecessary services..."
    sudo systemctl disable bluetooth 2>/dev/null || true
    sudo systemctl disable cups 2>/dev/null || true
    sudo systemctl disable avahi-daemon 2>/dev/null || true
    
    # Configure swap
    print_status "Optimizing swap configuration..."
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    
    # Set up log rotation
    print_status "Configuring log rotation..."
    sudo tee /etc/logrotate.d/sapphire-modbot > /dev/null << EOF
/var/log/sapphire-*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF
    
    print_success "System optimized for lightweight operation"
}

# Function to start services
start_services() {
    print_header "🚀 Starting Services"
    
    print_status "Starting Sapphire Bot service..."
    sudo systemctl start sapphire-bot
    
    sleep 5
    
    print_status "Starting Sapphire API service..."
    sudo systemctl start sapphire-api
    
    sleep 3
    
    print_success "Services started"
}

# Function to test installation
test_installation() {
    print_header "🧪 Testing Installation"
    
    # Check service status
    print_status "Checking service status..."
    if sudo systemctl is-active --quiet sapphire-bot; then
        print_success "Bot service is running"
    else
        print_error "Bot service is not running"
        sudo systemctl status sapphire-bot --no-pager -l
    fi
    
    if sudo systemctl is-active --quiet sapphire-api; then
        print_success "API service is running"
    else
        print_error "API service is not running"
        sudo systemctl status sapphire-api --no-pager -l
    fi
    
    # Test API health
    local pi_ip=$(get_network_ip)
    local api_url="http://localhost:$API_PORT/health"
    
    print_status "Testing API health..."
    sleep 10  # Give services time to start
    
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
        sudo journalctl -u sapphire-api --lines 10 --no-pager
    fi
}

# Function to show final information
show_final_info() {
    local pi_ip=$(get_network_ip)
    
    print_header "✅ Installation Complete!"
    
    echo -e "${GREEN}🎉 Sapphire Modbot is now running on your Raspberry Pi!${NC}"
    echo ""
    echo -e "${BOLD}📊 Service Information:${NC}"
    echo -e "  • Bot Service: ${GREEN}sapphire-bot${NC}"
    echo -e "  • API Service: ${GREEN}sapphire-api${NC}"
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
    echo -e "${BOLD}🔧 Management Commands:${NC}"
    echo -e "  • ${CYAN}./start-sapphire.sh${NC}        - Start services"
    echo -e "  • ${CYAN}sudo systemctl stop sapphire-bot sapphire-api${NC} - Stop services"
    echo -e "  • ${CYAN}sudo systemctl status sapphire-bot${NC} - Check bot status"
    echo -e "  • ${CYAN}sudo journalctl -u sapphire-bot -f${NC} - View bot logs"
    echo -e "  • ${CYAN}cd $PROJECT_DIR && ./update.sh${NC} - Update bot"
    echo ""
    echo -e "${BOLD}📋 Connection Info:${NC}"
    echo -e "  • Saved to: ${CYAN}/home/$SERVICE_USER/sapphire-info.txt${NC}"
    echo ""
    echo -e "${BOLD}🎵 Features Ready:${NC}"
    echo -e "  • Multi-platform music streaming (YouTube, Spotify)"
    echo -e "  • Advanced verification system"
    echo -e "  • Real-time dashboard integration"
    echo -e "  • Automatic error recovery"
    echo -e "  • Lightweight 24/7 operation"
    echo ""
    print_success "Your Sapphire Modbot is ready for production use!"
}

# Main installation flow
main() {
    print_header "🤖 Sapphire Modbot Pi Factory Installer"
    echo -e "${CYAN}This script will completely set up Sapphire Modbot on your Raspberry Pi${NC}"
    echo -e "${CYAN}It will install all dependencies and configure the bot for 24/7 operation${NC}"
    echo ""
    
    # Check if running as correct user
    if [ "$USER" != "$SERVICE_USER" ]; then
        print_warning "This script should be run as the '$SERVICE_USER' user"
        print_input "Continue anyway? (y/N): "
        read -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Get tokens first
    get_tokens
    
    # Update system
    update_system
    
    # Install Node.js
    install_nodejs
    
    # Install PM2
    install_pm2
    
    # Install additional tools
    install_tools
    
    # Setup project
    setup_project
    
    # Create environment file
    create_env_file
    
    # Install dependencies
    install_dependencies
    
    # Deploy commands
    deploy_commands
    
    # Create systemd services
    create_systemd_service
    
    # Create update scripts
    create_update_script
    
    # Configure firewall
    configure_firewall
    
    # Optimize system
    optimize_system
    
    # Start services
    start_services
    
    # Test installation
    test_installation
    
    # Show final information
    show_final_info
}

# Run main function
main "$@"
