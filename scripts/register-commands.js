const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, '../src/commands');

console.log('🔍 Loading commands from:', commandsPath);

function loadCommandsFromDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Recursively load from subdirectories
            loadCommandsFromDirectory(fullPath);
        } else if (item.endsWith('.js')) {
            try {
                const command = require(fullPath);
                
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                    console.log(`✅ Loaded command: ${command.data.name}`);
                } else {
                    console.log(`⚠️  Skipped ${item}: Missing data or execute property`);
                }
            } catch (error) {
                console.error(`❌ Error loading ${item}:`, error.message);
            }
        }
    }
}

// Load all commands
loadCommandsFromDirectory(commandsPath);

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
    console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID in environment variables');
    process.exit(1);
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);
        
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        
        console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
        console.log('Commands registered:', data.map(cmd => cmd.name).join(', '));
        
    } catch (error) {
        console.error('❌ Error registering commands:', error);
        
        if (error.status === 401) {
            console.error('Invalid bot token. Please check your DISCORD_TOKEN in .env file');
        } else if (error.status === 403) {
            console.error('Bot lacks permissions. Make sure the bot is properly invited with applications.commands scope');
        }
        
        process.exit(1);
    }
})();
