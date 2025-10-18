const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandNames = new Set();

// Load commands recursively
function loadCommands(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            try {
                const command = require(filePath);
                if (command.data && command.execute) {
                    const commandName = command.data.name;
                    
                    if (commandNames.has(commandName)) {
                        console.log(`⚠️ Duplicate command found: ${commandName} - skipping`);
                        continue;
                    }
                    
                    commandNames.add(commandName);
                    commands.push(command.data.toJSON());
                    console.log(`✅ ${commandName}`);
                }
            } catch (error) {
                console.error(`❌ Error loading ${file}:`, error.message);
            }
        }
    }
}

// Load all commands
const commandsPath = path.join(__dirname, 'src', 'commands');
if (fs.existsSync(commandsPath)) {
    console.log('📂 Loading commands...\n');
    loadCommands(commandsPath);
}

console.log(`\n📋 Total commands: ${commands.length}\n`);

// Deploy commands
(async () => {
    try {
        const clientId = process.env.CLIENT_ID || process.env.APPLICATION_ID;
        const guildId = process.env.GUILD_ID || '1352812960933875712'; // Your server ID
        
        if (!process.env.DISCORD_TOKEN) {
            console.error('❌ DISCORD_TOKEN not found!');
            process.exit(1);
        }
        
        if (!clientId) {
            console.error('❌ CLIENT_ID not found in .env!');
            process.exit(1);
        }

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

        console.log('🚀 Deploying commands to guild (INSTANT)...\n');
        console.log(`📱 Client ID: ${clientId}`);
        console.log(`🏢 Guild ID: ${guildId}\n`);

        // Deploy to specific guild (INSTANT)
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`✅ Successfully deployed ${data.length} commands!`);
        console.log('⚡ Commands are available INSTANTLY in your server!\n');
        
        console.log('📋 Deployed commands:');
        data.forEach(cmd => {
            console.log(`  /${cmd.name}`);
        });

        console.log('\n✨ Done! Type / in Discord to see all commands!');

    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
