const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkperms')
        .setDescription('🔐 Check bot permissions in this server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const botMember = interaction.guild.members.me;
            const permissions = botMember.permissions;

            // Check critical permissions
            const criticalPerms = {
                'Administrator': PermissionFlagsBits.Administrator,
                'Kick Members': PermissionFlagsBits.KickMembers,
                'Ban Members': PermissionFlagsBits.BanMembers,
                'Timeout Members': PermissionFlagsBits.ModerateMembers,
                'Manage Channels': PermissionFlagsBits.ManageChannels,
                'Manage Roles': PermissionFlagsBits.ManageRoles,
                'Manage Messages': PermissionFlagsBits.ManageMessages,
                'Send Messages': PermissionFlagsBits.SendMessages,
                'Embed Links': PermissionFlagsBits.EmbedLinks,
                'Attach Files': PermissionFlagsBits.AttachFiles,
                'Manage Webhooks': PermissionFlagsBits.ManageWebhooks,
                'View Audit Log': PermissionFlagsBits.ViewAuditLog
            };

            let hasAdmin = permissions.has(PermissionFlagsBits.Administrator);
            let missingPerms = [];
            let hasPerms = [];

            for (const [name, flag] of Object.entries(criticalPerms)) {
                if (permissions.has(flag)) {
                    hasPerms.push(`✅ ${name}`);
                } else {
                    missingPerms.push(`❌ ${name}`);
                }
            }

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle('🔐 Bot Permission Check')
                .setColor(hasAdmin ? 0x00ff00 : (missingPerms.length > 0 ? 0xff0000 : 0xffff00))
                .addFields(
                    { 
                        name: '🤖 Bot Info', 
                        value: `**Name:** ${botMember.user.tag}\n**ID:** ${botMember.id}\n**Highest Role:** ${botMember.roles.highest.name}`, 
                        inline: false 
                    }
                );

            if (hasAdmin) {
                embed.addFields({
                    name: '✅ Administrator Permission',
                    value: 'Bot has Administrator permission - all commands will work!',
                    inline: false
                });
            }

            if (hasPerms.length > 0) {
                embed.addFields({
                    name: '✅ Granted Permissions',
                    value: hasPerms.join('\n'),
                    inline: true
                });
            }

            if (missingPerms.length > 0) {
                embed.addFields({
                    name: '❌ Missing Permissions',
                    value: missingPerms.join('\n'),
                    inline: true
                });

                embed.addFields({
                    name: '⚠️ Warning',
                    value: 'Some commands may not work without these permissions!\n\n**Fix:** Give bot Administrator role or grant missing permissions.',
                    inline: false
                });
            }

            // Add role position info
            const highestRole = interaction.guild.roles.highest;
            const botRolePosition = botMember.roles.highest.position;
            const totalRoles = interaction.guild.roles.cache.size;

            embed.addFields({
                name: '📊 Role Hierarchy',
                value: `**Bot Role Position:** ${botRolePosition}/${totalRoles}\n**Can Moderate:** ${botRolePosition > 1 ? '✅ Yes' : '❌ No (role too low)'}`,
                inline: false
            });

            // Add recommendations
            if (!hasAdmin && missingPerms.length > 0) {
                embed.addFields({
                    name: '💡 Recommendation',
                    value: '**Option 1:** Give bot a role with Administrator permission (easiest)\n**Option 2:** Grant all missing permissions individually\n**Option 3:** Re-invite bot with proper permissions',
                    inline: false
                });

                embed.addFields({
                    name: '🔗 Re-invite Link',
                    value: `[Click here to re-invite with Administrator](https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands)`,
                    inline: false
                });
            }

            embed.setTimestamp();
            embed.setFooter({ text: 'Use /help for command list' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Check perms error:', error);
            await interaction.editReply({
                content: '❌ Failed to check permissions.'
            });
        }
    }
};
