const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createCase } = require('../../utils/caseManager');
const webhookLogger = require('../../utils/webhookLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('🦵 Kick a member from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('silent')
                .setDescription('Don\'t send DM to user')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('server_id')
                .setDescription('Server ID (required for DMs)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const silent = interaction.options.getBoolean('silent') || false;
        const serverIdRaw = interaction.options.getString('server_id');

        // Determine guild (from current guild or provided server_id for DMs)
        let guild;
        
        if (interaction.guild) {
            guild = interaction.guild;
        } else if (serverIdRaw) {
            try {
                guild = await interaction.client.guilds.fetch(serverIdRaw);
                if (!guild) {
                    return interaction.reply({
                        content: '❌ Server not found or bot is not in that server.',
                        flags: 64
                    });
                }
            } catch (error) {
                return interaction.reply({
                    content: '❌ Invalid server ID or bot is not in that server.',
                    flags: 64
                });
            }
        } else {
            return interaction.reply({
                content: '❌ When using moderation commands in DMs, please provide the server_id parameter.\nExample: `/kick user:@user server_id:123456789`',
                flags: 64
            });
        }

        // Defer reply for moderation actions
        await interaction.deferReply({ flags: silent ? 64 : 0 });

        try {
            const member = await guild.members.fetch(targetUser.id).catch(() => null);
            
            if (!member) {
                return interaction.reply({ 
                    content: '❌ User not found in this server.', 
                    ephemeral: true 
                });
            }

            // Permission checks (skip hierarchy check in DMs)
            if (member && interaction.guild) {
                if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                    return interaction.editReply({ content: '❌ You cannot kick this member due to role hierarchy.' });
                }
                if (!member.kickable) {
                    return interaction.editReply({ content: '❌ I cannot kick this member.' });
                }
            }

            // Create case
            const newCase = await createCase({
                type: 'kick',
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                guildId: guild.id,
                reason: reason,
                status: 'active',
                appealable: true
            });

            // Send DM to user (unless silent)
            let dmSent = false;
            if (!silent) {
                try {
                    // Generate server invite
                    let inviteLink = null;
                    try {
                        const textChannels = guild.channels.cache.filter(c => c.type === 0);
                        const generalChannel = textChannels.find(c => 
                            c.name.includes('general') || 
                            c.name.includes('welcome') || 
                            c.name.includes('lobby')
                        ) || textChannels.first();
                        
                        if (generalChannel) {
                            const invite = await generalChannel.createInvite({
                                maxAge: 0, // Never expires
                                maxUses: 1, // Single use
                                unique: true,
                                reason: `Rejoin invite for kicked user ${targetUser.tag}`
                            });
                            inviteLink = invite.url;
                        }
                    } catch (inviteError) {
                        console.log(`Could not create invite: ${inviteError.message}`);
                    }

                    const dmEmbed = new EmbedBuilder()
                        .setTitle('🦵 You have been kicked')
                        .setColor(0xff9900)
                        .addFields(
                            { name: '🏢 Server', value: guild.name, inline: true },
                            { name: '🆔 Server ID', value: guild.id, inline: true },
                            { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                            { name: '📝 Reason', value: reason, inline: false },
                            { name: '📋 Appeal', value: `Use \`/appeal submit case_id:${newCase.caseId} server_id:${guild.id}\` if you believe this is unfair`, inline: false }
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

            // Execute the kick
            await member.kick(`${reason} | Moderator: ${interaction.user.tag} | Case: ${newCase.caseId}`);

            // Create response embed
            const embed = new EmbedBuilder()
                .setTitle('🦵 Member Kicked')
                .setColor(0xff9900)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag}\n\`${targetUser.id}\``, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                    { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                    { name: '📝 Reason', value: reason, inline: false },
                    { name: '💬 DM Sent', value: dmSent ? '✅ Yes' : '❌ No', inline: true }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Log via webhook system
            await webhookLogger.logModeration(guild, { id: guild.id, type: 'kick', 
                targetTag: targetUser.tag,
                targetId: targetUser.id,
                moderatorTag: interaction.user.tag,
                moderatorId: interaction.user.id,
                caseId: newCase.caseId,
                reason: reason
            });

            // Fallback: Log to mod channel if configured
            const modLogChannelId = process.env.MOD_LOG_CHANNEL_ID;
            if (modLogChannelId) {
                const modLogChannel = interaction.guild.channels.cache.get(modLogChannelId);
                if (modLogChannel) {
                    await modLogChannel.send({ embeds: [embed] });
                }
            }

        } catch (error) {
            console.error('Kick command error:', error);
            await interaction.reply({
                content: '❌ Failed to kick the user. Please check my permissions.',
                ephemeral: true
            });
        }
    }
};
