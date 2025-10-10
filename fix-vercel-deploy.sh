#!/bin/bash

echo "🌐 SKYFALL - Vercel Deployment Fix"
echo "================================="

# Install Vercel CLI if needed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy with fixed configuration
echo "🚀 Deploying to Vercel..."
vercel --prod --yes

echo ""
echo "✅ Vercel deployment complete!"
echo "🌐 Website: https://skyfall-omega.vercel.app"
