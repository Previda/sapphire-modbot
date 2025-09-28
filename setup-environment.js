#!/usr/bin/env node
/**
 * Interactive Environment Setup for Sapphire Modbot
 * This script helps configure environment variables for both Pi and Vercel deployments
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const https = require('https');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Utility functions
const log = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
    header: (msg) => {
        console.log(`\n${colors.cyan}${colors.bright}${'='.repeat(50)}`);
        console.log(`  ${msg}`);
        console.log(`${'='.repeat(50)}${colors.reset}\n`);
    }
};

// Question helper
const question = (prompt) => {
    return new Promise((resolve) => {
        rl.question(`${colors.cyan}[INPUT]${colors.reset} ${prompt}: `, resolve);
    });
};

// Hidden input for tokens
const hiddenQuestion = (prompt) => {
    return new Promise((resolve) => {
        process.stdout.write(`${colors.cyan}[INPUT]${colors.reset} ${prompt}: `);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        
        let input = '';
        process.stdin.on('data', function(char) {
            char = char + '';
            switch(char) {
                case '\n':
                case '\r':
                case '\u0004':
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdout.write('\n');
                    resolve(input);
                    break;
                case '\u0003':
                    process.exit();
                    break;
                case '\u007f': // Backspace
                    if (input.length > 0) {
                        input = input.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                    break;
                default:
                    input += char;
                    process.stdout.write('*');
                    break;
            }
        });
    });
};

// Validate Discord token
const validateDiscordToken = async (token) => {
    return new Promise((resolve) => {
        if (!token || token.length < 50) {
            resolve(false);
            return;
        }
        
        const options = {
            hostname: 'discord.com',
            port: 443,
            path: '/api/v10/users/@me',
            method: 'GET',
            headers: {
                'Authorization': `Bot ${token}`,
                'User-Agent': 'Sapphire-Modbot/1.0'
            },
            timeout: 10000
        };
        
        const req = https.request(options, (res) => {
            resolve(res.statusCode === 200);
        });
        
        req.on('error', () => resolve(false));
        req.on('timeout', () => resolve(false));
        req.end();
    });
};

// Generate secure random token
const generateSecureToken = () => {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
};

// Get network IP
const getNetworkIP = () => {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '192.168.1.62'; // Fallback
};

// Main setup function
async function setupEnvironment() {
    log.header('🤖 Sapphire Modbot Environment Setup');
    
    console.log(`${colors.cyan}This wizard will help you configure your bot for:`);
    console.log(`• Raspberry Pi deployment`);
    console.log(`• Vercel dashboard integration`);
    console.log(`• Discord bot configuration${colors.reset}\n`);
    
    const config = {};
    
    // Discord Configuration
    log.header('🔐 Discord Bot Configuration');
    
    let tokenValid = false;
    while (!tokenValid) {
        const token = await hiddenQuestion('Enter your Discord Bot Token');
        
        if (!token) {
            log.error('Token cannot be empty!');
            continue;
        }
        
        log.info('Validating Discord token...');
        tokenValid = await validateDiscordToken(token);
        
        if (tokenValid) {
            config.DISCORD_TOKEN = token;
            log.success('Discord token is valid!');
        } else {
            log.error('Invalid Discord token! Please check and try again.');
            log.warning('Make sure your bot token is correct and the bot exists in Discord Developer Portal.');
        }
    }
    
    // Client ID
    let clientIdValid = false;
    while (!clientIdValid) {
        const clientId = await question('Enter your Discord Application Client ID');
        
        if (!clientId || clientId.length < 15) {
            log.error('Invalid Client ID! Must be at least 15 characters.');
            continue;
        }
        
        config.CLIENT_ID = clientId;
        clientIdValid = true;
        log.success('Client ID configured!');
    }
    
    // Optional Guild ID
    const guildId = await question('Enter Guild ID for instant command deployment (optional, press Enter to skip)');
    if (guildId && guildId.trim()) {
        config.GUILD_ID = guildId.trim();
        log.success('Guild ID configured for instant deployment!');
    } else {
        config.GUILD_ID = '';
        log.info('Using global command deployment (takes up to 1 hour)');
    }
    
    // Pi Configuration
    log.header('🥧 Raspberry Pi Configuration');
    
    const piIP = getNetworkIP();
    const confirmedIP = await question(`Pi IP address (detected: ${piIP}, press Enter to confirm or type new IP)`);
    const finalIP = confirmedIP.trim() || piIP;
    
    config.PI_BOT_TOKEN = generateSecureToken();
    config.PI_BOT_API_URL = `http://${finalIP}:3001`;
    config.MAX_MEMORY = '400';
    config.LOG_LEVEL = 'info';
    config.NODE_ENV = 'production';
    config.API_PORT = '3001';
    
    log.success(`Pi configuration set for IP: ${finalIP}`);
    
    // Optional Features
    log.header('⚙️ Optional Features');
    
    const webhookUrl = await question('Discord Error Webhook URL (optional, press Enter to skip)');
    if (webhookUrl && webhookUrl.trim()) {
        config.DISCORD_ERROR_WEBHOOK_URL = webhookUrl.trim();
        log.success('Error webhook configured!');
    }
    
    const spotifyClientId = await question('Spotify Client ID (optional, press Enter to skip)');
    if (spotifyClientId && spotifyClientId.trim()) {
        config.SPOTIFY_CLIENT_ID = spotifyClientId.trim();
        
        const spotifySecret = await hiddenQuestion('Spotify Client Secret');
        if (spotifySecret && spotifySecret.trim()) {
            config.SPOTIFY_CLIENT_SECRET = spotifySecret.trim();
            log.success('Spotify integration configured!');
        }
    }
    
    // Create environment files
    log.header('📝 Creating Configuration Files');
    
    // Pi .env file
    const piEnvContent = Object.entries(config)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n') + '\n';
    
    fs.writeFileSync('.env', piEnvContent);
    log.success('Created .env file for Pi deployment');
    
    // Add to .gitignore if not already there
    const gitignorePath = '.gitignore';
    if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        if (!gitignoreContent.includes('.env')) {
            fs.appendFileSync(gitignorePath, '\n# Environment files\n.env\n.env.*\n!.env.template\n!.env.vercel.template\n');
            log.success('Updated .gitignore to protect environment files');
        }
    }
    
    // Vercel environment variables
    const vercelEnv = {
        PI_BOT_API_URL: config.PI_BOT_API_URL,
        PI_BOT_TOKEN: config.PI_BOT_TOKEN,
        NEXT_PUBLIC_DISCORD_CLIENT_ID: config.CLIENT_ID,
        DISCORD_CLIENT_SECRET: 'your_discord_oauth_secret_here',
        DISCORD_REDIRECT_URI: 'https://your-vercel-app.vercel.app/login',
        NEXTAUTH_SECRET: generateSecureToken(),
        NEXTAUTH_URL: 'https://your-vercel-app.vercel.app'
    };
    
    const vercelEnvContent = Object.entries(vercelEnv)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n') + '\n';
    
    fs.writeFileSync('.env.vercel', vercelEnvContent);
    log.success('Created .env.vercel file for Vercel deployment');
    
    // Summary
    log.header('✅ Setup Complete!');
    
    console.log(`${colors.green}Configuration files created successfully!${colors.reset}\n`);
    
    console.log(`${colors.bright}📁 Files Created:${colors.reset}`);
    console.log(`• .env - Pi environment configuration`);
    console.log(`• .env.vercel - Vercel environment variables\n`);
    
    console.log(`${colors.bright}🥧 Pi Deployment:${colors.reset}`);
    console.log(`Run this command on your Pi:`);
    console.log(`${colors.cyan}curl -sSL https://raw.githubusercontent.com/Previda/sapphire-modbot/main/pi-complete-installer.sh | bash${colors.reset}\n`);
    
    console.log(`${colors.bright}☁️ Vercel Deployment:${colors.reset}`);
    console.log(`1. Copy the contents of .env.vercel to your Vercel environment variables`);
    console.log(`2. Update DISCORD_CLIENT_SECRET with your actual OAuth secret`);
    console.log(`3. Update DISCORD_REDIRECT_URI with your actual Vercel domain`);
    console.log(`4. Update NEXTAUTH_URL with your actual Vercel domain\n`);
    
    console.log(`${colors.bright}🔐 Important Security Notes:${colors.reset}`);
    console.log(`• Keep your .env files secure and never commit them to git`);
    console.log(`• Your Pi Bot Token: ${colors.yellow}${config.PI_BOT_TOKEN.substring(0, 8)}...${colors.reset}`);
    console.log(`• This token is used for secure communication between Vercel and your Pi\n`);
    
    console.log(`${colors.bright}🎵 Features Enabled:${colors.reset}`);
    console.log(`• Discord slash commands (${config.GUILD_ID ? 'instant' : 'global'} deployment)`);
    console.log(`• Music streaming with multiple fallbacks`);
    console.log(`• Advanced verification system`);
    console.log(`• Real-time dashboard integration`);
    console.log(`• Error reporting ${config.DISCORD_ERROR_WEBHOOK_URL ? '(webhook configured)' : '(no webhook)'}`);
    console.log(`• Spotify integration ${config.SPOTIFY_CLIENT_ID ? '(enabled)' : '(disabled)'}\n`);
    
    log.success('Your Sapphire Modbot is ready to deploy!');
}

// Run setup
setupEnvironment()
    .then(() => {
        rl.close();
        process.exit(0);
    })
    .catch((error) => {
        log.error(`Setup failed: ${error.message}`);
        rl.close();
        process.exit(1);
    });
