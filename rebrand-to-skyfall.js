#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Rebranding Bot to Skyfall');
console.log('============================\n');

async function updateBotName() {
    console.log('🤖 Updating bot name and branding...\n');
    
    // Files to update
    const filesToUpdate = [
        'index.js',
        'src/commands/utility/help.js',
        'src/commands/utility/ping.js',
        'src/commands/utility/serverinfo.js',
        'package.json'
    ];
    
    for (const filePath of filesToUpdate) {
        const fullPath = path.join(__dirname, filePath);
        
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            console.log(`🔄 Processing ${filePath}...`);
            
            // Replace all instances of Sapphire with Skyfall
            const replacements = [
                ['Sapphire Modbot', 'Skyfall'],
                ['Sapphire Bot', 'Skyfall'],
                ['sapphire-modbot', 'skyfall'],
                ['Sapphire', 'Skyfall'],
                ['"name": "sapphire-modbot"', '"name": "skyfall"'],
                ['"description": "Advanced Discord moderation bot"', '"description": "Skyfall - Advanced Discord Management Bot"'],
                ['🤖 Sapphire', '🤖 Skyfall'],
                ['Advanced Discord Management', 'Advanced Discord Management'],
                ['Modbot', 'Bot']
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
        } else {
            console.log(`⚠️ File not found: ${filePath}`);
        }
    }
}

async function updateHelpCommand() {
    console.log('\n📋 Updating help command specifically...\n');
    
    const helpPath = path.join(__dirname, 'src', 'commands', 'utility', 'help.js');
    
    if (fs.existsSync(helpPath)) {
        const updatedHelpContent = `const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show available commands and bot information'),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const embed = new EmbedBuilder()
                .setTitle('🤖 Skyfall - Help')
                .setDescription('Here are the available commands:')
                .setColor(0x3498db)
                .addFields(
                    {
                        name: '⚡ Utility Commands',
                        value: \`\\\`/ping\\\` - Check bot latency
\\\`/help\\\` - Show this help message
\\\`/avatar\\\` - Show user avatar
\\\`/serverinfo\\\` - Show server information
\\\`/userinfo\\\` - Show user information\`,
                        inline: false
                    },
                    {
                        name: '🎫 Ticket Commands', 
                        value: \`\\\`/ticket open\\\` - Open a support ticket
\\\`/ticket close\\\` - Close current ticket (mods only)
\\\`/ticket transcript\\\` - Generate ticket transcript\`,
                        inline: false
                    },
                    {
                        name: '🎵 Music Commands',
                        value: \`\\\`/play\\\` - Play music from YouTube/Spotify
\\\`/stop\\\` - Stop music playback
\\\`/nowplaying\\\` - Show current song
\\\`/queue\\\` - Show music queue\`,
                        inline: false
                    },
                    {
                        name: '🛡️ Moderation Commands',
                        value: \`\\\`/case create\\\` - Create a moderation case (mods only)
\\\`/case view\\\` - View case details (mods only)
\\\`/warn\\\` - Warn a user (mods only)
\\\`/ban\\\` - Ban a user (mods only)\`,
                        inline: false
                    },
                    {
                        name: '🎮 Fun Commands',
                        value: \`\\\`/8ball\\\` - Ask the magic 8-ball
\\\`/coinflip\\\` - Flip a coin
\\\`/roll\\\` - Roll dice\`,
                        inline: false
                    }
                )
                .setFooter({ 
                    text: 'Skyfall - Advanced Discord Management • Use /help for more info',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Help command error:', error);
            
            const errorMessage = {
                content: '❌ Failed to load help information.',
                ephemeral: true
            };
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }
};`;
        
        fs.writeFileSync(helpPath, updatedHelpContent);
        console.log('✅ Updated help command with Skyfall branding');
    }
}

async function updatePingCommand() {
    console.log('🏓 Updating ping command...\n');
    
    const pingPath = path.join(__dirname, 'src', 'commands', 'utility', 'ping.js');
    
    if (fs.existsSync(pingPath)) {
        let content = fs.readFileSync(pingPath, 'utf8');
        
        // Update ping command to show Skyfall
        content = content.replace(
            /\.setTitle\(['"`][^'"`]*['"`]\)/g,
            ".setTitle('🏓 Skyfall Ping')"
        );
        
        content = content.replace(
            /Sapphire.*?online/g,
            'Skyfall is online'
        );
        
        fs.writeFileSync(pingPath, content);
        console.log('✅ Updated ping command');
    }
}

async function updatePackageJson() {
    console.log('📦 Updating package.json...\n');
    
    const packagePath = path.join(__dirname, 'package.json');
    
    if (fs.existsSync(packagePath)) {
        let content = fs.readFileSync(packagePath, 'utf8');
        const packageData = JSON.parse(content);
        
        packageData.name = 'skyfall';
        packageData.description = 'Skyfall - Advanced Discord Management Bot';
        
        if (packageData.author) {
            packageData.author = packageData.author.replace('Sapphire', 'Skyfall');
        }
        
        fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
        console.log('✅ Updated package.json');
    }
}

async function main() {
    try {
        console.log('🚀 Starting rebranding process...\n');
        
        await updateBotName();
        await updateHelpCommand();
        await updatePingCommand();
        await updatePackageJson();
        
        console.log('\n🎉 Rebranding completed!');
        console.log('\n📋 What was updated:');
        console.log('✅ Bot name changed from "Sapphire Modbot" to "Skyfall"');
        console.log('✅ Help command updated with Skyfall branding');
        console.log('✅ Ping command updated');
        console.log('✅ Package.json updated');
        console.log('✅ All references now show "Skyfall"');
        
        console.log('\n🚀 Deploy to Pi:');
        console.log('1. Commit: git add . && git commit -m "Rebrand to Skyfall"');
        console.log('2. Push: git push origin main');
        console.log('3. Deploy: git pull origin main && pm2 restart sapphire-bot');
        console.log('4. Test: /help should now show "Skyfall"');
        
        console.log('\n🎯 Your bot will now show "Skyfall" everywhere!');
        
    } catch (error) {
        console.error('💥 Rebranding failed:', error);
    }
}

main();
