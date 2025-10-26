# 🔐 Enhanced Authentication System

## Overview

The bot now includes a robust authentication system that:
- ✅ Validates Discord bot tokens before attempting login
- ✅ Provides clear, actionable error messages
- ✅ Prevents common configuration mistakes
- ✅ Includes an interactive setup wizard
- ✅ Detects placeholder text in configuration

## Quick Start

### Option 1: Interactive Setup Wizard (Recommended)

```bash
cd ~/sapphire-modbot
node setup-bot.js
```

The wizard will guide you through:
1. Getting your Discord bot token
2. Getting your client ID
3. Configuring ports
4. Creating a valid .env file

### Option 2: Manual Setup

1. **Get your credentials from Discord:**
   - Go to https://discord.com/developers/applications
   - Click your bot → Bot section
   - Reset Token → Copy the new token
   - Go to OAuth2 → Copy Client ID

2. **Create .env file:**
   ```bash
   nano ~/sapphire-modbot/.env
   ```

3. **Add your credentials:**
   ```env
   DISCORD_BOT_TOKEN=MTxxxxx.GYxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxx
   DISCORD_CLIENT_ID=1358527215020544222
   PORT=3001
   API_PORT=3001
   ```

4. **Start the bot:**
   ```bash
   bash start-bot.sh
   ```

## Features

### 1. Token Validation

The system validates tokens before attempting to login:

```javascript
const authManager = require('./utils/auth');

// Validates token format
const validation = authManager.validateToken(token);
if (!validation.valid) {
    console.error(validation.error);
}
```

**Checks performed:**
- ✅ Token is not empty
- ✅ Token is at least 50 characters
- ✅ Token doesn't contain placeholder text
- ✅ Token has correct format (3 parts separated by dots)
- ✅ Each part has content

### 2. Enhanced Error Messages

When authentication fails, you get detailed help:

```
╔════════════════════════════════════════════════════════════════╗
║                    BOT SETUP REQUIRED                          ║
╚════════════════════════════════════════════════════════════════╝

Your bot credentials are missing or invalid. Follow these steps:

1. Get your Discord Bot Token:
   • Go to https://discord.com/developers/applications
   • Click your bot application
   • Click "Bot" in the left sidebar
   • Click "Reset Token" button
   ...
```

### 3. Common Error Detection

The system detects and provides solutions for:

#### Invalid Token
```
Error: Invalid Discord bot token

SOLUTION:
1. Go to https://discord.com/developers/applications
2. Click your bot → Bot section
3. Click "Reset Token"
4. Copy the NEW token
5. Update .env file with the new token
6. Restart: pm2 restart skyfall-bot --update-env
```

#### Missing Intents
```
Error: Missing required intents

SOLUTION:
1. Go to https://discord.com/developers/applications
2. Click your bot → Bot section
3. Scroll to "Privileged Gateway Intents"
4. Enable: Server Members Intent, Message Content Intent
5. Save changes
6. Restart the bot
```

## File Structure

```
sapphire-modbot/
├── src/
│   ├── utils/
│   │   └── auth.js          # Authentication manager
│   └── index.js             # Main bot file (uses auth)
├── setup-bot.js             # Interactive setup wizard
├── start-bot.sh             # Enhanced start script
├── QUICK-FIX.md            # Quick troubleshooting guide
└── AUTH-SYSTEM.md          # This file
```

## API Reference

### AuthManager

#### `validateToken(token)`
Validates Discord bot token format.

**Returns:**
```javascript
{
    valid: boolean,
    error?: string,
    token?: string
}
```

#### `validateClientId(clientId)`
Validates Discord client ID format.

**Returns:**
```javascript
{
    valid: boolean,
    error?: string,
    clientId?: string
}
```

#### `loadCredentials()`
Loads and validates credentials from environment variables.

**Returns:**
```javascript
{
    success: boolean,
    error?: string,
    help?: string,
    token?: string,
    clientId?: string
}
```

#### `login(client)`
Attempts to login to Discord with validation.

**Parameters:**
- `client` - Discord.js Client instance

**Returns:**
```javascript
{
    success: boolean,
    message?: string,
    error?: string,
    details?: string,
    help?: string
}
```

## Troubleshooting

### Bot keeps crashing

1. **Stop the bot:**
   ```bash
   pm2 stop skyfall-bot
   ```

2. **Check your .env file:**
   ```bash
   cat ~/sapphire-modbot/.env
   ```

3. **Look for placeholder text:**
   - ❌ `YOUR_TOKEN_HERE`
   - ❌ `<paste your token here>`
   - ✅ Actual token: `MTxxxxx.GYxxxx.xxx...`

4. **Run setup wizard:**
   ```bash
   node setup-bot.js
   ```

### Token is valid but bot won't start

1. **Check intents in Discord Developer Portal:**
   - Server Members Intent
   - Message Content Intent
   - Presence Intent (optional)

2. **Verify bot permissions:**
   - Bot has proper role in your server
   - Bot has necessary channel permissions

3. **Check logs:**
   ```bash
   pm2 logs skyfall-bot --lines 50
   ```

### Environment variables not updating

```bash
# Force PM2 to reload environment
pm2 restart skyfall-bot --update-env

# Or delete and recreate
pm2 delete skyfall-bot
pm2 start src/index.js --name skyfall-bot
```

## Best Practices

1. **Never commit .env file to git**
   - Already in .gitignore
   - Contains sensitive credentials

2. **Reset token if compromised**
   - Go to Discord Developer Portal
   - Reset token immediately
   - Update .env file
   - Restart bot

3. **Use setup wizard for new deployments**
   - Prevents configuration errors
   - Validates input
   - Creates proper .env file

4. **Check logs regularly**
   ```bash
   pm2 logs skyfall-bot
   ```

5. **Keep PM2 process list clean**
   ```bash
   pm2 delete all  # Remove all processes
   pm2 start src/index.js --name skyfall-bot  # Start fresh
   ```

## Migration from Old System

If you're upgrading from the old authentication system:

1. **Pull latest code:**
   ```bash
   cd ~/sapphire-modbot
   git pull origin main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run setup wizard:**
   ```bash
   node setup-bot.js
   ```

4. **Restart bot:**
   ```bash
   bash start-bot.sh
   ```

The new system is backward compatible but provides much better error handling!

## Support

If you encounter issues:

1. Check `QUICK-FIX.md` for common solutions
2. Review error messages carefully (they include solutions)
3. Verify credentials in Discord Developer Portal
4. Check PM2 logs for detailed error information

---

**The authentication system is designed to prevent the most common bot startup issues and provide clear guidance when problems occur!** 🚀
