const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const errors = [];
const skipped = [];

// Enhanced function to validate command option ordering
function validateCommandOptions(command) {
    if (!command.options || command.options.length === 0) return { valid: true };
    
    let foundOptional = false;
    for (let i = 0; i < command.options.length; i++) {
        const option = command.options[i];
        const isRequired = option.required === true;
        const isOptional = option.required === false || option.required === undefined;
        
        if (isOptional) {
            foundOptional = true;
        } else if (foundOptional && isRequired) {
            return {
                valid: false,
                error: `Required option "${option.name}" found after optional options`
            };
        }
    }
    return { valid: true };
}

// Function to attempt fixing option ordering
function attemptFixCommand(command) {
    if (!command.options || command.options.length === 0) return command;
    
    // Sort options: required first, then optional
    const sortedOptions = [...command.options].sort((a, b) => {
        const aRequired = a.required === true ? 1 : 0;
        const bRequired = b.required === true ? 1 : 0;
        return bRequired - aRequired; // Required options first
    });
    
    return {
        ...command,
        options: sortedOptions
    };
}

// Function to recursively load commands from a directory
function loadCommands(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js') && !file.includes('backup') && !file.includes('-old')) {
            try {
                // Clear cache to ensure fresh load
                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);
                
                if (command.data && command.execute) {
                    let commandData = command.data.toJSON();
                    
                    // Validate option ordering
                    const validation = validateCommandOptions(commandData);
                    if (!validation.valid) {
                        // Try to fix the command
                        const fixedCommand = attemptFixCommand(commandData);
                        const fixedValidation = validateCommandOptions(fixedCommand);
                        
                        if (fixedValidation.valid) {
                            commands.push(fixedCommand);
                            console.log(`🔧 Fixed & loaded: ${commandData.name} (reordered options)`);
                        } else {
                            skipped.push(`⚠️ ${commandData.name}: ${validation.error}`);
                            console.log(`⚠️ Skipped ${commandData.name}: ${validation.error}`);
                            continue;
                        }
                    } else {
                        commands.push(commandData);
                        console.log(`✅ Loaded: ${commandData.name}`);
                    }
                } else {
                    errors.push(`❌ ${file}: Missing data or execute property`);
                }
            } catch (error) {
                errors.push(`❌ ${file}: ${error.message}`);
                console.error(`❌ Error loading ${file}:`, error.message);
            }
        }
    }
}

async function deployCommands() {
    try {
        console.log('🔄 Loading commands with validation and auto-fix...');
        console.log('🎯 Targeting Raspberry Pi optimization\n');
        
        // Load all commands from src/commands directory
        const commandsPath = path.join(__dirname, 'src', 'commands');
        if (!fs.existsSync(commandsPath)) {
            throw new Error(`Commands directory not found: ${commandsPath}`);
        }
        
        loadCommands(commandsPath);
        
        console.log(`\n📊 Registration Summary:`);
        console.log(`✅ Valid commands: ${commands.length}`);
        console.log(`⚠️ Skipped commands: ${skipped.length}`);
        console.log(`❌ Failed to load: ${errors.length}`);
        
        if (skipped.length > 0) {
            console.log('\n⚠️ Skipped Commands:');
            skipped.forEach(msg => console.log(msg));
        }
        
        if (errors.length > 0) {
            console.log('\n❌ Load Errors:');
            errors.forEach(error => console.log(error));
        }
        
        if (commands.length === 0) {
            throw new Error('No valid commands found to register');
        }
        
        if (!process.env.DISCORD_TOKEN) {
            throw new Error('DISCORD_TOKEN not found in environment variables');
        }
        
        if (!process.env.CLIENT_ID) {
            throw new Error('CLIENT_ID not found in environment variables');
        }
        
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        
        console.log(`\n🚀 Registering ${commands.length} commands globally...`);
        console.log('⏱️ This may take a moment...\n');
        
        try {
            // Try bulk registration first (faster)
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
            
            console.log(`✅ Successfully registered ${data.length} commands globally!`);
            console.log('🎉 All commands are now available across all servers!');
            
        } catch (bulkError) {
            console.log('❌ Bulk registration failed, using individual registration...');
            console.log(`Error: ${bulkError.message}\n`);
            
            let successCount = 0;
            let failCount = 0;
            
            for (const command of commands) {
                try {
                    await rest.post(
                        Routes.applicationCommands(process.env.CLIENT_ID),
                        { body: command }
                    );
                    console.log(`✅ ${command.name}`);
                    successCount++;
                } catch (individualError) {
                    console.error(`❌ ${command.name}: ${individualError.message}`);
                    failCount++;
                }
                
                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            console.log(`\n📊 Individual registration complete:`);
            console.log(`✅ Successful: ${successCount}`);
            console.log(`❌ Failed: ${failCount}`);
            console.log(`📈 Success rate: ${Math.round((successCount / commands.length) * 100)}%`);
        }
        
        console.log('\n🏁 Registration process complete!');
        console.log('💡 Your bot commands should now be available in Discord.');
        console.log('🔄 If commands don\'t appear immediately, try restarting Discord.');
        
    } catch (error) {
        console.error('\n💥 Fatal error during command registration:', error.message);
        console.error('🔍 Check your .env file and ensure DISCORD_TOKEN and CLIENT_ID are set correctly.');
        process.exit(1);
    }
}

// Run the deployment
if (require.main === module) {
    deployCommands().then(() => {
        console.log('🎯 Ready for Raspberry Pi deployment!');
        process.exit(0);
    }).catch((error) => {
        console.error('Registration failed:', error);
        process.exit(1);
    });
}
