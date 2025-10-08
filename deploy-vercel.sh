#!/bin/bash

echo "🌐 Deploying to Vercel"
echo "====================="

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Build and deploy
echo "Building and deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "🌐 Your site should be available at: https://skyfall-omega.vercel.app"
