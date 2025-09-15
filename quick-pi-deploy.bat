@echo off
echo Deploying to Pi at 192.168.1.62...

echo Creating deployment package...
tar -czf sapphire-modbot.tar.gz --exclude=node_modules --exclude=.git --exclude=temp_deploy .

echo.
echo Copy this file to your Pi using WinSCP or another tool:
echo %CD%\sapphire-modbot.tar.gz
echo.
echo Then run these commands on the Pi:
echo.
echo ssh admin@192.168.1.62
echo cd /home/admin
echo tar -xzf sapphire-modbot.tar.gz
echo cd sapphire-modbot
echo.
echo # Create .env file
echo echo "DISCORD_TOKEN=YOUR_BOT_TOKEN" > .env
echo echo "CLIENT_ID=YOUR_CLIENT_ID" >> .env
echo echo "PI_BOT_TOKEN=sapphire-secure-2024" >> .env
echo echo "PI_BOT_API_URL=http://192.168.1.62:3001" >> .env
echo echo "NODE_ENV=production" >> .env
echo.
echo # Install and run
echo curl -fsSL https://deb.nodesource.com/setup_18.x ^| sudo -E bash -
echo sudo apt-get install -y nodejs
echo sudo npm install -g pm2
echo npm install
echo node deploy-all-commands.js
echo pm2 start src/index.js --name sapphire-bot
echo pm2 start api-server.js --name sapphire-api
echo pm2 save
echo sudo ufw allow 3001/tcp

pause
