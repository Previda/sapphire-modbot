const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { createCase } = require('../../utils/caseManager');
const webhookLogger = require('../../utils/webhookLogger');

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
                return interaction.editReply({
                    content: '❌ Could not find a banned user with that ID or username.'
                });
            }

            // Check if user is actually banned
            try {
                await interaction.guild.bans.fetch(userId);
            } catch (error) {
                return interaction.editReply({
                    content: '❌ User is not banned from this server.'
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

            // Send DM to user if possible
            let dmSent = false;
            let inviteLink = null;
            if (targetUser) {
                try {
                    // Generate server invite
                    try {
                        const textChannels = interaction.guild.channels.cache.filter(c => c.type === 0);
                        const generalChannel = textChannels.find(c => 
                            c.name.includes('general') || 
                            c.name.includes('welcome') || 
                            c.name.includes('lobby')
                        ) || textChannels.first();
                        
                        if (generalChannel) {
                            const invite = await generalChannel.createInvite({
                                maxAge: 604800, // 7 days
                                maxUses: 1, // Single use
                                unique: true,
                                reason: `Unban invite for ${targetUser.tag}`
                            });
                            inviteLink = invite.url;
                        }
                    } catch (inviteError) {
                        console.log(`Could not create invite: ${inviteError.message}`);
                    }

                    const dmEmbed = new EmbedBuilder()
                        .setTitle('🔓 You have been unbanned')
                        .setColor(0x00ff00)
                        .addFields(
                            { name: '🏢 Server', value: interaction.guild.name, inline: true },
                            { name: '🆔 Server ID', value: interaction.guild.id, inline: true },
                            { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                            { name: '📝 Reason', value: reason, inline: false }
                        )
                        .setTimestamp();

                    const components = [];
                    if (inviteLink) {
                        dmEmbed.addFields({ name: '🔗 Rejoin Server', value: 'Click the button below to rejoin the server', inline: false });
                        
                        const inviteButton = {
                            type: 1,
                            components: [{
                                type: 2,
                                style: 5, // Link style
                                label: '🔗 Rejoin Server',
                                url: inviteLink
                            }]
                        };
                        components.push(inviteButton);
                    }

                    await targetUser.send({ 
                        embeds: [dmEmbed],
                        components: components
                    });
                    dmSent = true;
                } catch (error) {
                    console.log(`Could not DM user ${targetUser.tag}: ${error.message}`);
                }
            }

            // Create response embed
            const embed = new EmbedBuilder()
                .setTitle('🔓 Member Unbanned')
                .setColor(0x00ff00)
                .addFields(
                    { name: '👤 User', value: targetUser ? `${targetUser.tag}\n\`${targetUser.id}\`` : `\`${userId}\``, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                    { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                    { name: '📝 Reason', value: reason, inline: false },
                    { name: '💬 DM Sent', value: dmSent ? '✅ Yes' : '❌ No', inline: true },
                    { name: '🔗 Invite Created', value: inviteLink ? '✅ Yes' : '❌ No', inline: true }
                )
                .setThumbnail(targetUser ? targetUser.displayAvatarURL() : null)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Log to webhook if configured
            await webhookLogger.logModAction(interaction.guild.id, 'unban', {
                targetTag: targetUser ? targetUser.tag : 'Unknown User',
                targetId: userId,
                moderatorTag: interaction.user.tag,
                moderatorId: interaction.user.id,
                caseId: newCase.caseId,
                reason: reason
            });

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
            await interaction.editReply({
                content: '❌ Failed to unban the user. Please check my permissions.',
                ephemeral: true
            });
        }
    }
};
