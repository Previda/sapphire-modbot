const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandNames = new Set(); // Track unique names

// Function to load commands from a directory
function loadCommands(dir, category = '') {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            loadCommands(filePath, file);
        } else if (file.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);
                
                if (command?.data?.name) {
                    // Check for duplicates
                    if (commandNames.has(command.data.name)) {
                        console.log(`⚠️ Skipped duplicate: ${command.data.name} (from ${category || 'root'})`);
                        continue;
                    }
                    
                    commandNames.add(command.data.name);
                    commands.push(command.data.toJSON());
                    console.log(`✅ Loaded: ${command.data.name} (${category || 'root'})`);
                } else {
                    console.log(`⚠️ Skipped ${file}: No valid command data`);
                }
            } catch (error) {
                console.log(`❌ Error loading ${file}:`, error.message);
            }
        }
    }
}

async function deployCommands() {
    try {
        console.log('🚀 Clean Command Deployment - No Duplicates');
        
        // Load verification command from root
        const verificationPath = path.join(__dirname, 'verification.js');
        if (fs.existsSync(verificationPath)) {
            try {
                const verification = require(verificationPath);
                if (verification?.data?.name && !commandNames.has(verification.data.name)) {
                    commandNames.add(verification.data.name);
                    commands.push(verification.data.toJSON());
                    console.log('✅ Loaded: verification (root)');
                }
            } catch (error) {
                console.log('⚠️ Could not load verification.js:', error.message);
            }
        }
        
        // Load commands from src/commands
        const commandsDir = path.join(__dirname, 'src', 'commands');
        if (fs.existsSync(commandsDir)) {
            console.log('🔄 Loading commands from src/commands...');
            loadCommands(commandsDir);
        }
        
        console.log(`📋 Total unique commands: ${commands.length}`);
        console.log(`📝 Command names: ${Array.from(commandNames).sort().join(', ')}`);
        
        if (commands.length === 0) {
            console.log('❌ No commands found to deploy!');
            return;
        }
        
        // Deploy to Discord
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);
        
        console.log('🚀 Deploying commands to Discord...');
        
        const data = await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands }
        );
        
        console.log(`✅ Successfully deployed ${data.length} commands globally!`);
        console.log('🎉 All commands are now available in Discord!');
        console.log('🧪 Test with: /ping, /help, /play, /ticket');
        
    } catch (error) {
        console.error('❌ Deployment failed:', error);
        
        if (error.code === 50035) {
            console.log('💡 This is likely a duplicate name error. Checking for duplicates...');
            const duplicates = [];
            const seen = new Set();
            for (const cmd of commands) {
                if (seen.has(cmd.name)) {
                    duplicates.push(cmd.name);
                } else {
                    seen.add(cmd.name);
                }
            }
            if (duplicates.length > 0) {
                console.log('🔍 Found duplicates:', duplicates);
            }
        }
    }
}

deployCommands();
