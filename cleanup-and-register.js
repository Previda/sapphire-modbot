const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🧹 Cleanup & Re-Registration Script');
console.log('=====================================\n');

// Load config from environment
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
    console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID in .env file!');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

// Commands to KEEP (clean, working commands)
const KEEP_COMMANDS = [
    // New unified commands
    'verify',           // New unified verification
    'ticket',           // New unified tickets
    
    // Essential admin
    'setup',
    'blacklist',
    
    // Moderation
    'ban',
    'kick',
    'mute',
    'unmute',
    'warn',
    'timeout',
    'untimeout',
    'purge',
    'slowmode',
    'lock',
    'unlock',
    
    // Appeals
    'appeal',
    'appeal-config',
    
    // Utility
    'help',
    'ping',
    'serverinfo',
    'userinfo',
    'avatar',
    
    // Fun
    'meme',
    '8ball',
    'roll'
];

// Commands to REMOVE (duplicates, broken, or replaced)
const REMOVE_COMMANDS = [
    'verification',      // Replaced by /verify
    'verify-setup',      // Replaced by /verify
    'panel',             // Replaced by /ticket panel
    'manage',            // Replaced by /ticket
    'tickets',           // Replaced by /ticket
    'test-features',     // Test command
    'stats'              // Duplicate
];

async function main() {
    try {
        console.log('📋 Step 1: Fetching current commands...\n');
        
        // Get current global commands
        const currentCommands = await rest.get(
            Routes.applicationCommands(clientId)
        );
        
        console.log(`Found ${currentCommands.length} registered commands:\n`);
        currentCommands.forEach(cmd => {
            const status = KEEP_COMMANDS.includes(cmd.name) ? '✅ KEEP' :
                          REMOVE_COMMANDS.includes(cmd.name) ? '❌ REMOVE' :
                          '⚠️  UNKNOWN';
            console.log(`  ${status} - ${cmd.name}`);
        });
        
        console.log('\n🗑️  Step 2: Removing old/duplicate commands...\n');
        
        for (const cmd of currentCommands) {
            if (REMOVE_COMMANDS.includes(cmd.name)) {
                try {
                    await rest.delete(
                        Routes.applicationCommand(clientId, cmd.id)
                    );
                    console.log(`  ✅ Deleted: ${cmd.name}`);
                } catch (error) {
                    console.log(`  ❌ Failed to delete ${cmd.name}: ${error.message}`);
                }
            }
        }
        
        console.log('\n📦 Step 3: Loading new commands...\n');
        
        const commands = [];
        const commandsPath = path.join(__dirname, 'src/commands');
        
        function loadCommandsFromDir(dir) {
            const files = fs.readdirSync(dir);
            
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    loadCommandsFromDir(filePath);
                } else if (file.endsWith('.js')) {
                    try {
                        const command = require(filePath);
                        if (command.data && KEEP_COMMANDS.includes(command.data.name)) {
                            commands.push(command.data.toJSON());
                            console.log(`  ✅ Loaded: ${command.data.name}`);
                        }
                    } catch (error) {
                        console.log(`  ❌ Failed to load ${file}: ${error.message}`);
                    }
                }
            }
        }
        
        loadCommandsFromDir(commandsPath);
        
        console.log(`\n📤 Step 4: Registering ${commands.length} commands...\n`);
        
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );
        
        console.log('✅ Commands registered successfully!\n');
        
        console.log('📊 Summary:');
        console.log('=================');
        console.log(`✅ Kept: ${KEEP_COMMANDS.length} commands`);
        console.log(`❌ Removed: ${REMOVE_COMMANDS.length} commands`);
        console.log(`📦 Registered: ${commands.length} commands`);
        
        console.log('\n🎉 Cleanup complete!\n');
        console.log('Next steps:');
        console.log('1. Restart your bot: pm2 restart skyfall-bot');
        console.log('2. Test commands in Discord');
        console.log('3. Use /verify setup for verification');
        console.log('4. Use /ticket setup for tickets\n');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();
