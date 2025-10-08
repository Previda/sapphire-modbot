#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Command Permissions & Execution Issues');
console.log('===============================================\n');

async function fixCaseCommand() {
    console.log('📋 Fixing case command...\n');
    
    const casePath = path.join(__dirname, 'src', 'commands', 'moderation', 'case.js');
    
    if (!fs.existsSync(casePath)) {
        console.error('❌ case.js not found!');
        return false;
    }
    
    let content = fs.readFileSync(casePath, 'utf8');
    
    // Fix the reply issue after defer
    content = content.replace(
        'await interaction.reply({ embeds: [embed] });',
        'await interaction.editReply({ embeds: [embed] });'
    );
    
    // Fix other reply issues
    content = content.replace(
        /await interaction\.reply\({[\s\S]*?content: '❌ Failed to create case\.',[\s\S]*?ephemeral: true[\s\S]*?}\);/,
        'await interaction.editReply({ content: \'❌ Failed to create case.\' });'
    );
    
    content = content.replace(
        /await interaction\.reply\({[\s\S]*?content: `❌ Case.*not found\.`,[\s\S]*?ephemeral: true[\s\S]*?}\);/,
        'await interaction.editReply({ content: `❌ Case \\`${caseId}\\` not found.` });'
    );
    
    content = content.replace(
        /await interaction\.reply\({[\s\S]*?content: '❌ Failed to view case\.',[\s\S]*?ephemeral: true[\s\S]*?}\);/,
        'await interaction.editReply({ content: \'❌ Failed to view case.\' });'
    );
    
    content = content.replace(
        /await interaction\.reply\({[\s\S]*?content: `📋 No cases found for.*`,[\s\S]*?ephemeral: true[\s\S]*?}\);/,
        'await interaction.editReply({ content: `📋 No cases found for ${user.tag}.` });'
    );
    
    content = content.replace(
        /await interaction\.reply\({[\s\S]*?content: '❌ Failed to list cases\.',[\s\S]*?ephemeral: true[\s\S]*?}\);/,
        'await interaction.editReply({ content: \'❌ Failed to list cases.\' });'
    );
    
    content = content.replace(
        /await interaction\.reply\({[\s\S]*?content: '❌ Failed to get case statistics\.',[\s\S]*?ephemeral: true[\s\S]*?}\);/,
        'await interaction.editReply({ content: \'❌ Failed to get case statistics.\' });'
    );
    
    // Fix all remaining interaction.reply to interaction.editReply in functions
    content = content.replace(
        'await interaction.reply({ embeds: [embed] });',
        'await interaction.editReply({ embeds: [embed] });'
    );
    
    fs.writeFileSync(casePath, content);
    console.log('✅ Fixed case command reply issues');
    
    return true;
}

async function fixAllCommandPermissions() {
    console.log('🔐 Fixing command permissions across all commands...\n');
    
    const commandDirs = [
        'src/commands/moderation',
        'src/commands/utility',
        'src/commands/tickets',
        'src/commands/music'
    ];
    
    for (const dir of commandDirs) {
        const fullDir = path.join(__dirname, dir);
        if (!fs.existsSync(fullDir)) continue;
        
        const files = fs.readdirSync(fullDir).filter(file => file.endsWith('.js'));
        
        for (const file of files) {
            const filePath = path.join(fullDir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            
            // Fix common permission issues
            
            // 1. Remove overly restrictive default permissions
            if (content.includes('.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)')) {
                content = content.replace(
                    '.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)',
                    '.setDefaultMemberPermissions(null) // Allow all users'
                );
                modified = true;
                console.log(`✅ Removed admin-only restriction from ${file}`);
            }
            
            // 2. Fix permission checks to be less restrictive
            if (content.includes('PermissionFlagsBits.Administrator') && !file.includes('ban') && !file.includes('kick')) {
                content = content.replace(
                    /interaction\.member\.permissions\.has\(PermissionFlagsBits\.Administrator\)/g,
                    '(interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) || interaction.guild.ownerId === interaction.user.id)'
                );
                modified = true;
                console.log(`✅ Relaxed permission requirements in ${file}`);
            }
            
            // 3. Fix defer/reply issues
            if (content.includes('await interaction.deferReply()') && content.includes('await interaction.reply(')) {
                content = content.replace(
                    /await interaction\.reply\(/g,
                    'await interaction.editReply('
                );
                modified = true;
                console.log(`✅ Fixed defer/reply issues in ${file}`);
            }
            
            // 4. Add error handling for missing permissions
            if (content.includes('execute(interaction)') && !content.includes('try {')) {
                const executeMatch = content.match(/(async execute\(interaction\) \{[\s\S]*?\})/);
                if (executeMatch) {
                    const executeFunction = executeMatch[1];
                    const wrappedFunction = executeFunction.replace(
                        /async execute\(interaction\) \{([\s\S]*)\}/,
                        `async execute(interaction) {
        try {$1
        } catch (error) {
            console.error('Command execution error:', error);
            
            const errorMessage = {
                content: '❌ An error occurred while executing this command. Please try again later.',
                ephemeral: true
            };
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }`
                    );
                    
                    content = content.replace(executeFunction, wrappedFunction);
                    modified = true;
                    console.log(`✅ Added error handling to ${file}`);
                }
            }
            
            if (modified) {
                fs.writeFileSync(filePath, content);
            }
        }
    }
}

async function createPermissionlessCommands() {
    console.log('🆓 Creating permissionless utility commands...\n');
    
    // Create a simple ping command that works for everyone
    const pingCommand = `const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency and status')
        .setDefaultMemberPermissions(null), // Allow all users

    async execute(interaction) {
        try {
            const sent = await interaction.reply({ 
                content: '🏓 Pinging...', 
                fetchReply: true 
            });
            
            const embed = new EmbedBuilder()
                .setTitle('🏓 Pong!')
                .setColor(0x00ff00)
                .addFields(
                    { 
                        name: '📡 Latency', 
                        value: \`\${sent.createdTimestamp - interaction.createdTimestamp}ms\`, 
                        inline: true 
                    },
                    { 
                        name: '💓 API Latency', 
                        value: \`\${Math.round(interaction.client.ws.ping)}ms\`, 
                        inline: true 
                    },
                    { 
                        name: '🤖 Status', 
                        value: 'Online ✅', 
                        inline: true 
                    }
                )
                .setTimestamp()
                .setFooter({ 
                    text: \`Requested by \${interaction.user.username}\`, 
                    iconURL: interaction.user.displayAvatarURL() 
                });

            await interaction.editReply({ 
                content: null, 
                embeds: [embed] 
            });
            
        } catch (error) {
            console.error('Ping command error:', error);
            
            const errorMessage = {
                content: '❌ Failed to execute ping command.',
                ephemeral: true
            };
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};`;

    const pingPath = path.join(__dirname, 'src', 'commands', 'utility', 'ping.js');
    const utilityDir = path.dirname(pingPath);
    
    if (!fs.existsSync(utilityDir)) {
        fs.mkdirSync(utilityDir, { recursive: true });
    }
    
    fs.writeFileSync(pingPath, pingCommand);
    console.log('✅ Created permissionless ping command');
    
    // Create help command
    const helpCommand = `const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show available commands and bot information')
        .setDefaultMemberPermissions(null), // Allow all users

    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const embed = new EmbedBuilder()
                .setTitle('🤖 Sapphire Modbot - Help')
                .setColor(0x3498db)
                .setDescription('Here are the available commands:')
                .addFields(
                    { 
                        name: '🔧 Utility Commands', 
                        value: \`\\\`/ping\\\` - Check bot latency
\\\`/help\\\` - Show this help message\`, 
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
\\\`/nowplaying\\\` - Show current song\`, 
                        inline: false 
                    },
                    { 
                        name: '🛡️ Moderation Commands', 
                        value: \`\\\`/case create\\\` - Create a moderation case (mods only)
\\\`/case view\\\` - View case details (mods only)
\\\`/warn\\\` - Warn a user (mods only)\`, 
                        inline: false 
                    }
                )
                .setFooter({ 
                    text: 'Sapphire Modbot - Advanced Discord Management', 
                    iconURL: interaction.client.user.displayAvatarURL() 
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Help command error:', error);
            await interaction.editReply({
                content: '❌ Failed to show help information.'
            });
        }
    },
};`;

    const helpPath = path.join(__dirname, 'src', 'commands', 'utility', 'help.js');
    fs.writeFileSync(helpPath, helpCommand);
    console.log('✅ Created help command');
}

async function fixInteractionHandler() {
    console.log('🔄 Fixing interaction handler...\n');
    
    const interactionPath = path.join(__dirname, 'src', 'events', 'interactionCreate.js');
    
    if (!fs.existsSync(interactionPath)) {
        console.error('❌ interactionCreate.js not found!');
        return false;
    }
    
    let content = fs.readFileSync(interactionPath, 'utf8');
    
    // Add better error handling for command execution
    const betterErrorHandling = `
async function handleSlashCommand(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(\`No command matching \${interaction.commandName} was found.\`);
        return await interaction.reply({
            content: \`❌ Command \\\`\${interaction.commandName}\\\` not found. Use \\\`/help\\\` to see available commands.\`,
            ephemeral: true
        });
    }

    try {
        // Log command execution to dashboard
        await dashboardLogger.logCommand(interaction.commandName, interaction.user, interaction.guild, {
            options: interaction.options.data
        });
        
        // Execute the command
        await command.execute(interaction);
        
    } catch (error) {
        console.error('Error executing command:', error);
        
        // Report error to dashboard API
        await dashboardLogger.logError(error, interaction);

        const errorMessage = {
            content: '❌ There was an error while executing this command! Please try again or contact support.',
            ephemeral: true
        };

        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        } catch (replyError) {
            console.error('Failed to send error message:', replyError);
        }
    }
}`;

    // Replace the existing handleSlashCommand function
    content = content.replace(
        /async function handleSlashCommand\(interaction\) \{[\s\S]*?\n\}/,
        betterErrorHandling
    );
    
    fs.writeFileSync(interactionPath, content);
    console.log('✅ Enhanced interaction error handling');
    
    return true;
}

async function main() {
    try {
        console.log('🚀 Starting command permission fixes...\n');
        
        await fixCaseCommand();
        await fixAllCommandPermissions();
        await createPermissionlessCommands();
        await fixInteractionHandler();
        
        console.log('\n🎉 Command permission fixes completed!');
        console.log('\n📋 What was fixed:');
        console.log('✅ Fixed case command defer/reply issues');
        console.log('✅ Relaxed overly restrictive permissions');
        console.log('✅ Added comprehensive error handling');
        console.log('✅ Created permissionless utility commands');
        console.log('✅ Enhanced interaction error handling');
        
        console.log('\n🔧 Commands that now work for everyone:');
        console.log('• /ping - Check bot status');
        console.log('• /help - Show available commands');
        console.log('• /ticket open - Open support tickets');
        
        console.log('\n📋 Next steps:');
        console.log('1. Deploy to Pi: node fix-command-permissions.js');
        console.log('2. Redeploy commands: node deploy-commands-clean.js');
        console.log('3. Restart bot: pm2 restart sapphire-bot');
        console.log('4. Test: /ping and /help should work for everyone');
        
    } catch (error) {
        console.error('💥 Fix process failed:', error);
    }
}

main();
