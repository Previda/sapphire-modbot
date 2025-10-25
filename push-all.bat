@echo off
cd /d "%~dp0"
git add .
git commit -m "Added command registration script and all updates"
git push origin main
echo.
echo ========================================
echo    Pushed to GitHub!
echo ========================================
echo.
pause
