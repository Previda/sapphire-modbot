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
                        console.log(`⚠️ Duplicate command found: ${commandName} in ${filePath} - skipping`);
                        continue;
                    }
                    
                    commandNames.add(commandName);
                    commands.push(command.data.toJSON());
                    console.log(`✅ Found command: ${commandName} (${filePath})`);
                }
            } catch (error) {
                console.error(`❌ Error loading command ${file}:`, error.message);
            }
        }
    }
}

// Load all commands
const commandsPath = path.join(__dirname, 'src', 'commands');
if (fs.existsSync(commandsPath)) {
    loadCommands(commandsPath);
}

console.log(`📋 Total commands to deploy: ${commands.length}`);

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log('🚀 Started refreshing application (/) commands...');

        // Check if token exists
        if (!process.env.DISCORD_TOKEN) {
            console.error('❌ DISCORD_TOKEN not found in environment variables!');
            process.exit(1);
        }

        // Get application ID from .env file
        const clientId = process.env.CLIENT_ID || process.env.APPLICATION_ID;
        
        if (!clientId) {
            console.error('❌ CLIENT_ID or APPLICATION_ID not found in .env file!');
            console.log('💡 Add CLIENT_ID=your_bot_client_id to your .env file');
            process.exit(1);
        }

        console.log(`📱 Using Client ID: ${clientId}`);

        // Deploy commands globally (takes up to 1 hour to propagate)
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands globally.`);
        console.log('⏱️ Commands will be available globally within 1 hour.');
        
        // List all deployed commands
        console.log('\n📋 Deployed commands:');
        commands.forEach(cmd => {
            console.log(`  /${cmd.name} - ${cmd.description}`);
        });

    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();
