# Manual Deployment Guide for Skyfall Modbot Dashboard

Since the automated deployment encountered an error, here are manual deployment instructions for multiple platforms.

## Option 1: Vercel Deployment (Recommended)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Project Root
```bash
# Navigate to project directory
cd C:\Users\Mikhail\CascadeProjects\skyfall-modbot

# Deploy to Vercel
vercel

# Follow the prompts:
# ? Set up and deploy? Yes
# ? Which scope? Your personal account
# ? Link to existing project? No
# ? What's your project's name? skyfall-modbot-dashboard
# ? In which directory is your code located? ./
```

### 4. Configure Environment Variables in Vercel Dashboard

Go to your Vercel project dashboard and add these environment variables:

**Essential Variables:**
```env
DISCORD_CLIENT_ID=1358527215020544222
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_REDIRECT_URI=https://your-vercel-url.vercel.app/auth/callback
NEXT_PUBLIC_DISCORD_CLIENT_ID=1358527215020544222
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-vercel-url.vercel.app
PI_BOT_API_URL=http://192.168.1.62:3001
PI_BOT_TOKEN=your_pi_bot_token
DISCORD_ERROR_WEBHOOK_URL=your_error_webhook_url
```

## Option 2: Netlify Deployment

### 1. Install Netlify CLI
```bash
npm install -g netlify-cli
```

### 2. Login and Deploy
```bash
netlify login
netlify init
netlify deploy --build --prod
```

### 3. Configure Environment Variables
In your Netlify dashboard, add the same environment variables as listed above.

## Option 3: Manual Git Deployment

### 1. Push to GitHub (if not already done)
```bash
git add .
git commit -m "Added bot fixes and API integrations"
git push origin main
```

### 2. Connect to Vercel/Netlify via GitHub
- Go to Vercel or Netlify dashboard
- Import project from GitHub
- Select your repository
- Configure build settings:
  - Framework: Next.js
  - Build Command: `npm run build`
  - Output Directory: `.next`

## Post-Deployment Steps

### 1. Update Discord OAuth Settings
In Discord Developer Portal:
- Go to OAuth2 settings
- Update redirect URI to: `https://your-deployed-url/auth/callback`

### 2. Test Dashboard Functionality
- Visit your deployed dashboard
- Test Discord login
- Verify server data loads
- Test moderation actions
- Check ticket management

### 3. Update Pi Bot Configuration
Update your Pi's `.env` file with:
```env
DASHBOARD_URL=https://your-deployed-url
```

## Build Configuration Files

### vercel.json (if needed)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "DISCORD_CLIENT_ID": "1358527215020544222"
  }
}
```

### netlify.toml (if using Netlify)
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/api/:splat"
  status = 200
```

## Troubleshooting

### Build Errors
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for syntax errors
npm run build
```

### Environment Variable Issues
- Ensure all variables are set in deployment platform
- Double-check variable names (no typos)
- Restart deployment after adding variables

### OAuth Redirect Issues
- Verify redirect URI matches exactly in Discord Developer Portal
- Ensure HTTPS is used for production
- Check NEXTAUTH_URL matches deployment URL

## Quick Deploy Commands

**For Vercel:**
```bash
vercel --prod
```

**For Netlify:**
```bash
netlify deploy --prod --dir=.next
```

**Environment Check:**
```bash
# Test API endpoints locally first
npm run dev

# Check if API routes work
curl http://localhost:3000/api/health
```
