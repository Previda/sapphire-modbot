# 🚀 Quick Fix Guide - Token Issues

## Problem: Bot keeps crashing with "TokenInvalid" error

### ✅ Solution (5 minutes):

## Step 1: Stop the crashing bot
```bash
pm2 stop skyfall-bot
```

## Step 2: Run the setup wizard
```bash
cd ~/sapphire-modbot
node setup-bot.js
```

Follow the prompts to enter your:
- Discord Bot Token (from Discord Developer Portal)
- Discord Client ID

## Step 3: Restart the bot
```bash
pm2 delete skyfall-bot
pm2 start src/index.js --name skyfall-bot
pm2 logs skyfall-bot
```

You should see: `✅ Successfully logged in to Discord!`

---

## Manual Fix (if setup wizard doesn't work):

### 1. Get a NEW token from Discord:
1. Go to https://discord.com/developers/applications
2. Click your bot (Skyfall)
3. Click **Bot** in left sidebar
4. Click **Reset Token** button
5. Click **Yes, do it!**
6. **COPY THE ENTIRE TOKEN** (looks like: `MTxxxxx.GYxxxx.xxxxxxxxxx`)

### 2. Update .env file:
```bash
nano ~/sapphire-modbot/.env
```

Replace the file contents with:
```env
DISCORD_BOT_TOKEN=<paste your token here>
DISCORD_CLIENT_ID=1358527215020544222
PORT=3001
API_PORT=3001
```

**IMPORTANT:** Replace `<paste your token here>` with your ACTUAL token!

Save: `Ctrl+X`, then `Y`, then `Enter`

### 3. Verify the token was saved:
```bash
cat ~/sapphire-modbot/.env
```

Make sure it shows your real token, NOT placeholder text!

### 4. Restart:
```bash
pm2 restart skyfall-bot --update-env
pm2 logs skyfall-bot
```

---

## Common Mistakes:

❌ **DON'T** leave placeholder text like:
- `YOUR_TOKEN_HERE`
- `YOUR_NEW_TOKEN_FROM_DISCORD_HERE`
- `<paste your token here>`

✅ **DO** use the actual token from Discord:
- Example: `MTxxxxxxxxxxxxxxxxx.GYxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxx` (70+ characters)

---

## Still not working?

### Check if token is valid:
```bash
cd ~/sapphire-modbot
node -e "require('dotenv').config(); console.log('Token length:', process.env.DISCORD_BOT_TOKEN.length);"
```

Should show: `Token length: 70` or higher

### Check for errors:
```bash
pm2 logs skyfall-bot --lines 50 --nostream
```

Look for specific error messages and follow the help text provided.

---

## Need Help?

1. Make sure you're using the LATEST token from Discord (reset it if unsure)
2. Make sure the token has NO spaces or line breaks
3. Make sure you saved the .env file correctly
4. Make sure PM2 reloaded the environment variables

**The new authentication system will give you detailed error messages to help debug!**
