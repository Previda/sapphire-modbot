@echo off
echo Pushing all new features to GitHub...
echo.

git add -A
git commit -m "Add Wick-level automod, Discord SDK, Activities, Polls, Giveaways, and token validator"
git push origin main

echo.
echo ✅ Code pushed to GitHub!
echo.
echo Next: Update your Raspberry Pi
echo   1. SSH to Pi: ssh admin@Sky
echo   2. cd ~/sapphire-modbot
echo   3. git pull origin main
echo   4. node setup-bot.js (paste your token)
echo   5. pm2 restart skyfall-bot
echo.
pause
