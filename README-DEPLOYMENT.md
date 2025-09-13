# Sapphire Modbot Deployment Guide

## 🚀 Option 1: Same Repo + Vercel (Recommended)

### Quick Setup:
1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your existing `sapphire-modbot` repository
   - Select "Other" framework preset

2. **Environment Variables:**
   ```env
   DISCORD_TOKEN=your_token_here
   CLIENT_ID=your_client_id
   DASHBOARD_SECRET=your_secret_key
   ```

3. **Build Settings:**
   - Build Command: `npm run build` (optional)
   - Output Directory: `public`
   - Install Command: `npm install`

4. **Domain:**
   - Auto-generated: `sapphire-modbot-xxx.vercel.app`
   - Custom domain: `dashboard.yourdomain.com`

### File Structure:
```
sapphire-modbot/
├── public/           # Frontend (deployed to Vercel)
│   ├── dashboard.html
│   ├── modern-styles.css
│   └── modern-dashboard.js
├── src/             # Bot code (runs on Pi)
├── vercel.json      # Vercel config
└── package.json
```

---

## 🔄 Option 2: Separate Repository

### Setup New Repo:
```bash
# Create new repository
gh repo create sapphire-dashboard --public

# Clone and setup
git clone https://github.com/Previda/sapphire-dashboard.git
cd sapphire-dashboard

# Copy dashboard files
cp -r ../sapphire-modbot/public/* .
```

### Sync Strategy:
- **GitHub Actions** to sync files between repos
- **Git submodules** to link repositories
- **Manual sync** when updating dashboard

---

## 🌐 Deployment URLs

### Vercel Deployment:
- **Frontend:** `https://sapphire-modbot.vercel.app`
- **API Endpoints:** `https://sapphire-modbot.vercel.app/api/*`

### Pi Backend:
- **Bot API:** `http://192.168.1.62:3000`
- **Local Dashboard:** `http://192.168.1.62:3000`

---

## 🔧 Configuration

### Vercel.json Features:
- Static file serving for dashboard
- API route proxying
- Environment variable management
- Automatic deployments on git push

### Benefits:
✅ **Same Repo:** Easier management, single source of truth
✅ **Auto Deploy:** Push to git = instant deployment
✅ **Custom Domain:** Professional dashboard URL
✅ **SSL/CDN:** Fast, secure delivery worldwide
✅ **Analytics:** Built-in performance monitoring

---

# 🚀 Sapphire Modbot Deployment Guide
*Updated for Discord.js v14.22.1 and latest dependencies*

## 🔧 Quick Setup

### 1. Environment Setup
```bash
# Interactive setup (recommended)
node setup-env.js

# Or copy and edit manually
cp .env.example .env
nano .env
```

### 2. Quick Windows Deployment
```powershell
# Run PowerShell script for automatic setup
.\quick-deploy.ps1
```

### 3. Manual Setup
```bash
# Install dependencies
npm install

# Deploy Discord commands
node deploy-all-commands.js

# Start bot
npm run bot
```

## 🍓 Raspberry Pi Deployment

### Automated Pi Deployment
```bash
# Download and run the deployment script
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/sapphire-modbot/main/deploy-to-pi.sh | bash
```

### Manual Pi Setup
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y nodejs npm git python3 python3-pip ffmpeg

# Install yt-dlp for enhanced YouTube support
sudo pip3 install yt-dlp

# Clone and setup repository
git clone https://github.com/YOUR_USERNAME/sapphire-modbot.git
cd sapphire-modbot

# Handle any existing conflicts
git stash push -m "Auto-stash $(date)"
git reset --hard HEAD
git clean -fd
git pull origin main

# Install Node.js dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Add your bot token and configuration

# Deploy Discord commands
node deploy-all-commands.js

# Install PM2 for process management
npm install -g pm2

# Start services with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Verify deployment
pm2 status
```

## ☁️ Vercel Dashboard Deployment

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/sapphire-modbot)

### Manual Vercel Configuration
1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables** (Required):
   ```
   NEXT_PUBLIC_DISCORD_CLIENT_ID=1358527215020544222
   PI_BOT_API_URL=http://your-pi-ip:3001
   PI_BOT_TOKEN=your_secure_pi_token
   DISCORD_REDIRECT_URI=https://your-app.vercel.app/auth/callback
   ```
3. **Deploy**: Push to GitHub triggers automatic deployment

## 🔧 Updated Configuration

### Essential Environment Variables
```bash
# Discord Bot Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=1358527215020544222
GUILD_ID=your_server_id  # Optional - for instant command deployment

# Performance Settings
MAX_MEMORY=400
LOG_LEVEL=info
NODE_ENV=production

# Dashboard Integration (Optional)
PI_BOT_API_URL=http://your-pi-ip:3001
PI_BOT_TOKEN=your_secure_token
```

## 🎵 Enhanced Music Setup

### Latest Audio Dependencies
The bot now uses the newest Discord.js voice system with improved reliability:
- **Discord.js**: v14.22.1 (latest)
- **@discordjs/voice**: v0.17.0 (latest)
- Multiple fallback strategies for YouTube playback

### Pi Music Optimization
```bash
# Install latest yt-dlp
sudo pip3 install --upgrade yt-dlp

# Install additional audio libraries
sudo apt install -y libopus-dev libsodium-dev ffmpeg

# Test installation
yt-dlp --version
ffmpeg -version
```

## 🛠️ New Features & Fixes

### ✅ Latest Updates
- **Discord.js v14.22.1**: Latest stable release with all new Discord features
- **Enhanced Music Streaming**: Multiple fallback strategies for reliable playback
- **Improved Error Handling**: Better voice connection recovery and error messages
- **Guild-Specific Commands**: Instant command deployment for development
- **Enhanced Dashboard**: Modern UI with glass morphism and responsive design

### 🎯 Command System
All 57+ commands now include:
- Advanced validation and error handling
- Option ordering auto-fix
- Comprehensive permission checks
- Ephemeral replies for security

### 🔧 Deployment Scripts
- `setup-env.js` - Interactive environment configuration
- `deploy-all-commands.js` - Enhanced command deployment with validation
- `quick-deploy.ps1` - One-click Windows setup
- `deploy-to-pi.sh` - Automated Pi deployment

## 🔍 Enhanced Troubleshooting

### Commands Not Appearing
```bash
# 1. Check bot permissions (must include applications.commands)
# 2. Re-deploy commands
node deploy-all-commands.js

# 3. For instant updates, use guild deployment
echo "GUILD_ID=your_server_id" >> .env
node deploy-all-commands.js

# 4. Re-invite bot with updated scopes
# Go to Discord Developer Portal > OAuth2 > URL Generator
# Select: bot + applications.commands
```

### Music Playback Issues
```bash
# Check yt-dlp installation and update
yt-dlp --version
sudo pip3 install --upgrade yt-dlp

# Test with popular songs
/play never gonna give you up
/play official music video

# Monitor Pi resources
htop
pm2 monit
```

### Dashboard Connection Issues
```bash
# Check Pi API server
pm2 status pi-api-server
curl http://localhost:3001/health

# Verify Vercel environment variables
# Check network connectivity between Vercel and Pi
```

## 📊 Monitoring & Maintenance

### PM2 Management
```bash
# Service status
pm2 status

# View logs
pm2 logs sapphire-bot
pm2 logs pi-api-server

# Real-time monitoring
pm2 monit

# Restart services
pm2 restart all

# Update and restart
git pull && npm install && pm2 restart all
```

### Performance Monitoring
```bash
# System resources
htop
free -h
df -h

# Network connectivity
ping discord.com
curl -I https://www.youtube.com

# Bot-specific metrics
pm2 show sapphire-bot
```

## 🔄 Update Procedures

### Bot Updates
```bash
# 1. Backup current installation
cp .env .env.backup

# 2. Pull latest changes
git stash push -m "Pre-update backup"
git pull origin main

# 3. Update dependencies
npm install

# 4. Deploy new commands
node deploy-all-commands.js

# 5. Restart services
pm2 restart all
```

### Dashboard Updates
```bash
# Automatic via Vercel
git push origin main

# Manual verification
# Check Vercel deployment dashboard
# Test dashboard functionality
```

## 🎯 Testing Checklist

Essential commands to verify:
- ✅ `/ping` - Bot connectivity
- ✅ `/play rick roll` - Music with fallback
- ✅ `/verification setup` - Verification system
- ✅ `/ticket open test issue` - Ticket management
- ✅ `/ban @user spam` - Moderation commands
- ✅ `/ticket admin force-close 123` - Admin commands

## 🆘 Support & Recovery

### Emergency Recovery
```bash
# Complete reset (Pi)
pm2 delete all
rm -rf node_modules package-lock.json
git reset --hard HEAD
npm install
pm2 start ecosystem.config.js
```

### Log Analysis
```bash
# Bot errors
pm2 logs sapphire-bot --lines 100

# System errors
sudo tail -f /var/log/syslog | grep -i error

# Discord API status
curl -s https://discordstatus.com/api/v2/status.json
```

---

## 🎉 Success Indicators

Your bot is properly deployed when:
- ✅ All PM2 services show "online"
- ✅ Discord commands appear with `/` in chat
- ✅ `/ping` responds immediately
- ✅ `/play` can stream YouTube audio
- ✅ Dashboard loads and shows live data
- ✅ No critical errors in `pm2 logs`

**🔥 Your enhanced Sapphire Modbot with Discord.js v14.22.1 is ready to rock!**
