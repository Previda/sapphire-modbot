@echo off
cd /d "%~dp0"
git commit -m "Fix verification permissions and duplicate role creation"
git push origin main
echo.
echo ========================================
echo    Fix Pushed to GitHub!
echo ========================================
echo.
echo Now run on Pi:
echo   cd ~/sapphire-modbot
echo   git pull origin main
echo   pm2 restart skyfall-bot
echo.
echo Then fix role hierarchy:
echo   1. Server Settings - Roles
echo   2. Drag bot role ABOVE Verified role
echo   3. Test verification
echo.
pause
