#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Sapphire Bot deployment...\n');

// Check if we're in the right directory
const packagePath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packagePath)) {
    console.error('❌ package.json not found. Make sure you\'re in the bot directory.');
    process.exit(1);
}

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found. Please create one with DISCORD_TOKEN and CLIENT_ID.');
    process.exit(1);
}

async function runCommand(command, description) {
    return new Promise((resolve, reject) => {
        console.log(`📋 ${description}...`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ ${description} failed:`, error.message);
                reject(error);
            } else {
                if (stdout) console.log(stdout);
                if (stderr) console.warn(stderr);
                console.log(`✅ ${description} completed\n`);
                resolve();
            }
        });
    });
}

async function deploy() {
    try {
        // Install dependencies
        await runCommand('npm install', 'Installing dependencies');
        
        // Register commands
        await runCommand('node scripts/register-commands.js', 'Registering Discord commands');
        
        // Check PM2 status
        console.log('🔍 Checking PM2 processes...');
        exec('pm2 list', (error, stdout) => {
            console.log(stdout);
            
            // Restart or start the bot
            console.log('🔄 Restarting bot...');
            exec('pm2 restart sapphire-bot || pm2 start index.js --name sapphire-bot', (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Failed to restart bot:', error.message);
                } else {
                    console.log(stdout);
                    console.log('✅ Bot deployment completed successfully!');
                    console.log('📊 Check logs with: pm2 logs sapphire-bot');
                }
            });
        });
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

deploy();
