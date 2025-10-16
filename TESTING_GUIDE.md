# 🧪 COMPLETE TESTING GUIDE

## ✅ WHAT I JUST FIXED

### OAuth & Server Fetching:
- ✅ Enhanced OAuth callback to fetch ALL your Discord guilds
- ✅ Added logging to see exactly what's being fetched
- ✅ Merged Discord data with Pi bot data
- ✅ Shows which servers have the bot installed
- ✅ Displays member counts and server details

---

## 🔧 STEP 1: VERIFY DISCORD DEVELOPER PORTAL

**CRITICAL: Make sure this is set up correctly!**

1. Go to: https://discord.com/developers/applications
2. Click **Skyfall** application
3. Click **OAuth2**
4. Under **Redirects**, verify you have:
   ```
   https://skyfall-omega.vercel.app/api/auth/callback-discord
   ```
5. If not there, click **Add Redirect** and add it
6. Click **Save Changes**

---

## 🧪 STEP 2: TEST DASHBOARD LOGIN

### Clear Everything First:
1. Open browser (Chrome/Edge)
2. Press `Ctrl + Shift + Delete`
3. Clear cookies and cache for last hour
4. Close browser completely

### Test Login:
1. Open fresh browser window
2. Go to: https://skyfall-omega.vercel.app
3. Click **"Login with Discord"** (top right)
4. You'll be redirected to Discord
5. Click **"Authorize"**
6. You should be redirected back to dashboard

### What You Should See:
- ✅ Your Discord username (not "Guest")
- ✅ Your Discord avatar
- ✅ Server dropdown showing YOUR servers
- ✅ "Pi bot connected successfully!" message
- ✅ Real server count

---

## 🎮 STEP 3: TEST DISCORD COMMANDS

Open Discord and test these commands:

### Basic Commands:
```
/ping
/help
/serverinfo
/userinfo @YourName
/botinfo
```

### Fun Commands:
```
/8ball Will this work?
/coinflip
/dice sides:20
/poll What's your favorite? | Option 1 | Option 2 | Option 3
```

### Admin Commands:
```
/announce This is a test!
/verify
/ticket setup
```

**All should respond immediately with proper embeds!**

---

## 📊 STEP 4: TEST COMMAND MANAGEMENT

### On Dashboard:
1. Select a server from dropdown
2. Click **"Manage Commands"**
3. You should see all 62 commands
4. Try toggling a command on/off
5. Try editing a command description
6. Changes should save

### In Discord:
1. After disabling a command on dashboard
2. Try using that command in Discord
3. It should be disabled
4. Re-enable it on dashboard
5. It should work again in Discord

**This is two-way sync!**

---

## 🔍 STEP 5: CHECK LOGS

### On Pi (PuTTY):
```bash
pm2 logs discord-bot --lines 20
```

**You should see:**
```
✅ Discord bot online! Logged in as Skyfall#6931
🏰 Serving 5 guilds
👥 Total users: 58
📊 Updated API with 5 guilds and 60 commands
```

### On Vercel (check deployment logs):
```bash
vercel logs --prod
```

**Look for:**
```
✅ Fetched guilds from Discord: X
✅ Admin guilds: X
✅ Fetched bot guilds: 5
```

---

## ✅ SUCCESS CHECKLIST

Mark these off as you test:

### Dashboard:
- [ ] Shows your Discord username (not Guest)
- [ ] Shows your Discord avatar
- [ ] Server dropdown has your servers
- [ ] Can select a server
- [ ] Shows real member count
- [ ] Shows "Pi bot connected"
- [ ] Can view commands
- [ ] Can toggle commands
- [ ] Can edit command descriptions

### Discord Bot:
- [ ] `/ping` responds
- [ ] `/help` shows all commands
- [ ] `/serverinfo` shows server details
- [ ] `/8ball` works
- [ ] `/poll` creates polls
- [ ] `/verify` creates verification panel
- [ ] `/ticket setup` creates ticket system
- [ ] All 62 commands are registered

### Two-Way Sync:
- [ ] Disable command on dashboard → disabled in Discord
- [ ] Enable command on dashboard → enabled in Discord
- [ ] Edit description on dashboard → shows in Discord
- [ ] Use command in Discord → logs show on dashboard

---

## 🚨 TROUBLESHOOTING

### Problem: Still shows "Guest"

**Solution:**
1. Check redirect URL in Discord Developer Portal
2. Clear browser cache completely
3. Try incognito mode
4. Check Vercel logs for OAuth errors

### Problem: No servers showing

**Solution:**
1. Make sure you're logged in with correct Discord account
2. Make sure that account is admin in those servers
3. Check browser console (F12) for errors
4. Check Vercel logs

### Problem: Commands not working

**Solution:**
```bash
# On Pi:
pm2 restart discord-bot
pm2 logs discord-bot --lines 20
```

### Problem: Changes not syncing

**Solution:**
1. Wait 30 seconds (auto-refresh interval)
2. Check Pi bot API is running: `pm2 status`
3. Check network connection between dashboard and Pi

---

## 📝 EXPECTED BEHAVIOR

### When You Login:
1. Click "Login with Discord"
2. Redirected to Discord OAuth
3. Click "Authorize"
4. Redirected back to dashboard
5. See your username and servers immediately

### When You Select Server:
1. Click server dropdown
2. Select a server
3. Dashboard loads that server's data
4. Shows commands, members, activity
5. All data is REAL from Discord

### When You Manage Commands:
1. Click "Manage Commands"
2. See all 62 commands
3. Toggle any command
4. Change saves immediately
5. Discord reflects change within 30s

---

## 🎯 FINAL VERIFICATION

Run this complete test:

1. **Login Test:**
   - Clear cache
   - Go to dashboard
   - Login with Discord
   - ✅ See your username

2. **Server Test:**
   - Select your main server
   - ✅ See real member count
   - ✅ See real commands

3. **Command Test:**
   - Go to Discord
   - Type `/ping`
   - ✅ Bot responds

4. **Management Test:**
   - Disable `/ping` on dashboard
   - Try `/ping` in Discord
   - ✅ Command disabled
   - Enable it again
   - ✅ Command works

5. **Sync Test:**
   - Use `/help` in Discord
   - Check dashboard activity logs
   - ✅ See the command logged

---

## 🎊 SUCCESS!

If all tests pass:
- ✅ OAuth is working
- ✅ Server fetching is working
- ✅ Commands are working
- ✅ Two-way sync is working
- ✅ Everything is connected!

**Your complete Discord bot management system is operational!** 🚀
