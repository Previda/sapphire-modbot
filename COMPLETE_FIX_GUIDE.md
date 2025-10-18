# 🔧 COMPLETE FIX GUIDE - Fix Everything

## ⚡ STEP 1: FIX THE BOT (Run on Pi)

```bash
cd ~/sapphire-modbot && git pull origin main && npm install && pm2 restart discord-bot && sleep 3 && pm2 logs discord-bot --lines 30
```

**This will:**
- Pull latest code
- Install all dependencies
- Restart bot
- Show logs

---

## ✅ STEP 2: VERIFY BOT IS WORKING

**Check PM2 Status:**
```bash
pm2 status
```

**Should show:**
```
│ discord-bot  │ online │ 0 restarts │
```

**Check Logs:**
```bash
pm2 logs discord-bot --lines 20 --nostream
```

**Should show:**
```
✅ Discord bot online! Logged in as Skyfall#6931
🏰 Serving 5 guilds
📊 Updated API with 5 guilds and 60 commands
```

---

## 🎫 STEP 3: SETUP TICKET SYSTEM

**In Discord, run:**
```
/ticket setup
```

**This will:**
- Create ticket category
- Create log channel
- Setup ticket panel
- Add buttons

**Then users can click "Create Ticket" button!**

---

## 🛡️ STEP 4: SETUP VERIFICATION SYSTEM

**In Discord, run:**
```
/verification setup
```

**Then configure:**
1. **Verification Channel** - Where users verify
2. **Verified Role** - Role given after verification
3. **Verification Type:**
   - `button` - Simple button click
   - `captcha` - Math captcha
   - `reaction` - React to message

**Example:**
```
/verification setup
  channel: #verify
  role: @Verified
  type: button
```

**This will:**
- Create verification panel
- Users click "Verify" button
- Bot gives them the role
- They can access server

---

## 🔒 STEP 5: LOCK CHANNELS (Require Verification)

**For each channel you want to lock:**

1. Go to **Channel Settings** → **Permissions**
2. Click **@everyone**
3. **Deny** "View Channel"
4. Click **Add Role** → Select **@Verified**
5. **Allow** "View Channel"
6. Save

**Now only verified users can see those channels!**

---

## 📊 STEP 6: CHECK WEBSITE

1. **Go to:** https://skyfall-omega.vercel.app
2. **Login with Discord**
3. **Select your server**
4. **You should see:**
   - System Online ✅
   - All commands listed
   - Server stats
   - Activity logs

---

## 🎯 WORKING COMMANDS:

### **Moderation:**
```
/ban @user [reason]
/kick @user [reason]
/mute @user [duration] [reason]
/unmute @user
/warn @user [reason]
/warnings @user
/timeout @user [duration]
/purge [amount]
```

### **Tickets:**
```
/ticket setup          - Setup ticket system
(Users click button to create ticket)
```

### **Verification:**
```
/verification setup    - Setup verification
(Users click button to verify)
```

### **Utility:**
```
/ping                  - Check bot latency
/serverinfo            - Server information
/userinfo @user        - User information
/help                  - Show all commands
```

### **Appeals:**
```
/appeal setup          - Setup appeal system
(Banned users can appeal)
```

---

## 🐛 TROUBLESHOOTING:

### **Buttons Still Failing?**

**Check bot permissions:**
```
Bot needs these permissions:
✅ Manage Channels
✅ Manage Roles
✅ Send Messages
✅ Embed Links
✅ Attach Files
✅ Read Message History
✅ Add Reactions
✅ Use External Emojis
✅ Manage Messages
✅ Kick Members
✅ Ban Members
✅ Moderate Members
```

**Re-invite bot with correct permissions:**
```
https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=1099511627775&scope=bot%20applications.commands
```

### **Commands Not Showing?**

**Register slash commands:**
```bash
# On your Pi
cd ~/sapphire-modbot
node src/deploy-commands.js
```

### **Website Still Offline?**

**Check ngrok:**
```bash
screen -r ngrok
# Should show: Forwarding https://XXXXX.ngrok-free.app -> localhost:3004
# Press Ctrl+A then D to detach
```

**Update Vercel:**
```bash
# Get ngrok URL
curl http://localhost:4040/api/tunnels | grep -o 'https://[^"]*ngrok-free.app'

# Update in Vercel dashboard:
# https://vercel.com/previdas-projects/skyfall/settings/environment-variables
# Set PI_BOT_API_URL to your ngrok URL
# Then redeploy
```

---

## ✅ VERIFICATION SYSTEM FEATURES:

### **Customizable Options:**
- ✅ Choose verification channel
- ✅ Choose verified role
- ✅ Button, captcha, or reaction
- ✅ Custom welcome message
- ✅ Auto-delete verification messages
- ✅ DM users on verification
- ✅ Log verifications

### **How It Works:**
1. User joins server
2. Can only see #verify channel
3. Clicks "Verify" button
4. Completes verification (button/captcha/reaction)
5. Gets verified role
6. Can now see all channels

### **Lock Your Server:**
1. Setup verification system
2. Lock all channels (deny @everyone, allow @Verified)
3. Users must verify to access server
4. Prevents raids and bots

---

## 🎊 COMPLETE CHECKLIST:

- [ ] Run fix command on Pi
- [ ] Bot shows "online" in PM2
- [ ] Bot responds to `/ping`
- [ ] Setup ticket system (`/ticket setup`)
- [ ] Test ticket creation (click button)
- [ ] Setup verification (`/verification setup`)
- [ ] Test verification (click button)
- [ ] Lock channels (require @Verified role)
- [ ] Check website shows "Online"
- [ ] Test website login
- [ ] Verify all commands work

---

## 🚀 AFTER EVERYTHING IS FIXED:

**Your bot will have:**
- ✅ Working ticket system with buttons
- ✅ Verification system (customizable)
- ✅ Locked channels (require verification)
- ✅ All moderation commands
- ✅ Appeal system
- ✅ Beautiful website dashboard
- ✅ Real-time stats
- ✅ Activity logs

**Everything will be stable and working perfectly!** 🎉
