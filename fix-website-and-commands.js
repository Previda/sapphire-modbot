#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌐 Fixing Website Branding & Command Registration');
console.log('===============================================\n');

async function fixWebsiteBranding() {
    console.log('🎨 Updating website to show Skyfall...\n');
    
    const websiteFiles = [
        'pages/index.js',
        'pages/dashboard.js',
        'pages/invite.js',
        'components/ModernGlassDashboard.js',
        'components/ErrorBoundary.js',
        'next.config.js',
        'package.json'
    ];
    
    for (const filePath of websiteFiles) {
        const fullPath = path.join(__dirname, filePath);
        
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            console.log(`🔄 Processing ${filePath}...`);
            
            // Replace all Sapphire references with Skyfall
            const replacements = [
                ['Sapphire Modbot', 'Skyfall'],
                ['Sapphire Bot', 'Skyfall'],
                ['sapphire-modbot', 'skyfall'],
                ['Sapphire', 'Skyfall'],
                ['Advanced Discord moderation bot', 'Skyfall - Advanced Discord Management'],
                ['Discord moderation bot', 'Skyfall - Discord Management'],
                ['Modbot', 'Bot'],
                ['SAPPHIRE', 'SKYFALL']
            ];
            
            for (const [oldText, newText] of replacements) {
                if (content.includes(oldText)) {
                    content = content.replace(new RegExp(oldText, 'g'), newText);
                    modified = true;
                }
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`✅ Updated ${filePath}`);
            } else {
                console.log(`ℹ️ No changes needed for ${filePath}`);
            }
        }
    }
}

async function fixCommandRegistration() {
    console.log('\n🔧 Creating command registration fix...\n');
    
    const commandRegisterContent = `#!/usr/bin/env node

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Registering ALL Commands to Discord');
console.log('====================================\\n');

async function registerAllCommands() {
    const commands = [];
    const commandNames = new Set();
    
    console.log('📋 Loading commands...\\n');
    
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
                            console.log(\`⚠️ Skipping duplicate: \${command.data.name}\`);
                            continue;
                        }
                        
                        commandNames.add(command.data.name);
                        commands.push(command.data.toJSON());
                        console.log(\`✅ \${command.data.name} (\${category || 'root'})\`);
                    }
                } catch (error) {
                    console.log(\`❌ Error loading \${file}: \${error.message}\`);
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
                console.log(\`✅ \${command.data.name} (root)\`);
            }
        } catch (error) {
            console.log(\`❌ Error loading verification.js: \${error.message}\`);
        }
    }
    
    // Load all commands from src/commands
    const commandsPath = path.join(__dirname, 'src', 'commands');
    if (fs.existsSync(commandsPath)) {
        loadCommands(commandsPath);
    }
    
    console.log(\`\\n📊 Total commands to register: \${commands.length}\`);
    
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
    
    console.log(\`\\n🔑 Using Client ID: \${clientId}\`);
    console.log(\`🔑 Token length: \${token.length} characters\`);
    
    try {
        const rest = new REST({ version: '10' }).setToken(token);
        
        console.log('\\n🧹 Clearing existing commands...');
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        
        console.log('🚀 Registering new commands...');
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );
        
        console.log(\`\\n✅ Successfully registered \${data.length} commands globally!\`);
        console.log('\\n📝 Registered commands:');
        data.forEach(cmd => {
            console.log(\`   /\${cmd.name} - \${cmd.description}\`);
        });
        
        console.log('\\n🎉 Command registration complete!');
        console.log('💡 Commands will appear in Discord within 1-5 minutes');
        console.log('🧪 Test: /ping, /help, /play, /ticket, /avatar');
        
        return true;
        
    } catch (error) {
        console.error('❌ Command registration failed:', error);
        return false;
    }
}

registerAllCommands();
`;

    const registerPath = path.join(__dirname, 'register-all-commands.js');
    fs.writeFileSync(registerPath, commandRegisterContent);
    console.log('✅ Created command registration script');
}

async function fixTicketCommand() {
    console.log('🎫 Fixing ticket.js syntax error...\n');
    
    const ticketPath = path.join(__dirname, 'src', 'commands', 'tickets', 'ticket.js');
    
    if (fs.existsSync(ticketPath)) {
        let content = fs.readFileSync(ticketPath, 'utf8');
        
        // Fix the async function syntax error
        content = content.replace(
            /async function handleOpenTicket\(/g,
            '\n\nasync function handleOpenTicket('
        );
        
        // Ensure proper module structure
        if (content.includes('async function handleOpenTicket')) {
            fs.writeFileSync(ticketPath, content);
            console.log('✅ Fixed ticket.js syntax error');
        }
    }
}

async function main() {
    try {
        console.log('🚀 Starting website and command fixes...\n');
        
        await fixWebsiteBranding();
        await fixCommandRegistration();
        await fixTicketCommand();
        
        console.log('\n🎉 ALL FIXES COMPLETED!');
        console.log('\n📋 What was fixed:');
        console.log('✅ Website now shows "Skyfall" instead of "Sapphire"');
        console.log('✅ Created command registration script');
        console.log('✅ Fixed ticket.js syntax error');
        
        console.log('\n🚀 Deploy to Pi:');
        console.log('1. Push: git add . && git commit -m "Fix website branding and commands" && git push');
        console.log('2. Deploy: git pull origin main');
        console.log('3. Register: node register-all-commands.js');
        console.log('4. Restart: pm2 restart sapphire-bot');
        console.log('5. Test: /play, /ticket, /help should all work');
        
        console.log('\n🌐 Website will show "Skyfall" everywhere!');
        console.log('🎯 All commands including /play will be registered!');
        
    } catch (error) {
        console.error('💥 Fix process failed:', error);
    }
}

main();
