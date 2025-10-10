@echo off
echo 🌐 SKYFALL - Windows Vercel Deployment
echo ====================================

echo 📦 Checking Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

echo 🔐 Checking authentication...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo Please login to Vercel...
    vercel login
)

echo 🚀 Deploying to production...
vercel --prod --yes

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo 🌐 Your Skyfall dashboard is now live
echo 🔗 Check: https://skyfall-omega.vercel.app

pause
