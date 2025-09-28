# 🚀 Skyfall Modbot - Deployment Guide

## 📊 Dashboard Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (connected to GitHub)
- Environment variables ready

### 1. GitHub Setup
```bash
git init
git add .
git commit -m "Initial commit: Skyfall Modbot Dashboard"
git branch -M main
git remote add origin https://github.com/yourusername/skyfall-modbot.git
git push -u origin main
```

### 2. Vercel Deployment
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" → Import your skyfall-modbot repository
3. Framework preset: **Next.js**
4. Root directory: `./` (default)
5. Add environment variables in Vercel dashboard:

```env
# Required Environment Variables
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_BOT_TOKEN=your_bot_token
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_REDIRECT_URI=https://your-vercel-domain.vercel.app/auth/callback
PI_BOT_API_URL=http://your-pi-ip:3001
PI_BOT_TOKEN=your_secure_pi_token
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
```

6. Click **Deploy**

### 3. Post-Deployment
- Update Discord OAuth redirect URI in Discord Developer Portal
- Test all dashboard features
- Configure domain (optional)

---

## 🤖 Bot Deployment (Raspberry Pi)

### System Requirements
- Raspberry Pi 4B+ (recommended)
- Ubuntu Server 22.04 LTS or Raspberry Pi OS
- 4GB+ RAM
- 32GB+ SD card
- Stable internet connection

### 1. Initial Pi Setup
```bash
# Update system
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'skyfall-modbot',
    script: 'bot/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '400M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start bot
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Update Script
```bash
# Create update script
cat > update-bot.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating Skyfall Modbot..."

# Stop bot
pm2 stop skyfall-modbot

# Pull latest changes
git pull origin main

# Install/update dependencies
npm install

# Restart bot
pm2 restart skyfall-modbot

echo "✅ Bot updated and restarted!"
pm2 status
EOF

chmod +x update-bot.sh
```

### 7. Monitoring & Maintenance
```bash
# Check bot status
pm2 status

# View logs
pm2 logs skyfall-modbot

# Restart bot
pm2 restart skyfall-modbot

# Update bot
./update-bot.sh
```

---

## 🔧 API Endpoints

### Bot API Server (Pi)
The bot runs an internal API server on port 3001:

- `GET /health` - Bot health check
- `GET /analytics/:serverId` - Server analytics
- `GET /tickets/:serverId` - Server tickets
- `POST /tickets/:serverId/:ticketId/close` - Close ticket
- `GET /music/:serverId` - Music status
- `POST /music/:serverId/control` - Music controls
- `DELETE /music/:serverId/queue/:index` - Remove from queue

### Dashboard API Routes
- `/api/analytics/[serverId]` - Analytics data
- `/api/tickets/[serverId]` - Ticket management
- `/api/tickets/[serverId]/[ticketId]` - Individual ticket actions
- `/api/music/[serverId]` - Music data
- `/api/music/[serverId]/control` - Music controls
- `/api/commands/[serverId]` - Command management

---

## 🛡️ Security Checklist

- [ ] Environment variables configured properly
- [ ] Bot token secured and not exposed
- [ ] Database backups enabled
- [ ] Pi firewall configured (UFW recommended)
- [ ] SSH key authentication enabled
- [ ] Regular system updates scheduled
- [ ] PM2 process monitoring active
- [ ] Discord OAuth redirect URIs updated

---

## 📱 Discord Setup

### 1. Bot Permissions
Required permissions integer: `8589934591`
- Administrator (recommended for full functionality)
- Or specific permissions: Manage Server, Manage Channels, Manage Messages, etc.

### 2. OAuth Redirect URIs
Add these to your Discord app settings:
- `https://your-domain.vercel.app/auth/callback`
- `http://localhost:3000/auth/callback` (for development)

### 3. Slash Commands
Commands are automatically registered when bot starts. Manual registration:
```bash
node bot-commands/register-commands.js
```

---

## 🆘 Troubleshooting

### Common Issues

**Dashboard won't load:**
- Check Vercel deployment logs
- Verify environment variables
- Confirm Discord OAuth settings

**Bot offline:**
- Check PM2 status: `pm2 status`
- View logs: `pm2 logs skyfall-modbot`
- Verify token and permissions

**Commands not working:**
- Re-register commands: `node bot-commands/register-commands.js`
- Check bot permissions in Discord server
- Verify slash command scope

**Database issues:**
- Check file permissions: `ls -la bot.db`
- Recreate database: `node scripts/setup-database.js`

### Support
- Check logs first: `pm2 logs`
- Verify environment variables
- Test bot permissions
- Review Discord Developer Portal settings
