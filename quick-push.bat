@echo off
cd /d "%~dp0"
git add .
git commit -m "Fixed ticket blacklist and added Roblox verification system"
git push origin main
echo.
echo ========================================
echo    Pushed to GitHub!
echo ========================================
echo.
echo Next: SSH to Pi and run:
echo   cd ~/sapphire-modbot
echo   ./pi-fix-all.sh
echo.
pause
