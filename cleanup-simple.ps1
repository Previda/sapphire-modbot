# Simple Cleanup Script
Write-Host "Cleaning up clutter files..." -ForegroundColor Cyan

$filesToDelete = @(
    "deploy-all-fixes.sh", "deploy-commands-clean.js", "deploy-commands-final.js",
    "deploy-commands-simple.js", "deploy-pi.sh", "deploy-real-data-fix.sh",
    "deploy-skyfall-complete.sh", "deploy-skyfall-vercel.sh", "deploy-to-pi.ps1",
    "deploy-to-pi.sh", "deploy-vercel-complete.sh", "deploy-vercel-windows.ps1",
    "deploy-vercel.bat", "deploy-vercel.sh", "deploy-windows.bat", "deploy.sh",
    "quick-deploy.ps1", "quick-deploy.sh", "quick-pi-deploy.bat",
    "final-complete-fix.js", "final-fix-all.js", "fix-all-command-errors.js",
    "fix-all-issues.js", "fix-all-permissions-and-deployment.js", "fix-and-run.sh",
    "fix-bot.js", "fix-command-permissions.js", "fix-hydration-error.js",
    "fix-pi-bot-api-server.sh", "fix-pi-bot-now.sh", "fix-pi-deployment-final.sh",
    "fix-ports-final.sh", "fix-ports.sh", "fix-react-error-130.js",
    "fix-real-data-connection.js", "fix-seamless-integration.js", "fix-syntax-errors.js",
    "fix-ticket-system.js", "fix-vercel-deploy.sh", "fix-website-and-commands.js",
    "pi-complete-installer.sh", "pi-factory-installer.sh", "pi-setup.sh",
    "setup-auto-update.sh", "setup-complete.bat", "setup-env.js",
    "setup-environment.js", "setup-oauth.bat", "start-pi-server.sh",
    "start-pi.sh", "update-all.sh", "update-pi.sh", "update-skyfall.sh",
    "update-vercel.bat", "update-vercel-pi-integration.js",
    "API_SETUP.md", "COMMANDS.md", "COMPLETE-PI-DEPLOYMENT.md",
    "COMPLETE_SYSTEM_SUMMARY.md", "DEPLOY-COMMANDS.md", "DEPLOY-TO-VERCEL.md",
    "DEPLOYMENT.md", "DEPLOYMENT_MANUAL.md", "DEPLOYMENT_READY.md",
    "DISCORD_OAUTH_SETUP.md", "FIX_GUIDE.md", "GITHUB_READY.md",
    "PI2-OPTIMIZATION.md", "PI_DEPLOYMENT_COMPLETE.md", "RASPBERRY_PI_DEPLOYMENT.md",
    "README-DEPLOYMENT.md", "UI_DESIGN_PROMPT.md", "VERCEL-SETUP.md",
    "pi-setup.md", "start-pi-bot.md", "vercel-env-template.md",
    "dashboard.html", "index.html", "login.html", "server-settings.html",
    "api-server.js", "check-skyfall-status.js", "enhanced-pi-bot.js",
    "lightweight-config.js", "pi-api-server.js", "pi-bot-complete.js",
    "pi-bot-status-endpoint.js", "rebrand-to-skyfall.js", "register-all-commands.js",
    "register-commands-clean.js", "register-commands.js", "restart-bot.js",
    "start.js", "test-api.js", "verification.js",
    "check-bot.bat", "check-pi-bot.sh", "pi-bot-startup.sh", "restart-skyfall.sh",
    "force-deploy-fix.txt", "force-deploy.txt", "pi-deploy-commands.txt",
    ".env.local", ".env.template", ".env.vercel.template", "env.example"
)

$foldersToDelete = @("api", "auth", "bot-commands", "bot-main", "dashboard", "pi-bot")

$deletedCount = 0

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Deleted: $file" -ForegroundColor Green
        $deletedCount++
    }
}

foreach ($folder in $foldersToDelete) {
    if (Test-Path $folder) {
        Remove-Item $folder -Recurse -Force
        Write-Host "Deleted folder: $folder" -ForegroundColor Green
        $deletedCount++
    }
}

Write-Host "`nCleanup complete! Deleted $deletedCount items" -ForegroundColor Cyan
Write-Host "`nKept essential files:" -ForegroundColor Yellow
Write-Host "  - src/ (bot code)"
Write-Host "  - pages/ (dashboard)"
Write-Host "  - components/ (UI)"
Write-Host "  - README.md"
Write-Host "  - WALKTHROUGH.md"
Write-Host "  - package.json"
