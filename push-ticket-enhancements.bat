@echo off
echo Pushing ticket system enhancements...
git add src/index.js src/commands/admin/ticket-manage.js
git commit -m "Add ticket buttons and management menu - close, claim, pause, resume, save, priority"
git push origin main
echo.
echo ✅ Enhancements pushed!
echo.
echo On your Pi, run:
echo   cd ~/sapphire-modbot
echo   bash update-pi.sh
echo.
pause
