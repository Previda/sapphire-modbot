#!/usr/bin/env node
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

console.log('🚀 Final Command Deployment - All 60+ Commands');

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
    console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID in .env');
    process.exit(1);
}

const commands = [];
const commandNames = new Set();

function loadCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            try {
                // Clear require cache
                delete require.cache[require.resolve(path.resolve(filePath))];
                const command = require(path.resolve(filePath));
                
                if (command.data && command.data.name) {
                    // Skip duplicates
                    if (commandNames.has(command.data.name)) {
                        console.log(`⚠️ Skipped duplicate: ${command.data.name}`);
                        continue;
                    }
                    
                    commandNames.add(command.data.name);
                    commands.push(command.data.toJSON());
                    console.log(`✅ ${command.data.name}`);
                }
            } catch (error) {
                if (!error.message.includes('File is not defined')) {
                    console.log(`⚠️ Skipped ${file}: ${error.message}`);
                }
            }
        }
    }
}

async function clearAndDeploy() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    try {
        // Step 1: Clear existing commands
        console.log('🧹 Clearing existing commands...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );
        console.log('✅ Existing commands cleared');
        
        // Step 2: Load all commands
        console.log('\n📋 Loading commands...');
        loadCommands('./src/commands');
        
        // Load verification command
        if (fs.existsSync('./verification.js') && !commandNames.has('verification')) {
            try {
                const command = require('./verification.js');
                if (command.data) {
                    commands.push(command.data.toJSON());
                    console.log(`✅ verification`);
                }
            } catch (error) {
                console.log(`⚠️ Skipped verification: ${error.message}`);
            }
        }
        
        console.log(`\n📊 Total unique commands: ${commands.length}`);
        
        // Step 3: Deploy new commands
        console.log('\n🚀 Deploying commands globally...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        
        console.log(`\n✅ SUCCESS! Deployed ${commands.length} commands globally!`);
        console.log('⏰ Commands will appear in Discord within 1 hour');
        console.log('\n📋 Deployed commands:');
        commands.forEach((cmd, i) => {
            console.log(`   ${i + 1}. /${cmd.name} - ${cmd.description}`);
        });
        
        console.log('\n🎯 Test commands:');
        console.log('   • /ping - Check bot latency');
        console.log('   • /help - Show all commands');
        console.log('   • /play [song] - Play music');
        console.log('   • /setup - Configure bot');
        
    } catch (error) {
        console.error('\n❌ Deployment failed:', error);
        if (error.code === 50035) {
            console.log('\n💡 This usually means duplicate command names.');
            console.log('📋 Commands that were attempted:', commands.map(c => c.name).join(', '));
        }
        process.exit(1);
    }
}

clearAndDeploy();
