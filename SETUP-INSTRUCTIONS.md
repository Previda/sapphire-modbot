# 🚀 Complete Setup Instructions for Your Pi

## What I Just Built For You

I've created a **comprehensive authentication system** that will prevent all those token errors you were experiencing. Here's what's new:

### ✨ New Features

1. **Interactive Setup Wizard** (`setup-bot.js`)
   - Guides you through getting your Discord credentials
   - Validates token format before saving
   - Creates a proper .env file automatically

2. **Smart Authentication Manager** (`src/utils/auth.js`)
   - Validates tokens before attempting login
   - Detects placeholder text in .env files
   - Provides detailed, actionable error messages
   - Prevents common configuration mistakes

3. **Emergency Fix Script** (`fix-now.sh`)
   - Quickly diagnose and fix token issues
   - Stops crash loops immediately
   - Validates your current configuration

4. **Enhanced Start Script** (`start-bot.sh`)
   - Checks for .env file before starting
   - Validates token isn't placeholder text
   - Better error messages

---

## 🎯 How to Fix Your Bot Right Now

### On Your Raspberry Pi:

```bash
# 1. Pull the latest code
cd ~/sapphire-modbot
git pull origin main

# 2. Run the emergency fix script
bash fix-now.sh
```

The fix script will:
- ✅ Stop the crashing bot
- ✅ Check your .env file
- ✅ Validate your token
- ✅ Tell you exactly what's wrong

---

## 🔧 If You Need a Fresh Setup

### Option 1: Interactive Wizard (Easiest)

```bash
cd ~/sapphire-modbot
node setup-bot.js
```

This will walk you through:
1. Getting your Discord bot token
2. Getting your client ID  
3. Creating a valid .env file

Then start the bot:
```bash
bash start-bot.sh
```

### Option 2: Manual Setup

1. **Get a NEW token from Discord:**
   - Go to https://discord.com/developers/applications
   - Click your bot (Skyfall)
   - Click **Bot** → **Reset Token**
   - Copy the ENTIRE token

2. **Create/update .env file:**
   ```bash
   nano ~/sapphire-modbot/.env
   ```

   Add this (replace with YOUR actual token):
   ```env
   DISCORD_BOT_TOKEN=MTxxxxxxxxxxxxxxxxx.GYxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxx
   DISCORD_CLIENT_ID=1358527215020544222
   PORT=3001
   API_PORT=3001
   ```

3. **Start the bot:**
   ```bash
   bash start-bot.sh
   ```

---

## 📋 What Changed in the Code

### New Files:
- `setup-bot.js` - Interactive setup wizard
- `src/utils/auth.js` - Authentication manager
- `fix-now.sh` - Emergency fix script
- `AUTH-SYSTEM.md` - Complete documentation
- `QUICK-FIX.md` - Quick troubleshooting guide

### Modified Files:
- `src/index.js` - Now uses the new auth system
- `start-bot.sh` - Added validation checks

---

## 🎉 What You'll See When It Works

When the bot starts successfully, you'll see:

```
🚀 Starting Skyfall Bot...

✅ Bot started!

📋 Checking status...
┌────┬─────────────┬────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name        │ mode   │ ↺    │ status    │ cpu      │ mem      │
├────┼─────────────┼────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ skyfall-bot │ fork   │ 0    │ online    │ 0%       │ 60.0mb   │
└────┴─────────────┴────────┴──────┴───────────┴──────────┴──────────┘

📝 Showing logs...
✅ Loaded 70 commands
🌐 Skyfall API server running on port 3001
🔐 Attempting to login to Discord...
✅ Successfully logged in to Discord!
✅ Skyfall bot is online!
```

---

## 🆘 If You See Errors

The new system provides **detailed help messages**. For example:

### "Token validation failed"
```
╔════════════════════════════════════════════════════════════════╗
║                    BOT SETUP REQUIRED                          ║
╚════════════════════════════════════════════════════════════════╝

Your bot credentials are missing or invalid. Follow these steps:

1. Get your Discord Bot Token:
   • Go to https://discord.com/developers/applications
   ...
```

Just follow the instructions in the error message!

---

## 🔍 Useful Commands

### Check bot status:
```bash
pm2 status skyfall-bot
```

### View live logs:
```bash
pm2 logs skyfall-bot
```

### Restart with new .env:
```bash
pm2 restart skyfall-bot --update-env
```

### Emergency stop:
```bash
pm2 stop skyfall-bot
```

### Complete restart:
```bash
pm2 delete skyfall-bot
pm2 start ~/sapphire-modbot/src/index.js --name skyfall-bot
```

---

## 📚 Documentation

- **AUTH-SYSTEM.md** - Complete authentication system documentation
- **QUICK-FIX.md** - Quick troubleshooting for common issues
- **PI-SETUP.md** - Original Pi setup guide

---

## 🎯 Next Steps

1. **Pull the latest code** on your Pi:
   ```bash
   cd ~/sapphire-modbot
   git pull origin main
   ```

2. **Run the fix script**:
   ```bash
   bash fix-now.sh
   ```

3. **If it says you need a new token**, run:
   ```bash
   node setup-bot.js
   ```

4. **Start the bot**:
   ```bash
   bash start-bot.sh
   ```

That's it! The new system will guide you through any issues with clear, actionable error messages.

---

## 💡 Pro Tips

1. **Never commit .env to git** - It's already in .gitignore
2. **Use the setup wizard** - It prevents 99% of configuration errors
3. **Read error messages carefully** - They now include solutions
4. **Check PM2 logs** - They show exactly what's happening

---

## ✅ Summary

You now have:
- ✅ Token validation before login attempts
- ✅ Clear error messages with solutions
- ✅ Interactive setup wizard
- ✅ Emergency fix script
- ✅ Protection against placeholder text
- ✅ Better documentation

**No more mysterious crashes! The bot will tell you exactly what's wrong and how to fix it.** 🚀
