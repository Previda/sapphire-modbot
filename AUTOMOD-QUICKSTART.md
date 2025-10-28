# 🛡️ Auto-Moderation Quick Start Guide

## ⚡ Quick Setup (30 seconds)

### Step 1: Load Preset
```
/automod-config preset medium
```
✅ This enables balanced protection for most servers.

### Step 2: Set Log Channel
```
/automod-config log-channel #mod-logs
```
✅ All automod actions will be logged here.

### Step 3: Done!
Your server is now protected with Wick-level auto-moderation! 🎉

---

## 🎯 What's Enabled?

With the **Medium** preset, you get:

✅ **Anti-Spam** - Blocks rapid message spam  
✅ **Anti-Invite** - Blocks Discord invite links  
✅ **Caps Flood** - Blocks excessive CAPS  
✅ **Emoji Flood** - Blocks emoji spam  
✅ **Mention Spam** - Blocks mass mentions  
✅ **Anti-NSFW** - Blocks NSFW content  
✅ **Anti-Zalgo** - Blocks zalgo text  
✅ **Anti-Raid** - Detects and stops raids  
✅ **Anti-Nuke** - Protects against nuking  

---

## 📊 How Punishments Work

| Violations | Action |
|-----------|--------|
| 1-3 | ⚠️ Warning (DM sent) |
| 4-5 | 🔇 Muted for 10 minutes |
| 6-8 | 👢 Kicked from server |
| 9+ | 🔨 Banned permanently |

---

## 🔧 Common Customizations

### Make It Stricter (High Protection)
```
/automod-config preset high
```

### Make It More Relaxed (Low Protection)
```
/automod-config preset low
```

### Maximum Protection (Wick-Level)
```
/automod-config preset wick
```

### Whitelist Your Mods
```
/automod-config whitelist role <Moderator Role ID>
```

### Allow Links in Specific Channel
```
/automod-config whitelist channel <Channel ID>
```

### Adjust Punishment Thresholds
```
/automod-config thresholds warn:5 mute:8 kick:12 ban:15
```

---

## 📋 View Your Settings
```
/automod-config view
```

---

## 🚨 What Happens During a Raid?

1. Bot detects 10+ joins in 60 seconds
2. Server verification level increases to maximum
3. Alert sent to your log channel
4. New accounts (< 1 day old) are kicked (if using High/Wick preset)

---

## 💣 What Happens During a Nuke Attempt?

1. Bot detects 3+ mass deletions/bans in 10 seconds
2. Attacker's permissions are immediately removed
3. Attacker is banned (if using High/Wick preset)
4. Alert sent to your log channel with full details

---

## ✅ You're All Set!

Your Discord server now has **enterprise-level protection** similar to Wick bot!

**Need help?** Check `AUTOMOD-FEATURES.md` for full documentation.

🛡️ **Stay protected!**
