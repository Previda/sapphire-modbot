# 🚀 Vercel Dashboard Setup Guide

This guide shows you how to deploy the Sapphire Modbot dashboard to Vercel and connect it to your Raspberry Pi.

## 📋 Prerequisites

- Raspberry Pi running Sapphire Modbot (use the factory installer)
- Vercel account
- Discord OAuth application

## 🔧 Step 1: Pi Setup

First, run the factory installer on your Pi:

```bash
curl -sSL https://raw.githubusercontent.com/Previda/sapphire-modbot/main/pi-factory-installer.sh | bash
```

After installation, note down:
- **Pi IP Address**: (e.g., 192.168.1.62)
- **API Token**: (generated during setup)

## ☁️ Step 2: Deploy to Vercel

### Option A: Deploy Button (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Previda/sapphire-modbot)

### Option B: Manual Deployment

1. **Fork the Repository**
   ```bash
   git clone https://github.com/Previda/sapphire-modbot.git
   cd sapphire-modbot
   ```

2. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

## 🔐 Step 3: Configure Environment Variables

In your Vercel project dashboard, add these environment variables:

### Required Variables

```env
# Pi Bot Connection
PI_BOT_API_URL=http://YOUR_PI_IP:3001
PI_BOT_TOKEN=your_generated_api_token

# Discord OAuth (Create at https://discord.com/developers/applications)
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_oauth_secret
DISCORD_REDIRECT_URI=https://your-vercel-app.vercel.app/login

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=https://your-vercel-app.vercel.app
```

### How to Get Values:

1. **PI_BOT_API_URL**: Your Pi IP + port 3001 (e.g., `http://192.168.1.62:3001`)
2. **PI_BOT_TOKEN**: Found in `/home/admin/sapphire-info.txt` on your Pi
3. **DISCORD_CLIENT_ID**: From Discord Developer Portal → Your App → General Information
4. **DISCORD_CLIENT_SECRET**: From Discord Developer Portal → Your App → OAuth2 → General
5. **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`

## 🔗 Step 4: Configure Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **OAuth2** → **General**
4. Add redirect URI: `https://your-vercel-app.vercel.app/login`
5. Save changes

## 🌐 Step 5: Test Connection

1. Visit your Vercel dashboard URL
2. Click "Login with Discord"
3. Authorize the application
4. You should see live data from your Pi bot

## 🔧 Step 6: Network Configuration

### Port Forwarding (Optional - for external access)

If you want external access to your Pi API:

1. **Router Configuration**:
   - Forward port 3001 to your Pi's internal IP
   - Update `PI_BOT_API_URL` to use your external IP

2. **Dynamic DNS (Recommended)**:
   - Use services like No-IP or DuckDNS
   - Update `PI_BOT_API_URL` to use your domain

### Firewall Configuration

The installer automatically configures UFW, but verify:

```bash
sudo ufw status
# Should show port 3001 as allowed
```

## 🚨 Troubleshooting

### Dashboard Shows "Bot Offline"

1. **Check Pi Services**:
   ```bash
   sudo systemctl status sapphire-bot sapphire-api
   ```

2. **Check Pi Logs**:
   ```bash
   sudo journalctl -u sapphire-bot -f
   sudo journalctl -u sapphire-api -f
   ```

3. **Test API Directly**:
   ```bash
   curl http://localhost:3001/health
   ```

### Vercel Deployment Issues

1. **Check Environment Variables**:
   - Ensure all required variables are set
   - Verify no typos in variable names

2. **Check Build Logs**:
   - Go to Vercel dashboard → Deployments → View logs

3. **Check Function Logs**:
   - Go to Vercel dashboard → Functions → View logs

### Authentication Issues

1. **Discord OAuth**:
   - Verify redirect URI matches exactly
   - Check client ID and secret are correct

2. **Pi Connection**:
   - Verify Pi IP is accessible from Vercel
   - Check API token is correct

## 📊 Step 7: Monitoring

### Pi Monitoring

```bash
# Check service status
sudo systemctl status sapphire-bot sapphire-api

# View real-time logs
sudo journalctl -u sapphire-bot -f

# Check resource usage
htop

# View connection info
cat /home/admin/sapphire-info.txt
```

### Vercel Monitoring

- **Dashboard**: Monitor function executions and errors
- **Analytics**: Track page views and performance
- **Logs**: Check function logs for API calls

## 🔄 Step 8: Updates

### Update Pi Bot

```bash
cd /home/admin/sapphire-modbot
./update.sh
```

### Update Vercel Dashboard

Vercel automatically deploys when you push to your repository:

```bash
git add .
git commit -m "Update dashboard"
git push origin main
```

## 🎯 Success Indicators

Your setup is working correctly when:

- ✅ Pi services show "active (running)" status
- ✅ `curl http://localhost:3001/health` returns JSON
- ✅ Vercel dashboard shows live Pi data
- ✅ Discord login works in dashboard
- ✅ Bot commands work in Discord
- ✅ Music and verification systems function

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables
3. Ensure network connectivity between Vercel and Pi
4. Check Discord Developer Portal settings

## 🔐 Security Notes

- **Never commit** `.env` files to git
- **Use strong tokens** (generated automatically)
- **Keep Pi updated**: Run `sudo apt update && sudo apt upgrade` regularly
- **Monitor logs** for suspicious activity
- **Use firewall**: UFW is configured automatically

## 🎉 You're Done!

Your Sapphire Modbot is now running 24/7 on your Pi with a beautiful dashboard on Vercel!
