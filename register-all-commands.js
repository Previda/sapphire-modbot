#!/usr/bin/env node

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Registering ALL Commands to Discord');
console.log('====================================\n');

async function registerAllCommands() {
    const commands = [];
    const commandNames = new Set();
    
    console.log('📋 Loading commands...\n');
    
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
                        if (commandNames.has(command.data.name)) {
                            console.log(`⚠️ Skipping duplicate: ${command.data.name}`);
                            continue;
                        }
                        
                        commandNames.add(command.data.name);
                        commands.push(command.data.toJSON());
                        console.log(`✅ ${command.data.name} (${category || 'root'})`);
                    }
                } catch (error) {
                    console.log(`❌ Error loading ${file}: ${error.message}`);
                }
            }
        }
    }
    
    // Load verification command from root
    const verificationPath = path.join(__dirname, 'verification.js');
    if (fs.existsSync(verificationPath)) {
        try {
            const command = require(verificationPath);
            if (command?.data?.name) {
                commands.push(command.data.toJSON());
                console.log(`✅ ${command.data.name} (root)`);
            }
        } catch (error) {
            console.log(`❌ Error loading verification.js: ${error.message}`);
        }
    }
    
    // Load all commands from src/commands
    const commandsPath = path.join(__dirname, 'src', 'commands');
    if (fs.existsSync(commandsPath)) {
        loadCommands(commandsPath);
    }
    
    console.log(`\n📊 Total commands to register: ${commands.length}`);
    
    if (commands.length === 0) {
        console.error('❌ No commands found to register!');
        return false;
    }
    
    // Get credentials
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;
    
    if (!token || !clientId) {
        console.error('❌ Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in .env file');
        return false;
    }
    
    console.log(`\n🔑 Using Client ID: ${clientId}`);
    console.log(`🔑 Token length: ${token.length} characters`);
    
    try {
        const rest = new REST({ version: '10' }).setToken(token);
        
        console.log('\n🧹 Clearing existing commands...');
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        
        console.log('🚀 Registering new commands...');
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );
        
        console.log(`\n✅ Successfully registered ${data.length} commands globally!`);
        console.log('\n📝 Registered commands:');
        data.forEach(cmd => {
            console.log(`   /${cmd.name} - ${cmd.description}`);
        });
        
        console.log('\n🎉 Command registration complete!');
        console.log('💡 Commands will appear in Discord within 1-5 minutes');
        console.log('🧪 Test: /ping, /help, /play, /ticket, /avatar');
        
        return true;
        
    } catch (error) {
        console.error('❌ Command registration failed:', error);
        return false;
    }
}

registerAllCommands();
