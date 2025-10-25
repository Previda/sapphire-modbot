@echo off
echo ========================================
echo    Complete System Rebuild Deployment
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Cleaning up and re-registering commands...
node cleanup-and-register.js
if errorlevel 1 (
    echo.
    echo ❌ Command registration failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Committing to Git...
git add .
git commit -m "Complete rebuild: Unified verify and ticket systems with full customization"

echo.
echo [3/4] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo    ✅ Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. SSH to your Pi
echo 2. Run: cd ~/sapphire-modbot
echo 3. Run: git pull origin main
echo 4. Run: pm2 restart skyfall-bot
echo.
echo Then in Discord:
echo   /verify setup
echo   /ticket setup
echo.
pause
