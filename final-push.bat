@echo off
echo Removing token files and pushing clean code...

git reset --soft HEAD~2
git restore --staged .
del /f update-env.bat
del /f update-token.ps1
git add .gitignore
git add src/
git add test-token.js
git add AUTOMOD-QUICKSTART.md
git add AUTOMOD-FEATURES.md
git add DISCORD-SDK-FEATURES.md
git add SDK-QUICKSTART.md
git add WICK-COMPARISON.md
git add push-all-features.bat
git add fix-and-push.bat
git commit -m "Add Wick-level automod and Discord SDK features (clean)"
git push origin main --force

echo.
echo ✅ Done! Code pushed without tokens.
echo.
pause
