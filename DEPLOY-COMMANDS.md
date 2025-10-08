# 🚀 Complete Deployment Guide

## 📱 **Deploy to Raspberry Pi**

### **Method 1: Automated Deployment (Recommended)**
```bash
# Copy deployment script to Pi
scp deploy-pi.sh admin@192.168.1.62:/home/admin/sapphire-modbot/

# Run automated deployment
ssh admin@192.168.1.62 "cd sapphire-modbot && chmod +x deploy-pi.sh && ./deploy-pi.sh"
```

### **Method 2: Manual Step-by-Step**
```bash
# 1. Copy all files to Pi
scp fix-bot.js fix-ticket-system.js fix-all-issues.js deploy-commands-clean.js admin@192.168.1.62:/home/admin/sapphire-modbot/

# 2. SSH into Pi
ssh admin@192.168.1.62

# 3. Navigate to bot directory
cd /home/admin/sapphire-modbot

# 4. Update bot token in .env file
nano .env
# Add: DISCORD_TOKEN=your_actual_bot_token_here

# 5. Run all fixes
node fix-all-issues.js
node fix-bot.js
node fix-ticket-system.js

# 6. Deploy Discord commands
node deploy-commands-clean.js

# 7. Restart bot services
pm2 stop all
pm2 start index.js --name "sapphire-bot" --max-memory-restart 200M
pm2 save
pm2 startup

# 8. Check status
pm2 status
pm2 logs sapphire-bot --lines 50
```

## 🌐 **Deploy to Vercel**

### **Method 1: Using Vercel CLI**
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy to production
vercel --prod

# Or use npm script
npm run deploy:vercel
```

### **Method 2: Git-based Deployment**
```bash
# Commit all changes
git add .
git commit -m "🚀 Complete bot and website fixes"
git push origin main

# Vercel will auto-deploy from GitHub
# Visit: https://vercel.com/dashboard to check status
```

## 🔧 **Quick Fix Commands**

### **Run Individual Fixes**
```bash
npm run fix:all        # Fix everything
npm run fix:bot        # Fix bot issues only
npm run fix:tickets    # Fix ticket system only
```

### **Bot Management**
```bash
npm run bot:start      # Start bot locally
npm run bot:deploy     # Deploy Discord commands
```

### **Website Development**
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
```

## 🔍 **Troubleshooting**

### **If Bot Won't Start on Pi:**
```bash
# Check logs
pm2 logs sapphire-bot

# Restart with fresh config
pm2 delete all
pm2 start index.js --name "sapphire-bot"

# Check Discord token
node -e "console.log('Token length:', process.env.DISCORD_TOKEN?.length || 'Missing')"
```

### **If Website Has Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
npm run start

# Check environment variables
cat .env.local
```

### **If Commands Don't Appear in Discord:**
```bash
# Re-deploy commands
node deploy-commands-clean.js

# Check bot permissions in Discord Developer Portal
# Ensure bot has "applications.commands" scope
```

## 📋 **Post-Deployment Checklist**

### **Raspberry Pi:**
- [ ] Bot is online in Discord
- [ ] `/ping` command works
- [ ] `/ticket open` works without errors
- [ ] PM2 shows bot running
- [ ] Logs show no errors

### **Vercel:**
- [ ] Website loads at https://skyfall-omega.vercel.app
- [ ] Dashboard authentication works
- [ ] API endpoints respond
- [ ] No hydration errors in console

### **Discord:**
- [ ] Bot shows as online
- [ ] Slash commands appear in autocomplete
- [ ] Ticket system works
- [ ] Music commands work (if enabled)
- [ ] No "application did not respond" errors

## 🆘 **Emergency Commands**

### **If Everything Breaks:**
```bash
# On Pi - Nuclear restart
pm2 delete all
pm2 kill
cd /home/admin/sapphire-modbot
node fix-all-issues.js
pm2 start index.js --name "sapphire-bot"

# On Local - Reset everything
rm -rf node_modules .next
npm install
npm run build
```

### **Get Fresh Bot Token:**
1. Go to https://discord.com/developers/applications
2. Select your bot (Sapphire Modbot)
3. Go to "Bot" section
4. Click "Reset Token"
5. Copy new token immediately
6. Update `.env` file on Pi

## 📞 **Support**

If you encounter issues:
1. Check the logs: `pm2 logs sapphire-bot`
2. Verify environment variables: `cat .env`
3. Test Discord API: `node fix-bot.js`
4. Check website console for React errors
5. Ensure all dependencies are installed: `npm install`

---

**🎉 Your bot and website should now be fully functional!**
