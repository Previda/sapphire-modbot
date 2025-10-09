#!/bin/bash

echo "🌐 Deploying Skyfall to Vercel with Pi Integration"
echo "================================================"

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Set environment variables
echo "⚙️ Setting Vercel environment variables..."

vercel env add DISCORD_CLIENT_ID production <<< "1358527215020544222"
vercel env add PI_BOT_API_URL production <<< "http://192.168.1.62:3004"
vercel env add PI_BOT_TOKEN production <<< "95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af"
vercel env add DASHBOARD_API_URL production <<< "https://skyfall-omega.vercel.app"
vercel env add NEXT_PUBLIC_BOT_NAME production <<< "Skyfall"

echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your Skyfall dashboard is now live with Pi integration"
echo "🔗 URL: https://skyfall-omega.vercel.app"
echo "🤖 Bot API: http://192.168.1.62:3004"
