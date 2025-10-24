# 🚀 AUTOMATIC BOT SETUP & VALIDATION

## ✨ NEW FEATURE: Auto-Configuration

Your dashboard now **automatically validates** and **syncs** with your bot! Just paste your bot token and everything gets configured automatically.

---

## 🎯 WHAT IT DOES

### **Automatic Validation:**
- ✅ Validates bot token with Discord API
- ✅ Fetches bot information (ID, username, avatar)
- ✅ Retrieves application details
- ✅ Checks all environment variables
- ✅ Tests bot API connection
- ✅ Provides configuration suggestions

### **Auto-Generated Config:**
- ✅ **Client ID** - Automatically extracted from bot
- ✅ **Redirect URI** - Generated based on your URL
- ✅ **Bot Info** - Username, ID, verification status
- ✅ **Copy to Clipboard** - One-click copy for all values

---

## 🚀 HOW TO USE

### **Step 1: Access Setup Wizard**

Visit: `http://192.168.1.62:3000/setup`

Or use the validation API:
```bash
curl http://192.168.1.62:3000/api/validate
```

---

### **Step 2: Paste Bot Token**

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your bot application
3. Go to **Bot** section
4. Click **Reset Token** (or copy existing)
5. Copy the token
6. Paste into the setup wizard

---

### **Step 3: Automatic Validation**

The wizard will:
1. ✅ Validate token with Discord
2. ✅ Fetch bot information
3. ✅ Generate Client ID
4. ✅ Generate Redirect URI
5. ✅ Show copy buttons for easy setup

---

### **Step 4: Copy to .env.local**

Click the copy buttons to get:
- **Client ID** - For Discord OAuth
- **Redirect URI** - For OAuth callback

Paste into your `.env.local` file!

---

## 📋 API ENDPOINTS

### **1. GET /api/validate**
Check entire dashboard configuration

**Response:**
```json
{
  "success": true,
  "environment": {
    "valid": true,
    "errors": [],
    "warnings": [],
    "config": {
      "DISCORD_CLIENT_ID": "present",
      "JWT_SECRET": "present"
    }
  },
  "botConnection": {
    "online": true,
    "botInfo": {
      "guilds": 5,
      "users": 1234,
      "commands": 65
    }
  },
  "suggestions": [],
  "allValid": true
}
```

---

### **2. POST /api/validate**
Validate specific bot token

**Request:**
```json
{
  "token": "your_bot_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "bot": {
    "id": "1358527215020544222",
    "username": "Sapphire",
    "discriminator": "0000",
    "avatar": "abc123",
    "verified": true,
    "bot": true
  },
  "application": {
    "id": "1358527215020544222",
    "name": "Sapphire ModBot",
    "description": "Advanced moderation bot",
    "publicKey": "xyz789"
  },
  "recommendations": {
    "clientId": "1358527215020544222",
    "redirectUri": "http://192.168.1.62:3000/api/auth/callback"
  }
}
```

---

## 🔍 VALIDATION CHECKS

### **Environment Variables:**
- ✅ DISCORD_CLIENT_ID
- ✅ DISCORD_CLIENT_SECRET
- ✅ JWT_SECRET (min 32 chars)
- ✅ NEXTAUTH_SECRET (min 32 chars)
- ✅ BOT_API_URL
- ✅ DISCORD_REDIRECT_URI
- ✅ NEXTAUTH_URL

### **Bot Connection:**
- ✅ Can connect to bot API
- ✅ Bot is online
- ✅ Bot responds to status requests
- ✅ Bot data is accessible

### **Configuration:**
- ✅ All required variables present
- ✅ Secrets are strong enough
- ✅ URLs are properly formatted
- ✅ Bot token is valid

---

## 💡 SMART SUGGESTIONS

The system provides intelligent suggestions:

### **Example Suggestions:**
- 💡 "Consider using your Pi IP address (192.168.1.62) instead of localhost"
- 💡 "Remember to update BOT_API_URL when ngrok URL changes"
- 💡 "Update DISCORD_REDIRECT_URI to your actual domain for production"
- 💡 "JWT_SECRET should be at least 32 characters"

---

## 🎨 SETUP WIZARD FEATURES

### **Visual Status:**
- 🟢 **Green** - Everything configured correctly
- 🟡 **Yellow** - Warnings (optional config missing)
- 🔴 **Red** - Errors (required config missing)

### **Real-Time Validation:**
- ⚡ Instant token validation
- ⚡ Live bot connection check
- ⚡ Automatic config generation
- ⚡ One-click copy to clipboard

### **Detailed Information:**
- 📊 Environment variable status
- 🤖 Bot connection status
- 💡 Configuration suggestions
- 📋 Bot information display

---

## 🔧 USAGE EXAMPLES

### **Example 1: Quick Validation**
```bash
# Check if everything is configured
curl http://192.168.1.62:3000/api/validate
```

### **Example 2: Validate Token**
```bash
# Validate a specific bot token
curl -X POST http://192.168.1.62:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_BOT_TOKEN_HERE"}'
```

### **Example 3: Startup Check**
```javascript
// In your dashboard startup
const validation = await fetch('/api/validate');
const status = await validation.json();

if (!status.allValid) {
  console.error('Configuration issues:', status.environment.errors);
}
```

---

## 📝 INTEGRATION GUIDE

### **Add to Your Dashboard:**

1. **Import Setup Wizard:**
```tsx
import { SetupWizard } from '@/components/SetupWizard';
```

2. **Create Setup Page:**
```tsx
// app/setup/page.tsx
export default function SetupPage() {
  return <SetupWizard />;
}
```

3. **Add Validation Hook:**
```tsx
import { useEffect } from 'react';

useEffect(() => {
  fetch('/api/validate')
    .then(res => res.json())
    .then(data => {
      if (!data.allValid) {
        // Redirect to setup
        window.location.href = '/setup';
      }
    });
}, []);
```

---

## ✅ BENEFITS

### **For Users:**
- 🚀 **Faster Setup** - No manual config needed
- ✅ **Fewer Errors** - Automatic validation
- 📋 **Clear Guidance** - Step-by-step instructions
- 🎯 **One-Click Copy** - Easy value copying

### **For Developers:**
- 🔍 **Easy Debugging** - See exactly what's missing
- 📊 **Status Dashboard** - Visual configuration status
- 💡 **Smart Suggestions** - Helpful recommendations
- ⚡ **Quick Validation** - Instant feedback

---

## 🚨 ERROR HANDLING

### **Invalid Token:**
```json
{
  "success": false,
  "error": "Invalid bot token",
  "status": 401
}
```

### **Missing Variables:**
```json
{
  "success": false,
  "environment": {
    "valid": false,
    "errors": [
      "Missing required variable: DISCORD_CLIENT_SECRET",
      "Missing required variable: JWT_SECRET"
    ]
  }
}
```

### **Bot Offline:**
```json
{
  "success": false,
  "botConnection": {
    "online": false,
    "error": "Bot API not responding"
  }
}
```

---

## 🎯 COMPLETE WORKFLOW

### **1. First Time Setup:**
```bash
# Pull latest code
cd ~/sapphire-modbot
git pull origin main

# Install dependencies
cd dashboard
npm install

# Start dashboard
npm run dev

# Visit setup wizard
# http://192.168.1.62:3000/setup
```

### **2. Paste Bot Token:**
- Get token from Discord Developer Portal
- Paste into setup wizard
- Click "Validate"

### **3. Copy Generated Config:**
- Click copy button for Client ID
- Click copy button for Redirect URI
- Paste into `.env.local`

### **4. Complete Setup:**
- Add Discord Client Secret
- Generate JWT secrets
- Save `.env.local`
- Restart dashboard

### **5. Verify:**
- Visit `/api/validate`
- Check all green checkmarks
- Access dashboard

---

## 📚 ADDITIONAL FEATURES

### **Automatic Startup Validation:**
The dashboard automatically checks configuration on startup and logs:
```
🔍 Performing startup validation...
📋 Environment validation: ✅
🤖 Bot API connection: ✅
💡 Configuration suggestions:
   - Consider using your Pi IP address instead of localhost
```

### **Continuous Monitoring:**
- Checks bot connection every 30 seconds
- Updates status in real-time
- Alerts on configuration issues
- Provides actionable suggestions

---

## 🎉 SUMMARY

You now have:
- ✅ **Automatic bot token validation**
- ✅ **Auto-generated configuration**
- ✅ **Visual setup wizard**
- ✅ **One-click value copying**
- ✅ **Real-time status checking**
- ✅ **Smart suggestions**
- ✅ **Complete validation API**

**No more manual configuration! Just paste your bot token and go!** 🚀✨
