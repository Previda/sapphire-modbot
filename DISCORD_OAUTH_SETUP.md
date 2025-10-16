# 🔐 Discord OAuth Setup Guide

## Step 1: Get Your Discord OAuth Credentials

1. **Go to Discord Developer Portal:**
   - Visit: https://discord.com/developers/applications
   - Login with your Discord account

2. **Select Your Application:**
   - Click on your application: **Skyfall** (ID: 1358527215020544222)
   - If you don't see it, create a new application

3. **Get Your Client Secret:**
   - Click on **OAuth2** in the left sidebar
   - Under **Client Information**, you'll see:
     - **CLIENT ID:** 1358527215020544222 (you already have this)
     - **CLIENT SECRET:** Click "Reset Secret" or "Copy" to get it
   - **IMPORTANT:** Copy this secret - you'll need it!

4. **Add Redirect URLs:**
   - Scroll down to **Redirects**
   - Click **Add Redirect**
   - Add these URLs:
     ```
     https://skyfall-omega.vercel.app/api/auth/callback
     http://localhost:3000/api/auth/callback
     ```
   - Click **Save Changes**

5. **Set OAuth2 Scopes:**
   - In OAuth2 URL Generator section
   - Select these scopes:
     - ✅ `identify` - Get user info
     - ✅ `guilds` - See user's servers
     - ✅ `email` - Get user email
   - Copy the generated URL (you can use this to test login)

## Step 2: Add Credentials to Vercel

Run these commands in PowerShell:

```powershell
cd C:\Users\Mikhail\CascadeProjects\sapphire-modbot

# Add Discord Client Secret (replace YOUR_SECRET_HERE with actual secret)
vercel env add DISCORD_CLIENT_SECRET production
# When prompted, paste your Discord Client Secret

# Add NextAuth Secret (generate random string)
vercel env add NEXTAUTH_SECRET production
# When prompted, paste: skyfall-discord-oauth-secret-2024

# Add NextAuth URL
vercel env add NEXTAUTH_URL production
# When prompted, paste: https://skyfall-omega.vercel.app

# Redeploy
vercel --prod
```

## Step 3: Test Your OAuth

1. Go to: https://skyfall-omega.vercel.app
2. Click **Login with Discord**
3. Authorize the application
4. You should see your Discord servers and permissions!

## Your Current Credentials

- ✅ **DISCORD_CLIENT_ID:** 1358527215020544222
- ❌ **DISCORD_CLIENT_SECRET:** (Get from Discord Developer Portal)
- ✅ **DISCORD_BOT_TOKEN:** (Already set)
- ✅ **Redirect URL:** https://skyfall-omega.vercel.app/api/auth/callback

## Troubleshooting

**Error: "Invalid Client Secret"**
- Make sure you copied the entire secret
- No extra spaces or characters
- Reset the secret in Discord Developer Portal if needed

**Error: "Redirect URI Mismatch"**
- Make sure you added the exact redirect URL in Discord Developer Portal
- Check for http vs https
- Check for trailing slashes

**Can't see servers:**
- Make sure you selected the `guilds` scope
- Check that you're logged into the right Discord account
- Verify bot is in the servers you want to manage
