const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { loadGuildConfig, saveGuildConfig } = require('../../utils/configManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('🚀 Auto-setup everything for your server instantly!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        try {
            const guild = interaction.guild;
            const config = await loadGuildConfig(guild.id);

            const statusEmbed = new EmbedBuilder()
                .setTitle('🚀 Setting Up Your Server...')
                .setDescription('Please wait while I configure everything automatically...')
                .setColor('#3498db')
                .setTimestamp();

            await interaction.editReply({ embeds: [statusEmbed] });

            // Step 1: Create category
            const category = await guild.channels.create({
                name: '📋 Bot Logs',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    }
                ]
            });

            // Step 2: Create log channels
            const modLogs = await guild.channels.create({
                name: '👮-mod-logs',
                type: ChannelType.GuildText,
                parent: category.id,
                topic: 'Moderation action logs (bans, kicks, warns, etc.)'
            });

            const appealLogs = await guild.channels.create({
                name: '📋-appeal-logs',
                type: ChannelType.GuildText,
                parent: category.id,
                topic: 'Appeal submissions and reviews'
            });

            const ticketLogs = await guild.channels.create({
                name: '🎫-ticket-logs',
                type: ChannelType.GuildText,
                parent: category.id,
                topic: 'Ticket transcripts and logs'
            });

            const serverLogs = await guild.channels.create({
                name: '📊-server-logs',
                type: ChannelType.GuildText,
                parent: category.id,
                topic: 'Server events (joins, leaves, role changes, etc.)'
            });

            // Step 3: Create verified role
            const verifiedRole = await guild.roles.create({
                name: '✅ Verified',
                color: '#00ff00',
                reason: 'Auto-created by bot setup'
            });

            // Step 4: Create verification channel
            const verifyChannel = await guild.channels.create({
                name: '🔐-verify',
                type: ChannelType.GuildText,
                topic: 'Click the button to verify and access the server',
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                        deny: [PermissionFlagsBits.SendMessages]
                    },
                    {
                        id: verifiedRole.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: guild.members.me.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    }
                ]
            });

            // Step 5: Send verification panel
            const verifyEmbed = new EmbedBuilder()
                .setTitle('🔐 Server Verification')
                .setDescription(
                    '**Welcome to the server!**\n\n' +
                    'To access all channels, please verify yourself by clicking the button below.\n\n' +
                    '**Why verify?**\n' +
                    '• Protects against bots and spam\n' +
                    '• Ensures you\'re a real person\n' +
                    '• Keeps our community safe\n\n' +
                    '**Click the button below to get started!**'
                )
                .setColor('#00ff00')
                .setFooter({ text: 'This is a one-time verification' })
                .setTimestamp();

            const verifyButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('verify_button')
                        .setLabel('Verify')
                        .setEmoji('✅')
                        .setStyle(ButtonStyle.Success)
                );

            await verifyChannel.send({ embeds: [verifyEmbed], components: [verifyButton] });

            // Step 6: Update config
            config.modLogChannel = modLogs.id;
            config.appealLogChannel = appealLogs.id;
            config.ticketLogChannel = ticketLogs.id;
            config.serverLogChannel = serverLogs.id;
            config.verifiedRole = verifiedRole.id;
            config.verificationChannel = verifyChannel.id;
            config.verificationEnabled = false; // Disabled by default
            config.appealsEnabled = true;

            await saveGuildConfig(guild.id, config);

            // Step 7: Send success message
            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Setup Complete!')
                .setDescription('Your server has been configured automatically!')
                .setColor('#00ff00')
                .addFields(
                    { name: '📁 Category', value: `${category}`, inline: false },
                    { name: '👮 Mod Logs', value: `${modLogs}`, inline: true },
                    { name: '📋 Appeal Logs', value: `${appealLogs}`, inline: true },
                    { name: '🎫 Ticket Logs', value: `${ticketLogs}`, inline: true },
                    { name: '📊 Server Logs', value: `${serverLogs}`, inline: true },
                    { name: '🔐 Verify Channel', value: `${verifyChannel}`, inline: true },
                    { name: '✅ Verified Role', value: `${verifiedRole}`, inline: true }
                )
                .addFields({
                    name: '📝 What\'s Next?',
                    value: 
                        '**Verification (Optional):**\n' +
                        '• Enable: `/setup-complete verification enabled:true`\n' +
                        '• Lock other channels from @everyone\n' +
                        '• Allow only Verified role to see channels\n\n' +
                        '**Appeals:**\n' +
                        '• Configure questions: `/appeal-config edit-questions`\n\n' +
                        '**Tickets:**\n' +
                        '• Create panel: `/panel`\n\n' +
                        '**Permissions:**\n' +
                        '• Check: `/fix-permissions`',
                    inline: false
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Setup error:', error);
            await interaction.editReply({
                content: `❌ Setup failed: ${error.message}\n\nPlease check bot permissions and try again.`
            });
        }
    }
};
