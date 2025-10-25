# Git Push Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Pushing to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
Set-Location $PSScriptRoot

# Commit changes
Write-Host "[1/2] Committing changes..." -ForegroundColor Yellow
git commit -m "Major Update: Advanced Verification, Fixed Appeals, Polished UI"

# Push to GitHub
Write-Host "[2/2] Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✅ Push Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next: SSH to Pi and run:" -ForegroundColor Cyan
Write-Host "  cd ~/sapphire-modbot" -ForegroundColor White
Write-Host "  git pull" -ForegroundColor White
Write-Host "  pm2 restart skyfall-bot" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to close"
