#!/bin/bash

# Sapphire Bot - Raspberry Pi System Monitor
# Real-time monitoring and alerting for Pi deployment

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
BOT_DIR="/home/pi/sapphire-bot"
SERVICE_NAME="sapphire-bot"
LOG_FILE="/var/log/sapphire-monitor.log"
ALERT_THRESHOLD_CPU=85
ALERT_THRESHOLD_MEM=90
ALERT_THRESHOLD_DISK=85
TEMP_THRESHOLD=70

# Discord webhook for alerts (optional)
DISCORD_WEBHOOK=""

# Logging function
log_event() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Send Discord alert
send_alert() {
    local message="$1"
    local level="$2"
    
    log_event "ALERT [$level]: $message"
    
    if [ -n "$DISCORD_WEBHOOK" ]; then
        curl -H "Content-Type: application/json" \
             -X POST \
             -d "{\"content\": \"🚨 **Sapphire Bot Alert** [$level]\n\`\`\`$message\`\`\`\"}" \
             "$DISCORD_WEBHOOK" 2>/dev/null || true
    fi
}

# Get CPU usage
get_cpu_usage() {
    top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d'u' -f1
}

# Get memory usage
get_memory_usage() {
    free | grep Mem | awk '{printf "%.1f", ($3/$2)*100}'
}

# Get disk usage
get_disk_usage() {
    df /home | tail -1 | awk '{print $5}' | sed 's/%//'
}

# Get CPU temperature
get_cpu_temp() {
    if [ -f "/sys/class/thermal/thermal_zone0/temp" ]; then
        echo $(($(cat /sys/class/thermal/thermal_zone0/temp) / 1000))
    else
        echo "N/A"
    fi
}

# Check bot status
check_bot_status() {
    if pm2 list | grep -q "$SERVICE_NAME.*online"; then
        echo "online"
    elif pm2 list | grep -q "$SERVICE_NAME.*stopped"; then
        echo "stopped"
    elif pm2 list | grep -q "$SERVICE_NAME.*errored"; then
        echo "errored"
    else
        echo "not_found"
    fi
}

# Get bot memory usage
get_bot_memory() {
    local pid=$(pm2 jlist | jq -r ".[] | select(.name==\"$SERVICE_NAME\") | .pid" 2>/dev/null)
    if [ -n "$pid" ] && [ "$pid" != "null" ]; then
        ps -o pid,vsz,rss,pmem -p "$pid" | tail -n 1 | awk '{print $4}'
    else
        echo "0"
    fi
}

# Get bot uptime
get_bot_uptime() {
    pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$SERVICE_NAME\") | .pm2_env.pm_uptime" 2>/dev/null | head -1
}

# System health check
system_health_check() {
    local cpu_usage=$(get_cpu_usage)
    local mem_usage=$(get_memory_usage)
    local disk_usage=$(get_disk_usage)
    local cpu_temp=$(get_cpu_temp)
    local bot_status=$(check_bot_status)
    local bot_memory=$(get_bot_memory)
    
    # Check thresholds and send alerts
    if (( $(echo "$cpu_usage > $ALERT_THRESHOLD_CPU" | bc -l) )); then
        send_alert "High CPU usage detected: ${cpu_usage}%" "WARNING"
    fi
    
    if (( $(echo "$mem_usage > $ALERT_THRESHOLD_MEM" | bc -l) )); then
        send_alert "High memory usage detected: ${mem_usage}%" "WARNING"
    fi
    
    if [ "$disk_usage" -gt "$ALERT_THRESHOLD_DISK" ]; then
        send_alert "High disk usage detected: ${disk_usage}%" "WARNING"
    fi
    
    if [ "$cpu_temp" != "N/A" ] && [ "$cpu_temp" -gt "$TEMP_THRESHOLD" ]; then
        send_alert "High CPU temperature detected: ${cpu_temp}°C" "CRITICAL"
    fi
    
    if [ "$bot_status" = "errored" ]; then
        send_alert "Bot service is in error state" "CRITICAL"
        # Auto-restart attempt
        log_event "Attempting auto-restart of bot service"
        pm2 restart $SERVICE_NAME
    elif [ "$bot_status" = "stopped" ]; then
        send_alert "Bot service is stopped" "CRITICAL"
        # Auto-start attempt
        log_event "Attempting auto-start of bot service"
        pm2 start $SERVICE_NAME
    elif [ "$bot_status" = "not_found" ]; then
        send_alert "Bot service not found in PM2" "CRITICAL"
    fi
}

# Display real-time dashboard
show_dashboard() {
    while true; do
        clear
        echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BLUE}║                  🤖 Sapphire Bot Monitor                       ║${NC}"
        echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        
        # System Stats
        local cpu_usage=$(get_cpu_usage)
        local mem_usage=$(get_memory_usage)
        local disk_usage=$(get_disk_usage)
        local cpu_temp=$(get_cpu_temp)
        local load_avg=$(uptime | awk -F'load average:' '{print $2}')
        
        echo -e "${CYAN}📊 SYSTEM STATS${NC}"
        echo -e "CPU Usage:    $(format_percentage $cpu_usage)%"
        echo -e "Memory Usage: $(format_percentage $mem_usage)%"
        echo -e "Disk Usage:   $(format_percentage $disk_usage)%"
        echo -e "CPU Temp:     $(format_temperature $cpu_temp)"
        echo -e "Load Average: $load_avg"
        echo ""
        
        # Bot Stats
        local bot_status=$(check_bot_status)
        local bot_memory=$(get_bot_memory)
        local bot_uptime=$(get_bot_uptime)
        
        echo -e "${CYAN}🤖 BOT STATS${NC}"
        echo -e "Status:       $(format_status $bot_status)"
        echo -e "Memory:       ${bot_memory}%"
        if [ -n "$bot_uptime" ] && [ "$bot_uptime" != "null" ]; then
            local uptime_formatted=$(format_uptime $bot_uptime)
            echo -e "Uptime:       $uptime_formatted"
        else
            echo -e "Uptime:       N/A"
        fi
        echo ""
        
        # Recent logs
        echo -e "${CYAN}📝 RECENT LOGS${NC}"
        if [ -f "$LOG_FILE" ]; then
            tail -5 "$LOG_FILE" | while read line; do
                echo -e "${YELLOW}$line${NC}"
            done
        else
            echo -e "${YELLOW}No logs available${NC}"
        fi
        echo ""
        
        echo -e "${BLUE}Press Ctrl+C to exit, 'h' for help${NC}"
        
        # Read input with timeout
        read -t 5 -n 1 input
        case $input in
            h|H)
                show_help
                ;;
            r|R)
                log_event "Manual restart requested from monitor"
                pm2 restart $SERVICE_NAME
                ;;
            l|L)
                pm2 logs $SERVICE_NAME --lines 20
                read -p "Press Enter to continue..."
                ;;
        esac
    done
}

# Format percentage with colors
format_percentage() {
    local value=$1
    if (( $(echo "$value > 85" | bc -l) )); then
        echo -e "${RED}$value${NC}"
    elif (( $(echo "$value > 70" | bc -l) )); then
        echo -e "${YELLOW}$value${NC}"
    else
        echo -e "${GREEN}$value${NC}"
    fi
}

# Format temperature with colors
format_temperature() {
    local temp=$1
    if [ "$temp" = "N/A" ]; then
        echo -e "${YELLOW}N/A${NC}"
    elif [ "$temp" -gt 70 ]; then
        echo -e "${RED}${temp}°C${NC}"
    elif [ "$temp" -gt 60 ]; then
        echo -e "${YELLOW}${temp}°C${NC}"
    else
        echo -e "${GREEN}${temp}°C${NC}"
    fi
}

# Format bot status with colors
format_status() {
    local status=$1
    case $status in
        online)
            echo -e "${GREEN}● Online${NC}"
            ;;
        stopped)
            echo -e "${RED}● Stopped${NC}"
            ;;
        errored)
            echo -e "${RED}● Error${NC}"
            ;;
        *)
            echo -e "${YELLOW}● Unknown${NC}"
            ;;
    esac
}

# Format uptime
format_uptime() {
    local uptime_ms=$1
    local uptime_sec=$((uptime_ms / 1000))
    local days=$((uptime_sec / 86400))
    local hours=$(((uptime_sec % 86400) / 3600))
    local minutes=$(((uptime_sec % 3600) / 60))
    
    if [ $days -gt 0 ]; then
        echo "${days}d ${hours}h ${minutes}m"
    elif [ $hours -gt 0 ]; then
        echo "${hours}h ${minutes}m"
    else
        echo "${minutes}m"
    fi
}

# Show help
show_help() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                     Monitor Help                               ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Keyboard Shortcuts:${NC}"
    echo -e "  h/H  - Show this help"
    echo -e "  r/R  - Restart bot service"
    echo -e "  l/L  - Show recent bot logs"
    echo -e "  Ctrl+C - Exit monitor"
    echo ""
    echo -e "${CYAN}Alert Thresholds:${NC}"
    echo -e "  CPU Usage:    > ${ALERT_THRESHOLD_CPU}%"
    echo -e "  Memory Usage: > ${ALERT_THRESHOLD_MEM}%"
    echo -e "  Disk Usage:   > ${ALERT_THRESHOLD_DISK}%"
    echo -e "  CPU Temp:     > ${TEMP_THRESHOLD}°C"
    echo ""
    read -p "Press Enter to continue..."
}

# Generate system report
generate_report() {
    local report_file="/tmp/sapphire-system-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "Sapphire Bot System Report"
        echo "Generated: $(date)"
        echo "=================================="
        echo ""
        
        echo "SYSTEM INFORMATION:"
        echo "Hostname: $(hostname)"
        echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
        echo "Kernel: $(uname -r)"
        echo "Architecture: $(uname -m)"
        echo ""
        
        echo "HARDWARE:"
        echo "CPU: $(cat /proc/cpuinfo | grep 'model name' | head -1 | cut -d':' -f2 | xargs)"
        echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
        echo "Temperature: $(get_cpu_temp)°C"
        echo ""
        
        echo "CURRENT USAGE:"
        echo "CPU Usage: $(get_cpu_usage)%"
        echo "Memory Usage: $(get_memory_usage)%"
        echo "Disk Usage: $(get_disk_usage)%"
        echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
        echo ""
        
        echo "BOT STATUS:"
        echo "Status: $(check_bot_status)"
        echo "Memory Usage: $(get_bot_memory)%"
        echo "PM2 Info:"
        pm2 info $SERVICE_NAME 2>/dev/null || echo "Service not found"
        echo ""
        
        echo "RECENT LOGS (last 20 lines):"
        if [ -f "$LOG_FILE" ]; then
            tail -20 "$LOG_FILE"
        else
            echo "No log file found"
        fi
        
    } > "$report_file"
    
    echo "Report generated: $report_file"
    return 0
}

# Main execution
main() {
    case "${1:-dashboard}" in
        "dashboard"|"monitor")
            show_dashboard
            ;;
        "check")
            system_health_check
            echo "Health check completed"
            ;;
        "report")
            generate_report
            ;;
        "status")
            echo "Bot Status: $(check_bot_status)"
            echo "CPU: $(get_cpu_usage)%"
            echo "Memory: $(get_memory_usage)%"
            echo "Disk: $(get_disk_usage)%"
            echo "Temperature: $(get_cpu_temp)°C"
            ;;
        *)
            echo "Usage: $0 {dashboard|check|report|status}"
            echo ""
            echo "Commands:"
            echo "  dashboard - Show real-time monitoring dashboard"
            echo "  check     - Run health check once"
            echo "  report    - Generate system report"
            echo "  status    - Show current status"
            exit 1
            ;;
    esac
}

# Ensure required tools are available
if ! command -v bc &> /dev/null; then
    sudo apt install -y bc
fi

if ! command -v jq &> /dev/null; then
    sudo apt install -y jq
fi

# Run main function
main "$@"
