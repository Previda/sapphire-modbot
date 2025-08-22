const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// Superuser whitelist - hardcoded for security
const SUPERUSER_ID = '1340043754048061582';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('superuser')
        .setDescription('Superuser-only administrative commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('status')
                .setDescription('Check superuser status'))
        .addSubcommand(sub =>
            sub.setName('emergency')
                .setDescription('Emergency bot controls')
                .addStringOption(opt =>
                    opt.setName('action')
                        .setDescription('Emergency action')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Restart Bot', value: 'restart' },
                            { name: 'Clear Cache', value: 'cache' },
                            { name: 'Force Sync', value: 'sync' }
                        )))
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add another superuser')
                .addUserOption(opt =>
                    opt.setName('user')
                        .setDescription('User to grant superuser access')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all superusers'))
        .addSubcommand(sub =>
            sub.setName('alias')
                .setDescription('Create command alias')
                .addStringOption(opt =>
                    opt.setName('original')
                        .setDescription('Original command name')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('alias')
                        .setDescription('Alias name for the command')
                        .setRequired(true))),

    async execute(interaction) {
        // Check if user is the superuser
        if (interaction.user.id !== SUPERUSER_ID) {
            return interaction.reply({
                content: '❌ Access denied. This command is restricted to authorized personnel only.',
                ephemeral: true
            });
        }

        let subcommand;
        try {
            subcommand = interaction.options.getSubcommand();
        } catch (error) {
            // No subcommand provided, show available actions
            const embed = new EmbedBuilder()
                .setTitle('👑 Superuser Commands')
                .setColor(0xffd700)
                .setDescription('Available superuser actions:')
                .addFields(
                    { name: '/superuser status', value: 'Check superuser status and bot info', inline: false },
                    { name: '/superuser emergency', value: 'Emergency bot controls (restart, cache, sync)', inline: false },
                    { name: '/superuser add', value: 'Add another superuser', inline: false },
                    { name: '/superuser list', value: 'List all superusers', inline: false },
                    { name: '/superuser alias', value: 'Create command aliases', inline: false }
                )
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            if (subcommand === 'status') {
                const embed = new EmbedBuilder()
                    .setTitle('👑 Superuser Status')
                    .setColor(0xffd700)
                    .addFields(
                        { name: '🆔 User ID', value: interaction.user.id, inline: true },
                        { name: '✅ Access Level', value: 'SUPERUSER', inline: true },
                        { name: '🏠 Guild', value: interaction.guild.name, inline: true },
                        { name: '🤖 Bot Status', value: 'Online', inline: true },
                        { name: '📊 Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
                        { name: '👥 Users', value: `${interaction.client.users.cache.size}`, inline: true },
                        { name: '⚡ Commands', value: `${interaction.client.commands.size}`, inline: true },
                        { name: '🏓 Latency', value: `${interaction.client.ws.ping}ms`, inline: true },
                        { name: '⏱️ Uptime', value: `<t:${Math.floor((Date.now() - interaction.client.uptime) / 1000)}:R>`, inline: true }
                    )
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });

            } else if (subcommand === 'emergency') {
                const action = interaction.options.getString('action');

                const embed = new EmbedBuilder()
                    .setTitle('🚨 Emergency Action Executed')
                    .setColor(0xff0000)
                    .addFields(
                        { name: '⚡ Action', value: action.toUpperCase(), inline: true },
                        { name: '👤 Executed By', value: `<@${interaction.user.id}>`, inline: true },
                        { name: '📅 Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setTimestamp();

                if (action === 'restart') {
                    embed.setDescription('🔄 Bot restart initiated...');
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    
                    // Log the restart
                    console.log(`🚨 EMERGENCY RESTART initiated by superuser ${interaction.user.tag}`);
                    
                    // Graceful shutdown
                    setTimeout(() => {
                        process.exit(0);
                    }, 2000);

                } else if (action === 'cache') {
                    embed.setDescription('🗑️ Cache cleared successfully');
                    
                    // Clear various caches
                    interaction.client.users.cache.clear();
                    interaction.client.channels.cache.clear();
                    
                    await interaction.reply({ embeds: [embed], ephemeral: true });

                } else if (action === 'sync') {
                    embed.setDescription('🔄 Force sync completed');
                    
                    // Force sync guild data
                    await interaction.guild.members.fetch();
                    await interaction.guild.channels.fetch();
                    
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }

            } else if (subcommand === 'add') {
                const user = interaction.options.getUser('user');
                
                const embed = new EmbedBuilder()
                    .setTitle('👑 Superuser Management')
                    .setColor(0xffd700)
                    .setDescription(`🔧 This feature is not yet implemented.\n\nTo add ${user.tag} as superuser, manually add their ID to the SUPERUSER_ID array in the code.`)
                    .addFields(
                        { name: '👤 Target User', value: `${user.tag}`, inline: true },
                        { name: '🆔 User ID', value: user.id, inline: true }
                    )
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed], ephemeral: true });

            } else if (subcommand === 'list') {
                const embed = new EmbedBuilder()
                    .setTitle('👑 Superuser List')
                    .setColor(0xffd700)
                    .addFields(
                        { name: '👤 Primary Superuser', value: `<@${SUPERUSER_ID}>`, inline: false },
                        { name: '🆔 User ID', value: SUPERUSER_ID, inline: false }
                    )
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed], ephemeral: true });

            } else if (subcommand === 'alias') {
                const original = interaction.options.getString('original');
                const alias = interaction.options.getString('alias');
                
                const embed = new EmbedBuilder()
                    .setTitle('🔗 Command Alias')
                    .setColor(0x3498db)
                    .setDescription('⚠️ Command alias functionality is not yet implemented.')
                    .addFields(
                        { name: '📝 Original Command', value: `/${original}`, inline: true },
                        { name: '🏷️ Alias', value: `/${alias}`, inline: true },
                        { name: '💡 Note', value: 'This feature requires bot restart to take effect.', inline: false }
                    )
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

        } catch (error) {
            console.error('Superuser command error:', error);
            await interaction.reply({
                content: '❌ Emergency command failed to execute.',
                ephemeral: true
            });
        }
    }
};
