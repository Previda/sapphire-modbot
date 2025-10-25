@echo off
cd /d "%~dp0"
git commit -m "Advanced Verification System, Fixed Appeals, Polished UI"
git push origin main
echo.
echo ========================================
echo    Push Complete!
echo ========================================
echo.
echo Now run on Pi:
echo   cd ~/sapphire-modbot
echo   git pull origin main
echo   pm2 restart skyfall-bot
echo.
pause
