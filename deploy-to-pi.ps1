# Sapphire Modbot Pi Deployment Script
param(
    [string]$PiIP = "192.168.1.62",
    [string]$PiUser = "admin",
    [string]$BotToken = "",
    [string]$ClientId = "",
    [string]$GuildId = "",
    [string]$PiBotToken = ""
)

Write-Host "Deploying Sapphire Modbot to Raspberry Pi..." -ForegroundColor Cyan

# Check if required parameters are provided
if (-not $BotToken) {
    $BotToken = Read-Host "Enter Discord Bot Token"
}
if (-not $ClientId) {
    $ClientId = Read-Host "Enter Discord Client ID"
}
if (-not $PiBotToken) {
    $PiBotToken = Read-Host "Enter Pi Bot API Token (generate a secure random string)"
}

# Create temporary deployment files
$tempDir = "temp_deploy"
New-Item -ItemType Directory -Force -Path $tempDir

# Create environment file
$envContent = @"
DISCORD_TOKEN=$BotToken
CLIENT_ID=$ClientId
GUILD_ID=$GuildId
PI_BOT_TOKEN=$PiBotToken
PI_BOT_API_URL=http://$PiIP:3001
MAX_MEMORY=512
LOG_LEVEL=info
NODE_ENV=production
API_PORT=3001
"@

$envContent | Out-File -FilePath "$tempDir/.env" -Encoding UTF8

# Create deployment script for Pi
$piDeployScript = @"
#!/bin/bash
set -e

echo "Setting up Sapphire Modbot on Pi..."

# Update system
sudo apt update -y

# Install Node.js 18
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Navigate to bot directory
cd /home/admin/sapphire-modbot

# Install dependencies
echo "Installing dependencies..."
npm install

# Deploy commands
echo "Deploying Discord commands..."
node deploy-all-commands.js

# Stop existing processes
pm2 delete sapphire-bot 2>/dev/null || true
pm2 delete sapphire-api 2>/dev/null || true

# Start bot and API server
echo "Starting bot and API server..."
pm2 start src/index.js --name sapphire-bot --max-memory-restart 512M
pm2 start api-server.js --name sapphire-api --max-memory-restart 256M

# Save PM2 configuration
pm2 save
pm2 startup | grep sudo | bash || true

# Configure firewall
sudo ufw allow 3001/tcp 2>/dev/null || true

echo "Deployment complete!"
echo "Check status with: pm2 status"
echo "View logs with: pm2 logs"
echo "API Health: http://$PiIP:3001/health"
"@

$piDeployScript | Out-File -FilePath "$tempDir/deploy.sh" -Encoding UTF8

Write-Host "📁 Copying files to Pi..." -ForegroundColor Yellow

# Use SCP to copy files
try {
    # Copy project files
    scp -r . "${PiUser}@${PiIP}:/home/admin/sapphire-modbot/"
    
    # Copy environment file
    scp "$tempDir/.env" "${PiUser}@${PiIP}:/home/admin/sapphire-modbot/.env"
    
    # Copy and run deployment script
    scp "$tempDir/deploy.sh" "${PiUser}@${PiIP}:/tmp/deploy.sh"
    
    Write-Host "🔧 Running deployment on Pi..." -ForegroundColor Yellow
    ssh "${PiUser}@${PiIP}" "chmod +x /tmp/deploy.sh && /tmp/deploy.sh"
    
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 API Server: http://$PiIP:3001" -ForegroundColor Cyan
    Write-Host "🔍 Health Check: http://$PiIP:3001/health" -ForegroundColor Cyan
    
    # Test API connection
    Write-Host "🧪 Testing API connection..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod "http://$PiIP:3001/health"
        Write-Host "✅ API is responding: $($response.status)" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ API connection test failed - check firewall/network" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    Write-Host "💡 Make sure you can SSH to the Pi: ssh $PiUser@$PiIP" -ForegroundColor Yellow
}

# Cleanup
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update Vercel environment variables:"
Write-Host "   PI_BOT_API_URL=http://$PiIP:3001"
Write-Host "   PI_BOT_TOKEN=$PiBotToken"
Write-Host "2. Deploy dashboard to Vercel"
Write-Host "3. Test the complete flow"
