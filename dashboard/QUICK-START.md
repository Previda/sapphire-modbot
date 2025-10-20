# 🚀 QUICK START GUIDE

## ✅ Current Status

Your dashboard is installing dependencies! Once it finishes, follow these steps:

---

## 📝 STEP 1: Create Environment File

```bash
cd ~/sapphire-modbot/dashboard
nano .env.local
```

Paste this (replace with your Discord credentials):

```env
# Discord OAuth
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=http://192.168.1.62:3000/api/auth/callback

# JWT Secret (generate random string)
JWT_SECRET=your_super_secret_random_string_here

# Bot API (local)
BOT_API_URL=http://localhost:3001

# Next.js
NEXTAUTH_URL=http://192.168.1.62:3000
```

Save with `Ctrl+X`, then `Y`, then `Enter`

---

## 🔐 STEP 2: Setup Discord OAuth

1. Go to: https://discord.com/developers/applications
2. Select your bot application
3. Click **OAuth2** in sidebar
4. Under **Redirects**, click **Add Redirect**
5. Add: `http://192.168.1.62:3000/api/auth/callback`
6. Click **Save Changes**
7. Copy **Client ID** and **Client Secret**
8. Paste into `.env.local` file

---

## 🚀 STEP 3: Start Dashboard

The dev server should already be running at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.1.62:3000

If not, run:
```bash
npm run dev
```

---

## ✅ STEP 4: Test It

1. Open browser: http://192.168.1.62:3000
2. Click **"Login with Discord"**
3. Authorize the application
4. You should see the dashboard!

---

## 🔧 Troubleshooting

### "System Offline" Error
Make sure bot is running:
```bash
pm2 status
pm2 logs discord-bot
```

If bot is not running:
```bash
cd ~/sapphire-modbot
pm2 start src/bot-with-api.js --name discord-bot
```

### "Authentication Failed"
- Check Discord OAuth credentials in `.env.local`
- Make sure redirect URI matches exactly
- Restart dashboard: `Ctrl+C` then `npm run dev`

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

## 🎨 What You'll See

### Landing Page
- Beautiful hero section
- Stats cards
- Feature showcase
- Login button

### Dashboard
- Real-time server stats
- Command management
- Recent activity
- Bot status indicator

---

## 📱 Access From Other Devices

The dashboard is accessible on your local network at:
```
http://192.168.1.62:3000
```

Anyone on your network can access it!

---

## 🌐 Deploy to Internet (Optional)

### Using ngrok:
```bash
# Install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Start ngrok
ngrok http 3000

# Copy the URL (e.g., https://abc123.ngrok-free.app)
# Update Discord OAuth redirect to use ngrok URL
# Update .env.local with ngrok URL
```

---

## ✨ Features

- 🔐 Discord OAuth login
- 📊 Real-time statistics
- ⚡ Command management
- 🎨 Beautiful glassmorphism UI
- 📱 Mobile responsive
- 🌙 Dark mode
- ✨ Smooth animations

---

**Everything is ready! Just add your Discord OAuth credentials and you're good to go!** 🚀
