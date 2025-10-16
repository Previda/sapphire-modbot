@echo off
echo Updating Vercel environment variable...
echo.

echo Removing old PI_BOT_API_URL...
vercel env rm PI_BOT_API_URL production

echo.
echo Adding new PI_BOT_API_URL...
echo When prompted, enter: https://7685ece9559e.ngrok-free.app
vercel env add PI_BOT_API_URL production

echo.
echo Deploying to production...
vercel --prod

echo.
echo Done! Your dashboard should now connect to your Pi bot.
pause
