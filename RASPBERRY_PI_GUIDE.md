# 🍓 Raspberry Pi Setup Guide - Sapphire Modbot

## Current Status on Your Pi

Based on your terminal output:
- ✅ **Location:** `~/sapphire-modbot` 
- ✅ **Node.js:** v20.19.1 (Good!)
- ✅ **npm:** v10.8.2 (Good!)
- ✅ **Dependencies:** Installed
- ❌ **Missing:** `.env` file with bot credentials
- ❌ **Missing:** `start.js` file (NOW FIXED!)

---

## 🚀 Quick Fix - Run These Commands on Your Pi

```bash
cd ~/sapphire-modbot

# 1. Create .env file
nano .env
```

**Paste this into the file:**
```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
CLIENT_ID=your_client_id_here

MAX_MEMORY=200
PORT=3001
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

**Replace the placeholders:**
- Get your token from: https://discord.com/developers/applications
- Go to your application → Bot section → Copy token
- Go to General Information → Copy Application ID (Client ID)

```bash
# 2. Pull the updated files (including start.js)
git pull origin main

# 3. Update dependencies (fixes Node.js warning)
npm install

# 4. Deploy commands
npm run deploy-all

# 5. Start the bot
npm run bot
```

---

## 📝 Alternative: Manual File Creation

If `git pull` doesn't work, the files have been created in your Windows project folder. You need to:

### Option A: Use Git to sync
```bash
cd ~/sapphire-modbot
git pull
```

### Option B: Manually copy files
On your Windows machine, push changes:
```powershell
cd C:\Users\Mikhail\CascadeProjects\sapphire-modbot
git add .
git commit -m "Add start.js and Pi fixes"
git push
```

Then on Pi:
```bash
cd ~/sapphire-modbot
git pull
```

### Option C: Create start.js manually on Pi
```bash
cd ~/sapphire-modbot
nano start.js
```

Copy the content from the Windows file and paste it.

---

## 🔧 Fixing the Node.js Warning

The warning about `@discordjs/voice` requiring Node.js 22+ is just a warning. Your Node.js v20.19.1 will work fine, but to remove the warning:

```bash
# Update the package
npm install @discordjs/voice@^0.17.0

# Or update all packages
npm update
```

---

## 🎯 Complete Setup Steps

### 1. **Create .env File**
```bash
cd ~/sapphire-modbot
nano .env
```

Add your credentials (see above).

### 2. **Sync Files from GitHub**
```bash
git pull origin main
```

Or if you haven't pushed yet, wait for the files to be synced.

### 3. **Install/Update Dependencies**
```bash
npm install
```

### 4. **Deploy Commands to Discord**
```bash
npm run deploy-all
```

This should output:
```
✅ Successfully registered X application commands
```

### 5. **Start the Bot**
```bash
npm run bot
```

You should see:
```
🚀 Starting Sapphire Modbot...
🍓 Raspberry Pi detected - Applying optimizations...
✅ Skyfall bot is online!
```

---

## 🔄 Using PM2 for Auto-Restart

PM2 keeps your bot running even after you disconnect from SSH:

```bash
# Install PM2 globally (if not installed)
sudo npm install -g pm2

# Start bot with PM2
npm run pi:pm2

# View logs
npm run pi:logs

# Restart bot
npm run pi:restart

# Stop bot
npm run pi:stop

# Make PM2 start on boot
pm2 startup
pm2 save
```

---

## 📊 Monitoring on Pi

### Check Bot Status
```bash
# View logs
npm run pi:logs

# Check memory usage
free -h

# Check CPU usage
htop

# Check bot process
ps aux | grep node
```

### Performance Targets for Pi 2
- 💾 **Memory:** 60-85MB (optimized)
- 🔄 **CPU:** 5-15% average
- ⚡ **Response:** 200-500ms
- 🌡️ **Temp:** Keep under 80°C

---

## 🐛 Troubleshooting

### Error: "Cannot find module '/home/admin/sapphire-modbot/start.js'"
**Solution:** The file is now created. Pull from Git or create it manually.

```bash
git pull
# or
nano start.js  # and paste the content
```

### Error: "Missing required environment variables"
**Solution:** Create `.env` file with your bot credentials.

```bash
nano .env
# Add your DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID
```

### Warning: "Unsupported engine"
**Solution:** This is just a warning. The bot will work fine with Node.js v20. To remove:

```bash
npm install @discordjs/voice@^0.17.0
```

### Bot won't start
**Check these:**
1. `.env` file exists and has correct credentials
2. `start.js` file exists
3. `src/index.js` file exists
4. Dependencies are installed: `npm install`

### Bot crashes or high memory
**Pi 2 optimizations:**
```bash
# Start with manual GC
node --expose-gc start.js

# Or use the optimized start script
npm run bot
```

### Can't connect to voice channels
**Install audio dependencies:**
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg libopus-dev libsodium-dev
```

---

## 📁 File Structure on Pi

```
~/sapphire-modbot/
├── .env                    # Your bot credentials (CREATE THIS)
├── start.js                # Main startup script (NOW ADDED)
├── package.json            # Dependencies
├── src/
│   ├── index.js           # Bot entry point
│   ├── commands/          # All commands
│   ├── systems/           # Music, tickets, etc.
│   └── utils/             # Helper functions
└── node_modules/          # Installed packages
```

---

## 🎵 Music System on Pi

The music system works on Pi but has limitations:

**What Works:**
- ✅ YouTube URL playback
- ✅ Queue management
- ✅ Volume control
- ✅ Basic controls (play, skip, stop)

**Limitations:**
- ⚠️ Search disabled (use direct URLs)
- ⚠️ Some videos may be slow to load
- ⚠️ High bitrate may cause stuttering on Pi 2

**Recommended:**
- Use lower quality videos
- Keep queue small (5-10 songs)
- Monitor CPU/memory usage

---

## 🚀 Quick Command Reference

```bash
# Start bot
npm run bot

# Start with PM2 (recommended)
npm run pi:pm2

# Deploy commands
npm run deploy-all

# View logs
npm run pi:logs

# Restart bot
npm run pi:restart

# Stop bot
npm run pi:stop

# Update bot
git pull
npm install
npm run pi:restart
```

---

## ✅ Next Steps

1. **Create `.env` file** with your bot credentials
2. **Pull latest changes:** `git pull`
3. **Install dependencies:** `npm install`
4. **Deploy commands:** `npm run deploy-all`
5. **Start bot:** `npm run bot` or `npm run pi:pm2`
6. **Test:** Use `/ping` command in Discord

---

## 💡 Tips for Pi 2

1. **Use PM2** for automatic restarts
2. **Monitor memory** with `free -h`
3. **Keep bot updated** with `git pull`
4. **Limit music queue** to 5-10 songs
5. **Use SSH** to manage remotely
6. **Set up auto-start** with PM2 startup
7. **Monitor temperature** - keep cool!

---

## 🆘 Still Having Issues?

**Check the logs:**
```bash
npm run pi:logs
# or
tail -f ~/.pm2/logs/skyfall-bot-error.log
```

**Common issues:**
- Missing `.env` file → Create it with your credentials
- Missing `start.js` → Pull from Git or create manually
- Node.js warning → Update `@discordjs/voice` or ignore (it works)
- High memory → Restart bot: `npm run pi:restart`

---

**Your bot is ready to run on Raspberry Pi! 🍓🤖**
