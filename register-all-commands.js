const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Registering All Commands');
console.log('============================\n');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
    console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID in .env file!');
    console.log('\nPlease make sure your .env file has:');
    console.log('DISCORD_TOKEN=your_bot_token');
    console.log('CLIENT_ID=your_client_id\n');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

async function registerCommands() {
    const commands = [];
    const commandsPath = path.join(__dirname, 'src/commands');
    
    console.log('📦 Loading commands...\n');
    
    function loadCommandsFromDir(dir, category = '') {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                loadCommandsFromDir(filePath, file);
            } else if (file.endsWith('.js')) {
                try {
                    // Clear cache
                    delete require.cache[require.resolve(filePath)];
                    
                    const command = require(filePath);
                    if (command.data) {
                        commands.push(command.data.toJSON());
                        console.log(`  ✅ ${category ? category + '/' : ''}${command.data.name}`);
                    }
                } catch (error) {
                    console.log(`  ❌ Failed to load ${file}: ${error.message}`);
                }
            }
        }
    }
    
    loadCommandsFromDir(commandsPath);
    
    console.log(`\n📤 Registering ${commands.length} commands...\n`);
    
    try {
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );
        
        console.log('✅ Successfully registered commands!\n');
        console.log('📊 Summary:');
        console.log('===========');
        console.log(`Total commands: ${data.length}`);
        console.log('\nRegistered commands:');
        data.forEach(cmd => {
            console.log(`  • ${cmd.name}`);
        });
        
        console.log('\n🎉 All commands are now available in Discord!');
        console.log('\nYou can now use:');
        console.log('  /verify setup');
        console.log('  /ticket setup');
        console.log('  /roblox setup');
        console.log('  And all other commands!\n');
        
    } catch (error) {
        console.error('❌ Error registering commands:', error);
        
        if (error.code === 50001) {
            console.log('\n⚠️  Missing Access Error!');
            console.log('Make sure your bot has the "applications.commands" scope.');
        } else if (error.code === 0) {
            console.log('\n⚠️  Authentication Error!');
            console.log('Check that your DISCORD_TOKEN is correct in the .env file.');
        }
        
        process.exit(1);
    }
}

registerCommands();
