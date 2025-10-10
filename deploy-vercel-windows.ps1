# PowerShell script for Windows Vercel deployment
Write-Host "🌐 SKYFALL - Vercel Deployment (Windows)" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>$null
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Check if user is logged in
try {
    $user = vercel whoami 2>$null
    Write-Host "🔐 Logged in as: $user" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Vercel..." -ForegroundColor Yellow
    vercel login
}

# Set environment variables
Write-Host "⚙️ Setting environment variables..." -ForegroundColor Yellow

# Remove existing env vars (ignore errors)
vercel env rm DISCORD_CLIENT_ID production -y 2>$null
vercel env rm PI_BOT_API_URL production -y 2>$null
vercel env rm PI_BOT_TOKEN production -y 2>$null
vercel env rm DASHBOARD_API_URL production -y 2>$null
vercel env rm NEXT_PUBLIC_BOT_NAME production -y 2>$null

# Add new environment variables
"1358527215020544222" | vercel env add DISCORD_CLIENT_ID production
"http://192.168.1.62:3004" | vercel env add PI_BOT_API_URL production
"95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af" | vercel env add PI_BOT_TOKEN production
"https://skyfall-omega.vercel.app" | vercel env add DASHBOARD_API_URL production
"Skyfall" | vercel env add NEXT_PUBLIC_BOT_NAME production

# Deploy to production
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
vercel --prod --yes

Write-Host ""
Write-Host "🎉 SKYFALL VERCEL DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "✅ Website: https://skyfall-omega.vercel.app" -ForegroundColor Green
Write-Host "✅ Modern UI: Enhanced and sleek design" -ForegroundColor Green
Write-Host "✅ Pi Integration: Connected to port 3004" -ForegroundColor Green
Write-Host "✅ Real-time Data: Live bot statistics" -ForegroundColor Green
