@echo off
echo ========================================
echo Discord OAuth Setup for Skyfall
echo ========================================
echo.

echo Step 1: Get your Discord Client Secret
echo ----------------------------------------
echo 1. Go to: https://discord.com/developers/applications
echo 2. Select your application (Skyfall)
echo 3. Click OAuth2 in sidebar
echo 4. Copy your CLIENT SECRET
echo.
echo Press any key when you have your Client Secret...
pause >nul

echo.
echo Step 2: Add Redirect URLs
echo ----------------------------------------
echo Make sure these URLs are added in Discord Developer Portal:
echo - https://skyfall-omega.vercel.app/api/auth/callback
echo - http://localhost:3000/api/auth/callback
echo.
echo Press any key when you've added the redirect URLs...
pause >nul

echo.
echo Step 3: Add Environment Variables to Vercel
echo ----------------------------------------
echo.

echo Adding DISCORD_CLIENT_SECRET...
vercel env add DISCORD_CLIENT_SECRET production

echo.
echo Adding NEXTAUTH_SECRET...
echo skyfall-discord-oauth-secret-2024 | vercel env add NEXTAUTH_SECRET production

echo.
echo Adding NEXTAUTH_URL...
echo https://skyfall-omega.vercel.app | vercel env add NEXTAUTH_URL production

echo.
echo Step 4: Deploy to Production
echo ----------------------------------------
vercel --prod

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your dashboard is now ready with Discord OAuth!
echo Go to: https://skyfall-omega.vercel.app
echo Click "Login with Discord" to authenticate
echo.
pause
