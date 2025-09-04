# Raspberry Pi Bot Deployment Guide

This guide will help you update and deploy the latest Sapphire Modbot fixes to your Raspberry Pi.

## Prerequisites

- SSH access to your Raspberry Pi
- Git installed on your Pi
- Node.js and npm/pm2 installed
- Bot currently running on Pi (IP: 192.168.1.62)

## Step 1: Connect to Your Raspberry Pi

```bash
# SSH into your Raspberry Pi (replace with your actual Pi credentials)
ssh pi@192.168.1.62

# Or if using a different username
ssh your_username@192.168.1.62
```

## Step 2: Navigate to Bot Directory

```bash
# Navigate to your bot directory (adjust path as needed)
cd /home/pi/sapphire-modbot

# Or wherever you have the bot installed
cd ~/sapphire-modbot
```

## Step 3: Stop the Current Bot Process

```bash
# Stop the bot using pm2 (if using pm2)
pm2 stop sapphire-bot

# Or if running with a different name
pm2 stop all

# Check pm2 status
pm2 status

# Alternative: If not using pm2, find and kill the process
# ps aux | grep node
# kill <process_id>
```

## Step 4: Update the Code

```bash
# Pull the latest changes from your repository
git pull origin main

# Or if you need to reset to match the latest code
git fetch origin
git reset --hard origin/main

# Install/update dependencies
npm install

# If you have package-lock issues
rm package-lock.json
npm install
```

## Step 5: Update Environment Variables

```bash
# Edit your environment file
nano .env

# Or copy from the template if needed
cp .env.example .env
nano .env
```

Ensure these environment variables are set correctly:

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# Dashboard Integration (IMPORTANT - Updated)
DASHBOARD_URL=https://skyfall-omega.vercel.app
PI_BOT_TOKEN=your_pi_bot_token_here

# Webhook for Error Reporting
DISCORD_ERROR_WEBHOOK_URL=your_webhook_url_here

# Database Configuration (if using)
DATABASE_URL=your_database_url_here

# Optional: Logging Channel
MOD_LOG_CHANNEL_ID=your_mod_log_channel_id_here
```

## Step 6: Test the Bot

```bash
# Test run the bot to check for errors
node src/index.js

# If there are no errors, stop with Ctrl+C
```

## Step 7: Restart with PM2

```bash
# Start the bot with pm2
pm2 start src/index.js --name "sapphire-bot"

# Or if you have a pm2 ecosystem file
pm2 start ecosystem.config.js

# Save pm2 configuration
pm2 save

# Set pm2 to start on boot
pm2 startup
# Follow the instructions provided by the startup command
```

## Step 8: Monitor the Bot

```bash
# Check pm2 status
pm2 status

# View bot logs
pm2 logs sapphire-bot

# View real-time logs
pm2 logs sapphire-bot --lines 50

# Monitor bot performance
pm2 monit
```

## Step 9: Verify Integration

1. **Test Dashboard Connection**: Check if the dashboard at https://skyfall-omega.vercel.app shows live data
2. **Test Commands**: Run a few Discord commands to ensure they're logged
3. **Check Error Reporting**: Intentionally cause a small error to test error logging
4. **Verify Tickets**: Test ticket creation and management

## Troubleshooting

### Bot Won't Start
```bash
# Check for syntax errors
node -c src/index.js

# Check dependencies
npm audit
npm update

# View detailed error logs
pm2 logs sapphire-bot --err
```

### Dashboard Connection Issues
```bash
# Test API connection
curl -X POST https://skyfall-omega.vercel.app/api/bot/commands/log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_pi_bot_token" \
  -d '{"command":"test","user":"test","guild":"test","timestamp":"2025-01-01T00:00:00Z"}'
```

### Permission Issues
```bash
# Fix file permissions
chmod +x src/index.js
chown -R pi:pi /home/pi/sapphire-modbot

# Or with your username
chown -R your_username:your_username ~/sapphire-modbot
```

## Key Updates in This Deployment

1. **Enhanced Error Logging**: Errors are now automatically reported to the dashboard
2. **Command Usage Tracking**: All command usage is logged for analytics
3. **Improved Ticket System**: Better integration with the web dashboard
4. **Dashboard Logger**: New utility for consistent logging across all commands
5. **Better Error Handling**: More robust error handling throughout the bot

## Quick Commands Reference

```bash
# Essential PM2 commands
pm2 restart sapphire-bot    # Restart the bot
pm2 stop sapphire-bot       # Stop the bot
pm2 delete sapphire-bot     # Delete the bot process
pm2 logs sapphire-bot       # View logs
pm2 flush sapphire-bot      # Clear logs

# Git commands for updates
git status                  # Check repository status
git pull origin main        # Pull latest changes
git log --oneline -5        # View recent commits

# System monitoring
htop                       # System resource monitor
df -h                      # Check disk space
free -h                    # Check memory usage
```

## Post-Deployment Checklist

- [ ] Bot is running and responding to commands
- [ ] Dashboard shows live server data
- [ ] Command usage is being logged
- [ ] Error reporting is working
- [ ] Ticket system is functional
- [ ] Moderation commands work properly
- [ ] Transcripts generate correctly

## Support

If you encounter issues:

1. Check the pm2 logs: `pm2 logs sapphire-bot`
2. Verify environment variables are set correctly
3. Ensure the Pi has internet connectivity
4. Check Discord bot permissions
5. Verify the dashboard URL is accessible

For persistent issues, check the error logs in the dashboard at https://skyfall-omega.vercel.app/dashboard
