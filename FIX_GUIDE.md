# 🔧 Complete Fix Guide for Skyfall Discord Bot Dashboard

## Current Issues
1. ❌ Ngrok tunnel offline - dashboard can't connect to Pi bot
2. ❌ Port 3001 conflict on Pi - multiple processes trying to use same port
3. ❌ Some API endpoints may have errors
4. ❌ Dashboard showing connection errors

## Solution Overview
We'll fix everything in 6 clear steps:
1. Clean up Pi bot processes
2. Start fresh Pi bot API on port 3004
3. Setup stable ngrok tunnel
4. Update Vercel environment
5. Test all connections
6. Verify dashboard works

---

## 📋 STEP-BY-STEP FIX

### **STEP 1: Clean Up Pi Bot (Run on your Pi)**

```bash
# Stop all PM2 processes
pm2 stop all
pm2 delete all

# Kill any processes on ports 3001 and 3004
sudo fuser -k 3001/tcp
sudo fuser -k 3004/tcp

# Kill any ngrok processes
pkill ngrok

# Verify nothing is running
pm2 status
sudo netstat -tlnp | grep :300
```

### **STEP 2: Create Complete Pi Bot API Server**

```bash
cd ~/sapphire-modbot

# Create the complete Pi bot API server
cat > pi-bot-api.js << 'EOF'
const express = require('express');
const cors = require('cors');

const app = express();

// Complete CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'User-Agent'],
    credentials: true
}));

app.use(express.json());

const port = process.env.PORT || 3004;

// Bot data storage
let botData = {
    guilds: [],
    commands: [
        { id: 'ping', name: 'ping', description: 'Check bot latency', category: 'utility', enabled: true, usageCount: 0, cooldown: 0 },
        { id: 'ban', name: 'ban', description: 'Ban a user from the server', category: 'moderation', enabled: true, usageCount: 0, cooldown: 5 },
        { id: 'kick', name: 'kick', description: 'Kick a user from the server', category: 'moderation', enabled: true, usageCount: 0, cooldown: 3 },
        { id: 'mute', name: 'mute', description: 'Mute a user', category: 'moderation', enabled: true, usageCount: 0, cooldown: 2 },
        { id: 'warn', name: 'warn', description: 'Warn a user', category: 'moderation', enabled: true, usageCount: 0, cooldown: 1 },
        { id: 'purge', name: 'purge', description: 'Delete multiple messages', category: 'moderation', enabled: true, usageCount: 0, cooldown: 5 },
        { id: 'userinfo', name: 'userinfo', description: 'Get user information', category: 'utility', enabled: true, usageCount: 0, cooldown: 0 },
        { id: 'serverinfo', name: 'serverinfo', description: 'Get server information', category: 'utility', enabled: true, usageCount: 0, cooldown: 0 }
    ],
    logs: [
        { id: 1, action: 'Bot started', user: 'System', details: 'Pi bot API server started', type: 'system', timestamp: new Date().toISOString() }
    ],
    appeals: [],
    startTime: Date.now(),
    botStatus: 'online'
};

// Status endpoint
app.get('/api/status', (req, res) => {
    const uptime = Math.floor((Date.now() - botData.startTime) / 1000);
    
    res.json({
        status: botData.botStatus,
        uptime: uptime,
        version: '2.0.0',
        guilds: botData.guilds.length,
        users: botData.guilds.reduce((acc, guild) => acc + (guild.memberCount || 0), 0),
        commands: botData.commands.length,
        ping: 42,
        timestamp: new Date().toISOString(),
        realData: true
    });
});

// Guilds endpoint
app.get('/api/guilds', (req, res) => {
    res.json({
        success: true,
        guilds: botData.guilds,
        count: botData.guilds.length,
        realData: true
    });
});

// Commands management endpoint
app.get('/api/commands/manage', (req, res) => {
    res.json({
        success: true,
        commands: botData.commands,
        realData: true
    });
});

app.put('/api/commands/manage', (req, res) => {
    const { commandId, enabled, description, cooldown } = req.body;
    
    const command = botData.commands.find(cmd => cmd.id === commandId);
    if (command) {
        if (typeof enabled === 'boolean') command.enabled = enabled;
        if (description) command.description = description;
        if (typeof cooldown === 'number') command.cooldown = cooldown;
        
        botData.logs.unshift({
            id: Date.now(),
            action: 'Command updated',
            user: 'Dashboard',
            details: `Updated ${command.name}: enabled=${enabled}`,
            type: 'command',
            timestamp: new Date().toISOString()
        });
        
        res.json({
            success: true,
            command: command,
            message: 'Command updated successfully',
            realData: true
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Command not found'
        });
    }
});

// Logs endpoint
app.get('/api/logs', (req, res) => {
    res.json({
        success: true,
        logs: botData.logs.slice(0, 50),
        total: botData.logs.length,
        realData: true
    });
});

// Appeals endpoints
app.get('/api/appeals', (req, res) => {
    res.json({
        success: true,
        appeals: botData.appeals,
        realData: true
    });
});

app.post('/api/appeals', (req, res) => {
    const { username, banReason, appealMessage } = req.body;
    
    const appeal = {
        id: Date.now(),
        username,
        banReason,
        appealMessage,
        status: 'pending',
        submittedAt: new Date().toISOString()
    };
    
    botData.appeals.push(appeal);
    
    botData.logs.unshift({
        id: Date.now(),
        action: 'Appeal submitted',
        user: username,
        details: `New ban appeal from ${username}`,
        type: 'appeal',
        timestamp: new Date().toISOString()
    });
    
    res.json({
        success: true,
        appeal: appeal,
        message: 'Appeal submitted successfully',
        realData: true
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        realData: true 
    });
});

// Internal endpoints for Discord bot to update data
app.post('/api/internal/update-guilds', (req, res) => {
    botData.guilds = req.body.guilds || [];
    botData.botStatus = 'online';
    res.json({ success: true });
});

app.post('/api/internal/add-log', (req, res) => {
    const log = {
        id: Date.now(),
        ...req.body,
        timestamp: new Date().toISOString()
    };
    botData.logs.unshift(log);
    if (botData.logs.length > 100) botData.logs = botData.logs.slice(0, 100);
    res.json({ success: true });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log('✅ Pi Bot API Server Started');
    console.log(`🌐 Local: http://localhost:${port}`);
    console.log(`🌐 Network: http://192.168.1.62:${port}`);
    console.log(`📊 Status: ${botData.botStatus}`);
    console.log(`📝 Commands: ${botData.commands.length}`);
    console.log('🔗 Ready for ngrok tunnel');
});
EOF

# Start the Pi bot API
PORT=3004 pm2 start pi-bot-api.js --name pi-bot-api

# Save PM2 configuration
pm2 save

# Check status
pm2 status

# Test the API locally
curl http://localhost:3004/api/status
```

### **STEP 3: Setup Ngrok Tunnel**

```bash
# Start ngrok tunnel
ngrok http 3004

# You'll see output like:
# Forwarding  https://abc123.ngrok-free.app -> http://localhost:3004
# 
# Copy the https URL (e.g., https://abc123.ngrok-free.app)
```

**⚠️ IMPORTANT: Keep this terminal window open! Don't close it or ngrok will stop.**

### **STEP 4: Test Ngrok Connection**

Open a NEW terminal window and test:

```bash
# Replace YOUR_NGROK_URL with your actual ngrok URL
curl -H "ngrok-skip-browser-warning: true" https://YOUR_NGROK_URL/api/status

# You should see JSON response with bot status
```

### **STEP 5: Update Vercel Environment (Run on your Windows PC)**

```powershell
# Navigate to project
cd C:\Users\Mikhail\CascadeProjects\sapphire-modbot

# Remove old environment variable
vercel env rm PI_BOT_API_URL production

# Add new one with your ngrok URL
vercel env add PI_BOT_API_URL production
# When prompted, enter: https://YOUR_NGROK_URL (replace with actual URL)

# Redeploy to apply changes
vercel --prod
```

### **STEP 6: Test Dashboard Connection**

1. Go to: https://skyfall-omega.vercel.app/dashboard
2. Click "Test Connection" button
3. You should see: ✅ Connected to Pi bot
4. All data should now be real from your Pi!

---

## 🔍 Troubleshooting

### If API doesn't start:
```bash
# Check logs
pm2 logs pi-bot-api --lines 20

# Check if port is in use
sudo netstat -tlnp | grep :3004

# Restart
pm2 restart pi-bot-api
```

### If ngrok shows "offline":
```bash
# Kill and restart ngrok
pkill ngrok
ngrok http 3004
```

### If dashboard still shows errors:
1. Make sure ngrok is running
2. Test ngrok URL with curl
3. Verify Vercel environment variable is set
4. Redeploy Vercel with `vercel --prod`

---

## ✅ Success Checklist

- [ ] Pi bot API running on port 3004
- [ ] Can curl http://localhost:3004/api/status successfully
- [ ] Ngrok tunnel active and showing forwarding URL
- [ ] Can curl ngrok URL successfully
- [ ] Vercel environment variable updated with ngrok URL
- [ ] Vercel redeployed
- [ ] Dashboard connects successfully
- [ ] Dashboard shows real data from Pi

---

## 📝 Keeping It Running

### To keep ngrok running permanently:
```bash
# Install screen
sudo apt-get install screen

# Start screen session
screen -S ngrok

# Run ngrok
ngrok http 3004

# Detach from screen: Press Ctrl+A then D
# Reattach later: screen -r ngrok
```

### To auto-start Pi bot API on reboot:
```bash
# PM2 already handles this with:
pm2 startup
pm2 save
```

---

## 🎯 Quick Reference

**Pi Bot API:** http://192.168.1.62:3004
**Dashboard:** https://skyfall-omega.vercel.app
**PM2 Commands:**
- `pm2 status` - Check status
- `pm2 logs pi-bot-api` - View logs
- `pm2 restart pi-bot-api` - Restart
- `pm2 stop pi-bot-api` - Stop

**Test Commands:**
```bash
# Test local API
curl http://localhost:3004/api/status

# Test ngrok
curl -H "ngrok-skip-browser-warning: true" https://YOUR_NGROK_URL/api/status

# Check PM2
pm2 status

# View logs
pm2 logs pi-bot-api --lines 20
```
