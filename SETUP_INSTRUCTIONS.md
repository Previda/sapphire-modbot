# 🚀 Sapphire Modbot - Complete Setup Guide

## ✅ Prerequisites Checklist

### 1. **Install Node.js** (Required)
- Download from: https://nodejs.org/
- Install **LTS version** (v18.x or v20.x)
- Restart your terminal/IDE after installation
- Verify: `node --version` and `npm --version`

### 2. **Install Git** (Already Done ✓)
- You have Git version 2.51.2 installed
- Configured with username: Previda
- Configured with email: mikhailali2010@gmail.com

### 3. **Discord Bot Setup**
You need to create a Discord bot and get credentials:

#### Step-by-step:
1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Give it a name (e.g., "Sapphire Modbot")
4. Go to "Bot" section in left sidebar
5. Click "Add Bot"
6. Under "Token" section, click "Reset Token" and copy it
7. **Save this token** - you'll need it for `.env` file
8. Enable these **Privileged Gateway Intents**:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
9. Go to "OAuth2" → "General"
10. Copy your **Application ID** (this is your CLIENT_ID)

#### Invite Bot to Server:
1. Go to "OAuth2" → "URL Generator"
2. Select scopes:
   - ✅ bot
   - ✅ applications.commands
3. Select bot permissions:
   - ✅ Administrator (or specific permissions you need)
4. Copy the generated URL and open it in browser
5. Select your server and authorize

---

## 📝 Configuration

### Create `.env` File

Create a file named `.env` in the project root with:

```env
# Required Discord Bot Settings
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_client_id_here

# Optional Database (leave empty if not using)
MYSQL_URL=
MONGODB_URI=

# Optional Channel IDs (leave empty for now)
MOD_LOG_CHANNEL_ID=
APPEALS_CHANNEL_ID=

# Memory Settings (for Raspberry Pi - leave default)
MAX_MEMORY=200
PORT=3001
```

**Replace:**
- `your_bot_token_here` with the token from Discord Developer Portal
- `your_application_client_id_here` with your Application ID

---

## 🔧 Installation Steps

### 1. Install Dependencies
```powershell
cd C:\Users\Mikhail\CascadeProjects\sapphire-modbot
npm install
```

This will install all required packages including:
- `discord.js` - Discord API library
- `@discordjs/voice` - Voice connection support
- `@distube/ytdl-core` - YouTube music streaming
- `express` - API server
- `next.js` - Web dashboard
- And many more...

### 2. Deploy Commands to Discord
```powershell
npm run deploy-all
```

This registers all slash commands with Discord.

### 3. Start the Bot
```powershell
npm run bot
```

Or for direct start:
```powershell
npm run bot-direct
```

---

## 🎵 Music System

The bot includes a comprehensive music system with:
- YouTube URL playback (search currently unavailable due to YouTube API changes)
- Queue management
- Volume control
- Loop/shuffle features
- Now playing display

### Music Commands:
- `/play <youtube-url>` - Play a song from YouTube URL
- `/skip` - Skip current song
- `/stop` - Stop playback and clear queue
- `/queue` - Show current queue
- `/nowplaying` - Show current song
- `/volume <1-100>` - Adjust volume
- `/loop <off/song/queue>` - Set loop mode
- `/shuffle` - Shuffle the queue

**Note:** Due to YouTube API changes, you must use direct YouTube URLs. Song search is temporarily unavailable.

---

## 🛡️ Available Features

### Moderation Commands
- `/ban` - Ban users
- `/kick` - Kick users
- `/mute` - Mute users
- `/warn` - Warn users
- `/timeout` - Timeout users
- `/purge` - Bulk delete messages
- `/lock` - Lock channels
- `/slowmode` - Set slowmode

### Ticket System
- `/ticket` - Create support tickets
- `/ticket-manage` - Manage tickets
- Advanced ticket categories
- Automatic permissions
- Transcript generation

### Economy System
- `/balance` - Check balance
- `/work` - Work for money
- `/daily` - Daily rewards
- XP and leveling system

### Utility Commands
- `/ping` - Check bot latency
- `/serverinfo` - Server information
- `/userinfo` - User information
- `/avatar` - Get user avatar

### Admin Commands
- `/setup` - Initial server setup
- `/automod` - Configure auto-moderation
- `/logging` - Configure logging
- `/verification` - Setup verification system
- `/backup` - Backup server data

---

## 🐛 Troubleshooting

### Commands not showing up?
1. Make sure you ran `npm run deploy-all`
2. Restart Discord client
3. Wait a few minutes for Discord to update

### Bot not responding?
1. Check if bot is online in Discord
2. Verify bot has proper permissions
3. Check console for errors
4. Make sure `.env` file has correct token

### Music not working?
1. Ensure you're using YouTube URLs (not search terms)
2. Check if bot has voice permissions
3. Make sure you're in a voice channel
4. Try a different video (some are region-locked)

### Installation errors?
1. Make sure Node.js is installed: `node --version`
2. Delete `node_modules` folder and `package-lock.json`
3. Run `npm install` again
4. Check if you have internet connection

---

## 📊 Dashboard (Optional)

The bot includes a Next.js web dashboard:

### Start Dashboard:
```powershell
npm run dev
```

Then open: http://localhost:3000

### Deploy to Vercel:
1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables
5. Deploy!

---

## 🔒 Security Notes

- **NEVER** share your bot token
- **NEVER** commit `.env` file to Git
- Keep your dependencies updated
- Use environment variables for all secrets
- Enable 2FA on Discord account

---

## 📚 Additional Resources

- **Discord.js Guide**: https://discordjs.guide/
- **Discord Developer Portal**: https://discord.com/developers
- **Node.js Documentation**: https://nodejs.org/docs/
- **GitHub Repository**: https://github.com/Previda/sapphire-modbot

---

## ✨ Quick Start Summary

```powershell
# 1. Install Node.js from https://nodejs.org/

# 2. Create .env file with your bot token

# 3. Install dependencies
npm install

# 4. Deploy commands
npm run deploy-all

# 5. Start bot
npm run bot
```

**That's it! Your bot should now be online! 🎉**

---

## 💡 Tips

- Use `/ping` to test if bot is working
- Start with `/setup` command in your server
- Configure auto-mod with `/automod`
- Set up logging with `/logging`
- Test music with `/play <youtube-url>`

---

## 🆘 Need Help?

If you encounter issues:
1. Check console output for errors
2. Verify all prerequisites are installed
3. Make sure `.env` file is configured correctly
4. Check Discord bot permissions
5. Review the troubleshooting section above

**Happy moderating! 🚀**
