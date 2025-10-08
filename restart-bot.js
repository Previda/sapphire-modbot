#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

console.log('🔄 Sapphire Bot Restart Script');
console.log('==============================\n');

async function restartBot() {
    try {
        console.log('1️⃣ Fixing and deploying commands...');
        await execAsync('node fix-bot.js');
        
        console.log('\n2️⃣ Stopping existing bot process...');
        try {
            await execAsync('pm2 stop sapphire-bot');
            console.log('✅ Bot stopped');
        } catch (error) {
            console.log('⚠️ No existing process found');
        }
        
        console.log('\n3️⃣ Starting bot with PM2...');
        await execAsync('pm2 start index.js --name sapphire-bot --watch --ignore-watch="node_modules logs *.log" --max-memory-restart 200M');
        console.log('✅ Bot started with PM2');
        
        console.log('\n4️⃣ Checking bot status...');
        const { stdout } = await execAsync('pm2 status sapphire-bot');
        console.log(stdout);
        
        console.log('\n🎉 Bot restart completed!');
        console.log('📋 Next steps:');
        console.log('1. Check Discord - bot should be online');
        console.log('2. Test commands: /ping, /help');
        console.log('3. Monitor logs: pm2 logs sapphire-bot');
        
    } catch (error) {
        console.error('❌ Restart failed:', error.message);
        console.log('\n💡 Manual steps:');
        console.log('1. Run: node fix-bot.js');
        console.log('2. Run: pm2 restart sapphire-bot');
        console.log('3. Check: pm2 logs sapphire-bot');
    }
}

restartBot();
