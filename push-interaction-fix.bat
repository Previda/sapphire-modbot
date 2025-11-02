@echo off
echo Pushing interaction fixes...
git add src/index.js
git commit -m "Fix interaction failures - add button, select menu, and modal handlers"
git push origin main
echo.
echo ✅ Fixes pushed!
echo.
echo On your Pi, run:
echo   cd ~/sapphire-modbot
echo   git pull origin main
echo   pm2 restart skyfall-bot
echo   pm2 logs skyfall-bot
echo.
pause
