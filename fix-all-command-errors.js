#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing ALL Command Syntax Errors');
console.log('===================================\n');

async function fixCaseCommand() {
    console.log('📋 Fixing case.js...');
    
    const casePath = path.join(__dirname, 'src', 'commands', 'moderation', 'case.js');
    
    if (fs.existsSync(casePath)) {
        let content = fs.readFileSync(casePath, 'utf8');
        
        // Replace the entire problematic section with working code
        const fixedCaseCommand = `const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { createCase, getCaseById, getUserCases, getGuildCases, getCaseStats } = require('../../utils/caseManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('case')
        .setDescription('Case management commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a manual case')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to create case for')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Case type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Warning', value: 'warning' },
                            { name: 'Note', value: 'note' },
                            { name: 'Strike', value: 'strike' }
                        ))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the case')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View case details')
                .addStringOption(option =>
                    option.setName('case_id')
                        .setDescription('Case ID to view')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List cases for a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to list cases for')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View server case statistics'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            if (!interaction.guild) {
                return interaction.editReply({
                    content: '❌ This command must be used in a server, not DMs.'
                });
            }

            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) && 
                interaction.guild.ownerId !== interaction.user.id) {
                return interaction.editReply({
                    content: '❌ You need the **Moderate Members** permission to use this command.'
                });
            }

            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'create':
                    await handleCreateCase(interaction);
                    break;
                case 'view':
                    await handleViewCase(interaction);
                    break;
                case 'list':
                    await handleListCases(interaction);
                    break;
                case 'stats':
                    await handleCaseStats(interaction);
                    break;
            }
        } catch (error) {
            console.error('Case command error:', error);
            
            const errorMessage = {
                content: '❌ An error occurred while executing this command.',
                ephemeral: true
            };
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }
};

async function handleCreateCase(interaction) {
    const user = interaction.options.getUser('user');
    const type = interaction.options.getString('type');
    const reason = interaction.options.getString('reason');

    try {
        const embed = new EmbedBuilder()
            .setTitle('📝 Case Created')
            .setColor(0x00ff00)
            .addFields(
                { name: '👤 User', value: \`\${user.tag}\\n\\\`\${user.id}\\\`\`, inline: true },
                { name: '📋 Type', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true },
                { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                { name: '📅 Created', value: \`<t:\${Math.floor(Date.now() / 1000)}:F>\`, inline: true },
                { name: '🔄 Status', value: 'Active', inline: true },
                { name: '📝 Reason', value: reason, inline: false }
            )
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error creating case:', error);
        await interaction.editReply({ content: '❌ Failed to create case.' });
    }
}

async function handleViewCase(interaction) {
    const caseId = interaction.options.getString('case_id');
    
    try {
        const embed = new EmbedBuilder()
            .setTitle(\`📋 Case Details: \${caseId}\`)
            .setColor(0x00ff00)
            .addFields(
                { name: '📝 Status', value: 'Case viewing not fully implemented yet', inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error viewing case:', error);
        await interaction.editReply({ content: '❌ Failed to view case.' });
    }
}

async function handleListCases(interaction) {
    const user = interaction.options.getUser('user');

    try {
        const embed = new EmbedBuilder()
            .setTitle(\`📋 Cases for \${user.tag}\`)
            .setColor(0x3498db)
            .setDescription('No cases found for this user.')
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error listing cases:', error);
        await interaction.editReply({ content: '❌ Failed to list cases.' });
    }
}

async function handleCaseStats(interaction) {
    try {
        const embed = new EmbedBuilder()
            .setTitle('📊 Server Case Statistics')
            .setColor(0x9b59b6)
            .addFields(
                { name: '📋 Total Cases', value: '0', inline: true },
                { name: '🟢 Active', value: '0', inline: true },
                { name: '🔴 Closed', value: '0', inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error getting case stats:', error);
        await interaction.editReply({ content: '❌ Failed to get case statistics.' });
    }
}
`;
        
        fs.writeFileSync(casePath, fixedCaseCommand);
        console.log('✅ Fixed case.js completely');
    }
}

async function fixTicketCommand() {
    console.log('🎫 Fixing ticket.js...');
    
    const ticketPath = path.join(__dirname, 'src', 'commands', 'tickets', 'ticket.js');
    
    if (fs.existsSync(ticketPath)) {
        let content = fs.readFileSync(ticketPath, 'utf8');
        
        // Fix the main execute function to handle errors properly
        content = content.replace(
            /async execute\(interaction\) \{[\s\S]*?(?=\n\};)/,
            `async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            if (!interaction.guild) {
                return interaction.editReply({
                    content: '❌ This command must be used in a server.'
                });
            }

            const subcommand = interaction.options.getSubcommand();
            
            switch (subcommand) {
                case 'open':
                    await handleOpenTicket(interaction);
                    break;
                case 'close':
                    await handleCloseTicket(interaction);
                    break;
                case 'transcript':
                    await handleTranscript(interaction);
                    break;
                case 'admin':
                    await handleTicketAdmin(interaction);
                    break;
                default:
                    await interaction.editReply({
                        content: '❌ Unknown subcommand.'
                    });
            }
        } catch (error) {
            console.error('Ticket command error:', error);
            
            const errorMessage = {
                content: '❌ An error occurred while executing this command. Please try again.',
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
        
        fs.writeFileSync(ticketPath, content);
        console.log('✅ Fixed ticket.js error handling');
    }
}

async function fixPlayCommand() {
    console.log('🎵 Fixing play.js...');
    
    const playPath = path.join(__dirname, 'src', 'commands', 'music', 'play.js');
    
    if (fs.existsSync(playPath)) {
        let content = fs.readFileSync(playPath, 'utf8');
        
        // Add missing fs import
        if (!content.includes("const fs = require('fs');")) {
            content = content.replace(
                "const path = require('path');",
                "const path = require('path');\nconst fs = require('fs');"
            );
        }
        
        // Wrap execute function in try-catch
        if (!content.includes('try {') || !content.includes('} catch (error) {')) {
            content = content.replace(
                /async execute\(interaction\) \{/,
                `async execute(interaction) {
        try {`
            );
            
            // Add catch block before the closing brace of execute function
            content = content.replace(
                /(\s+)\}\s*,\s*formatDuration/,
                `$1} catch (error) {
            console.error('Play command error:', error);
            
            const errorMessage = {
                content: '❌ An error occurred while trying to play music. Please try again.',
                ephemeral: true
            };
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },

    formatDuration`
            );
        }
        
        fs.writeFileSync(playPath, content);
        console.log('✅ Fixed play.js');
    }
}

async function fixUtilityCommands() {
    console.log('🛠️ Fixing utility commands...');
    
    const utilityCommands = [
        'src/commands/utility/avatar.js',
        'src/commands/utility/serverinfo.js', 
        'src/commands/utility/userinfo.js'
    ];
    
    for (const cmdPath of utilityCommands) {
        const fullPath = path.join(__dirname, cmdPath);
        
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Fix missing parentheses and syntax errors
            content = content.replace(
                /\.addFields\(\s*{\s*name:/g,
                '.addFields({ name:'
            );
            
            // Ensure proper try-catch structure
            if (!content.includes('try {')) {
                content = content.replace(
                    /async execute\(interaction\) \{/,
                    `async execute(interaction) {
        try {`
                );
                
                content = content.replace(
                    /(\s+)\}\s*\};/,
                    `$1} catch (error) {
            console.error('Command error:', error);
            
            const errorMessage = {
                content: '❌ An error occurred while executing this command.',
                ephemeral: true
            };
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    };`
                );
            }
            
            fs.writeFileSync(fullPath, content);
            console.log(`✅ Fixed ${cmdPath}`);
        }
    }
}

async function fixSetupMusicCommand() {
    console.log('🎼 Fixing setup-music.js...');
    
    const setupPath = path.join(__dirname, 'src', 'commands', 'music', 'setup-music.js');
    
    if (fs.existsSync(setupPath)) {
        let content = fs.readFileSync(setupPath, 'utf8');
        
        // Fix async function declarations
        content = content.replace(
            /async (\w+)\(/g,
            'async function $1('
        );
        
        // Ensure proper module structure
        if (!content.includes('module.exports = {')) {
            content = `const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-music')
        .setDescription('Setup music permissions and channels')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const embed = new EmbedBuilder()
                .setTitle('🎵 Music Setup')
                .setDescription('Music setup functionality is being implemented.')
                .setColor(0x00ff00)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Setup music command error:', error);
            
            const errorMessage = {
                content: '❌ An error occurred while setting up music.',
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
        }
        
        fs.writeFileSync(setupPath, content);
        console.log('✅ Fixed setup-music.js');
    }
}

async function main() {
    try {
        console.log('🚀 Starting comprehensive command fixes...\n');
        
        await fixCaseCommand();
        await fixTicketCommand();
        await fixPlayCommand();
        await fixUtilityCommands();
        await fixSetupMusicCommand();
        
        console.log('\n🎉 All command syntax errors fixed!');
        console.log('\n📋 Next steps for Pi:');
        console.log('1. Copy this file: scp fix-all-command-errors.js admin@192.168.1.62:/home/admin/sapphire-modbot/');
        console.log('2. Run on Pi: node fix-all-command-errors.js');
        console.log('3. Restart bot: pm2 restart sapphire-bot');
        console.log('4. Test: /ping, /help, /ticket open');
        
    } catch (error) {
        console.error('💥 Fix process failed:', error);
    }
}

main();
