const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;

async function fixDuplicates() {
    try {
        console.log('🔍 Step 1: Fetching current commands...\n');

        // Get all registered commands
        const registeredCommands = await rest.get(
            Routes.applicationCommands(clientId)
        );

        console.log(`📋 Found ${registeredCommands.length} registered commands:\n`);
        
        // Group commands by name to find duplicates
        const commandsByName = new Map();
        
        registeredCommands.forEach(cmd => {
            if (!commandsByName.has(cmd.name)) {
                commandsByName.set(cmd.name, []);
            }
            commandsByName.get(cmd.name).push(cmd);
        });

        // Find and display duplicates
        const duplicates = [];
        commandsByName.forEach((cmds, name) => {
            if (cmds.length > 1) {
                duplicates.push({ name, count: cmds.length, commands: cmds });
                console.log(`⚠️  DUPLICATE: /${name} (${cmds.length} copies)`);
                cmds.forEach((cmd, index) => {
                    console.log(`   ${index + 1}. ID: ${cmd.id} | Created: ${new Date(cmd.created_timestamp).toLocaleString()}`);
                });
            } else {
                console.log(`✅ /${name} (unique)`);
            }
        });

        if (duplicates.length === 0) {
            console.log('\n✅ No duplicates found! Your commands are clean.');
            return;
        }

        console.log(`\n🗑️  Step 2: Clearing ALL commands to remove duplicates...\n`);

        // Clear all commands
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: [] }
        );

        console.log('✅ All commands cleared!\n');

        console.log('📦 Step 3: Re-registering commands from source files...\n');

        // Load commands from files
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
                        // Clear require cache to get fresh data
                        delete require.cache[require.resolve(filePath)];
                        
                        const command = require(filePath);
                        if (command.data && command.execute) {
                            const commandName = command.data.name;
                            
                            if (commandNames.has(commandName)) {
                                console.log(`⚠️  Skipping duplicate in source: ${commandName} (${filePath})`);
                                continue;
                            }
                            
                            commandNames.add(commandName);
                            commands.push(command.data.toJSON());
                            console.log(`✅ Loaded: /${commandName}`);
                        }
                    } catch (error) {
                        console.error(`❌ Error loading ${file}:`, error.message);
                    }
                }
            }
        }

        const commandsPath = path.join(__dirname, 'src', 'commands');
        if (fs.existsSync(commandsPath)) {
            loadCommands(commandsPath);
        }

        console.log(`\n📋 Total unique commands loaded: ${commands.length}\n`);

        // Re-register commands
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );

        console.log(`✅ Successfully registered ${data.length} commands!\n`);

        console.log('📋 Registered commands:');
        data.forEach(cmd => {
            console.log(`  /${cmd.name} - ${cmd.description}`);
        });

        console.log('\n✅ DONE! All duplicates removed and commands re-registered.');
        console.log('⏱️  Commands will be available globally within 1 hour.');
        console.log('💡 Restart your bot to apply changes: pm2 restart skyfall-bot');

    } catch (error) {
        console.error('❌ Error fixing duplicates:', error);
        console.error('Stack:', error.stack);
    }
}

fixDuplicates();
