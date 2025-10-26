#!/usr/bin/env node

/**
 * Interactive Bot Setup Script
 * Helps configure Discord bot with proper authentication
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ENV_PATH = path.join(__dirname, '.env');

console.log('\n🤖 Discord Bot Setup Wizard\n');
console.log('This will help you configure your bot with the correct credentials.\n');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  try {
    console.log('📋 Step 1: Get your Discord Bot Token');
    console.log('   1. Go to https://discord.com/developers/applications');
    console.log('   2. Click your bot application');
    console.log('   3. Click "Bot" in the left sidebar');
    console.log('   4. Under "Token", click "Reset Token"');
    console.log('   5. Click "Yes, do it!"');
    console.log('   6. Copy the token that appears\n');

    const token = await question('Paste your Discord Bot Token here: ');
    
    if (!token || token.trim().length < 50) {
      console.log('\n❌ Invalid token! Token should be at least 50 characters long.');
      console.log('Please run this script again with a valid token.\n');
      process.exit(1);
    }

    console.log('\n📋 Step 2: Get your Discord Client ID');
    console.log('   1. On the same page, click "OAuth2" in the left sidebar');
    console.log('   2. Copy the "Client ID"\n');

    const clientId = await question('Paste your Discord Client ID here: ');

    if (!clientId || clientId.trim().length < 10) {
      console.log('\n❌ Invalid Client ID! Please run this script again.\n');
      process.exit(1);
    }

    console.log('\n📋 Step 3: Configure Ports');
    const port = await question('API Port (default: 3001): ') || '3001';

    // Create .env file
    const envContent = `# Discord Bot Configuration
# Generated: ${new Date().toISOString()}

DISCORD_BOT_TOKEN=${token.trim()}
DISCORD_CLIENT_ID=${clientId.trim()}
PORT=${port}
API_PORT=${port}

# Optional: MongoDB Connection (leave empty to use local storage)
MONGODB_URI=

# Optional: Additional Configuration
NODE_ENV=production
`;

    fs.writeFileSync(ENV_PATH, envContent, 'utf8');

    console.log('\n✅ Configuration saved to .env file!');
    console.log('\n📦 Next steps:');
    console.log('   1. On your Raspberry Pi, run: bash start-bot.sh');
    console.log('   2. Or manually: pm2 start src/index.js --name skyfall-bot');
    console.log('   3. Check logs: pm2 logs skyfall-bot\n');

    // Validate token format
    const tokenParts = token.trim().split('.');
    if (tokenParts.length !== 3) {
      console.log('⚠️  WARNING: Token format looks unusual. Discord tokens have 3 parts separated by dots.');
      console.log('   Make sure you copied the entire token!\n');
    }

    console.log('🎉 Setup complete!\n');

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setup();
