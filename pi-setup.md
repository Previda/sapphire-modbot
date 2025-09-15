# Raspberry Pi Setup Instructions

## Connection Details
- **IP Address:** 192.168.1.62
- **Username:** admin
- **Password:** Nolook233!

## SSH Connection
```bash
ssh admin@192.168.1.62
```

## Step 1: Update System
```bash
sudo apt update && sudo apt upgrade -y
```

## Step 2: Install Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Step 3: Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

## Step 4: Clone/Update Bot Repository
```bash
cd /home/admin
git clone https://github.com/your-username/sapphire-modbot.git
# OR if already exists:
# cd sapphire-modbot && git pull origin main
```

## Step 5: Install Dependencies
```bash
cd sapphire-modbot
npm install
```

## Step 6: Setup Environment Variables
Create `.env` file with:
```bash
nano .env
```

Copy this content:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
PI_BOT_TOKEN=secure_api_token_here
PI_BOT_API_URL=http://192.168.1.62:3001
MAX_MEMORY=512
LOG_LEVEL=info
NODE_ENV=production
```

## Step 7: Deploy Commands
```bash
node deploy-all-commands.js
```

## Step 8: Start Bot and API Server
```bash
# Start the bot
pm2 start src/index.js --name sapphire-bot --max-memory-restart 512M

# Start the API server
pm2 start api-server.js --name sapphire-api --max-memory-restart 256M

# Save PM2 configuration
pm2 save
pm2 startup
```

## Step 9: Configure Firewall (if needed)
```bash
sudo ufw allow 3001/tcp
sudo ufw reload
```

## Monitoring Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs sapphire-bot
pm2 logs sapphire-api

# Restart services
pm2 restart sapphire-bot
pm2 restart sapphire-api
```

## Step 10: Test API Connection
```bash
curl http://192.168.1.62:3001/health
```

## Vercel Environment Variables
Set these in your Vercel dashboard:
- `PI_BOT_API_URL=http://192.168.1.62:3001`
- `PI_BOT_TOKEN=secure_api_token_here`
