const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { createCase } = require('../../utils/caseManager');
const webhookLogger = require('../../utils/webhookLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('⏰ Timeout a member (remove them from chat)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The member to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes (1-10080, max 7 days)')
                .setMinValue(1)
                .setMaxValue(10080)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('silent')
                .setDescription('Don\'t send DM to user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const silent = interaction.options.getBoolean('silent') || false;

        // Defer reply for moderation actions
        await interaction.deferReply({ ephemeral: silent });

        try {
            const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
            
            if (!member) {
                return interaction.reply({ 
                    content: '❌ User not found in this server.', 
                    ephemeral: true 
                });
            }

            // Permission checks
            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.reply({ content: '❌ You cannot timeout this member due to role hierarchy.', ephemeral: true });
            }
            if (!member.moderatable) {
                return interaction.reply({ content: '❌ I cannot timeout this member.', ephemeral: true });
            }

            // Create case
            const newCase = await createCase({
                type: 'timeout',
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                guildId: interaction.guild.id,
                reason: reason,
                status: 'active',
                appealable: true,
                duration: duration
            });

            // Send DM to user (unless silent)
            let dmSent = false;
            if (!silent) {
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle('⏰ You have been timed out')
                        .setColor(0xff6600)
                        .addFields(
                            { name: '🏢 Server', value: interaction.guild.name, inline: true },
                            { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                            { name: '⏱️ Duration', value: `${duration} minutes`, inline: true },
                            { name: '📝 Reason', value: reason, inline: false },
                            { name: '📋 Appeal', value: `Use \`/appeal submit case_id:${newCase.caseId}\` if you believe this is unfair`, inline: false }
                        )
                        .setTimestamp();

                    await targetUser.send({ embeds: [dmEmbed] });
                    dmSent = true;
                } catch (error) {
                    console.log(`Could not DM user ${targetUser.tag}: ${error.message}`);
                }
            }

            // Execute the timeout
            const timeoutUntil = new Date(Date.now() + (duration * 60 * 1000));
            await member.timeout(duration * 60 * 1000, `${reason} | Moderator: ${interaction.user.tag} | Case: ${newCase.caseId}`);

            // Create response embed
            const embed = new EmbedBuilder()
                .setTitle('⏰ Member Timed Out')
                .setColor(0xff6600)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag}\n\`${targetUser.id}\``, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                    { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                    { name: '⏱️ Duration', value: `${duration} minutes`, inline: true },
                    { name: '⏰ Expires', value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:R>`, inline: true },
                    { name: '💬 DM Sent', value: dmSent ? '✅ Yes' : '❌ No', inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Log to webhook if configured
            await webhookLogger.logModAction(interaction.guild.id, 'timeout', {
                targetTag: targetUser.tag,
                targetId: targetUser.id,
                moderatorTag: interaction.user.tag,
                moderatorId: interaction.user.id,
                caseId: newCase.caseId,
                reason: reason,
                duration: `${duration} minutes`
            });

            // Log to mod channel if configured
            const modLogChannelId = process.env.MOD_LOG_CHANNEL_ID;
            if (modLogChannelId) {
                const modLogChannel = interaction.guild.channels.cache.get(modLogChannelId);
                if (modLogChannel) {
                    await modLogChannel.send({ embeds: [embed] });
                }
            }

        } catch (error) {
            console.error('Timeout command error:', error);
            console.error('Error stack:', error.stack);
            
            let errorMessage = '❌ Failed to timeout the user. ';
            
            if (error.code === 50013) {
                errorMessage += 'Missing permissions - I need "Moderate Members" permission.';
            } else if (error.code === 50001) {
                errorMessage += 'Missing access - Cannot access this user or channel.';
            } else if (error.message.includes('Missing Permissions')) {
                errorMessage += 'I don\'t have permission to timeout this user.';
            } else if (error.message.includes('Cannot timeout')) {
                errorMessage += 'This user cannot be timed out (they may have higher permissions).';
            } else if (error.message.includes('ENOENT') || error.message.includes('data')) {
                errorMessage += 'Database error - could not save case data.';
            } else {
                errorMessage += `Error: ${error.message}`;
            }
            
            const isDeferred = interaction.deferred || interaction.replied;
            if (isDeferred) {
                await interaction.editReply({
                    content: errorMessage
                });
            } else {
                await interaction.reply({
                    content: errorMessage,
                    ephemeral: true
                });
            }
        }
    }
};
