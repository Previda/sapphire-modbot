# 🔄 RESTART BOT TO FIX "SYSTEM OFFLINE" ERROR

## ⚡ QUICK FIX (On Your Raspberry Pi)

### **Step 1: Pull Latest Code**
```bash
cd ~/sapphire-modbot
git pull origin main
```

### **Step 2: Restart Bot with PM2**
```bash
pm2 restart skyfall-bot
```

### **Step 3: Check Bot Logs**
```bash
pm2 logs skyfall-bot
```

You should see:
```
🌐 API server running on http://0.0.0.0:3001
✅ Bot is ready! Logged in as Skyfall
```

### **Step 4: Test API**
```bash
curl http://localhost:3001/api/status
```

You should get JSON response with bot status.

---

## 🔍 WHAT WAS FIXED

### **Problem:**
- Dashboard showed "System Offline"
- Bot had no API server
- Dashboard couldn't connect to bot

### **Solution:**
- ✅ Added Express API server to bot
- ✅ Created `/api/status` endpoint
- ✅ Created `/api/commands` endpoint
- ✅ Created `/api/guilds` endpoint
- ✅ Bot now runs on port 3001

---

## 📡 API ENDPOINTS NOW AVAILABLE

### **1. Bot Status**
```
GET http://192.168.1.62:3001/api/status
```
Returns: Bot uptime, guilds, users, commands, ping

### **2. Commands List**
```
GET http://192.168.1.62:3001/api/commands
```
Returns: All bot commands with descriptions

### **3. Guilds List**
```
GET http://192.168.1.62:3001/api/guilds
```
Returns: All servers bot is in

### **4. Health Check**
```
GET http://192.168.1.62:3001/health
```
Returns: Simple health status

---

## 🌐 DASHBOARD CONNECTION

### **Local Network (Default)**
Dashboard will connect to: `http://192.168.1.62:3001`

### **Internet Access (Optional)**
If you want to access dashboard from outside your network:

1. **Start ngrok on Pi:**
```bash
ngrok http 3001
```

2. **Copy the ngrok URL** (e.g., `https://abc123.ngrok-free.app`)

3. **Update dashboard `.env.local`:**
```bash
cd ~/sapphire-modbot/dashboard
nano .env.local
```

Add:
```
BOT_API_URL=https://abc123.ngrok-free.app
```

4. **Restart dashboard:**
```bash
pm2 restart sapphire-dashboard
```

---

## ✅ VERIFICATION

### **Check if Bot API is Running:**
```bash
curl http://localhost:3001/api/status
```

### **Check Dashboard Connection:**
Open: `http://192.168.1.62:3000`

You should see:
- ✅ "System Online" (green)
- ✅ Bot statistics
- ✅ Server count
- ✅ No errors

---

## 🚨 TROUBLESHOOTING

### **If Still Offline:**

1. **Check bot is running:**
```bash
pm2 list
```

2. **Check bot logs:**
```bash
pm2 logs skyfall-bot --lines 50
```

3. **Check API port:**
```bash
netstat -tuln | grep 3001
```

4. **Restart everything:**
```bash
pm2 restart all
```

---

## 📝 NOTES

- Bot now includes built-in API server
- No need for separate `api-server.js` file
- API runs on port 3001 by default
- Dashboard connects automatically
- All changes committed to GitHub

---

**Your dashboard should now show "System Online"!** ✨
