@echo off
echo ========================================
echo COMPLETE SKYFALL SETUP
echo ========================================
echo.

echo Step 1: Adding Discord Client Secret...
echo ZibWF0HAyT_a9MNC9UQILasp5S6LcW0 | vercel env add DISCORD_CLIENT_SECRET production

echo.
echo Step 2: Adding NextAuth Secret...
echo skyfall-nextauth-secret-2024 | vercel env add NEXTAUTH_SECRET production

echo.
echo Step 3: Adding NextAuth URL...
echo https://skyfall-omega.vercel.app | vercel env add NEXTAUTH_URL production

echo.
echo Step 4: Deploying to production...
vercel --prod

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Go to Discord Developer Portal
echo 2. Add redirect URL: https://skyfall-omega.vercel.app/api/auth/callback-discord
echo 3. Go to your dashboard and login!
echo.
pause
