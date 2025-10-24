# 🔗 Linking Dashboard to Discord Bot

## Overview

This guide shows you how to link your Vercel dashboard to your Raspberry Pi Discord bot.

---

## 🌐 Step 1: Expose Your Pi Bot to the Internet

### Option A: Using ngrok (Recommended for Testing)

1. **Install ngrok on your Pi:**
   ```bash
   curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
   echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
   sudo apt update
   sudo apt install ngrok
   ```

2. **Sign up for ngrok:**
   - Go to https://ngrok.com/
   - Create a free account
   - Get your auth token

3. **Configure ngrok:**
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

4. **Start ngrok tunnel:**
   ```bash
   ngrok http 3001
   ```

5. **Copy the HTTPS URL:**
   ```
   Forwarding: https://abc123.ngrok-free.app -> http://localhost:3001
   ```
   Copy: `https://abc123.ngrok-free.app`

### Option B: Using Cloudflare Tunnel (Free, Permanent)

1. **Install cloudflared:**
   ```bash
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
   sudo dpkg -i cloudflared-linux-arm64.deb
   ```

2. **Login to Cloudflare:**
   ```bash
   cloudflared tunnel login
   ```

3. **Create a tunnel:**
   ```bash
   cloudflared tunnel create skyfall-bot
   ```

4. **Configure the tunnel:**
   ```bash
   nano ~/.cloudflared/config.yml
   ```

   Add:
   ```yaml
   tunnel: YOUR_TUNNEL_ID
   credentials-file: /home/mikhail/.cloudflared/YOUR_TUNNEL_ID.json

   ingress:
     - hostname: bot.yourdomain.com
       service: http://localhost:3001
     - service: http_status:404
   ```

5. **Start the tunnel:**
   ```bash
   cloudflared tunnel run skyfall-bot
   ```

---

## 🔧 Step 2: Configure Environment Variables

### On Vercel Dashboard:

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Select your `sapphire-modbot` project

2. **Add Environment Variable:**
   - Go to Settings → Environment Variables
   - Add new variable:
     ```
     Name: NEXT_PUBLIC_PI_BOT_API_URL
     Value: https://your-ngrok-url.ngrok-free.app
     ```
   - Click "Save"

3. **Redeploy:**
   - Go to Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"

### On Your Pi (Optional):

Create `.env` file if you want to configure CORS:
```bash
cd /home/mikhail/sapphire-modbot
nano .env
```

Add:
```env
ALLOWED_ORIGINS=https://skyfall-omega.vercel.app,http://localhost:3000
```

---

## 🔌 Step 3: Verify API Endpoints

Your bot should expose these endpoints:

### Required Endpoints:

```javascript
// GET /api/stats
{
  servers: 5,
  totalMembers: 1234,
  modActions: 89,
  commandsUsed: 45600,
  uptime: 86400,
  responseTime: 45,
  status: 'online'
}

// GET /api/servers
[
  {
    id: '123...',
    name: 'My Server',
    icon: 'https://...',
    members: 1234,
    owner: true,
    botAdded: true
  }
]

// GET /api/activity/recent
[
  {
    action: 'User banned',
    user: 'User#1234',
    time: '2 min ago',
    type: 'ban'
  }
]

// GET /api/moderation/logs
[
  {
    id: '1',
    action: 'ban',
    user: 'User#1234',
    moderator: 'Admin#5678',
    reason: 'Spam',
    timestamp: '2025-10-24T13:00:00Z',
    type: 'ban'
  }
]

// GET /api/status
{
  status: 'online',
  uptime: 86400,
  responseTime: 45
}
```

---

## 🧪 Step 4: Test the Connection

### Test from your browser:

1. **Visit your ngrok URL:**
   ```
   https://your-ngrok-url.ngrok-free.app/api/stats
   ```

2. **You should see JSON response:**
   ```json
   {
     "servers": 5,
     "totalMembers": 1234,
     ...
   }
   ```

### Test from dashboard:

1. **Visit your dashboard:**
   ```
   https://skyfall-omega.vercel.app/dashboard
   ```

2. **Open browser console (F12)**

3. **Check for API calls:**
   - Should see requests to your ngrok URL
   - Should show real data, not fallback data

---

## 🔄 Step 5: Keep ngrok Running (Production)

### Option 1: Use PM2 to manage ngrok

```bash
pm2 start ngrok -- http 3001 --name ngrok-tunnel
pm2 save
```

### Option 2: Use systemd service

Create service file:
```bash
sudo nano /etc/systemd/system/ngrok.service
```

Add:
```ini
[Unit]
Description=ngrok tunnel
After=network.target

[Service]
Type=simple
User=mikhail
WorkingDirectory=/home/mikhail
ExecStart=/usr/local/bin/ngrok http 3001
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable ngrok
sudo systemctl start ngrok
```

### Option 3: Use Cloudflare Tunnel (Recommended)

Cloudflare tunnels are permanent and don't need to be restarted!

---

## 🔐 Step 6: Add Discord OAuth (Optional)

To allow users to login with Discord:

1. **Go to Discord Developer Portal:**
   - https://discord.com/developers/applications
   - Select your bot

2. **Add OAuth2 Redirect:**
   - Go to OAuth2 → General
   - Add redirect URL:
     ```
     https://skyfall-omega.vercel.app/api/auth/callback/discord
     ```

3. **Copy Client ID and Secret:**
   - Client ID: Already have this
   - Client Secret: Generate new secret

4. **Add to Vercel Environment Variables:**
   ```
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   NEXTAUTH_URL=https://skyfall-omega.vercel.app
   NEXTAUTH_SECRET=generate_random_string
   ```

5. **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

---

## 📊 Step 7: Monitor the Connection

### Check ngrok status:
```bash
curl http://localhost:4040/api/tunnels
```

### Check bot API:
```bash
curl http://localhost:3001/api/stats
```

### Check from internet:
```bash
curl https://your-ngrok-url.ngrok-free.app/api/stats
```

### View ngrok dashboard:
- Visit http://localhost:4040
- See all requests in real-time

---

## 🐛 Troubleshooting

### Dashboard shows "offline" or fallback data:

1. **Check ngrok is running:**
   ```bash
   pm2 list
   # Should show ngrok-tunnel running
   ```

2. **Check bot API is running:**
   ```bash
   curl http://localhost:3001/api/stats
   # Should return JSON
   ```

3. **Check Vercel environment variable:**
   - Go to Vercel → Settings → Environment Variables
   - Verify `NEXT_PUBLIC_PI_BOT_API_URL` is correct
   - Must start with `https://`

4. **Check CORS:**
   - Your bot needs to allow requests from Vercel
   - Add CORS headers in your API

### ngrok URL changes every restart:

**Solution 1: Get a static domain (ngrok paid)**
- Upgrade to ngrok paid plan
- Get a permanent subdomain

**Solution 2: Use Cloudflare Tunnel**
- Free permanent URL
- No restarts needed

**Solution 3: Update Vercel env var after restart**
- Get new ngrok URL
- Update Vercel environment variable
- Redeploy

### API returns 404:

1. **Check endpoint exists:**
   ```bash
   curl http://localhost:3001/api/stats
   ```

2. **Check bot-with-api.js has routes:**
   - Should have Express routes defined
   - Should be listening on port 3001

---

## 🚀 Quick Setup Commands

### Full setup in one go:

```bash
# On your Pi
cd /home/mikhail/sapphire-modbot
git pull

# Start ngrok
pm2 start ngrok -- http 3001 --name ngrok-tunnel
pm2 save

# Get ngrok URL
curl http://localhost:4040/api/tunnels | grep -o 'https://[^"]*ngrok-free.app'

# Copy the URL and add to Vercel
# Then restart bot
pm2 restart skyfall-bot
```

---

## 📝 Summary

1. ✅ **Expose Pi bot** - Use ngrok or Cloudflare
2. ✅ **Get public URL** - Copy HTTPS URL
3. ✅ **Add to Vercel** - Environment variable
4. ✅ **Redeploy** - Apply changes
5. ✅ **Test** - Visit dashboard
6. ✅ **Monitor** - Check ngrok dashboard

---

## 🎯 Expected Result

When properly linked:

- ✅ Dashboard shows real server count
- ✅ Dashboard shows actual member count
- ✅ Dashboard shows live bot status
- ✅ Dashboard shows real-time data
- ✅ Auto-refreshes every 30 seconds

**Your dashboard is now connected to your Pi bot!** 🎉
