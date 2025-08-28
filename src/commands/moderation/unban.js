const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createCase, getCaseById, updateCase } = require('../../utils/caseManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('🔓 Unban a user from the server')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('User ID or username to unban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the unban')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const userInput = interaction.options.getString('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Defer reply for moderation actions
        await interaction.deferReply();

        try {
            let targetUser = null;
            let userId = null;

            // Try to parse as user ID first
            if (/^\d{17,19}$/.test(userInput)) {
                userId = userInput;
                try {
                    targetUser = await interaction.client.users.fetch(userId);
                } catch (error) {
                    // User not found but we can still try to unban by ID
                }
            } else {
                // Try to find by username
                const bans = await interaction.guild.bans.fetch();
                const bannedUser = bans.find(ban => 
                    ban.user.username.toLowerCase() === userInput.toLowerCase() ||
                    ban.user.tag.toLowerCase() === userInput.toLowerCase()
                );
                
                if (bannedUser) {
                    targetUser = bannedUser.user;
                    userId = bannedUser.user.id;
                }
            }

            if (!userId) {
                return interaction.reply({
                    content: '❌ Could not find a banned user with that ID or username.',
                    ephemeral: true
                });
            }

            // Check if user is actually banned
            try {
                await interaction.guild.bans.fetch(userId);
            } catch (error) {
                return interaction.reply({
                    content: '❌ User is not banned from this server.',
                    ephemeral: true
                });
            }

            // Create unban case
            const newCase = await createCase({
                type: 'unban',
                userId: userId,
                moderatorId: interaction.user.id,
                guildId: interaction.guild.id,
                reason: reason,
                status: 'active',
                appealable: false
            });

            // Execute the unban
            await interaction.guild.bans.remove(userId, `${reason} | Moderator: ${interaction.user.tag} | Case: ${newCase.caseId}`);

            // Create response embed
            const embed = new EmbedBuilder()
                .setTitle('🔓 Member Unbanned')
                .setColor(0x00ff00)
                .addFields(
                    { name: '👤 User', value: targetUser ? `${targetUser.tag}\n\`${targetUser.id}\`` : `\`${userId}\``, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                    { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setThumbnail(targetUser ? targetUser.displayAvatarURL() : null)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Send DM to unbanned user if possible
            if (targetUser) {
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle('🔓 You have been unbanned')
                        .setColor(0x00ff00)
                        .addFields(
                            { name: '🏢 Server', value: interaction.guild.name, inline: true },
                            { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                            { name: '📝 Reason', value: reason, inline: false },
                            { name: '🎉 Welcome Back', value: 'You can now rejoin the server if you wish.', inline: false }
                        )
                        .setTimestamp();

                    await targetUser.send({ embeds: [dmEmbed] });
                } catch (error) {
                    console.log(`Could not DM user ${targetUser.tag}: ${error.message}`);
                }
            }

            // Log to mod channel if configured
            const modLogChannelId = process.env.MOD_LOG_CHANNEL_ID;
            if (modLogChannelId) {
                const modLogChannel = interaction.guild.channels.cache.get(modLogChannelId);
                if (modLogChannel) {
                    await modLogChannel.send({ embeds: [embed] });
                }
            }

        } catch (error) {
            console.error('Unban command error:', error);
            await interaction.reply({
                content: '❌ Failed to unban the user. Please check my permissions.',
                ephemeral: true
            });
        }
    }
};
