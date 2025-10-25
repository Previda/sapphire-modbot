@echo off
echo ========================================
echo    Simple Deployment
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Committing changes...
git add .
git commit -m "Complete rebuild: Unified verify and ticket systems"

echo.
echo [2/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo    ✅ Pushed to GitHub!
echo ========================================
echo.
echo Next: SSH to Pi and run:
echo   cd ~/sapphire-modbot
echo   git pull origin main
echo   pm2 restart skyfall-bot
echo.
echo Then in Discord run:
echo   /verify setup
echo   /ticket setup
echo.
pause
