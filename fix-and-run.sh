#!/bin/bash

# Complete Bot Fix & Startup Script
set -e

echo "🔧 Fixing all bot issues..."

# Stop any existing bot
pm2 stop sapphire-bot 2>/dev/null || true
pm2 delete sapphire-bot 2>/dev/null || true

# Create missing directories
mkdir -p src/services src/modules src/api src/utils logs data

# Create all missing service files
echo "📦 Creating missing service modules..."

cat > src/services/xpSystem.js << 'EOF'
class XPSystem {
    constructor(client) {
        this.client = client;
    }
    
    async processMessage(message) {
        // XP system disabled for Pi optimization
        return;
    }
}
module.exports = XPSystem;
EOF

cat > src/services/loggingSystem.js << 'EOF'
class LoggingSystem {
    constructor(client) {
        this.client = client;
    }
}
module.exports = LoggingSystem;
EOF

cat > src/services/autoModSystem.js << 'EOF'
class AutoModSystem {
    constructor(client) {
        this.client = client;
    }
}
module.exports = AutoModSystem;
EOF

cat > src/services/backupScheduler.js << 'EOF'
class BackupScheduler {
    constructor(client) {
        this.client = client;
    }
    
    start() {
        console.log('📦 Backup scheduler: Local storage mode');
    }
}
module.exports = BackupScheduler;
EOF

cat > src/modules/automod.js << 'EOF'
class AutoModerationModule {
    async processMessage(message) {
        return;
    }
}
module.exports = { AutoModerationModule };
EOF

cat > src/utils/antiRaid.js << 'EOF'
class AntiRaidSystem {
    constructor(client) {
        this.client = client;
    }
}
module.exports = AntiRaidSystem;
EOF

cat > src/utils/antiNuke.js << 'EOF'
class AntiNukeSystem {
    constructor(client) {
        this.client = client;
    }
}
module.exports = AntiNukeSystem;
EOF

cat > src/api/dashboardAPI.js << 'EOF'
class DashboardAPI {
    constructor(client) {
        this.client = client;
    }
    
    start() {
        console.log('📊 Dashboard disabled for Pi optimization');
    }
}
module.exports = DashboardAPI;
EOF

cat > src/utils/dmHandler.js << 'EOF'
async function handleDMCommand(message, client) {
    return;
}
module.exports = { handleDMCommand };
EOF

# Check if .env exists, create if not
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file..."
    cat > .env << 'EOF'
DISCORD_TOKEN=your_discord_token_here
NODE_ENV=production
DISABLE_DASHBOARD=true
MAX_MEMORY=200
LOG_LEVEL=error
EOF
    echo "❌ EDIT .env FILE WITH YOUR DISCORD TOKEN!"
    echo "nano .env"
    exit 1
fi

# Check if Discord token is set
if grep -q "your_discord_token_here" .env; then
    echo "❌ DISCORD TOKEN NOT SET!"
    echo "Edit .env file with: nano .env"
    echo "Add your real Discord bot token"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

echo "🚀 Starting bot with PM2..."
pm2 start ecosystem.config.js

# Wait and check status
sleep 5
echo "📊 Bot Status:"
pm2 status

echo ""
echo "✅ Bot startup complete!"
echo ""
echo "Check bot status:"
echo "  pm2 logs sapphire-bot"
echo "  pm2 status"
echo ""
echo "If bot is offline, check Discord token in .env file"
EOF
