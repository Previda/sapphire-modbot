# 🚀 Deploy Commands Guide

## ⚠️ IMPORTANT: You must deploy commands after any changes!

### On Your Pi (Linux):

```bash
cd ~/sapphire-modbot
git pull origin main
node deploy-commands.js
pm2 restart discord-bot
```

### Expected Output:

```
✅ Found command: setup-complete (src/commands/admin/setup-complete.js)
✅ Found command: fix-permissions (src/commands/admin/fix-permissions.js)
✅ Found command: appeal-config (src/commands/appeals/appeal-config.js)
✅ Found command: case (src/commands/moderation/case.js)
... (all 63 commands)

📋 Total commands to deploy: 63
🚀 Started refreshing application (/) commands...
📱 Using Client ID: 1234567890
✅ Successfully reloaded 63 application (/) commands globally.
⏱️ Commands will be available globally within 1 hour.
```

---

## 📋 New Commands Added:

1. **`/setup-complete`** - Complete server setup
   - `/setup-complete quick` - Auto-create all channels
   - `/setup-complete logs` - Setup logging channels
   - `/setup-complete appeals` - Configure appeals
   - `/setup-complete verification` - Configure verification
   - `/setup-complete view` - View configuration

2. **`/fix-permissions`** - Check bot permissions

3. **`/appeal-config`** - Configure appeal questions
   - `/appeal-config view` - View settings
   - `/appeal-config edit-questions` - Edit questions
   - `/appeal-config channel` - Set review channel
   - `/appeal-config enable` - Enable/disable

4. **`/case view`** - Now fully implemented!

---

## ⏱️ Command Deployment Time:

- **Global Commands**: Up to 1 hour to propagate
- **Guild Commands**: Instant (but we use global)

---

## 🔧 If Commands Don't Show Up:

### Option 1: Wait 1 Hour
Global commands take time to propagate across Discord.

### Option 2: Use Guild Commands (Instant)
Edit `deploy-commands.js` line 76-79:

**Change from:**
```javascript
const data = await rest.put(
    Routes.applicationCommands(clientId),
    { body: commands },
);
```

**To:**
```javascript
const guildId = 'YOUR_SERVER_ID_HERE'; // Your test server ID
const data = await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands },
);
```

Then run:
```bash
node deploy-commands.js
```

Commands will appear **instantly** in that server!

---

## ✅ Verify Commands Are Deployed:

In Discord, type `/` and you should see all commands!

If you see:
- `/setup-complete` ✅
- `/fix-permissions` ✅
- `/appeal-config` ✅
- `/case` ✅

**You're good to go!**

---

## 🎯 Quick Start After Deploy:

```
/setup-complete quick
```

This will:
- Create all log channels
- Create verified role
- Configure everything automatically

Then:
```
/fix-permissions
```

Check if bot has all permissions!

---

## 📊 Total Commands: 63

All working and ready to use! 🚀
