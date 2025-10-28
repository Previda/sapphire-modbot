@echo off
git reset --soft HEAD~1
git restore --staged update-env.bat update-token.ps1
git add -A
git commit -m "Add Wick automod, Discord SDK, Activities without token files"
git push origin main
pause
