@echo off
git add src/index.js
git commit -m "CRITICAL FIX: Load dotenv before auth manager to fix token loading"
git push origin main
echo.
echo ✅ Bug fix pushed!
echo.
echo On your Pi, run:
echo   cd ~/sapphire-modbot
echo   git pull origin main
echo   pm2 restart skyfall-bot
echo   pm2 logs skyfall-bot
echo.
pause
