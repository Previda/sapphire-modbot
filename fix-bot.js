#!/usr/bin/env node

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔧 Sapphire Bot Diagnostic & Fix Tool');
console.log('=====================================\n');

async function runDiagnostics() {
    console.log('🔍 Running bot diagnostics...\n');
    
    // 1. Check environment variables
    console.log('1️⃣ Checking environment variables:');
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;
    
    if (!token) {
        console.error('❌ DISCORD_TOKEN is missing!');
        console.log('💡 Add DISCORD_TOKEN=your_bot_token to .env file');
        return false;
    } else {
        console.log(`✅ DISCORD_TOKEN found (${token.length} chars)`);
    }
    
    if (!clientId) {
        console.error('❌ DISCORD_CLIENT_ID is missing!');
        console.log('💡 Add DISCORD_CLIENT_ID=1358527215020544222 to .env file');
        return false;
    } else {
        console.log(`✅ DISCORD_CLIENT_ID found: ${clientId}`);
    }
    
    // 2. Test Discord API connection
    console.log('\n2️⃣ Testing Discord API connection:');
    try {
        const rest = new REST({ version: '10' }).setToken(token);
        const application = await rest.get(Routes.oauth2CurrentApplication());
        console.log(`✅ Connected to Discord API`);
        console.log(`🤖 Bot name: ${application.name}`);
        console.log(`🆔 Application ID: ${application.id}`);
        
        if (application.id !== clientId) {
            console.error(`❌ CLIENT_ID mismatch! Expected: ${application.id}, Got: ${clientId}`);
            console.log(`💡 Update DISCORD_CLIENT_ID=${application.id} in .env file`);
            return false;
        }
    } catch (error) {
        console.error('❌ Discord API connection failed:', error.message);
        if (error.code === 0) {
            console.log('💡 This usually means invalid bot token');
        }
        return false;
    }
    
    // 3. Check command files
    console.log('\n3️⃣ Checking command files:');
    const commandsPath = path.join(__dirname, 'src', 'commands');
    if (!fs.existsSync(commandsPath)) {
        console.error('❌ Commands directory not found!');
        return false;
    }
    
    const commands = [];
    const commandNames = new Set();
    
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
                            console.log(`⚠️ Duplicate command: ${command.data.name}`);
                            continue;
                        }
                        
                        commandNames.add(command.data.name);
                        commands.push(command.data.toJSON());
                        console.log(`✅ ${command.data.name} (${category || 'root'})`);
                    } else {
                        console.log(`⚠️ Invalid command file: ${file}`);
                    }
                } catch (error) {
                    console.log(`❌ Error loading ${file}: ${error.message}`);
                }
            }
        }
    }
    
    loadCommands(commandsPath);
    console.log(`📋 Found ${commands.length} valid commands`);
    
    if (commands.length === 0) {
        console.error('❌ No valid commands found!');
        return false;
    }
    
    // 4. Deploy commands
    console.log('\n4️⃣ Deploying commands to Discord:');
    try {
        const rest = new REST({ version: '10' }).setToken(token);
        
        console.log('🚀 Registering slash commands...');
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );
        
        console.log(`✅ Successfully deployed ${data.length} commands!`);
        console.log('🎉 Commands should now appear in Discord autocomplete');
        
        // List deployed commands
        console.log('\n📝 Deployed commands:');
        data.forEach(cmd => {
            console.log(`   /${cmd.name} - ${cmd.description}`);
        });
        
    } catch (error) {
        console.error('❌ Command deployment failed:', error.message);
        if (error.code === 50035) {
            console.log('💡 This is usually a validation error in command data');
        }
        return false;
    }
    
    // 5. Test bot permissions
    console.log('\n5️⃣ Checking bot permissions:');
    try {
        const rest = new REST({ version: '10' }).setToken(token);
        const guilds = await rest.get(Routes.userGuilds());
        
        console.log(`✅ Bot is in ${guilds.length} servers`);
        
        for (const guild of guilds.slice(0, 3)) { // Check first 3 servers
            try {
                const botMember = await rest.get(Routes.guildMember(guild.id, clientId));
                const permissions = BigInt(botMember.permissions || 0);
                const hasAdmin = (permissions & BigInt(0x8)) === BigInt(0x8);
                
                console.log(`   ${guild.name}: ${hasAdmin ? '✅ Admin' : '⚠️ Limited'}`);
            } catch (error) {
                console.log(`   ${guild.name}: ❌ Access denied`);
            }
        }
    } catch (error) {
        console.log('⚠️ Could not check server permissions');
    }
    
    return true;
}

async function fixCommonIssues() {
    console.log('\n🔧 Applying common fixes...\n');
    
    // 1. Fix .env file format
    console.log('1️⃣ Checking .env file format:');
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        let modified = false;
        
        // Ensure DISCORD_CLIENT_ID exists
        if (!envContent.includes('DISCORD_CLIENT_ID=')) {
            if (envContent.includes('CLIENT_ID=')) {
                envContent = envContent.replace('CLIENT_ID=', 'DISCORD_CLIENT_ID=');
                modified = true;
                console.log('✅ Fixed CLIENT_ID → DISCORD_CLIENT_ID');
            } else {
                envContent += '\nDISCORD_CLIENT_ID=1358527215020544222\n';
                modified = true;
                console.log('✅ Added DISCORD_CLIENT_ID');
            }
        }
        
        if (modified) {
            fs.writeFileSync(envPath, envContent);
            console.log('💾 Updated .env file');
        } else {
            console.log('✅ .env file looks good');
        }
    } else {
        console.log('❌ .env file not found!');
        const defaultEnv = `# Discord Bot Configuration
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=1358527215020544222

# Pi Configuration
PI_BOT_TOKEN=95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af
PI_BOT_API_URL=http://192.168.1.62:3001
MAX_MEMORY=200
LOG_LEVEL=info
NODE_ENV=production
API_PORT=3001
`;
        fs.writeFileSync(envPath, defaultEnv);
        console.log('✅ Created default .env file');
    }
    
    // 2. Clear require cache
    console.log('\n2️⃣ Clearing Node.js cache:');
    Object.keys(require.cache).forEach(key => {
        if (key.includes('commands') || key.includes('src')) {
            delete require.cache[key];
        }
    });
    console.log('✅ Cleared command cache');
    
    console.log('\n🎉 Fix process completed!');
}

// Main execution
async function main() {
    try {
        await fixCommonIssues();
        const success = await runDiagnostics();
        
        if (success) {
            console.log('\n🎉 All diagnostics passed!');
            console.log('🚀 Your bot should now work properly');
            console.log('\n📋 Next steps:');
            console.log('1. Restart your bot: pm2 restart sapphire-bot');
            console.log('2. Test commands in Discord: /ping');
            console.log('3. Check bot is online in Discord server');
        } else {
            console.log('\n❌ Some issues need manual fixing');
            console.log('💡 Check the errors above and fix them');
        }
    } catch (error) {
        console.error('💥 Diagnostic failed:', error);
    }
}

main();
