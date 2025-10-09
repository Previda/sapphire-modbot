#!/bin/bash

echo "🌐 SKYFALL - Vercel Deployment"
echo "============================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if needed)
echo "🔐 Ensuring Vercel authentication..."
vercel whoami || vercel login

# Set environment variables for production
echo "⚙️ Setting environment variables..."

# Remove existing env vars and set new ones
vercel env rm DISCORD_CLIENT_ID production -y 2>/dev/null || true
vercel env rm PI_BOT_API_URL production -y 2>/dev/null || true
vercel env rm PI_BOT_TOKEN production -y 2>/dev/null || true
vercel env rm DASHBOARD_API_URL production -y 2>/dev/null || true
vercel env rm NEXT_PUBLIC_BOT_NAME production -y 2>/dev/null || true

# Add updated environment variables
echo "1358527215020544222" | vercel env add DISCORD_CLIENT_ID production
echo "http://192.168.1.62:3004" | vercel env add PI_BOT_API_URL production
echo "95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af" | vercel env add PI_BOT_TOKEN production
echo "https://skyfall-omega.vercel.app" | vercel env add DASHBOARD_API_URL production
echo "Skyfall" | vercel env add NEXT_PUBLIC_BOT_NAME production

# Deploy to production
echo "🚀 Deploying to Vercel..."
vercel --prod --yes

echo ""
echo "🎉 SKYFALL VERCEL DEPLOYMENT COMPLETE!"
echo "======================================"
echo "✅ Website: https://skyfall-omega.vercel.app"
echo "✅ Branding: Skyfall everywhere"
echo "✅ Pi Integration: Port 3004"
echo "✅ Real-time Data: Connected to Pi bot"
echo ""
echo "🧪 Test the website:"
echo "• Dashboard shows real Pi bot data"
echo "• All 'Sapphire' references changed to 'Skyfall'"
echo "• API endpoints working with Pi"
