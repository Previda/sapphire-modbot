# 🔐 BOT PERMISSIONS SETUP GUIDE

## ⚠️ CRITICAL: Bot Needs Administrator Permission!

Your bot is failing commands because it doesn't have the right permissions in your Discord server.

---

## 🚀 QUICK FIX (Recommended)

### **Give Bot Administrator Permission:**

1. **Go to your Discord server**
2. **Right-click the bot** (Beta Skyfall)
3. **Click "Roles"**
4. **Create or assign a role with Administrator permission**

**OR**

1. **Server Settings** → **Roles**
2. **Find the bot's role** (or create one)
3. **Enable "Administrator"** permission
4. **Save changes**
5. **Assign role to bot**

---

## 📋 REQUIRED PERMISSIONS

If you don't want to give Administrator, the bot needs these specific permissions:

### **General Permissions:**
- ✅ View Channels
- ✅ Manage Channels
- ✅ Manage Roles
- ✅ Manage Server
- ✅ View Audit Log
- ✅ Manage Webhooks

### **Membership Permissions:**
- ✅ Kick Members
- ✅ Ban Members
- ✅ Timeout Members
- ✅ Moderate Members

### **Text Permissions:**
- ✅ Send Messages
- ✅ Send Messages in Threads
- ✅ Create Public Threads
- ✅ Create Private Threads
- ✅ Embed Links
- ✅ Attach Files
- ✅ Add Reactions
- ✅ Use External Emojis
- ✅ Mention @everyone, @here, and All Roles
- ✅ Manage Messages
- ✅ Manage Threads
- ✅ Read Message History
- ✅ Use Slash Commands

### **Voice Permissions:**
- ✅ Connect
- ✅ Speak
- ✅ Mute Members
- ✅ Deafen Members
- ✅ Move Members

---

## 🔧 HOW TO SET UP PROPERLY

### **Method 1: Administrator Role (Easiest)**

```
1. Server Settings → Roles
2. Create new role: "Bot Admin"
3. Enable "Administrator" permission
4. Assign to Beta Skyfall bot
5. Done! ✅
```

### **Method 2: Custom Permissions**

```
1. Server Settings → Roles
2. Create new role: "Moderation Bot"
3. Enable all permissions listed above
4. Assign to Beta Skyfall bot
5. Done! ✅
```

### **Method 3: Re-invite Bot with Permissions**

Use this invite link (replace YOUR_CLIENT_ID):

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

**Your bot's client ID:** `1358527215020544222`

**Full invite link:**
```
https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands
```

---

## ✅ VERIFY PERMISSIONS

Run this command in Discord:
```
/sysinfo
```

The bot will show if it has proper permissions.

---

## 🎯 WHY EACH PERMISSION IS NEEDED

| Permission | Why Needed |
|------------|------------|
| **Administrator** | Simplest - gives all permissions |
| **Kick Members** | For `/kick` command |
| **Ban Members** | For `/ban` and `/unban` commands |
| **Timeout Members** | For `/timeout` and `/mute` commands |
| **Manage Channels** | For creating ticket channels |
| **Manage Roles** | For role management and permissions |
| **Manage Messages** | For purge and moderation |
| **Send Messages** | To respond to commands |
| **Embed Links** | For beautiful embeds |
| **Attach Files** | For transcripts |
| **Manage Webhooks** | For webhook logging |

---

## 🚨 COMMON ERRORS & FIXES

### **Error: "Failed to warn the user"**
**Fix:** Bot needs "Moderate Members" or "Administrator" permission

### **Error: "I cannot ban this member"**
**Fix:** Bot needs "Ban Members" permission + role must be higher than target

### **Error: "Failed to create ticket"**
**Fix:** Bot needs "Manage Channels" permission

### **Error: "Missing Permissions"**
**Fix:** Give bot Administrator or all required permissions

---

## 🎉 AFTER FIXING PERMISSIONS

**Test these commands:**
```
/warn @user reason: test
/kick @user reason: test
/ban @user reason: test
/panel
/setup
```

**All should work perfectly!** ✅

---

## 📞 STILL NOT WORKING?

1. **Check bot role position** - Must be above users you want to moderate
2. **Check channel permissions** - Bot needs access to channels
3. **Restart bot** - `pm2 restart discord-bot` on your Pi
4. **Re-invite bot** - Use invite link with permissions=8

---

## 🔗 QUICK LINKS

**Invite Bot with Admin:**
```
https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands
```

**Invite Bot with Specific Permissions:**
```
https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=1099511627775&scope=bot%20applications.commands
```

---

## ✅ CHECKLIST

- [ ] Bot has Administrator role OR all required permissions
- [ ] Bot role is above users you want to moderate
- [ ] Bot has access to all channels
- [ ] Commands are deployed (`node deploy-commands.js`)
- [ ] Bot is online and running
- [ ] Tested `/warn`, `/kick`, `/ban` commands

**Once all checked, everything will work!** 🚀
