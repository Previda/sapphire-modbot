#!/bin/bash

# Real-time monitoring script for Raspberry Pi 2
# Shows bot performance and system resources

echo "🍓 Skyfall Bot - Raspberry Pi 2 Monitor"
echo "========================================"
echo ""

# Function to get CPU temperature (if available)
get_temp() {
    if [ -f /sys/class/thermal/thermal_zone0/temp ]; then
        temp=$(cat /sys/class/thermal/thermal_zone0/temp)
        echo "scale=1; $temp/1000" | bc
    else
        echo "N/A"
    fi
}

# Function to get bot memory usage
get_bot_memory() {
    pm2 jlist | jq -r '.[] | select(.name=="skyfall-bot") | .monit.memory' | numfmt --to=iec
}

# Function to get bot CPU usage
get_bot_cpu() {
    pm2 jlist | jq -r '.[] | select(.name=="skyfall-bot") | .monit.cpu'
}

# Function to get bot uptime
get_bot_uptime() {
    pm2 jlist | jq -r '.[] | select(.name=="skyfall-bot") | .pm2_env.pm_uptime' | xargs -I {} date -d @{} +%s | xargs -I {} echo $(( $(date +%s) - {} )) | awk '{printf "%dd %dh %dm", $1/86400, ($1%86400)/3600, ($1%3600)/60}'
}

# Function to get bot restart count
get_bot_restarts() {
    pm2 jlist | jq -r '.[] | select(.name=="skyfall-bot") | .pm2_env.restart_time'
}

# Continuous monitoring
while true; do
    clear
    echo "🍓 Skyfall Bot - Raspberry Pi 2 Monitor"
    echo "========================================"
    echo ""
    
    # System Info
    echo "📊 SYSTEM RESOURCES"
    echo "-------------------"
    echo "CPU Temp:    $(get_temp)°C"
    echo "CPU Usage:   $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
    echo "Memory:      $(free -h | awk '/^Mem:/ {printf "%s / %s (%.1f%%)", $3, $2, ($3/$2)*100}')"
    echo "Swap:        $(free -h | awk '/^Swap:/ {printf "%s / %s", $3, $2}')"
    echo "Disk (Home): $(df -h ~ | awk 'NR==2 {printf "%s / %s (%s used)", $3, $2, $5}')"
    echo ""
    
    # Bot Info
    echo "🤖 BOT STATUS"
    echo "-------------"
    
    if pm2 jlist | jq -e '.[] | select(.name=="skyfall-bot")' > /dev/null 2>&1; then
        STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="skyfall-bot") | .pm2_env.status')
        
        if [ "$STATUS" = "online" ]; then
            echo "Status:      ✅ Online"
        else
            echo "Status:      ❌ $STATUS"
        fi
        
        echo "Uptime:      $(get_bot_uptime)"
        echo "Memory:      $(get_bot_memory)"
        echo "CPU:         $(get_bot_cpu)%"
        echo "Restarts:    $(get_bot_restarts)"
        
        # Memory warning
        BOT_MEM_MB=$(pm2 jlist | jq -r '.[] | select(.name=="skyfall-bot") | .monit.memory' | awk '{print $1/1024/1024}')
        if (( $(echo "$BOT_MEM_MB > 350" | bc -l) )); then
            echo ""
            echo "⚠️  WARNING: High memory usage! Bot will restart at 400MB"
        fi
    else
        echo "Status:      ❌ Not running"
        echo ""
        echo "Start with: bash start-pi2.sh"
    fi
    
    echo ""
    echo "📈 PERFORMANCE TIPS"
    echo "-------------------"
    
    # Check if system is under stress
    LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | cut -d',' -f1)
    if (( $(echo "$LOAD > 3.0" | bc -l) )); then
        echo "⚠️  High system load ($LOAD)"
        echo "   Consider reducing background processes"
    fi
    
    # Check available memory
    AVAIL_MEM=$(free -m | awk '/^Mem:/ {print $7}')
    if [ "$AVAIL_MEM" -lt 100 ]; then
        echo "⚠️  Low available memory (${AVAIL_MEM}MB)"
        echo "   Bot may restart soon"
    fi
    
    # Check disk space
    DISK_USAGE=$(df -h ~ | awk 'NR==2 {print $5}' | cut -d'%' -f1)
    if [ "$DISK_USAGE" -gt 80 ]; then
        echo "⚠️  Low disk space (${DISK_USAGE}% used)"
        echo "   Clear logs: pm2 flush"
    fi
    
    echo ""
    echo "🔄 Refreshing in 5 seconds... (Ctrl+C to exit)"
    echo ""
    echo "Commands:"
    echo "  pm2 logs skyfall-bot    - View logs"
    echo "  pm2 restart skyfall-bot - Restart bot"
    echo "  pm2 monit              - PM2 monitor"
    
    sleep 5
done
