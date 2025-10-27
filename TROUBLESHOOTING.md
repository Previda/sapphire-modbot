# 🔧 Troubleshooting Guide - Raspberry Pi 2

## Quick Fixes

### Bot Won't Start - "TokenInvalid" Error

**Problem:** Bot keeps crashing with "An invalid token was provided"

**Solution:**
```bash
cd ~/sapphire-modbot

# 1. Stop the bot
pm2 stop all
pm2 delete all

# 2. Check your .env file
cat .env

# 3. If you see placeholder text, you need a REAL token:
#    - Go to https://discord.com/developers/applications
#    - Click your bot → Bot section
#    - Click "Reset Token"
#    - Copy the ENTIRE new token

# 4. Edit .env file
nano .env

# 5. Replace the token line with:
DISCORD_BOT_TOKEN=paste_your_actual_token_here

# 6. Save (Ctrl+X, Y, Enter)

# 7. Start bot
bash quick-start.sh
```

---

### Monitor Script Error - "bc: command not found"

**Problem:** `monitor-pi2.sh` shows "bc: command not found"

**Solution:** The script has been updated to use `awk` instead of `bc`. Pull the latest code:
```bash
cd ~/sapphire-modbot
git pull origin main
chmod +x *.sh
```

---

### Bot Status Shows "Not Running"

**Problem:** PM2 shows bot is stopped or not found

**Solution:**
```bash
# Quick start
bash quick-start.sh

# Or manual start
pm2 start ecosystem.config.js

# Check logs for errors
pm2 logs skyfall-bot --lines 50
```

---

### High Memory Usage

**Problem:** Bot using >350MB memory

**Solution:**
```bash
# Restart to clear memory
pm2 restart skyfall-bot

# If it keeps happening, check for:
# 1. Too many guilds (leave unused servers)
# 2. Memory leaks in custom code
# 3. Large music queues

# Monitor memory
pm2 monit
```

---

### Bot Keeps Restarting

**Problem:** Bot restarts every few minutes

**Causes & Solutions:**

1. **Memory limit exceeded (400MB)**
   ```bash
   # Check memory usage
   pm2 describe skyfall-bot | grep memory
   
   # If consistently >400MB, increase limit in ecosystem.config.js:
   max_memory_restart: '450M'
   ```

2. **Invalid token**
   ```bash
   # Check logs for "TokenInvalid"
   pm2 logs skyfall-bot --err --lines 20
   
   # Fix: Get new token and update .env
   ```

3. **Missing dependencies**
   ```bash
   # Reinstall dependencies
   cd ~/sapphire-modbot
   rm -rf node_modules
   npm install --production
   ```

---

### PM2 Commands Not Working

**Problem:** `pm2` command not found or errors

**Solution:**
```bash
# Install PM2 globally
npm install -g pm2

# Or use npx
npx pm2 status
npx pm2 start ecosystem.config.js
```

---

### Disk Space Full

**Problem:** "No space left on device"

**Solution:**
```bash
# Clear PM2 logs
pm2 flush

# Clear system logs
sudo journalctl --vacuum-time=7d

# Check disk usage
df -h

# Find large files
du -h ~ | sort -rh | head -20
```

---

### Slow Performance

**Problem:** Bot is slow or unresponsive

**Solutions:**

1. **Check system resources**
   ```bash
   htop
   # Look for high CPU/memory usage
   ```

2. **Restart bot**
   ```bash
   pm2 restart skyfall-bot
   ```

3. **Reboot Pi**
   ```bash
   sudo reboot
   ```

4. **Enable swap if not enabled**
   ```bash
   # Check swap
   free -h
   
   # If swap is 0, enable it:
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   ```

---

### Cannot Connect to Discord

**Problem:** Bot online but not responding to commands

**Causes & Solutions:**

1. **Missing intents**
   - Go to Discord Developer Portal
   - Bot → Privileged Gateway Intents
   - Enable: Server Members, Message Content
   - Restart bot

2. **Bot not in server**
   - Re-invite bot with proper permissions
   - Use invite link from Developer Portal

3. **Commands not registered**
   ```bash
   # Check logs for command registration
   pm2 logs skyfall-bot | grep "Loaded command"
   ```

---

### Git Pull Fails

**Problem:** `git pull` shows conflicts or errors

**Solution:**
```bash
cd ~/sapphire-modbot

# Stash local changes
git stash

# Pull latest
git pull origin main

# If you need your changes back
git stash pop

# Or discard local changes completely
git reset --hard origin/main
```

---

### Node.js Version Issues

**Problem:** Errors about Node.js version

**Solution:**
```bash
# Check Node version
node -v

# Should be 14+ for best performance
# If older, update:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Common Error Messages

### "EADDRINUSE: address already in use :::3001"

**Cause:** Another process is using port 3001

**Solution:**
```bash
# Find and kill the process
sudo lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

### "MODULE_NOT_FOUND"

**Cause:** Missing npm dependencies

**Solution:**
```bash
cd ~/sapphire-modbot
npm install --production
```

### "EPIPE" or "write EPIPE"

**Cause:** PM2 communication error (usually harmless)

**Solution:**
```bash
# Restart PM2
pm2 kill
pm2 start ecosystem.config.js
```

### "Cannot find module 'discord.js'"

**Cause:** Dependencies not installed

**Solution:**
```bash
cd ~/sapphire-modbot
npm install discord.js
# Or reinstall all
npm install
```

---

## Diagnostic Commands

### Check Bot Status
```bash
pm2 status
pm2 describe skyfall-bot
```

### View Logs
```bash
# Live logs
pm2 logs skyfall-bot

# Last 50 lines
pm2 logs skyfall-bot --lines 50 --nostream

# Error logs only
pm2 logs skyfall-bot --err
```

### Check System Resources
```bash
# Memory
free -h

# CPU
top -bn1 | head -20

# Disk
df -h

# Temperature (if available)
vcgencmd measure_temp
```

### Check Configuration
```bash
# View .env (token hidden)
cat .env | sed 's/DISCORD_BOT_TOKEN=.*/DISCORD_BOT_TOKEN=***HIDDEN***/'

# Check token length
grep "DISCORD_BOT_TOKEN=" .env | cut -d'=' -f2 | wc -c

# Verify Node.js
node -v
npm -v
```

### Test Bot Manually
```bash
cd ~/sapphire-modbot

# Load .env and check token
node -e "require('dotenv').config(); console.log('Token length:', process.env.DISCORD_BOT_TOKEN?.length || 0);"

# Try starting directly (for debugging)
node src/index.js
```

---

## Emergency Recovery

### Complete Reset
```bash
cd ~/sapphire-modbot

# 1. Stop everything
pm2 stop all
pm2 delete all
pm2 kill

# 2. Pull latest code
git stash
git pull origin main

# 3. Reinstall dependencies
rm -rf node_modules
npm install --production

# 4. Verify .env has real token
cat .env

# 5. Start fresh
bash quick-start.sh
```

### System Frozen
```bash
# Reboot Pi
sudo reboot

# After reboot, start bot
cd ~/sapphire-modbot
bash quick-start.sh
```

### Out of Memory
```bash
# Stop bot
pm2 stop all

# Clear cache
sudo sync
sudo sh -c 'echo 3 > /proc/sys/vm/drop_caches'

# Start bot
pm2 start ecosystem.config.js
```

---

## Prevention Tips

1. **Monitor regularly**
   ```bash
   pm2 monit
   # Or use: bash monitor-pi2.sh (after fixing bc issue)
   ```

2. **Keep updated**
   ```bash
   cd ~/sapphire-modbot
   git pull origin main
   npm install
   pm2 restart skyfall-bot
   ```

3. **Enable auto-start**
   ```bash
   pm2 startup
   pm2 save
   ```

4. **Set up log rotation**
   ```bash
   # Add to crontab (crontab -e)
   0 0 * * * pm2 flush
   0 4 * * * pm2 restart skyfall-bot
   ```

5. **Enable swap**
   ```bash
   sudo fallocate -l 1G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

---

## Getting Help

### Check Documentation
- `PI2-OPTIMIZATION.md` - Performance guide
- `PI2-QUICK-REFERENCE.md` - Command reference
- `SETUP-INSTRUCTIONS.md` - Setup guide
- `AUTH-SYSTEM.md` - Authentication help
- `QUICK-FIX.md` - Quick fixes

### Collect Information
When asking for help, provide:
```bash
# System info
uname -a
cat /proc/device-tree/model
free -h
df -h

# Bot info
pm2 status
pm2 logs skyfall-bot --lines 50 --nostream

# Node info
node -v
npm -v

# Config (token hidden)
cat .env | sed 's/DISCORD_BOT_TOKEN=.*/DISCORD_BOT_TOKEN=***HIDDEN***/'
```

---

## Still Having Issues?

1. **Check logs carefully** - They usually tell you what's wrong
2. **Try quick-start.sh** - Handles most common issues
3. **Verify token** - 90% of issues are invalid tokens
4. **Check system resources** - Pi 2 has limited RAM
5. **Reboot if needed** - Sometimes the simplest solution works

**Most common fix:** Get a fresh token from Discord and update `.env`!
