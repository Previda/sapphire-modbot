#!/bin/bash

# Sapphire Bot - Comprehensive Testing Suite for Raspberry Pi
# Automated testing with self-repair capabilities

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
CURRENT_USER=$(whoami)
BOT_DIR="/home/$CURRENT_USER/sapphire-bot"
TEST_LOG="/tmp/sapphire-test-$(date +%Y%m%d-%H%M%S).log"
BACKUP_DIR="/home/$CURRENT_USER/bot-backups"
MAX_MEMORY_MB=200
MAX_CPU_PERCENT=50
TEST_TIMEOUT=30

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0
FIXES_APPLIED=0

# Logging function
log_test() {
    local level="$1"
    local message="$2"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [$level] $message" | tee -a "$TEST_LOG"
}

# Test result function
test_result() {
    local test_name="$1"
    local result="$2"
    local message="$3"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if [ "$result" = "PASS" ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✅ PASS${NC} - $test_name: $message"
    elif [ "$result" = "FAIL" ]; then
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}❌ FAIL${NC} - $test_name: $message"
    else
        echo -e "${YELLOW}⚠️  SKIP${NC} - $test_name: $message"
    fi
    
    log_test "$result" "$test_name: $message"
}

# Auto-fix function
apply_fix() {
    local fix_name="$1"
    local fix_command="$2"
    local fix_description="$3"
    
    echo -e "${CYAN}🔧 Applying fix: $fix_name${NC}"
    log_test "FIX" "$fix_name - $fix_description"
    
    if eval "$fix_command"; then
        FIXES_APPLIED=$((FIXES_APPLIED + 1))
        echo -e "${GREEN}✅ Fix applied successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Fix failed${NC}"
        return 1
    fi
}

# Test 1: System Requirements
test_system_requirements() {
    echo -e "${BLUE}📋 Testing System Requirements...${NC}"
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -ge 16 ]; then
            test_result "Node.js Version" "PASS" "v$(node -v) (>= v16 required)"
        else
            test_result "Node.js Version" "FAIL" "v$(node -v) (< v16 required)"
            apply_fix "Update Node.js" "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs" "Installing Node.js 18 LTS"
        fi
    else
        test_result "Node.js Installation" "FAIL" "Node.js not found"
        apply_fix "Install Node.js" "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs" "Installing Node.js 18 LTS"
    fi
    
    # Check available memory
    local available_mem=$(free -m | grep "^Mem:" | awk '{print $7}')
    if [ "$available_mem" -ge 100 ]; then
        test_result "Available Memory" "PASS" "${available_mem}MB available (>= 100MB required)"
    else
        test_result "Available Memory" "FAIL" "${available_mem}MB available (< 100MB required)"
        apply_fix "Free Memory" "sudo sh -c 'echo 3 > /proc/sys/vm/drop_caches'" "Clearing system cache to free memory"
    fi
    
    # Check disk space
    local available_disk=$(df /home | tail -1 | awk '{print $4}')
    local available_disk_mb=$((available_disk / 1024))
    if [ "$available_disk_mb" -ge 500 ]; then
        test_result "Disk Space" "PASS" "${available_disk_mb}MB available (>= 500MB required)"
    else
        test_result "Disk Space" "FAIL" "${available_disk_mb}MB available (< 500MB required)"
        apply_fix "Free Disk Space" "sudo apt autoremove -y && sudo apt autoclean" "Cleaning package cache"
    fi
    
    # Check PM2
    if command -v pm2 &> /dev/null; then
        test_result "PM2 Process Manager" "PASS" "PM2 installed"
    else
        test_result "PM2 Process Manager" "FAIL" "PM2 not found"
        apply_fix "Install PM2" "sudo npm install -g pm2" "Installing PM2 globally"
    fi
}

# Test 2: Bot Files and Structure
test_bot_structure() {
    echo -e "${BLUE}📁 Testing Bot File Structure...${NC}"
    
    cd "$BOT_DIR" || {
        test_result "Bot Directory" "FAIL" "Directory $BOT_DIR not found"
        return 1
    }
    
    # Required files
    local required_files=(
        "index.js"
        "package.json"
        "src/commands"
        "src/events"
        "src/utils"
        "src/schemas"
    )
    
    for file in "${required_files[@]}"; do
        if [ -e "$file" ]; then
            test_result "File Structure" "PASS" "$file exists"
        else
            test_result "File Structure" "FAIL" "$file missing"
        fi
    done
    
    # Check package.json validity
    if [ -f "package.json" ]; then
        if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
            test_result "Package.json Syntax" "PASS" "Valid JSON format"
        else
            test_result "Package.json Syntax" "FAIL" "Invalid JSON format"
        fi
    fi
    
    # Check main entry point
    if [ -f "index.js" ]; then
        if node -c index.js 2>/dev/null; then
            test_result "Main File Syntax" "PASS" "index.js syntax valid"
        else
            test_result "Main File Syntax" "FAIL" "index.js has syntax errors"
        fi
    fi
}

# Test 3: Dependencies
test_dependencies() {
    echo -e "${BLUE}📦 Testing Dependencies...${NC}"
    
    cd "$BOT_DIR" || return 1
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        test_result "Node Modules" "PASS" "Dependencies installed"
    else
        test_result "Node Modules" "FAIL" "Dependencies not installed"
        apply_fix "Install Dependencies" "NODE_OPTIONS='--max-old-space-size=256' npm install --production" "Installing Node.js dependencies"
    fi
    
    # Test Discord.js
    if node -e "require('discord.js')" 2>/dev/null; then
        test_result "Discord.js" "PASS" "Discord.js module loads"
    else
        test_result "Discord.js" "FAIL" "Discord.js module missing or broken"
        apply_fix "Reinstall Discord.js" "NODE_OPTIONS='--max-old-space-size=256' npm install discord.js --save" "Reinstalling Discord.js"
    fi
    
    # Test other critical dependencies
    local critical_deps=("mysql2" "mongoose")
    for dep in "${critical_deps[@]}"; do
        if node -e "require('$dep')" 2>/dev/null; then
            test_result "Dependency $dep" "PASS" "$dep module loads"
        else
            test_result "Dependency $dep" "FAIL" "$dep module missing"
            apply_fix "Install $dep" "NODE_OPTIONS='--max-old-space-size=256' npm install $dep --save" "Installing $dep"
        fi
    done
}

# Test 4: Configuration
test_configuration() {
    echo -e "${BLUE}⚙️  Testing Configuration...${NC}"
    
    cd "$BOT_DIR" || return 1
    
    # Check .env file
    if [ -f ".env" ]; then
        test_result "Environment File" "PASS" ".env file exists"
        
        # Check required environment variables
        local required_vars=("DISCORD_TOKEN" "CLIENT_ID")
        for var in "${required_vars[@]}"; do
            if grep -q "^$var=" .env && ! grep -q "^$var=$" .env; then
                test_result "Environment Variable" "PASS" "$var is set"
            else
                test_result "Environment Variable" "FAIL" "$var is missing or empty"
            fi
        done
    else
        test_result "Environment File" "FAIL" ".env file missing"
        if [ -f ".env.example" ]; then
            apply_fix "Create .env" "cp .env.example .env" "Creating .env from example"
        fi
    fi
    
    # Check permissions
    if [ -f ".env" ]; then
        local env_perms=$(stat -c "%a" .env)
        if [ "$env_perms" = "600" ] || [ "$env_perms" = "640" ]; then
            test_result "Environment Security" "PASS" ".env permissions secure ($env_perms)"
        else
            test_result "Environment Security" "FAIL" ".env permissions insecure ($env_perms)"
            apply_fix "Fix .env Permissions" "chmod 600 .env" "Setting secure permissions on .env"
        fi
    fi
}

# Test 5: Memory Usage
test_memory_usage() {
    echo -e "${BLUE}🧠 Testing Memory Usage...${NC}"
    
    cd "$BOT_DIR" || return 1
    
    # Test bot startup memory
    echo "Starting bot for memory test..."
    local test_output=$(timeout $TEST_TIMEOUT node -e "
        const client = require('./index.js');
        setTimeout(() => {
            const usage = process.memoryUsage();
            console.log(JSON.stringify(usage));
            process.exit(0);
        }, 5000);
    " 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$test_output" ]; then
        local memory_mb=$(echo "$test_output" | node -e "
            const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
            console.log(Math.round(data.rss / 1024 / 1024));
        " 2>/dev/null)
        
        if [ -n "$memory_mb" ] && [ "$memory_mb" -le "$MAX_MEMORY_MB" ]; then
            test_result "Memory Usage" "PASS" "Bot uses ${memory_mb}MB (<= ${MAX_MEMORY_MB}MB target)"
        else
            test_result "Memory Usage" "FAIL" "Bot uses ${memory_mb}MB (> ${MAX_MEMORY_MB}MB target)"
            apply_fix "Optimize Memory" "export NODE_OPTIONS='--max-old-space-size=256'" "Setting Node.js memory limit"
        fi
    else
        test_result "Memory Usage" "FAIL" "Could not measure memory usage"
    fi
}

# Test 6: Command Registration
test_command_registration() {
    echo -e "${BLUE}⚡ Testing Command Registration...${NC}"
    
    cd "$BOT_DIR" || return 1
    
    if [ -f "register-commands.js" ]; then
        # Test command registration script
        if node -c register-commands.js 2>/dev/null; then
            test_result "Command Registration Script" "PASS" "register-commands.js syntax valid"
            
            # Test dry-run if Discord token is available
            if grep -q "DISCORD_TOKEN=" .env && ! grep -q "DISCORD_TOKEN=$" .env; then
                echo "Testing command registration (dry-run)..."
                local reg_output=$(timeout $TEST_TIMEOUT node register-commands.js --dry-run 2>&1 || true)
                if echo "$reg_output" | grep -q "Commands would be registered" || echo "$reg_output" | grep -q "Successfully registered"; then
                    test_result "Command Registration" "PASS" "Commands can be registered"
                else
                    test_result "Command Registration" "FAIL" "Command registration failed"
                fi
            else
                test_result "Command Registration" "SKIP" "No Discord token for testing"
            fi
        else
            test_result "Command Registration Script" "FAIL" "register-commands.js has syntax errors"
        fi
    else
        test_result "Command Registration Script" "FAIL" "register-commands.js missing"
    fi
}

# Test 7: Service Management
test_service_management() {
    echo -e "${BLUE}🔄 Testing Service Management...${NC}"
    
    cd "$BOT_DIR" || return 1
    
    # Test PM2 service start/stop
    if command -v pm2 &> /dev/null; then
        # Stop any existing service
        pm2 delete sapphire-bot 2>/dev/null || true
        
        # Test service start
        if PM2_HOME=/home/$CURRENT_USER/.pm2 NODE_OPTIONS="--max-old-space-size=256" pm2 start index.js --name sapphire-bot-test --max-memory-restart 200M >/dev/null 2>&1; then
            sleep 3
            
            if pm2 list | grep -q "sapphire-bot-test.*online"; then
                test_result "Service Start" "PASS" "Bot service starts successfully"
                
                # Test service stop
                if pm2 stop sapphire-bot-test >/dev/null 2>&1; then
                    test_result "Service Stop" "PASS" "Bot service stops successfully"
                else
                    test_result "Service Stop" "FAIL" "Cannot stop bot service"
                fi
                
                # Cleanup
                pm2 delete sapphire-bot-test >/dev/null 2>&1 || true
            else
                test_result "Service Start" "FAIL" "Bot service failed to start"
                pm2 logs sapphire-bot-test --lines 5 2>/dev/null || true
            fi
        else
            test_result "Service Start" "FAIL" "Cannot start bot with PM2"
        fi
    else
        test_result "Service Management" "SKIP" "PM2 not available"
    fi
}

# Test 8: Network and Discord Connectivity
test_connectivity() {
    echo -e "${BLUE}🌐 Testing Network Connectivity...${NC}"
    
    # Test internet connectivity
    if ping -c 1 google.com >/dev/null 2>&1; then
        test_result "Internet Connectivity" "PASS" "Internet connection working"
    else
        test_result "Internet Connectivity" "FAIL" "No internet connection"
        return 1
    fi
    
    # Test Discord API connectivity
    if curl -s https://discord.com/api/v10 >/dev/null; then
        test_result "Discord API" "PASS" "Discord API reachable"
    else
        test_result "Discord API" "FAIL" "Cannot reach Discord API"
        apply_fix "DNS Fix" "echo 'nameserver 8.8.8.8' | sudo tee -a /etc/resolv.conf" "Adding Google DNS"
    fi
    
    # Test NPM registry
    if npm ping >/dev/null 2>&1; then
        test_result "NPM Registry" "PASS" "NPM registry reachable"
    else
        test_result "NPM Registry" "FAIL" "Cannot reach NPM registry"
    fi
}

# Test 9: Performance Benchmark
test_performance() {
    echo -e "${BLUE}⚡ Testing Performance...${NC}"
    
    cd "$BOT_DIR" || return 1
    
    # CPU stress test
    echo "Running CPU performance test..."
    local cpu_start=$(date +%s%N)
    node -e "
        const start = Date.now();
        let sum = 0;
        for(let i = 0; i < 1000000; i++) {
            sum += Math.sqrt(i);
        }
        console.log(Date.now() - start);
    " 2>/dev/null > /tmp/cpu_test_result
    
    if [ -f /tmp/cpu_test_result ]; then
        local cpu_time=$(cat /tmp/cpu_test_result)
        if [ "$cpu_time" -lt 5000 ]; then
            test_result "CPU Performance" "PASS" "CPU test completed in ${cpu_time}ms"
        else
            test_result "CPU Performance" "FAIL" "CPU test took ${cpu_time}ms (> 5000ms)"
        fi
        rm -f /tmp/cpu_test_result
    else
        test_result "CPU Performance" "FAIL" "CPU test failed to run"
    fi
    
    # I/O performance test
    echo "Running I/O performance test..."
    local io_start=$(date +%s%N)
    dd if=/dev/zero of=/tmp/iotest bs=1M count=10 >/dev/null 2>&1
    local io_end=$(date +%s%N)
    local io_time=$(((io_end - io_start) / 1000000))
    
    rm -f /tmp/iotest
    
    if [ "$io_time" -lt 2000 ]; then
        test_result "I/O Performance" "PASS" "I/O test completed in ${io_time}ms"
    else
        test_result "I/O Performance" "FAIL" "I/O test took ${io_time}ms (> 2000ms)"
    fi
}

# Generate test report
generate_report() {
    echo ""
    echo -e "${BLUE}📊 Test Report${NC}"
    echo -e "${BLUE}==============${NC}"
    echo ""
    echo -e "Tests Run:    ${TESTS_RUN}"
    echo -e "Tests Passed: ${GREEN}${TESTS_PASSED}${NC}"
    echo -e "Tests Failed: ${RED}${TESTS_FAILED}${NC}"
    echo -e "Fixes Applied: ${CYAN}${FIXES_APPLIED}${NC}"
    echo ""
    
    local success_rate=$((TESTS_PASSED * 100 / TESTS_RUN))
    if [ "$success_rate" -ge 90 ]; then
        echo -e "${GREEN}✅ Overall Status: EXCELLENT (${success_rate}%)${NC}"
        return 0
    elif [ "$success_rate" -ge 75 ]; then
        echo -e "${YELLOW}⚠️  Overall Status: GOOD (${success_rate}%)${NC}"
        return 0
    else
        echo -e "${RED}❌ Overall Status: POOR (${success_rate}%)${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🔍 Sapphire Bot - Comprehensive Test Suite${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo ""
    echo "Log file: $TEST_LOG"
    echo ""
    
    case "${1:-all}" in
        "all")
            test_system_requirements
            test_bot_structure
            test_dependencies
            test_configuration
            test_memory_usage
            test_command_registration
            test_service_management
            test_connectivity
            test_performance
            ;;
        "quick")
            test_system_requirements
            test_bot_structure
            test_dependencies
            test_configuration
            ;;
        "performance")
            test_memory_usage
            test_performance
            ;;
        "connectivity")
            test_connectivity
            ;;
        "service")
            test_service_management
            ;;
        *)
            echo "Usage: $0 {all|quick|performance|connectivity|service}"
            echo ""
            echo "Test Suites:"
            echo "  all          - Run comprehensive test suite"
            echo "  quick        - Run basic functionality tests"
            echo "  performance  - Run performance and memory tests"
            echo "  connectivity - Test network and API connectivity"
            echo "  service      - Test service management capabilities"
            exit 1
            ;;
    esac
    
    generate_report
    
    echo ""
    echo "Detailed log: $TEST_LOG"
}

# Ensure we're in the right location
if [ ! -d "$BOT_DIR" ] && [ -d "$(dirname "$0")/.." ]; then
    BOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
fi

# Run main function
main "$@"
