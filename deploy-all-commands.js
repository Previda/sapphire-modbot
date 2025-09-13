#!/usr/bin/env node

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Enhanced command deployment script with comprehensive error handling
class CommandDeployer {
    constructor() {
        this.commands = [];
        this.errors = [];
        this.skipped = [];
        this.deploymentStats = {
            total: 0,
            successful: 0,
            failed: 0,
            skipped: 0
        };
    }

    validateEnvironment() {
        const required = ['DISCORD_TOKEN', 'CLIENT_ID'];
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        console.log('✅ Environment variables validated');
        console.log(`🤖 Client ID: ${process.env.CLIENT_ID}`);
        console.log(`🏠 Guild ID: ${process.env.GUILD_ID || 'Global deployment'}`);
    }

    validateCommand(command) {
        // Check required properties
        if (!command.data || !command.execute) {
            return { valid: false, error: 'Missing data or execute property' };
        }

        const commandData = command.data.toJSON();
        
        // Validate command name
        if (!commandData.name || commandData.name.length < 1 || commandData.name.length > 32) {
            return { valid: false, error: 'Invalid command name length' };
        }

        // Validate description
        if (!commandData.description || commandData.description.length < 1 || commandData.description.length > 100) {
            return { valid: false, error: 'Invalid description length' };
        }

        // Validate options ordering (required options must come before optional ones)
        if (commandData.options && commandData.options.length > 0) {
            let foundOptional = false;
            for (const option of commandData.options) {
                if (!option.required) {
                    foundOptional = true;
                } else if (foundOptional) {
                    return {
                        valid: false,
                        error: `Required option "${option.name}" found after optional options`
                    };
                }
            }
        }

        return { valid: true };
    }

    loadCommandsFromDirectory(dir) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                this.loadCommandsFromDirectory(filePath);
            } else if (file.endsWith('.js') && !file.includes('backup') && !file.includes('-old')) {
                try {
                    // Clear cache for fresh load
                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);
                    
                    const validation = this.validateCommand(command);
                    if (validation.valid) {
                        const commandData = command.data.toJSON();
                        this.commands.push(commandData);
                        console.log(`✅ Loaded: ${commandData.name} (${commandData.description})`);
                    } else {
                        this.skipped.push(`⚠️ ${file}: ${validation.error}`);
                        console.log(`⚠️ Skipped ${file}: ${validation.error}`);
                    }
                } catch (error) {
                    this.errors.push(`❌ ${file}: ${error.message}`);
                    console.error(`❌ Error loading ${file}:`, error.message);
                }
            }
        }
    }

    async deployCommands() {
        try {
            this.validateEnvironment();
            
            console.log('\n🔄 Loading commands with enhanced validation...');
            console.log('🎯 Sapphire Modbot Command Deployment\n');
            
            // Load commands from src/commands directory
            const commandsPath = path.join(__dirname, 'src', 'commands');
            if (!fs.existsSync(commandsPath)) {
                throw new Error(`Commands directory not found: ${commandsPath}`);
            }
            
            this.loadCommandsFromDirectory(commandsPath);
            
            // Display summary
            console.log('\n📊 Load Summary:');
            console.log(`✅ Valid commands: ${this.commands.length}`);
            console.log(`⚠️ Skipped: ${this.skipped.length}`);
            console.log(`❌ Errors: ${this.errors.length}`);
            
            if (this.skipped.length > 0) {
                console.log('\n⚠️ Skipped Commands:');
                this.skipped.forEach(msg => console.log(msg));
            }
            
            if (this.errors.length > 0) {
                console.log('\n❌ Load Errors:');
                this.errors.forEach(error => console.log(error));
            }
            
            if (this.commands.length === 0) {
                throw new Error('No valid commands found to deploy');
            }

            // Initialize REST client
            const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
            
            // Determine deployment type
            const guildId = process.env.GUILD_ID;
            const isGuildDeployment = guildId && guildId.trim() !== '';
            
            if (isGuildDeployment) {
                console.log(`\n🚀 Deploying ${this.commands.length} commands to guild ${guildId}...`);
                console.log('⚡ Guild deployment is instant!');
            } else {
                console.log(`\n🌍 Deploying ${this.commands.length} commands globally...`);
                console.log('⏳ Global deployment may take up to 1 hour...');
            }

            // Deploy commands
            const route = isGuildDeployment 
                ? Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId)
                : Routes.applicationCommands(process.env.CLIENT_ID);

            console.log('\n🔄 Starting deployment...');
            
            const startTime = Date.now();
            const data = await rest.put(route, { body: this.commands });
            const endTime = Date.now();
            
            // Success message
            console.log(`\n🎉 SUCCESS! Deployed ${data.length} commands in ${endTime - startTime}ms`);
            
            if (isGuildDeployment) {
                console.log('✨ Commands are now available in your Discord server!');
                console.log('💡 Type "/" in any channel to see the commands');
            } else {
                console.log('🌐 Commands will be available globally within 1 hour');
                console.log('🔄 Try restarting Discord if commands don\'t appear');
            }
            
            // Display command list
            console.log('\n📋 Deployed Commands:');
            data.forEach(cmd => {
                console.log(`   /${cmd.name} - ${cmd.description}`);
            });
            
            this.deploymentStats.total = this.commands.length;
            this.deploymentStats.successful = data.length;
            
        } catch (error) {
            console.error('\n💥 Deployment failed:', error.message);
            
            if (error.code === 50001) {
                console.log('❌ Bot lacks "applications.commands" scope');
                console.log('🔗 Re-invite bot: https://discord.com/developers/applications');
                console.log('   → OAuth2 → URL Generator → Select "bot" + "applications.commands"');
            } else if (error.code === 50035) {
                console.log('❌ Invalid command structure detected');
                console.log('🔍 Check command validation errors above');
            } else if (error.status === 401) {
                console.log('❌ Invalid bot token');
                console.log('🔑 Check DISCORD_TOKEN in .env file');
            }
            
            process.exit(1);
        }
    }

    displayFinalReport() {
        console.log('\n' + '═'.repeat(50));
        console.log('📊 FINAL DEPLOYMENT REPORT');
        console.log('═'.repeat(50));
        console.log(`🎯 Total Commands: ${this.deploymentStats.total}`);
        console.log(`✅ Successful: ${this.deploymentStats.successful}`);
        console.log(`❌ Failed: ${this.deploymentStats.failed}`);
        console.log(`⚠️ Skipped: ${this.deploymentStats.skipped}`);
        console.log('═'.repeat(50));
        
        if (this.deploymentStats.successful > 0) {
            console.log('🎉 Your Sapphire Modbot is ready to use!');
            console.log('💡 Test with: /ping, /play, /verification setup, /ticket open');
        }
        
        console.log('\n');
    }
}

// Main execution
if (require.main === module) {
    const deployer = new CommandDeployer();
    
    deployer.deployCommands()
        .then(() => {
            deployer.displayFinalReport();
            process.exit(0);
        })
        .catch((error) => {
            console.error('Deployment process failed:', error.message);
            process.exit(1);
        });
}

module.exports = CommandDeployer;
