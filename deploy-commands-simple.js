#!/usr/bin/env node
/**
 * Simple command deployment script for Pi
 */

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Validate environment
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN not found in .env file');
    process.exit(1);
}

if (!process.env.CLIENT_ID) {
    console.error('❌ CLIENT_ID not found in .env file');
    process.exit(1);
}

const commands = [];

// Load commands from src/commands directory
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
                if (command.data && command.data.name) {
                    commands.push(command.data.toJSON());
                    console.log(`✅ Loaded: ${command.data.name}`);
                }
            } catch (error) {
                console.log(`⚠️ Skipped ${file}: ${error.message}`);
            }
        }
    }
}

// Load verification command from root if exists
const verificationPath = path.join(__dirname, 'verification.js');
if (fs.existsSync(verificationPath)) {
    try {
        const command = require(verificationPath);
        if (command.data && command.data.name) {
            commands.push(command.data.toJSON());
            console.log(`✅ Loaded: ${command.data.name} (from root)`);
        }
    } catch (error) {
        console.log(`⚠️ Skipped verification.js: ${error.message}`);
    }
}

async function deployCommands() {
    try {
        console.log('🔄 Loading commands...');
        
        const commandsPath = path.join(__dirname, 'src', 'commands');
        if (fs.existsSync(commandsPath)) {
            loadCommands(commandsPath);
        }
        
        console.log(`📋 Found ${commands.length} commands`);
        
        if (commands.length === 0) {
            console.log('⚠️ No commands found to deploy');
            return;
        }
        
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        
        console.log('🚀 Deploying commands...');
        
        if (process.env.GUILD_ID) {
            // Deploy to specific guild (faster for testing)
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log(`✅ Successfully deployed ${commands.length} commands to guild ${process.env.GUILD_ID}`);
        } else {
            // Deploy globally (takes up to 1 hour)
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
            console.log(`✅ Successfully deployed ${commands.length} commands globally`);
            console.log('⏰ Global commands may take up to 1 hour to appear');
        }
        
    } catch (error) {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    }
}

deployCommands();
