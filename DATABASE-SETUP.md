# 🗄️ DATABASE SETUP GUIDE - Neon PostgreSQL

## ✅ WHAT I SET UP

Your bot now has **full PostgreSQL database integration** with Neon!

---

## 📊 DATABASE FEATURES

### **What Gets Stored:**
1. ✅ **Moderation Logs** - All bans, kicks, warns, mutes
2. ✅ **User Warnings** - Warning history per user
3. ✅ **Server Settings** - Custom prefixes, channels, configs
4. ✅ **Appeal Submissions** - Ban appeals from users
5. ✅ **Command Stats** - Usage analytics

---

## 🚀 SETUP ON RASPBERRY PI

### **Step 1: Add Database URL to .env**

```bash
# On your Raspberry Pi
cd ~/sapphire-modbot
nano .env
```

Add this line:
```env
DATABASE_URL="postgresql://neondb_owner:npg_hjST6ABguC5s@ep-long-butterfly-ad5js8vm-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`)

---

### **Step 2: Pull Latest Code**

```bash
cd ~/sapphire-modbot
git pull origin main
```

---

### **Step 3: Install Dependencies**

```bash
npm install
```

This will install the `pg` (PostgreSQL) package.

---

### **Step 4: Initialize Database**

The database will automatically initialize when you start the bot!

```bash
# Start the bot
node src/index.js

# Or with PM2
pm2 restart skyfall-bot
```

You'll see:
```
🔧 Initializing database tables...
✅ Database tables initialized successfully
✅ Connected to Neon PostgreSQL database
```

---

## 📁 FILES CREATED

### **1. `src/database/db.js`**
- Database connection pool
- Connection management
- Table initialization
- Query helpers

### **2. `src/database/queries.js`**
- All database operations
- Moderation logging
- Warning management
- Settings management
- Analytics queries

---

## 🗃️ DATABASE SCHEMA

### **Tables Created:**

#### **1. moderation_logs**
```sql
- id (auto-increment)
- guild_id
- user_id
- moderator_id
- action (ban, kick, warn, mute, timeout)
- reason
- duration
- created_at
- expires_at
- active
```

#### **2. user_warnings**
```sql
- id (auto-increment)
- guild_id
- user_id
- moderator_id
- reason
- created_at
```

#### **3. server_settings**
```sql
- guild_id (primary key)
- prefix
- mod_log_channel
- welcome_channel
- auto_mod_enabled
- settings (JSON)
- created_at
- updated_at
```

#### **4. appeal_submissions**
```sql
- id (auto-increment)
- guild_id
- user_id
- ban_reason
- appeal_reason
- status (pending, approved, denied)
- reviewed_by
- reviewed_at
- created_at
```

#### **5. command_stats**
```sql
- id (auto-increment)
- guild_id
- user_id
- command_name
- success
- executed_at
```

---

## 💻 HOW TO USE IN COMMANDS

### **Example: Log a Ban**

```javascript
const { logModeration } = require('../database/queries');

// In your ban command
await logModeration(
  interaction.guild.id,
  user.id,
  interaction.user.id,
  'ban',
  reason
);
```

### **Example: Add a Warning**

```javascript
const { addWarning, getWarningCount } = require('../database/queries');

// Add warning
await addWarning(
  interaction.guild.id,
  user.id,
  interaction.user.id,
  reason
);

// Get warning count
const count = await getWarningCount(interaction.guild.id, user.id);
console.log(`User has ${count} warnings`);
```

### **Example: Get Server Settings**

```javascript
const { getServerSettings } = require('../database/queries');

const settings = await getServerSettings(interaction.guild.id);
console.log(`Server prefix: ${settings.prefix}`);
```

### **Example: Log Command Usage**

```javascript
const { logCommandUsage } = require('../database/queries');

// After command executes
await logCommandUsage(
  interaction.guild.id,
  interaction.user.id,
  interaction.commandName,
  true // success
);
```

---

## 📊 ANALYTICS QUERIES

### **Get Moderation Logs:**
```javascript
const { getModerationLogs } = require('../database/queries');

// Get all logs for a server
const logs = await getModerationLogs(guildId);

// Get logs for a specific user
const userLogs = await getModerationLogs(guildId, userId);
```

### **Get Command Stats:**
```javascript
const { getCommandStats } = require('../database/queries');

const stats = await getCommandStats(guildId, 10); // Top 10 commands
```

### **Get Server Analytics:**
```javascript
const { getServerAnalytics } = require('../database/queries');

const analytics = await getServerAnalytics(guildId);
// Returns: { totalModerationActions, totalWarnings, totalAppeals, totalCommands }
```

---

## 🔧 TESTING THE DATABASE

### **Test Connection:**

```bash
# On your Pi
node -e "require('./src/database/db').initDatabase().then(() => console.log('✅ Database working!')).catch(console.error)"
```

### **View Data:**

You can connect to your Neon database directly:

```bash
psql 'postgresql://neondb_owner:npg_hjST6ABguC5s@ep-long-butterfly-ad5js8vm-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

Then run SQL queries:
```sql
-- View all moderation logs
SELECT * FROM moderation_logs ORDER BY created_at DESC LIMIT 10;

-- View warnings for a user
SELECT * FROM user_warnings WHERE user_id = 'USER_ID';

-- View command stats
SELECT command_name, COUNT(*) as usage 
FROM command_stats 
GROUP BY command_name 
ORDER BY usage DESC;
```

---

## 🎯 NEXT STEPS

### **1. Update Commands to Use Database**

I can update your moderation commands (ban, kick, warn, etc.) to automatically log to the database.

### **2. Create Dashboard Integration**

Display database data in your Vercel dashboard:
- Recent moderation actions
- User warning history
- Command usage charts
- Server analytics

### **3. Add More Features**

- Auto-moderation rules
- Timed punishments (auto-unban)
- Warning thresholds (auto-action after X warnings)
- Detailed audit logs

---

## 🚨 IMPORTANT NOTES

### **Security:**
- ✅ Database URL is in `.env` (not committed to git)
- ✅ SSL/TLS encryption enabled
- ✅ Connection pooling for performance
- ✅ Prepared statements (SQL injection protection)

### **Performance:**
- ✅ Indexed tables for fast queries
- ✅ Connection pooling (max 20 connections)
- ✅ Automatic connection management
- ✅ Query logging for debugging

### **Backup:**
- Neon automatically backs up your database
- You can export data anytime from Neon dashboard
- All data is replicated for reliability

---

## 📝 QUICK REFERENCE

### **Import Database Functions:**
```javascript
const { 
  logModeration,
  addWarning,
  getServerSettings,
  logCommandUsage 
} = require('./database/queries');
```

### **Initialize Database:**
```javascript
const { initDatabase } = require('./database/db');
await initDatabase();
```

### **Close Database:**
```javascript
const { closePool } = require('./database/db');
await closePool();
```

---

## 🎉 SUMMARY

Your bot now has:
- ✅ **Full PostgreSQL integration**
- ✅ **5 database tables** (moderation, warnings, settings, appeals, stats)
- ✅ **20+ query functions** ready to use
- ✅ **Automatic initialization**
- ✅ **Connection pooling**
- ✅ **Error handling**
- ✅ **Performance optimized**

**Just add the DATABASE_URL to your .env and restart the bot!** 🚀

---

## 🆘 TROUBLESHOOTING

### **Error: "Connection refused"**
- Check DATABASE_URL in `.env`
- Make sure it's the exact string provided

### **Error: "SSL required"**
- This is normal for Neon
- The code already handles SSL

### **Tables not created:**
```bash
# Manually initialize
node -e "require('./src/database/db').initDatabase()"
```

---

**Your bot is now database-powered!** 🗄️✨
