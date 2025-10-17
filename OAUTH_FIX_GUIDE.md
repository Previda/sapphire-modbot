# 🔐 DISCORD OAUTH FIX GUIDE

## ❌ ERROR: `token_exchange_failed`

This error means Discord OAuth is not configured correctly. Here's how to fix it:

---

## 🔧 STEP 1: CHECK DISCORD DEVELOPER PORTAL

### **Go to Discord Developer Portal:**
```
https://discord.com/developers/applications
```

### **Select Your Application:**
1. Click on **"Skyfall"** (or your bot name)
2. Go to **OAuth2** section (left sidebar)

### **Check Redirect URIs:**
Make sure you have EXACTLY this URL:
```
https://skyfall-omega.vercel.app/api/auth/callback-discord
```

**IMPORTANT:** 
- ✅ Must be EXACT match (no trailing slash)
- ✅ Must be `https://` not `http://`
- ✅ Case-sensitive

### **Add if Missing:**
1. Click **"Add Redirect"**
2. Paste: `https://skyfall-omega.vercel.app/api/auth/callback-discord`
3. Click **"Save Changes"** at bottom

---

## 🔧 STEP 2: CHECK VERCEL ENVIRONMENT VARIABLES

### **Go to Vercel Dashboard:**
```
https://vercel.com/previdas-projects/skyfall/settings/environment-variables
```

### **Required Variables:**

#### **1. DISCORD_CLIENT_ID**
```
Value: 1358527215020544222
Environment: Production, Preview, Development
```

#### **2. DISCORD_CLIENT_SECRET**
```
Value: [YOUR SECRET FROM DISCORD DEVELOPER PORTAL]
Environment: Production, Preview, Development
```

**To get Client Secret:**
1. Go to Discord Developer Portal
2. Click your application
3. Go to **OAuth2** → **General**
4. Click **"Reset Secret"** (if needed)
5. Copy the secret
6. Paste into Vercel

#### **3. NEXTAUTH_URL** (Optional)
```
Value: https://skyfall-omega.vercel.app
Environment: Production
```

---

## 🔧 STEP 3: REDEPLOY WEBSITE

After updating environment variables:

### **Option 1: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click latest deployment
3. Click **"..."** menu
4. Click **"Redeploy"**

### **Option 2: Via Command Line**
```bash
vercel --prod
```

---

## 🧪 STEP 4: TEST LOGIN

### **Clear Browser Cache:**
```
Ctrl + Shift + Delete
→ Select "All time"
→ Check "Cached images and files"
→ Click "Clear data"
```

### **Try Login:**
1. Go to: https://skyfall-omega.vercel.app
2. Click **"🔐 Login with Discord"**
3. Authorize the application
4. Should redirect to dashboard

---

## 🔍 TROUBLESHOOTING

### **Error: `missing_secret`**
- ❌ `DISCORD_CLIENT_SECRET` not set in Vercel
- ✅ Add it in Vercel environment variables
- ✅ Redeploy

### **Error: `token_exchange_failed`**
- ❌ Client Secret is wrong
- ❌ Redirect URI doesn't match
- ✅ Check both in Discord Developer Portal
- ✅ Make sure redirect URI is EXACT match

### **Error: `no_code`**
- ❌ Discord didn't send authorization code
- ❌ User cancelled authorization
- ✅ Try logging in again

### **Error: `discord_access_denied`**
- ❌ User denied permission
- ✅ Try again and click "Authorize"

---

## 📋 CHECKLIST

Before testing, make sure:

- [ ] Redirect URI added in Discord Developer Portal
- [ ] Redirect URI is EXACT: `https://skyfall-omega.vercel.app/api/auth/callback-discord`
- [ ] `DISCORD_CLIENT_ID` set in Vercel (1358527215020544222)
- [ ] `DISCORD_CLIENT_SECRET` set in Vercel (from Discord portal)
- [ ] Website redeployed after env variable changes
- [ ] Browser cache cleared
- [ ] Using correct URL: https://skyfall-omega.vercel.app

---

## 🎯 QUICK FIX COMMANDS

### **Get Client Secret from Discord:**
1. https://discord.com/developers/applications
2. Click your app → OAuth2 → General
3. Copy "Client Secret"

### **Set in Vercel:**
```bash
# Remove old secret (if exists)
vercel env rm DISCORD_CLIENT_SECRET production

# Add new secret
vercel env add DISCORD_CLIENT_SECRET production
# Paste your secret when prompted

# Redeploy
vercel --prod
```

---

## ✅ EXPECTED RESULT

After fixing, you should see:
1. Click "Login with Discord"
2. Discord authorization page
3. Click "Authorize"
4. Redirect to dashboard
5. See your username and avatar
6. See your servers

---

## 🆘 STILL NOT WORKING?

Check Vercel logs:
```
https://vercel.com/previdas-projects/skyfall/deployments
→ Click latest deployment
→ Click "Functions" tab
→ Look for errors in `/api/auth/callback-discord`
```

The logs will now show:
- ✅ Client ID being used
- ✅ Redirect URI being used
- ✅ Whether secret exists
- ❌ Exact error from Discord

---

**Follow these steps and OAuth will work!** 🚀
