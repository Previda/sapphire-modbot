# 🔐 ENVIRONMENT SETUP GUIDE

## ⚡ QUICK SETUP (On Your Raspberry Pi)

### **Step 1: Create `.env.local` File**

```bash
cd ~/sapphire-modbot/dashboard
cp env.example .env.local
nano .env.local
```

---

## 📋 COMPLETE `.env.local` TEMPLATE

Copy this and fill in your values:

```env
# ===== DISCORD OAUTH CONFIGURATION =====
# Get these from: https://discord.com/developers/applications
DISCORD_CLIENT_ID=1358527215020544222
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
DISCORD_REDIRECT_URI=http://192.168.1.62:3000/api/auth/callback

# ===== JWT SECRET =====
# Generate with: openssl rand -base64 32
JWT_SECRET=your_generated_jwt_secret_here

# ===== BOT API URL =====
# Local network (default)
BOT_API_URL=http://192.168.1.62:3001

# Or use ngrok for internet access:
# BOT_API_URL=https://your-ngrok-url.ngrok-free.app

# ===== NEXT.JS CONFIGURATION =====
NEXTAUTH_URL=http://192.168.1.62:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

---

## 🔑 HOW TO GET EACH VALUE

### **1. DISCORD_CLIENT_ID**
✅ **You already have this:** `1358527215020544222`

---

### **2. DISCORD_CLIENT_SECRET**

1. Go to: https://discord.com/developers/applications
2. Click on your bot application
3. Go to **OAuth2** section
4. Click **Reset Secret** (or copy existing)
5. Copy the secret

**Example:**
```env
DISCORD_CLIENT_SECRET=AbCdEf123456_xYz789-MnOpQrStUvWx
```

---

### **3. DISCORD_REDIRECT_URI**

For **local network** (Pi):
```env
DISCORD_REDIRECT_URI=http://192.168.1.62:3000/api/auth/callback
```

For **localhost** (development):
```env
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

**Important:** Add this exact URL to Discord Developer Portal:
1. Go to OAuth2 → Redirects
2. Click "Add Redirect"
3. Paste: `http://192.168.1.62:3000/api/auth/callback`
4. Click "Save Changes"

---

### **4. JWT_SECRET**

Generate a secure random string:

```bash
openssl rand -base64 32
```

**Example output:**
```
K8mN2pQ5rS9tV1wX3yZ6aB8cD0eF2gH4iJ7kL9mN1oP3qR5sT7uV9wX1yZ3aB5c=
```

Copy this and use it as your JWT_SECRET:
```env
JWT_SECRET=K8mN2pQ5rS9tV1wX3yZ6aB8cD0eF2gH4iJ7kL9mN1oP3qR5sT7uV9wX1yZ3aB5c=
```

---

### **5. BOT_API_URL**

**Option A: Local Network (Recommended)**
```env
BOT_API_URL=http://192.168.1.62:3001
```

**Option B: Internet Access (via ngrok)**
```bash
# On Pi, run:
ngrok http 3001

# Copy the URL (e.g., https://abc123.ngrok-free.app)
```

```env
BOT_API_URL=https://abc123.ngrok-free.app
```

---

### **6. NEXTAUTH_URL**

For **local network** (Pi):
```env
NEXTAUTH_URL=http://192.168.1.62:3000
```

For **localhost** (development):
```env
NEXTAUTH_URL=http://localhost:3000
```

---

### **7. NEXTAUTH_SECRET**

Generate another secure random string:

```bash
openssl rand -base64 32
```

**Example:**
```env
NEXTAUTH_SECRET=A1bC2dE3fG4hI5jK6lM7nO8pQ9rS0tU1vW2xY3zA4bC5dE6fG7hI8jK9lM0nO1p=
```

---

## 📝 COMPLETE EXAMPLE

Here's a **filled-in example** (with fake secrets):

```env
# Discord OAuth
DISCORD_CLIENT_ID=1358527215020544222
DISCORD_CLIENT_SECRET=AbCdEf123456_xYz789-MnOpQrStUvWx
DISCORD_REDIRECT_URI=http://192.168.1.62:3000/api/auth/callback

# JWT Secret
JWT_SECRET=K8mN2pQ5rS9tV1wX3yZ6aB8cD0eF2gH4iJ7kL9mN1oP3qR5sT7uV9wX1yZ3aB5c=

# Bot API
BOT_API_URL=http://192.168.1.62:3001

# Next.js
NEXTAUTH_URL=http://192.168.1.62:3000
NEXTAUTH_SECRET=A1bC2dE3fG4hI5jK6lM7nO8pQ9rS0tU1vW2xY3zA4bC5dE6fG7hI8jK9lM0nO1p=
```

---

## 🚀 AFTER CREATING `.env.local`

### **1. Verify File Exists**
```bash
ls -la .env.local
cat .env.local
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Start Dashboard**
```bash
npm run dev
```

Or with PM2:
```bash
pm2 start npm --name "sapphire-dashboard" -- run dev
```

### **4. Access Dashboard**
Open: `http://192.168.1.62:3000`

---

## ✅ VERIFICATION CHECKLIST

- [ ] `.env.local` file created
- [ ] All 7 variables filled in
- [ ] Discord redirect URI added to Developer Portal
- [ ] JWT_SECRET generated (32+ characters)
- [ ] NEXTAUTH_SECRET generated (32+ characters)
- [ ] BOT_API_URL points to your Pi (port 3001)
- [ ] Bot is running with API server
- [ ] Dashboard starts without errors

---

## 🔒 SECURITY NOTES

### **NEVER commit `.env.local` to Git!**

It's already in `.gitignore`, but double-check:

```bash
cat .gitignore | grep .env.local
```

Should show:
```
.env.local
```

### **Keep Secrets Secret!**

- ❌ Don't share your `.env.local` file
- ❌ Don't post secrets in Discord/GitHub
- ❌ Don't commit to public repos
- ✅ Use different secrets for production
- ✅ Regenerate if compromised

---

## 🌐 DISCORD DEVELOPER PORTAL SETUP

### **Add Redirect URI:**

1. Go to: https://discord.com/developers/applications
2. Select your bot application
3. Click **OAuth2** in left sidebar
4. Scroll to **Redirects** section
5. Click **Add Redirect**
6. Enter: `http://192.168.1.62:3000/api/auth/callback`
7. Click **Save Changes**

### **Required OAuth2 Scopes:**

Make sure these are enabled:
- ✅ `identify` - Get user info
- ✅ `guilds` - Get user's servers
- ✅ `email` - Get user's email (optional)

---

## 🚨 TROUBLESHOOTING

### **"Invalid Redirect URI" Error**

**Problem:** Discord OAuth fails with redirect error

**Solution:**
1. Check redirect URI in `.env.local` matches Discord Developer Portal exactly
2. Make sure you saved changes in Discord Developer Portal
3. Restart dashboard after changing `.env.local`

---

### **"Cannot Connect to Bot" Error**

**Problem:** Dashboard shows "System Offline"

**Solution:**
1. Check bot is running: `pm2 list`
2. Check bot API: `curl http://localhost:3001/api/status`
3. Check `BOT_API_URL` in `.env.local`
4. Restart bot: `pm2 restart skyfall-bot`

---

### **"Invalid JWT Secret" Error**

**Problem:** Authentication fails

**Solution:**
1. Generate new JWT_SECRET: `openssl rand -base64 32`
2. Update `.env.local`
3. Restart dashboard

---

## 📚 QUICK REFERENCE

### **Generate Secrets:**
```bash
# JWT Secret
openssl rand -base64 32

# NextAuth Secret
openssl rand -base64 32
```

### **Test Bot API:**
```bash
curl http://192.168.1.62:3001/api/status
```

### **Restart Dashboard:**
```bash
pm2 restart sapphire-dashboard
```

### **View Dashboard Logs:**
```bash
pm2 logs sapphire-dashboard
```

---

## ✨ FINAL CHECKLIST

Before accessing dashboard:

- [ ] Bot running with API server (port 3001)
- [ ] Dashboard `.env.local` configured
- [ ] Discord redirect URI added
- [ ] Dependencies installed (`npm install`)
- [ ] Dashboard started (`npm run dev`)
- [ ] Can access `http://192.168.1.62:3000`

---

**Once everything is set up, you'll have a fully functional dashboard with Discord OAuth!** 🎉
