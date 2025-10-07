# 🚀 Deploy Sapphire Modbot Dashboard to Vercel

This guide walks you through deploying the updated Sapphire Modbot dashboard to Vercel with all the latest fixes and optimizations.

## 🎯 What's New in This Update

### ✨ **Latest Features & Fixes:**
- ✅ **Pi 2 Optimization**: Full support for Raspberry Pi 2 with resource limits
- ✅ **Real Data Integration**: Dashboard shows actual Pi data (no fake data)
- ✅ **Enhanced Security**: Improved CORS, headers, and authentication
- ✅ **Better Error Handling**: Comprehensive error reporting and recovery
- ✅ **Performance Optimization**: Faster loading and response times
- ✅ **Modern UI**: Glass morphism effects and responsive design
- ✅ **Health Monitoring**: Advanced health checks and deployment status
- ✅ **Command Registration**: All 50+ commands properly registered

### 🔧 **Technical Improvements:**
- Enhanced API endpoints with better caching
- Improved memory management for Vercel functions
- Better Pi connection handling with timeouts
- Security headers and CORS optimization
- Deployment status monitoring

## 🚀 Quick Deploy

### **Option 1: One-Click Deploy (Recommended)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Previda/sapphire-modbot&env=PI_BOT_API_URL,PI_BOT_TOKEN,NEXT_PUBLIC_DISCORD_CLIENT_ID,DISCORD_CLIENT_SECRET,NEXTAUTH_SECRET&envDescription=Required%20environment%20variables%20for%20Sapphire%20Modbot&envLink=https://github.com/Previda/sapphire-modbot/blob/main/VERCEL-SETUP.md)

### **Option 2: Manual Deploy**

1. **Fork/Clone Repository**:
```bash
git clone https://github.com/Previda/sapphire-modbot.git
cd sapphire-modbot
```

2. **Install Vercel CLI**:
```bash
npm i -g vercel
```

3. **Deploy**:
```bash
vercel --prod
```

## 🔐 Environment Variables

Set these in your Vercel project dashboard:

### **Required Variables**

```env
# Pi Bot Connection (Get from your Pi after running installer)
PI_BOT_API_URL=http://YOUR_PI_IP:3001
PI_BOT_TOKEN=your_generated_api_token_from_pi

# Discord OAuth (Create at https://discord.com/developers/applications)
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_oauth_secret

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=https://your-vercel-app.vercel.app
```

### **How to Get Values:**

1. **PI_BOT_API_URL**: 
   - Run Pi installer: `curl -sSL https://raw.githubusercontent.com/Previda/sapphire-modbot/main/pi-factory-installer.sh | bash`
   - Use format: `http://YOUR_PI_IP:3001`

2. **PI_BOT_TOKEN**: 
   - Found in `/home/admin/sapphire-info.txt` on your Pi after installation

3. **Discord OAuth Setup**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create/select your application
   - Copy Client ID and Client Secret
   - Add redirect URI: `https://your-vercel-app.vercel.app/login`

4. **NEXTAUTH_SECRET**: 
   - Generate with: `openssl rand -base64 32`

## 🔍 Verify Deployment

### **1. Check Health Endpoint**
Visit: `https://your-vercel-app.vercel.app/api/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-06T...",
  "services": {
    "dashboard": "online",
    "pi_connection": "connected"
  },
  "version": "2.0.0"
}
```

### **2. Check Deployment Status**
Visit: `https://your-vercel-app.vercel.app/api/deployment-status`

Should show:
```json
{
  "pi_connection": {
    "status": "connected",
    "api_url": "http://YOUR_PI_IP:3001"
  },
  "features": {
    "dashboard": true,
    "real_time_data": true,
    "authentication": true
  }
}
```

### **3. Test Dashboard**
1. Visit your Vercel app URL
2. Click "Login with Discord"
3. Authorize the application
4. Should see live data from your Pi

## 🔧 Configuration Files

### **vercel.json** (Optimized)
```json
{
  "framework": "nextjs",
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

### **package.json** (Updated)
```json
{
  "name": "sapphire-modbot",
  "version": "1.0.0",
  "scripts": {
    "build": "next build",
    "vercel-build": "next build"
  }
}
```

## 🚨 Troubleshooting

### **Dashboard Shows "Pi Offline"**

1. **Check Pi Status**:
```bash
# On your Pi
sudo systemctl status sapphire-bot sapphire-api
```

2. **Test Pi API Directly**:
```bash
curl http://YOUR_PI_IP:3001/health
```

3. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Functions → View Logs
   - Look for connection errors

### **Build Failures**

1. **Check Build Logs**:
   - Vercel Dashboard → Deployments → View Build Logs

2. **Common Issues**:
   - Missing environment variables
   - Node.js version mismatch
   - Dependency conflicts

3. **Fix**:
```bash
# Locally test build
npm run build
```

### **Authentication Issues**

1. **Discord OAuth**:
   - Verify redirect URI matches exactly
   - Check client ID/secret are correct
   - Ensure bot has proper scopes

2. **NextAuth**:
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain

## 📊 Performance Monitoring

### **Vercel Analytics**
- Enable in Vercel Dashboard → Analytics
- Monitor function execution times
- Track error rates

### **Pi Monitoring**
```bash
# Check Pi resources
htop

# Monitor bot logs
sudo journalctl -u sapphire-bot -f

# Check API logs
sudo journalctl -u sapphire-api -f
```

## 🔄 Updates

### **Auto-Deploy**
Vercel automatically deploys when you push to your repository:

```bash
git add .
git commit -m "Update dashboard"
git push origin main
```

### **Manual Redeploy**
```bash
vercel --prod
```

## 🎯 Success Checklist

Your deployment is successful when:

- ✅ Health endpoint returns "healthy" status
- ✅ Deployment status shows Pi connection
- ✅ Dashboard loads without errors
- ✅ Discord login works
- ✅ Live data appears from Pi
- ✅ All tabs (Overview, Music, Verification) work
- ✅ No console errors in browser

## 🔐 Security Best Practices

1. **Environment Variables**:
   - Never commit secrets to git
   - Use strong, unique tokens
   - Rotate secrets regularly

2. **Network Security**:
   - Use HTTPS for all connections
   - Configure Pi firewall properly
   - Monitor access logs

3. **Discord Security**:
   - Use minimal required scopes
   - Regularly review OAuth applications
   - Monitor bot permissions

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Test Pi connectivity independently
4. Check Vercel function logs for errors
5. Ensure Discord OAuth is configured properly

## 🎉 You're Done!

Your Sapphire Modbot dashboard is now deployed on Vercel with:
- ✅ Modern, responsive UI
- ✅ Real-time Pi integration
- ✅ Secure authentication
- ✅ Performance optimization
- ✅ Comprehensive monitoring

Enjoy your professional Discord bot dashboard! 🚀
