# Cleanup Script - Remove Clutter Files
Write-Host "🧹 Cleaning up clutter files..." -ForegroundColor Cyan

$filesToDelete = @(
    # Old deployment scripts
    "deploy-all-fixes.sh", "deploy-commands-clean.js", "deploy-commands-final.js",
    "deploy-commands-simple.js", "deploy-pi.sh", "deploy-real-data-fix.sh",
    "deploy-skyfall-complete.sh", "deploy-skyfall-vercel.sh", "deploy-to-pi.ps1",
    "deploy-to-pi.sh", "deploy-vercel-complete.sh", "deploy-vercel-windows.ps1",
    "deploy-vercel.bat", "deploy-vercel.sh", "deploy-windows.bat", "deploy.sh",
    "quick-deploy.ps1", "quick-deploy.sh", "quick-pi-deploy.bat",
    
    # Old fix scripts
    "final-complete-fix.js", "final-fix-all.js", "fix-all-command-errors.js",
    "fix-all-issues.js", "fix-all-permissions-and-deployment.js", "fix-and-run.sh",
    "fix-bot.js", "fix-command-permissions.js", "fix-hydration-error.js",
    "fix-pi-bot-api-server.sh", "fix-pi-bot-now.sh", "fix-pi-deployment-final.sh",
    "fix-ports-final.sh", "fix-ports.sh", "fix-react-error-130.js",
    "fix-real-data-connection.js", "fix-seamless-integration.js", "fix-syntax-errors.js",
    "fix-ticket-system.js", "fix-vercel-deploy.sh", "fix-website-and-commands.js",
    
    # Old setup scripts
    "pi-complete-installer.sh", "pi-factory-installer.sh", "pi-setup.sh",
    "setup-auto-update.sh", "setup-complete.bat", "setup-env.js",
    "setup-environment.js", "setup-oauth.bat", "start-pi-server.sh",
    "start-pi.sh", "update-all.sh", "update-pi.sh", "update-skyfall.sh",
    "update-vercel.bat", "update-vercel-pi-integration.js",
    
    # Old documentation
    "API_SETUP.md", "COMMANDS.md", "COMPLETE-PI-DEPLOYMENT.md",
    "COMPLETE_SYSTEM_SUMMARY.md", "DEPLOY-COMMANDS.md", "DEPLOY-TO-VERCEL.md",
    "DEPLOYMENT.md", "DEPLOYMENT_MANUAL.md", "DEPLOYMENT_READY.md",
    "DISCORD_OAUTH_SETUP.md", "FIX_GUIDE.md", "GITHUB_READY.md",
    "PI2-OPTIMIZATION.md", "PI_DEPLOYMENT_COMPLETE.md", "RASPBERRY_PI_DEPLOYMENT.md",
    "README-DEPLOYMENT.md", "UI_DESIGN_PROMPT.md", "VERCEL-SETUP.md",
    "pi-setup.md", "start-pi-bot.md", "vercel-env-template.md",
    
    # Old HTML files
    "dashboard.html", "index.html", "login.html", "server-settings.html",
    
    # Old JS files
    "api-server.js", "check-skyfall-status.js", "enhanced-pi-bot.js",
    "lightweight-config.js", "pi-api-server.js", "pi-bot-complete.js",
    "pi-bot-status-endpoint.js", "rebrand-to-skyfall.js", "register-all-commands.js",
    "register-commands-clean.js", "register-commands.js", "restart-bot.js",
    "start.js", "test-api.js", "verification.js",
    
    # Old batch/shell files
    "check-bot.bat", "check-pi-bot.sh", "pi-bot-startup.sh", "restart-skyfall.sh",
    
    # Old text files
    "force-deploy-fix.txt", "force-deploy.txt", "pi-deploy-commands.txt",
    
    # Old env files
    ".env.local", ".env.template", ".env.vercel.template", "env.example",
    
    # Old folders
    "api", "auth", "bot-commands", "bot-main", "dashboard", "pi-bot"
)

$deletedCount = 0
$skippedCount = 0

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Recurse -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Green
            $deletedCount++
        } catch {
            Write-Host "⚠️  Could not delete: $file" -ForegroundColor Yellow
            $skippedCount++
        }
    } else {
        $skippedCount++
    }
}

Write-Host "`n📊 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "✅ Deleted: $deletedCount files" -ForegroundColor Green
Write-Host "⏭️  Skipped: $skippedCount files (already removed)" -ForegroundColor Yellow
Write-Host "`n🎉 Cleanup complete!" -ForegroundColor Green
Write-Host "`nKept essential files:" -ForegroundColor Cyan
Write-Host "  ✅ src/ (bot code)" -ForegroundColor White
Write-Host "  ✅ pages/ (dashboard)" -ForegroundColor White
Write-Host "  ✅ components/ (UI)" -ForegroundColor White
Write-Host "  ✅ README.md" -ForegroundColor White
Write-Host "  ✅ FINAL_SETUP_GUIDE.md" -ForegroundColor White
Write-Host "  ✅ COMPLETE_SOLUTION.md" -ForegroundColor White
Write-Host "  ✅ package.json" -ForegroundColor White
Write-Host "  ✅ .env files" -ForegroundColor White
