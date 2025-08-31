# Dashboard Deployment Guide

## 🚀 Option 1: Same Repo + Vercel (Recommended)

### Quick Setup:
1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your existing `sapphire-modbot` repository
   - Select "Other" framework preset

2. **Environment Variables:**
   ```env
   DISCORD_TOKEN=your_token_here
   CLIENT_ID=your_client_id
   DASHBOARD_SECRET=your_secret_key
   ```

3. **Build Settings:**
   - Build Command: `npm run build` (optional)
   - Output Directory: `public`
   - Install Command: `npm install`

4. **Domain:**
   - Auto-generated: `sapphire-modbot-xxx.vercel.app`
   - Custom domain: `dashboard.yourdomain.com`

### File Structure:
```
sapphire-modbot/
├── public/           # Frontend (deployed to Vercel)
│   ├── dashboard.html
│   ├── modern-styles.css
│   └── modern-dashboard.js
├── src/             # Bot code (runs on Pi)
├── vercel.json      # Vercel config
└── package.json
```

---

## 🔄 Option 2: Separate Repository

### Setup New Repo:
```bash
# Create new repository
gh repo create sapphire-dashboard --public

# Clone and setup
git clone https://github.com/Previda/sapphire-dashboard.git
cd sapphire-dashboard

# Copy dashboard files
cp -r ../sapphire-modbot/public/* .
```

### Sync Strategy:
- **GitHub Actions** to sync files between repos
- **Git submodules** to link repositories
- **Manual sync** when updating dashboard

---

## 🌐 Deployment URLs

### Vercel Deployment:
- **Frontend:** `https://sapphire-modbot.vercel.app`
- **API Endpoints:** `https://sapphire-modbot.vercel.app/api/*`

### Pi Backend:
- **Bot API:** `http://192.168.1.62:3000`
- **Local Dashboard:** `http://192.168.1.62:3000`

---

## 🔧 Configuration

### Vercel.json Features:
- Static file serving for dashboard
- API route proxying
- Environment variable management
- Automatic deployments on git push

### Benefits:
✅ **Same Repo:** Easier management, single source of truth
✅ **Auto Deploy:** Push to git = instant deployment
✅ **Custom Domain:** Professional dashboard URL
✅ **SSL/CDN:** Fast, secure delivery worldwide
✅ **Analytics:** Built-in performance monitoring
