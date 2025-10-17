# 🔧 COMPLETE CONNECTION FIX GUIDE

## ❌ PROBLEM: System Status Shows "Major System Outage"

Your status page shows:
- 0% System Health
- 0/6 Services Online
- All APIs degraded

This means the website cannot connect to your Pi bot.

---

## 🎯 ROOT CAUSE

The Discord bot on your Pi is **crashing repeatedly** due to a broken `cheerio` dependency. The bot keeps restarting (6391 times!) but fails immediately.

---

## ✅ COMPLETE FIX - RUN ON YOUR PI

### **Step 1: SSH into Your Pi**
```bash
ssh admin@192.168.1.62
```

### **Step 2: Navigate to Project**
```bash
cd ~/sapphire-modbot
```

### **Step 3: Pull Latest Code**
```bash
git pull origin main
```

### **Step 4: Stop Broken Bot**
```bash
pm2 stop discord-bot
```

### **Step 5: Delete Broken Dependencies**
```bash
rm -rf node_modules package-lock.json
```

### **Step 6: Clean npm Cache**
```bash
npm cache clean --force
```

### **Step 7: Reinstall Clean Dependencies**
```bash
npm install --legacy-peer-deps
```

### **Step 8: Start Bot Fresh**
```bash
pm2 start src/bot-with-api.js --name discord-bot
pm2 save
```

### **Step 9: Check Logs**
```bash
pm2 logs discord-bot --lines 20
```

You should see:
```
✅ Discord bot online! Logged in as Skyfall#6931
🏰 Serving 5 guilds
👥 Total users: XXX
📊 Updated API with 5 guilds and 60 commands
```

---

## 🚀 ONE-LINE COMMAND (COPY & PASTE)

```bash
cd ~/sapphire-modbot && git pull origin main && pm2 stop discord-bot && rm -rf node_modules package-lock.json && npm cache clean --force && npm install --legacy-peer-deps && pm2 start src/bot-with-api.js --name discord-bot && pm2 save && sleep 3 && pm2 logs discord-bot --lines 20
```

---

## 🔍 VERIFY IT'S WORKING

### **1. Check PM2 Status**
```bash
pm2 status
```

Should show:
```
│ discord-bot  │ online │ 0 restarts │
│ pi-bot-api   │ online │ 0 restarts │
```

### **2. Test API Locally**
```bash
curl http://localhost:3004/api/status
```

Should return:
```json
{
  "status": "online",
  "guilds": 5,
  "commands": 60,
  "uptime": ...
}
```

### **3. Check ngrok**
```bash
screen -r ngrok
```

Should show:
```
Forwarding https://XXXXX.ngrok-free.app -> http://localhost:3004
```

Press `Ctrl+A` then `D` to detach

### **4. Test Website Connection**
```bash
curl https://skyfall-omega.vercel.app/api/pi-bot/status
```

Should return online status

---

## 🌐 UPDATE VERCEL WITH NGROK URL

### **1. Get Current ngrok URL**
```bash
curl http://localhost:4040/api/tunnels | grep -o 'https://[^"]*ngrok-free.app'
```

### **2. Update Vercel Environment Variable**

**Option A: Via Dashboard**
```
1. Go to: https://vercel.com/previdas-projects/skyfall/settings/environment-variables
2. Find: PI_BOT_API_URL
3. Edit: Set to your ngrok URL (e.g., https://XXXXX.ngrok-free.app)
4. Save
5. Redeploy: Go to Deployments → Latest → Redeploy
```

**Option B: Via CLI**
```bash
vercel env rm PI_BOT_API_URL production
vercel env add PI_BOT_API_URL production
# Paste your ngrok URL when prompted
vercel --prod
```

---

## 🎯 EXPECTED RESULTS

After fixing, your status page should show:

### **System Health: 100%**
- ✅ Pi Bot Core: Online (72ms response)
- ✅ Commands API: Online
- ✅ Discord Data: Online
- ✅ User Profile: Online
- ✅ Appeals: Online
- ✅ Logs: Online

### **Services: 6/6 Online**
- All green checkmarks
- Fast response times
- Real data flowing

---

## 🔒 SECURITY IMPROVEMENTS ADDED

### **1. Web-Based Verification**
- Multi-step verification process
- Math captcha to prevent bots
- Behavior analysis (mouse movement, timing)
- Security scoring system
- Automatic bot detection

### **2. Enhanced OAuth Security**
- Better error logging
- Token validation
- Session management
- Redirect URI verification

### **3. API Security**
- Authorization headers
- Rate limiting ready
- Error handling
- Input validation

---

## 📋 TROUBLESHOOTING

### **Error: "ReferenceError: File is not defined"**
- ❌ Old node_modules still present
- ✅ Run: `rm -rf node_modules && npm install --legacy-peer-deps`

### **Error: "Cannot find module"**
- ❌ Dependencies not installed
- ✅ Run: `npm install --legacy-peer-deps`

### **Bot Keeps Restarting**
- ❌ Code error or dependency issue
- ✅ Check logs: `pm2 logs discord-bot --lines 50`
- ✅ Look for error stack trace

### **Website Shows "Degraded"**
- ❌ ngrok URL changed or expired
- ✅ Update Vercel env variable with new ngrok URL
- ✅ Restart ngrok if needed

### **ngrok Not Running**
```bash
# Start ngrok in screen
screen -S ngrok
ngrok http 3004
# Press Ctrl+A then D to detach
```

---

## ✅ VERIFICATION CHECKLIST

Before testing website:
- [ ] Discord bot showing "online" in PM2
- [ ] No errors in `pm2 logs discord-bot`
- [ ] Bot responds to `/ping` in Discord
- [ ] Local API returns data: `curl localhost:3004/api/status`
- [ ] ngrok tunnel is running
- [ ] Vercel has correct ngrok URL
- [ ] Website redeployed after env update

---

## 🎊 NEW FEATURES ADDED

### **1. Complete Commands Page**
```
URL: https://skyfall-omega.vercel.app/commands
Shows: All 62 commands with categories, usage, stats
```

### **2. Web Verification System**
```
URL: https://skyfall-omega.vercel.app/verify?token=XXX&guild=YYY
Features:
- Multi-step verification
- Math captcha
- Bot detection
- Security scoring
- Beautiful UI
```

### **3. Enhanced Dashboard**
- Real-time status updates
- User profile with avatar
- Server management
- Command statistics
- Activity logs

---

## 🚀 AFTER FIX

1. **Run the one-line command** on your Pi
2. **Wait for bot to start** (check logs)
3. **Update Vercel** with ngrok URL
4. **Refresh website** - should show 100% health
5. **Test all features** - commands, verification, dashboard

**Everything will work perfectly!** 🎉
