# 🛡️ Advanced Auto-Moderation System (Wick-Level)

## Overview

Your Discord bot now includes a **Wick-level auto-moderation system** with comprehensive protection features including anti-spam, anti-raid, anti-nuke, and more.

---

## 🚀 Features

### 1. **Anti-Spam Protection**
- Detects rapid message sending (5+ messages in 10 seconds)
- Identifies duplicate message spam
- Automatic message deletion
- Progressive punishment system

### 2. **Anti-Invite Protection**
- Blocks Discord invite links
- Configurable whitelist for allowed servers
- Instant detection and deletion

### 3. **Anti-Link Protection**
- Blocks external links
- Whitelist support for trusted domains
- Separate from invite detection

### 4. **Caps Flood Protection**
- Detects excessive capital letters (>70%)
- Minimum message length threshold
- Automatic deletion

### 5. **Emoji Flood Protection**
- Detects excessive emojis (>10 per message)
- Supports both Unicode and custom emojis
- Prevents emoji spam

### 6. **Mention Spam Protection**
- Detects mass mentions (>5 users/roles)
- Blocks @everyone/@here abuse
- Critical severity for everyone mentions

### 7. **Anti-NSFW**
- Keyword-based NSFW content detection
- Expandable keyword list
- Automatic content removal

### 8. **Anti-Zalgo**
- Detects zalgo text and combining characters
- Prevents text that breaks Discord formatting
- Automatic removal

### 9. **Anti-Raid Protection** 🛡️
- Monitors rapid member joins (10+ in 60 seconds)
- Detects new account raids
- Automatic server lockdown options
- Configurable actions:
  - **Alert**: Notify moderators
  - **Lockdown**: Increase verification level
  - **Kick New**: Auto-kick accounts < 1 day old

### 10. **Anti-Nuke Protection** 💣
- Monitors mass deletions/bans
- Detects:
  - Mass channel deletion (3+ in 10 seconds)
  - Mass role deletion (3+ in 10 seconds)
  - Mass bans (3+ in 10 seconds)
  - Mass kicks (3+ in 10 seconds)
- Automatic response:
  - Remove dangerous permissions
  - Ban the attacker (configurable)
  - Alert moderators
- Whitelist support for trusted admins

---

## 📋 Commands

### `/automod-config view`
View current automod configuration

### `/automod-config enable <feature>`
Enable specific automod features
- Options: Anti-Spam, Anti-Invite, Anti-Link, Caps Flood, Emoji Flood, Mention Spam, Anti-NSFW, Anti-Zalgo, Anti-Raid, Anti-Nuke, All Features

### `/automod-config disable <feature>`
Disable specific automod features

### `/automod-config thresholds`
Set punishment thresholds
- `warn`: Violations before warning (default: 2)
- `mute`: Violations before mute (default: 4)
- `kick`: Violations before kick (default: 6)
- `ban`: Violations before ban (default: 8)

### `/automod-config whitelist <type> <id>`
Whitelist roles or channels
- `type`: role or channel
- `id`: Role ID or Channel ID

### `/automod-config log-channel <channel>`
Set the channel for automod logs

### `/automod-config preset <level>`
Load preset configurations
- **Low**: Relaxed protection
- **Medium**: Balanced protection (recommended)
- **High**: Strict protection
- **Wick**: Maximum protection (Wick-level)

---

## ⚖️ Punishment System

The automod uses a progressive punishment system based on violation count:

| Violations | Action | Description |
|-----------|--------|-------------|
| 1-2 | ⚠️ **Warn** | User receives a DM warning |
| 3-4 | 🔇 **Mute** | User is timed out (default: 10 minutes) |
| 5-6 | 👢 **Kick** | User is kicked from the server |
| 7+ | 🔨 **Ban** | User is permanently banned |

**Note:** Thresholds are fully customizable via `/automod-config thresholds`

---

## 🎚️ Preset Levels

### Low (Relaxed)
```
✅ Anti-Spam
✅ Mention Spam
✅ Anti-NSFW
❌ Anti-Invite
❌ Anti-Link
❌ Caps/Emoji Flood
❌ Anti-Raid
❌ Anti-Nuke

Thresholds: Warn: 5, Mute: 8, Kick: 12, Ban: 15
```

### Medium (Balanced) - **Recommended**
```
✅ Anti-Spam
✅ Anti-Invite
✅ Caps Flood
✅ Emoji Flood
✅ Mention Spam
✅ Anti-NSFW
✅ Anti-Zalgo
✅ Anti-Raid
✅ Anti-Nuke
❌ Anti-Link

Thresholds: Warn: 3, Mute: 5, Kick: 8, Ban: 10
Raid Action: Lockdown
Nuke Action: Remove Permissions
```

### High (Strict)
```
✅ All Features Enabled

Thresholds: Warn: 2, Mute: 3, Kick: 5, Ban: 7
Raid Action: Kick New Accounts
Nuke Action: Ban Attacker
```

### Wick (Maximum Protection)
```
✅ All Features Enabled
⚡ Zero Tolerance Policy

Thresholds: Warn: 1, Mute: 2, Kick: 3, Ban: 4
Raid Action: Kick New Accounts
Nuke Action: Ban Attacker
Mute Duration: 30 minutes
```

---

## 🔧 Setup Guide

### 1. **Initial Setup**
```
/automod-config preset medium
```
This loads the recommended balanced configuration.

### 2. **Set Log Channel**
```
/automod-config log-channel #mod-logs
```
All automod actions will be logged here.

### 3. **Whitelist Trusted Roles**
```
/automod-config whitelist role <Moderator Role ID>
/automod-config whitelist role <Admin Role ID>
```
Whitelisted roles bypass automod checks.

### 4. **Whitelist Safe Channels**
```
/automod-config whitelist channel <Bot Commands Channel ID>
```
Useful for channels where links/spam are allowed.

### 5. **Customize Thresholds** (Optional)
```
/automod-config thresholds warn:3 mute:5 kick:8 ban:10
```

### 6. **View Configuration**
```
/automod-config view
```
Check your current settings.

---

## 📊 How It Works

### Message Monitoring
1. Every message is checked against enabled filters
2. Violations are detected and logged
3. Message is deleted if it violates rules
4. User violation counter is incremented
5. Appropriate action is taken based on threshold

### Raid Detection
1. Monitors member joins in real-time
2. Tracks joins in 60-second windows
3. Detects patterns (10+ joins, new accounts)
4. Triggers configured action (alert/lockdown/kick)
5. Logs raid event to mod channel

### Nuke Detection
1. Monitors audit logs for mass actions
2. Tracks actions by each user in 10-second windows
3. Detects dangerous patterns (3+ deletions/bans)
4. Immediately removes permissions from attacker
5. Optionally bans the attacker
6. Alerts moderators with full details

---

## 🎯 Best Practices

### For Small Servers (<100 members)
- Use **Low** or **Medium** preset
- Enable Anti-Spam, Anti-NSFW, Mention Spam
- Disable Anti-Link (unless needed)
- Higher thresholds (more lenient)

### For Medium Servers (100-1000 members)
- Use **Medium** preset (recommended)
- Enable most features
- Standard thresholds
- Set up raid protection

### For Large Servers (1000+ members)
- Use **High** or **Wick** preset
- Enable all features
- Lower thresholds (stricter)
- Mandatory raid and nuke protection
- Multiple whitelisted mod roles

### For Public/Gaming Servers
- Use **Wick** preset
- Zero tolerance for spam/raids
- Quick punishments
- Strong nuke protection

---

## 🚨 Raid Response

When a raid is detected:

1. **Alert** (Low preset)
   - Sends alert to log channel
   - No automatic action
   - Moderators handle manually

2. **Lockdown** (Medium preset)
   - Increases verification level to highest
   - Sends alert to log channel
   - Prevents new joins without verification

3. **Kick New** (High/Wick preset)
   - Kicks all accounts < 1 day old
   - Increases verification level
   - Sends detailed alert with statistics

---

## 💣 Nuke Response

When nuke attempt is detected:

1. **Remove Permissions** (Medium preset)
   - Removes all dangerous permissions from attacker
   - Removes roles with admin/manage perms
   - Sends alert to log channel
   - Attacker can no longer cause damage

2. **Ban** (High/Wick preset)
   - Immediately bans the attacker
   - Removes all permissions first
   - Sends detailed alert
   - Prevents any further actions

---

## 📝 Log Examples

### Spam Violation
```
⚠️ Automod Action

User: @Spammer#1234 (123456789)
Channel: #general
Action: MUTE

Violations:
• spam: 7 messages in 10 seconds (medium)
• duplicate_spam: Repeated identical messages (high)

Message Content: "JOIN MY SERVER! discord.gg/spam"
```

### Raid Detection
```
🚨 RAID DETECTED

14 members joined in the last 60 seconds!

Action Taken: lockdown
New Accounts: 12
```

### Nuke Attempt
```
🚨 ANTI-NUKE TRIGGERED

@Attacker#5678 performed 5 channel_delete actions in 10 seconds!

User: @Attacker#5678 (987654321)
Action Type: channel delete
Count: 5
Response: Permissions removed
```

---

## ⚙️ Technical Details

### Memory Optimization
- Automatic cleanup every 5 minutes
- Violation data expires after 1 hour
- Message cache limited to recent messages
- Optimized for Raspberry Pi 2

### Performance
- Non-blocking async operations
- Efficient regex patterns
- Minimal database queries
- Cache-based detection

### Reliability
- Error handling on all operations
- Fallback to default config if database fails
- Graceful degradation
- No false positives on whitelisted users

---

## 🔐 Security Features

1. **Whitelist System**
   - Role-based whitelisting
   - Channel-based whitelisting
   - Admin permission bypass
   - Nuke whitelist for trusted admins

2. **Progressive Punishment**
   - Escalating consequences
   - Violation tracking
   - Automatic reset after 1 hour
   - DM warnings before mutes

3. **Audit Logging**
   - All actions logged
   - Detailed violation information
   - Timestamp and user tracking
   - Message content preservation

4. **Anti-Bypass**
   - Detects zalgo text
   - Catches Unicode tricks
   - Monitors audit logs
   - Real-time detection

---

## 🆘 Troubleshooting

### Automod Not Working
1. Check if automod is enabled: `/automod-config view`
2. Verify log channel is set
3. Check bot permissions (Manage Messages, Timeout Members, etc.)
4. Ensure bot role is above target roles

### False Positives
1. Whitelist the affected role/channel
2. Adjust thresholds to be more lenient
3. Disable specific features if not needed
4. Use **Low** preset for relaxed moderation

### Raid Not Detected
1. Ensure Anti-Raid is enabled
2. Check if 10+ joins occurred in 60 seconds
3. Verify log channel is set
4. Review raid action setting

### Nuke Protection Not Triggering
1. Ensure Anti-Nuke is enabled
2. Check if bot has audit log permissions
3. Verify attacker isn't whitelisted
4. Ensure bot role is high enough

---

## 📚 Additional Resources

- **Setup Video**: [Coming Soon]
- **Discord Support**: [Your Support Server]
- **GitHub**: [Your Repository]
- **Documentation**: This file

---

## ✅ Summary

Your bot now has **Wick-level auto-moderation** with:

- ✅ 10 protection features
- ✅ Progressive punishment system
- ✅ Raid detection and response
- ✅ Nuke protection
- ✅ Customizable thresholds
- ✅ Whitelist system
- ✅ 4 preset configurations
- ✅ Comprehensive logging
- ✅ Optimized for Raspberry Pi 2

**Get started:** `/automod-config preset medium`

🛡️ **Your server is now protected!**
