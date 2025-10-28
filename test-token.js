#!/usr/bin/env node

/**
 * Discord Bot Token Validator
 * Tests if your bot token is valid
 */

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

console.log('\n🔍 Discord Bot Token Validator\n');
console.log('================================\n');

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
    console.log('❌ No token found in .env file!');
    console.log('\nPlease run: node setup-bot.js\n');
    process.exit(1);
}

// Check token format
console.log('📋 Token Format Check:');
console.log(`   Length: ${token.length} characters`);

if (token.length < 50) {
    console.log('   ❌ Token too short! Should be 70+ characters');
    console.log('\n⚠️  Your token appears to be invalid or incomplete.\n');
    process.exit(1);
}

const parts = token.split('.');
console.log(`   Parts: ${parts.length} (should be 3)`);

if (parts.length !== 3) {
    console.log('   ❌ Invalid token format! Should have 3 parts separated by dots');
    console.log('\n⚠️  Your token format is incorrect.\n');
    process.exit(1);
}

console.log(`   Part 1 (User ID): ${parts[0].substring(0, 10)}...`);
console.log(`   Part 2 (Timestamp): ${parts[1].substring(0, 6)}...`);
console.log(`   Part 3 (HMAC): ${parts[2].substring(0, 10)}...`);
console.log('   ✅ Token format looks valid\n');

// Test connection
console.log('🔌 Testing Discord Connection...');
console.log('   Creating client...');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

let connectionTimeout;

client.once('ready', () => {
    clearTimeout(connectionTimeout);
    console.log('\n✅ SUCCESS! Bot connected to Discord!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Bot Username: ${client.user.tag}`);
    console.log(`   Bot ID: ${client.user.id}`);
    console.log(`   Servers: ${client.guilds.cache.size}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Your token is VALID and working!\n');
    console.log('Next steps:');
    console.log('   • Start your bot: pm2 restart skyfall-bot');
    console.log('   • View logs: pm2 logs skyfall-bot\n');
    
    client.destroy();
    process.exit(0);
});

client.on('error', (error) => {
    clearTimeout(connectionTimeout);
    console.log('\n❌ Connection Error!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Error: ${error.message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (error.code === 'TokenInvalid') {
        console.log('⚠️  Your token is INVALID!\n');
        console.log('This means:');
        console.log('   • The token was reset/regenerated');
        console.log('   • The token was typed incorrectly');
        console.log('   • The token expired\n');
        console.log('How to fix:');
        console.log('   1. Go to: https://discord.com/developers/applications');
        console.log('   2. Click your bot');
        console.log('   3. Go to "Bot" section');
        console.log('   4. Click "Reset Token"');
        console.log('   5. Copy the NEW token');
        console.log('   6. Run: node setup-bot.js');
        console.log('   7. Paste the new token\n');
    } else {
        console.log('⚠️  Connection failed!\n');
        console.log('Possible causes:');
        console.log('   • Network connection issues');
        console.log('   • Discord API is down');
        console.log('   • Firewall blocking connection\n');
    }
    
    process.exit(1);
});

// Set timeout for connection
connectionTimeout = setTimeout(() => {
    console.log('\n⏱️  Connection timeout!\n');
    console.log('The bot took too long to connect.');
    console.log('This could mean:');
    console.log('   • Network issues');
    console.log('   • Invalid token');
    console.log('   • Discord API issues\n');
    
    client.destroy();
    process.exit(1);
}, 15000); // 15 second timeout

console.log('   Attempting to login...');

// Attempt login
client.login(token).catch(error => {
    clearTimeout(connectionTimeout);
    console.log('\n❌ Login Failed!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Error: ${error.message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (error.message.includes('token')) {
        console.log('⚠️  TOKEN IS INVALID!\n');
        console.log('Your token has been rejected by Discord.\n');
        console.log('You MUST get a new token:');
        console.log('   1. Go to: https://discord.com/developers/applications');
        console.log('   2. Click your bot (Skyfall)');
        console.log('   3. Go to "Bot" section');
        console.log('   4. Click "Reset Token"');
        console.log('   5. Click "Yes, do it!"');
        console.log('   6. Copy the ENTIRE new token');
        console.log('   7. Run: node setup-bot.js');
        console.log('   8. Paste the new token\n');
    }
    
    process.exit(1);
});
