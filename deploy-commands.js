const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

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
                    commands.push(command.data.toJSON());
                    console.log(`✅ Found command: ${command.data.name}`);
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

        // Get application ID from bot token
        const clientId = Buffer.from(process.env.DISCORD_TOKEN.split('.')[0], 'base64').toString();

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
