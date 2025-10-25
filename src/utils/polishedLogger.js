/**
 * Polished Console Logger
 * Beautiful, clean console output with colors and formatting
 */

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    
    // Text colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    
    // Background colors
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m'
};

class PolishedLogger {
    /**
     * Get current timestamp
     */
    static getTimestamp() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${colors.dim}${hours}:${minutes}:${seconds}${colors.reset}`;
    }

    /**
     * Success message
     */
    static success(message, details = '') {
        const timestamp = this.getTimestamp();
        console.log(`${timestamp} ${colors.green}${colors.bright}✓${colors.reset} ${colors.green}${message}${colors.reset}${details ? colors.dim + ' ' + details : ''}${colors.reset}`);
    }

    /**
     * Error message
     */
    static error(message, details = '') {
        const timestamp = this.getTimestamp();
        console.log(`${timestamp} ${colors.red}${colors.bright}✗${colors.reset} ${colors.red}${message}${colors.reset}${details ? '\n  ' + colors.dim + details : ''}${colors.reset}`);
    }

    /**
     * Warning message
     */
    static warn(message, details = '') {
        const timestamp = this.getTimestamp();
        console.log(`${timestamp} ${colors.yellow}${colors.bright}⚠${colors.reset} ${colors.yellow}${message}${colors.reset}${details ? colors.dim + ' ' + details : ''}${colors.reset}`);
    }

    /**
     * Info message
     */
    static info(message, details = '') {
        const timestamp = this.getTimestamp();
        console.log(`${timestamp} ${colors.cyan}${colors.bright}ℹ${colors.reset} ${colors.cyan}${message}${colors.reset}${details ? colors.dim + ' ' + details : ''}${colors.reset}`);
    }

    /**
     * Debug message
     */
    static debug(message, details = '') {
        const timestamp = this.getTimestamp();
        console.log(`${timestamp} ${colors.magenta}${colors.bright}◆${colors.reset} ${colors.magenta}${message}${colors.reset}${details ? colors.dim + ' ' + details : ''}${colors.reset}`);
    }

    /**
     * Command execution log
     */
    static command(commandName, user, guild) {
        const timestamp = this.getTimestamp();
        console.log(`${timestamp} ${colors.blue}${colors.bright}⚡${colors.reset} ${colors.blue}Command:${colors.reset} ${colors.bright}${commandName}${colors.reset} ${colors.dim}by ${user} in ${guild}${colors.reset}`);
    }

    /**
     * System startup message
     */
    static startup(botName, version = '1.0.0') {
        console.log('\n' + colors.cyan + colors.bright + '═'.repeat(60) + colors.reset);
        console.log(colors.cyan + colors.bright + '  🚀 ' + botName + ' v' + version + colors.reset);
        console.log(colors.cyan + colors.bright + '═'.repeat(60) + colors.reset + '\n');
    }

    /**
     * Section header
     */
    static section(title) {
        console.log('\n' + colors.bright + colors.cyan + '▸ ' + title + colors.reset);
        console.log(colors.dim + '─'.repeat(40) + colors.reset);
    }

    /**
     * Loading indicator
     */
    static loading(message) {
        const timestamp = this.getTimestamp();
        console.log(`${timestamp} ${colors.yellow}⏳${colors.reset} ${message}...`);
    }

    /**
     * Module loaded
     */
    static module(moduleName, status = 'loaded') {
        const timestamp = this.getTimestamp();
        const statusIcon = status === 'loaded' ? '✓' : status === 'failed' ? '✗' : '⚠';
        const statusColor = status === 'loaded' ? colors.green : status === 'failed' ? colors.red : colors.yellow;
        console.log(`${timestamp} ${statusColor}${statusIcon}${colors.reset} ${colors.bright}${moduleName}${colors.reset} ${colors.dim}${status}${colors.reset}`);
    }

    /**
     * Event log
     */
    static event(eventName, details = '') {
        const timestamp = this.getTimestamp();
        console.log(`${timestamp} ${colors.magenta}●${colors.reset} ${colors.bright}${eventName}${colors.reset}${details ? colors.dim + ' ' + details : ''}${colors.reset}`);
    }

    /**
     * API request log
     */
    static api(method, endpoint, status) {
        const timestamp = this.getTimestamp();
        const statusColor = status >= 200 && status < 300 ? colors.green : status >= 400 ? colors.red : colors.yellow;
        console.log(`${timestamp} ${colors.blue}→${colors.reset} ${colors.bright}${method}${colors.reset} ${endpoint} ${statusColor}${status}${colors.reset}`);
    }

    /**
     * Database operation log
     */
    static database(operation, table, status = 'success') {
        const timestamp = this.getTimestamp();
        const statusIcon = status === 'success' ? '✓' : '✗';
        const statusColor = status === 'success' ? colors.green : colors.red;
        console.log(`${timestamp} ${colors.cyan}◆${colors.reset} ${colors.bright}${operation}${colors.reset} ${colors.dim}${table}${colors.reset} ${statusColor}${statusIcon}${colors.reset}`);
    }

    /**
     * Moderation action log
     */
    static moderation(action, target, moderator, caseId) {
        const timestamp = this.getTimestamp();
        const actionEmojis = {
            ban: '🔨',
            kick: '👢',
            warn: '⚠️',
            mute: '🔇',
            timeout: '⏰'
        };
        const emoji = actionEmojis[action] || '⚡';
        console.log(`${timestamp} ${colors.red}${emoji}${colors.reset} ${colors.bright}${action.toUpperCase()}${colors.reset} ${colors.dim}${target} by ${moderator} [${caseId}]${colors.reset}`);
    }

    /**
     * Statistics summary
     */
    static stats(stats) {
        console.log('\n' + colors.cyan + colors.bright + '📊 Statistics' + colors.reset);
        console.log(colors.dim + '─'.repeat(40) + colors.reset);
        Object.entries(stats).forEach(([key, value]) => {
            console.log(`  ${colors.bright}${key}:${colors.reset} ${colors.green}${value}${colors.reset}`);
        });
        console.log('');
    }

    /**
     * Clean separator line
     */
    static separator() {
        console.log(colors.dim + '─'.repeat(60) + colors.reset);
    }

    /**
     * Box message (for important announcements)
     */
    static box(message, type = 'info') {
        const boxColors = {
            info: colors.cyan,
            success: colors.green,
            warning: colors.yellow,
            error: colors.red
        };
        const color = boxColors[type] || colors.cyan;
        const lines = message.split('\n');
        const maxLength = Math.max(...lines.map(l => l.length));
        
        console.log('\n' + color + '┌' + '─'.repeat(maxLength + 2) + '┐' + colors.reset);
        lines.forEach(line => {
            console.log(color + '│ ' + colors.reset + line.padEnd(maxLength) + color + ' │' + colors.reset);
        });
        console.log(color + '└' + '─'.repeat(maxLength + 2) + '┘' + colors.reset + '\n');
    }

    /**
     * Progress bar
     */
    static progress(current, total, label = '') {
        const percentage = Math.floor((current / total) * 100);
        const barLength = 30;
        const filledLength = Math.floor((barLength * current) / total);
        const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        
        process.stdout.write(`\r${colors.cyan}${label}${colors.reset} [${colors.green}${bar}${colors.reset}] ${colors.bright}${percentage}%${colors.reset} (${current}/${total})`);
        
        if (current === total) {
            console.log(''); // New line when complete
        }
    }

    /**
     * Table output
     */
    static table(headers, rows) {
        console.log('');
        
        // Calculate column widths
        const widths = headers.map((h, i) => {
            const maxRowWidth = Math.max(...rows.map(r => String(r[i]).length));
            return Math.max(h.length, maxRowWidth);
        });

        // Print header
        const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join(' │ ');
        console.log(colors.bright + headerRow + colors.reset);
        console.log(colors.dim + widths.map(w => '─'.repeat(w)).join('─┼─') + colors.reset);

        // Print rows
        rows.forEach(row => {
            const rowStr = row.map((cell, i) => String(cell).padEnd(widths[i])).join(' │ ');
            console.log(rowStr);
        });
        
        console.log('');
    }
}

module.exports = PolishedLogger;
