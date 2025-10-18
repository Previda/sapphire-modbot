const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { logEvent } = require('../../utils/logger');
const { isSuperuser } = require('../../utils/superuserManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('🔒 Lock channels to prevent message sending during emergencies')
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Lock a specific channel')
                .addChannelOption(option =>
                    option.setName('target')
                        .setDescription('Channel to lock (defaults to current)')
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildNews))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for locking the channel')
                        .setRequired(false)
                        .setMaxLength(200)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('🚨 EMERGENCY: Lock entire server')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for server lockdown')
                        .setRequired(false)
                        .setMaxLength(200)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unlock')
                .setDescription('Unlock previously locked channels')
                .addChannelOption(option =>
                    option.setName('target')
                        .setDescription('Channel to unlock (defaults to current)')
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildNews)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check lock status of channels'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        try {
            // Defer reply for channel operations
            await interaction.deferReply();

            // Check permissions
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) && 
                interaction.guild.ownerId !== interaction.user.id) {
                return interaction.editReply({
                    content: '❌ You need the **Manage Channels** permission to use this command.'
                });
            }

            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'channel':
                    await this.lockChannel(interaction);
                    break;
                case 'server':
                    await this.lockServer(interaction);
                    break;
                case 'unlock':
                    await this.unlockChannel(interaction);
                    break;
                case 'status':
                    await this.checkStatus(interaction);
                    break;
            }

        } catch (error) {
            console.error('Error in lock command:', error);
            
            await interaction.editReply({
                content: '❌ **Error:** Failed to execute lock command. Please try again.',
                flags: 64
            }).catch(() => {});
        }
    },

    async lockChannel(interaction) {
        const targetChannel = interaction.options.getChannel('target') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            // Get @everyone role
            const everyoneRole = interaction.guild.roles.everyone;

            // Store original permissions for later unlock
            const originalPerms = targetChannel.permissionOverwrites.cache.get(everyoneRole.id);
            
            // Set lock permissions
            await targetChannel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: false,
                AddReactions: false,
                CreatePublicThreads: false,
                CreatePrivateThreads: false,
                SendMessagesInThreads: false,
                Connect: false,    // For voice channels
                Speak: false       // For voice channels
            }, { reason: `Channel lock by ${interaction.user.tag}: ${reason}` });

            // Create lock embed
            const lockEmbed = new EmbedBuilder()
                .setTitle('🔒 Channel Locked')
                .setColor('#FF6B6B')
                .setDescription(`${targetChannel} has been locked for security reasons.`)
                .addFields(
                    { name: '👤 Locked by', value: `${interaction.user}`, inline: true },
                    { name: '📝 Reason', value: reason, inline: true },
                    { name: '⏰ Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Only staff can send messages while locked' });

            // Send lock notification to the channel
            if (targetChannel.type === ChannelType.GuildText) {
                await targetChannel.send({
                    embeds: [lockEmbed]
                }).catch(() => {}); // Ignore if can't send
            }

            // Log the action
            await logEvent(interaction.guild, {
                type: 'CHANNEL_LOCK',
                executor: interaction.user,
                target: targetChannel,
                reason: reason,
                timestamp: new Date()
            });

            // Confirm to user
            await interaction.editReply({
                content: `✅ **Successfully locked** ${targetChannel}`,
                embeds: [lockEmbed],
                flags: 64
            });

        } catch (error) {
            console.error('Error locking channel:', error);
            await interaction.editReply({
                content: `❌ **Failed to lock** ${targetChannel}. Check permissions.`,
                flags: 64
            });
        }
    },

    async lockServer(interaction) {
        const reason = interaction.options.getString('reason') || 'Emergency server lockdown';

        // Extra confirmation for server lock
        if (!(interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) || interaction.guild.ownerId === interaction.user.id) && 
            !isSuperuser(interaction.user.id)) {
            return await interaction.editReply({
                content: '❌ **Administrator** permissions required for server lockdown.',
                flags: 64
            });
        }

        try {
            // Check if already deferred/replied
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: 64 });
            }

            const everyoneRole = interaction.guild.roles.everyone;
            let lockedChannels = 0;
            let failedChannels = 0;

            // Lock all text and voice channels
            for (const [, channel] of interaction.guild.channels.cache) {
                if (channel.type === ChannelType.GuildText || 
                    channel.type === ChannelType.GuildVoice || 
                    channel.type === ChannelType.GuildNews) {
                    
                    try {
                        await channel.permissionOverwrites.edit(everyoneRole, {
                            SendMessages: false,
                            AddReactions: false,
                            CreatePublicThreads: false,
                            CreatePrivateThreads: false,
                            SendMessagesInThreads: false,
                            Connect: false,
                            Speak: false
                        }, { reason: `Server lockdown by ${interaction.user.tag}: ${reason}` });
                        
                        lockedChannels++;
                    } catch (error) {
                        failedChannels++;
                        console.error(`Failed to lock channel ${channel.name}:`, error);
                    }
                }
            }

            // Create lockdown embed
            const lockdownEmbed = new EmbedBuilder()
                .setTitle('🚨 SERVER LOCKDOWN ACTIVATED')
                .setColor('#8E24AA')
                .setDescription(`**The server has been placed under emergency lockdown.**`)
                .addFields(
                    { name: '👤 Activated by', value: `${interaction.user}`, inline: true },
                    { name: '📝 Reason', value: reason, inline: true },
                    { name: '⏰ Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '📊 Channels Locked', value: `${lockedChannels}`, inline: true },
                    { name: '❌ Failed Locks', value: `${failedChannels}`, inline: true },
                    { name: '🔓 Unlock Info', value: 'Use `/lock unlock` to restore', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Emergency lockdown - Only staff can communicate' });

            // Try to send announcement in general/announcements channel
            const announcementChannels = ['general', 'announcements', 'chat'];
            for (const channelName of announcementChannels) {
                const channel = interaction.guild.channels.cache.find(ch => 
                    ch.name.toLowerCase().includes(channelName) && 
                    ch.type === ChannelType.GuildText
                );
                if (channel) {
                    await channel.send({
                        content: '@everyone **EMERGENCY LOCKDOWN**',
                        embeds: [lockdownEmbed]
                    }).catch(() => {});
                    break;
                }
            }

            // Log the action
            await logEvent(interaction.guild, {
                type: 'SERVER_LOCKDOWN',
                executor: interaction.user,
                reason: reason,
                details: `Locked ${lockedChannels} channels, ${failedChannels} failures`,
                timestamp: new Date()
            });

            await interaction.editReply({
                content: `🚨 **SERVER LOCKDOWN COMPLETE**\n✅ Locked ${lockedChannels} channels\n❌ Failed to lock ${failedChannels} channels`,
                embeds: [lockdownEmbed]
            });

        } catch (error) {
            console.error('Error in server lockdown:', error);
            await interaction.editReply({
                content: '❌ **Server lockdown failed.** Check console for errors.'
            });
        }
    },

    async unlockChannel(interaction) {
        const targetChannel = interaction.options.getChannel('target') || interaction.channel;

        try {
            // Get @everyone role
            const everyoneRole = interaction.guild.roles.everyone;

            // Remove lock permissions (restore defaults)
            await targetChannel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: null,
                AddReactions: null,
                CreatePublicThreads: null,
                CreatePrivateThreads: null,
                SendMessagesInThreads: null,
                Connect: null,
                Speak: null
            }, { reason: `Channel unlock by ${interaction.user.tag}` });

            // Create unlock embed
            const unlockEmbed = new EmbedBuilder()
                .setTitle('🔓 Channel Unlocked')
                .setColor('#00FF00')
                .setDescription(`${targetChannel} has been unlocked.`)
                .addFields(
                    { name: '👤 Unlocked by', value: `${interaction.user}`, inline: true },
                    { name: '⏰ Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Channel is now accessible to all members' });

            // Send unlock notification
            if (targetChannel.type === ChannelType.GuildText) {
                await targetChannel.send({
                    embeds: [unlockEmbed]
                }).catch(() => {});
            }

            // Log the action
            await logEvent(interaction.guild, {
                type: 'CHANNEL_UNLOCK',
                executor: interaction.user,
                target: targetChannel,
                timestamp: new Date()
            });

            await interaction.editReply({
                content: `🔓 **Successfully unlocked** ${targetChannel}`,
                embeds: [unlockEmbed],
                flags: 64
            });

        } catch (error) {
            console.error('Error unlocking channel:', error);
            await interaction.editReply({
                content: `❌ **Failed to unlock** ${targetChannel}. Check permissions.`,
                flags: 64
            });
        }
    },

    async checkStatus(interaction) {
        try {
            const everyoneRole = interaction.guild.roles.everyone;
            const lockedChannels = [];
            const unlockedChannels = [];

            // Check all channels
            for (const [, channel] of interaction.guild.channels.cache) {
                if (channel.type === ChannelType.GuildText || 
                    channel.type === ChannelType.GuildVoice || 
                    channel.type === ChannelType.GuildNews) {
                    
                    const perms = channel.permissionOverwrites.cache.get(everyoneRole.id);
                    const isLocked = perms && (
                        perms.deny.has(PermissionFlagsBits.SendMessages) ||
                        perms.deny.has(PermissionFlagsBits.Connect)
                    );

                    if (isLocked) {
                        lockedChannels.push(`🔒 ${channel.name}`);
                    } else {
                        unlockedChannels.push(`🔓 ${channel.name}`);
                    }
                }
            }

            const statusEmbed = new EmbedBuilder()
                .setTitle('🔐 Channel Lock Status')
                .setColor(lockedChannels.length > 0 ? '#FF6B6B' : '#00FF00')
                .addFields(
                    { 
                        name: `🔒 Locked Channels (${lockedChannels.length})`, 
                        value: lockedChannels.length > 0 ? 
                            lockedChannels.slice(0, 10).join('\n') + 
                            (lockedChannels.length > 10 ? `\n*+${lockedChannels.length - 10} more...*` : '') : 
                            'None', 
                        inline: false 
                    },
                    { 
                        name: `🔓 Unlocked Channels (${unlockedChannels.length})`, 
                        value: unlockedChannels.length > 0 ? 
                            unlockedChannels.slice(0, 5).join('\n') + 
                            (unlockedChannels.length > 5 ? `\n*+${unlockedChannels.length - 5} more...*` : '') : 
                            'None', 
                        inline: false 
                    }
                )
                .setTimestamp()
                .setFooter({ text: 'Use /lock unlock to restore locked channels' });

            await interaction.editReply({
                embeds: [statusEmbed],
                flags: 64
            });

        } catch (error) {
            console.error('Error checking lock status:', error);
            await interaction.editReply({
                content: '❌ **Error:** Failed to check channel lock status.',
                flags: 64
            });
        }
    }
};
