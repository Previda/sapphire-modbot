# Quick deployment script for Sapphire Modbot
# Sets up environment and deploys commands

Write-Host "🚀 Sapphire Modbot Quick Deploy" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️ No .env file found. Please create one with your bot token." -ForegroundColor Yellow
    Write-Host "Run: node setup-env.js" -ForegroundColor Green
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}

# Deploy commands
Write-Host "🎯 Deploying Discord commands..." -ForegroundColor Blue
node deploy-all-commands.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Command deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Bot is ready! Run 'npm run bot' to start." -ForegroundColor Green
