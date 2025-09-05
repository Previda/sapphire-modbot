@echo off
echo 🚀 Deploying Skyfall Modbot Dashboard to Vercel...
echo.

echo Step 1: Installing Vercel CLI (if needed)...
npm install -g vercel
echo.

echo Step 2: Login to Vercel (browser will open)...
vercel login
echo.

echo Step 3: Deploying to Vercel...
vercel --prod
echo.

echo ✅ Deployment complete!
echo 📋 Next steps:
echo 1. Add environment variables in Vercel dashboard
echo 2. Update Discord OAuth redirect URI
echo 3. Test dashboard functionality
echo.
pause
