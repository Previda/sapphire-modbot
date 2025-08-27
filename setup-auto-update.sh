#!/bin/bash

# Sapphire Bot - Auto Update Setup Script for Skyfall
echo "🚀 Setting up auto-update for Sapphire Bot on Skyfall..."

# Create auto-update cron job
echo "⏰ Setting up daily auto-update at 2 AM..."

# Add cron job for daily updates
(crontab -l 2>/dev/null; echo "0 2 * * * cd /home/admin/sapphire-bot && bash scripts/pi-auto-update.sh update >> /var/log/sapphire-auto-update.log 2>&1") | crontab -

# Add weekly restart cron job (Sundays at 3 AM)
(crontab -l 2>/dev/null; echo "0 3 * * 0 cd /home/admin/sapphire-bot && pm2 restart sapphire-bot") | crontab -

# Create log rotation
echo "📜 Setting up log rotation..."
sudo tee /etc/logrotate.d/sapphire-bot > /dev/null <<EOF
/var/log/sapphire-auto-update.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 $USER $USER
}
EOF

echo ""
echo "✅ Auto-update setup complete!"
echo ""
echo "📋 Schedule Summary:"
echo "  🔄 Daily updates: 2:00 AM"
echo "  🔄 Weekly restart: Sunday 3:00 AM"
echo "  📄 Logs: /var/log/sapphire-auto-update.log"
echo ""
echo "🔧 Manual Commands:"
echo "  crontab -l           - View scheduled jobs"
echo "  crontab -e           - Edit scheduled jobs"
echo "  tail -f /var/log/sapphire-auto-update.log - Watch update logs"
echo ""
echo "🎯 Your bot will now auto-update daily from GitHub!"
