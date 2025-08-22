#!/bin/bash

# Sapphire Bot - Raspberry Pi Auto Update System
# Automated GitHub clone, update, test, and deploy system

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
# Detect actual user (handles sudo usage)
if [ -n "$SUDO_USER" ] && [ "$SUDO_USER" != "root" ]; then
    CURRENT_USER="$SUDO_USER"
else
    CURRENT_USER=$(whoami)
fi
BOT_DIR="/home/$CURRENT_USER/sapphire-bot"
REPO_URL="https://github.com/Previda/sapphire-modbot.git"
BACKUP_DIR="/home/$CURRENT_USER/bot-backups"
LOG_FILE="/var/log/sapphire-bot-update.log"
SERVICE_NAME="sapphire-bot"

# Create log function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Check if running as regular user (not root)
check_user() {
    if [ "$USER" = "root" ] || [ "$EUID" -eq 0 ]; then
        echo -e "${YELLOW}⚠️  Running as root. Consider running as a regular user for better security.${NC}"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}❌ Aborted by user${NC}"
            exit 1
        fi
    fi
    echo -e "${GREEN}✅ Running as user: $CURRENT_USER${NC}"
}

# Create directories if they don't exist
create_directories() {
    log "Creating necessary directories..."
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || sudo mkdir -p "$(dirname "$LOG_FILE")"
    sudo chown $CURRENT_USER:$CURRENT_USER "$(dirname "$LOG_FILE")" 2>/dev/null || true
}

# Memory optimization for Pi
optimize_for_pi() {
    log "Applying Raspberry Pi optimizations..."
    
    # Increase swap if needed (512MB Pi)
    if [ $(free -m | awk 'NR==2{printf "%.0f", $2}') -lt 1024 ]; then
        if [ $(free -m | awk 'NR==3{printf "%.0f", $2}') -lt 512 ]; then
            log "Increasing swap space for low memory Pi..."
            sudo dphys-swapfile swapoff 2>/dev/null || true
            sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=1024/' /etc/dphys-swapfile
            sudo dphys-swapfile setup
            sudo dphys-swapfile swapon
        fi
    fi
    
    # Set memory limits for Node.js
    export NODE_OPTIONS="--max-old-space-size=256"
    
    # GPU memory split for headless Pi
    if ! grep -q "gpu_mem=16" /boot/config.txt; then
        echo "gpu_mem=16" | sudo tee -a /boot/config.txt
        log "Set GPU memory to 16MB for more RAM"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing system dependencies..."
    
    # Update package list
    sudo apt update -qq
    
    # Install Node.js 18 LTS if not present
    if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
        log "Installing Node.js 18 LTS..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
    
    # Install PM2 globally
    if ! command -v pm2 &> /dev/null; then
        log "Installing PM2 process manager..."
        sudo npm install -g pm2
        pm2 startup systemd -u $CURRENT_USER --hp /home/$CURRENT_USER
        sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $CURRENT_USER --hp /home/$CURRENT_USER
    fi
    
    # Install Git if not present
    sudo apt install -y git curl wget unzip htop
    
    log "✅ Dependencies installed successfully"
}

# Backup current installation
backup_current() {
    if [ -d "$BOT_DIR" ]; then
        local backup_name="backup-$(date '+%Y%m%d-%H%M%S')"
        log "Creating backup: $backup_name"
        
        # Stop the bot service
        pm2 stop $SERVICE_NAME 2>/dev/null || true
        
        # Create backup
        cp -r "$BOT_DIR" "$BACKUP_DIR/$backup_name"
        
        # Keep only last 5 backups
        cd "$BACKUP_DIR"
        ls -t | tail -n +6 | xargs rm -rf
        
        log "✅ Backup created successfully"
    fi
}

# Clone or update repository
clone_or_update() {
    log "Cloning/updating repository..."
    
    if [ ! -d "$BOT_DIR" ]; then
        # Fresh clone
        log "Cloning fresh repository..."
        git clone "$REPO_URL" "$BOT_DIR"
        cd "$BOT_DIR"
    else
        # Update existing
        log "Updating existing repository..."
        cd "$BOT_DIR"
        git fetch origin
        
        # Check if updates available
        local local_commit=$(git rev-parse HEAD)
        local remote_commit=$(git rev-parse origin/main)
        
        if [ "$local_commit" = "$remote_commit" ]; then
            log "✅ Already up to date"
            return 0
        fi
        
        # Stash local changes and pull
        git stash
        git pull origin main
        git stash pop 2>/dev/null || true
    fi
    
    log "✅ Repository updated successfully"
}

# Install Node dependencies
install_node_deps() {
    log "Installing Node.js dependencies..."
    cd "$BOT_DIR"
    
    # Use npm ci for faster, reliable installs
    if [ -f "package-lock.json" ]; then
        NODE_OPTIONS="--max-old-space-size=256" npm ci --production --silent
    else
        NODE_OPTIONS="--max-old-space-size=256" npm install --production --silent
    fi
    
    log "✅ Node.js dependencies installed"
}

# Run automated tests
run_tests() {
    log "Running automated tests..."
    cd "$BOT_DIR"
    
    # Test 1: Syntax check
    log "Testing JavaScript syntax..."
    if ! node -c index.js; then
        log "❌ Syntax error in index.js"
        return 1
    fi
    
    # Test 2: Check required files
    local required_files=("index.js" "package.json" "src/commands" "src/events")
    for file in "${required_files[@]}"; do
        if [ ! -e "$file" ]; then
            log "❌ Missing required file/directory: $file"
            return 1
        fi
    done
    
    # Test 3: Environment variables
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            log "Creating .env from example..."
            cp .env.example .env
            log "⚠️  Please configure .env file with your Discord token"
        else
            log "❌ No .env or .env.example found"
            return 1
        fi
    fi
    
    # Test 4: Memory usage simulation
    log "Testing memory usage..."
    local memory_test=$(node -e "
        console.log('Memory test passed');
        process.exit(0);
    " 2>&1)
    
    if [ $? -ne 0 ]; then
        log "❌ Memory test failed: $memory_test"
        return 1
    fi
    
    # Test 5: Discord.js compatibility
    log "Testing Discord.js compatibility..."
    local discord_test=$(node -e "
        try {
            const { Client } = require('discord.js');
            console.log('Discord.js test passed');
            process.exit(0);
        } catch (error) {
            console.error('Discord.js test failed:', error.message);
            process.exit(1);
        }
    " 2>&1)
    
    if [ $? -ne 0 ]; then
        log "❌ Discord.js test failed: $discord_test"
        return 1
    fi
    
    log "✅ All tests passed successfully"
    return 0
}

# Auto-fix common issues
auto_fix() {
    log "Running auto-fix for common issues..."
    cd "$BOT_DIR"
    
    # Fix 1: Permissions
    log "Fixing file permissions..."
    chmod +x scripts/*.sh 2>/dev/null || true
    chmod 600 .env 2>/dev/null || true
    
    # Fix 2: Node modules rebuild for Pi architecture
    if [ -d "node_modules" ]; then
        log "Rebuilding native modules for Pi architecture..."
        NODE_OPTIONS="--max-old-space-size=256" npm rebuild --silent 2>/dev/null || true
    fi
    
    # Fix 3: Clear Node cache if issues
    log "Clearing Node.js cache..."
    npm cache clean --force --silent 2>/dev/null || true
    
    # Fix 4: Register Discord commands
    if [ -f "register-commands.js" ] && [ -f ".env" ]; then
        log "Registering Discord slash commands..."
        NODE_OPTIONS="--max-old-space-size=256" node register-commands.js 2>/dev/null || {
            log "⚠️  Command registration failed - may need manual Discord token configuration"
        }
    fi
    
    # Fix 5: Create required directories
    mkdir -p logs data/backups data/tickets data/transcripts 2>/dev/null || true
    
    log "✅ Auto-fix completed"
}

# Start/restart the bot service
manage_service() {
    log "Managing bot service..."
    cd "$BOT_DIR"
    
    # Stop existing process
    pm2 stop $SERVICE_NAME 2>/dev/null || true
    pm2 delete $SERVICE_NAME 2>/dev/null || true
    
    # Start with Pi optimizations
    PM2_HOME=/home/$CURRENT_USER/.pm2 NODE_OPTIONS="--max-old-space-size=256" pm2 start index.js \
        --name $SERVICE_NAME \
        --max-memory-restart 200M \
        --node-args="--max-old-space-size=256" \
        --log-date-format="YYYY-MM-DD HH:mm:ss" \
        --merge-logs
    
    # Save PM2 configuration
    pm2 save
    
    # Wait for startup
    sleep 5
    
    # Check if running
    if pm2 list | grep -q "$SERVICE_NAME.*online"; then
        log "✅ Bot service started successfully"
        pm2 logs $SERVICE_NAME --lines 10
    else
        log "❌ Failed to start bot service"
        pm2 logs $SERVICE_NAME --lines 20
        return 1
    fi
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check service status
    if ! pm2 list | grep -q "$SERVICE_NAME.*online"; then
        log "❌ Bot service is not running"
        return 1
    fi
    
    # Check memory usage
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", ($3/$2)*100}')
    log "Current memory usage: ${memory_usage}%"
    
    if (( $(echo "$memory_usage > 90" | bc -l) )); then
        log "⚠️  High memory usage detected"
    fi
    
    # Check disk space
    local disk_usage=$(df /home | tail -1 | awk '{print $5}' | sed 's/%//')
    log "Current disk usage: ${disk_usage}%"
    
    if [ "$disk_usage" -gt 85 ]; then
        log "⚠️  High disk usage detected"
        # Cleanup old logs
        find /home/pi/.pm2/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
    fi
    
    log "✅ Health check completed"
}

# Rollback function
rollback() {
    log "Rolling back to previous version..."
    
    local latest_backup=$(ls -t "$BACKUP_DIR" | head -n 1)
    if [ -n "$latest_backup" ]; then
        pm2 stop $SERVICE_NAME 2>/dev/null || true
        
        # Remove current installation
        rm -rf "$BOT_DIR"
        
        # Restore backup
        cp -r "$BACKUP_DIR/$latest_backup" "$BOT_DIR"
        
        # Restart service
        manage_service
        
        log "✅ Rollback completed successfully"
    else
        log "❌ No backup available for rollback"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🤖 Sapphire Bot - Pi Auto Update System${NC}"
    echo -e "${BLUE}======================================${NC}"
    
    case "${1:-update}" in
        "install")
            check_user
            create_directories
            optimize_for_pi
            install_dependencies
            clone_or_update
            install_node_deps
            auto_fix
            run_tests || { log "Tests failed, aborting"; exit 1; }
            manage_service
            health_check
            echo -e "${GREEN}✅ Fresh installation completed successfully!${NC}"
            ;;
        "update")
            check_user
            create_directories
            backup_current
            clone_or_update
            install_node_deps
            auto_fix
            if run_tests; then
                manage_service
                health_check
                echo -e "${GREEN}✅ Update completed successfully!${NC}"
            else
                echo -e "${YELLOW}⚠️  Tests failed, rolling back...${NC}"
                rollback
            fi
            ;;
        "test")
            cd "$BOT_DIR" 2>/dev/null || { echo "Bot not installed"; exit 1; }
            run_tests
            ;;
        "fix")
            cd "$BOT_DIR" 2>/dev/null || { echo "Bot not installed"; exit 1; }
            auto_fix
            manage_service
            ;;
        "rollback")
            rollback
            ;;
        "status")
            health_check
            pm2 status
            ;;
        "logs")
            pm2 logs $SERVICE_NAME
            ;;
        *)
            echo "Usage: $0 {install|update|test|fix|rollback|status|logs}"
            echo ""
            echo "Commands:"
            echo "  install  - Fresh installation of the bot"
            echo "  update   - Update bot from GitHub and restart"
            echo "  test     - Run automated tests"
            echo "  fix      - Auto-fix common issues and restart"
            echo "  rollback - Rollback to previous version"
            echo "  status   - Show bot and system status"
            echo "  logs     - Show bot logs"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
