# Vercel Environment Variables Template

Set these environment variables in your Vercel dashboard:

## Required Variables:

```env
# Pi Bot Connection
PI_BOT_API_URL=http://192.168.1.62:3001
PI_BOT_TOKEN=3a0320a8f805012c76dc296aec05a156c571fa1f8cf982c4c641bd5b1aa543b3

# Discord OAuth (for dashboard login)
NEXT_PUBLIC_DISCORD_CLIENT_ID=1358527215020544222
DISCORD_CLIENT_SECRET=your_discord_oauth_secret_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=https://your-vercel-app.vercel.app

# Optional: Discord Webhook for Errors
DISCORD_ERROR_WEBHOOK_URL=https://discord.com/api/webhooks/1410415067777994833/uyj_nUzO4awKMqGxx8ToeSwlaCHiyYDayxN7ZSPqB31yQeUYQCRWmXd6_GXLS8KxiqQy
```

## How to Set in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable above
5. Redeploy your project

## Generate Secrets:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate DISCORD_CLIENT_SECRET
# Get from Discord Developer Portal → OAuth2 → Client Secret
```
