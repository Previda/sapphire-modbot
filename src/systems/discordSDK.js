const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

/**
 * Discord SDK Integration System
 * Provides advanced Discord features including Activities, Voice, RPC, and more
 */
class DiscordSDKSystem {
    constructor(client) {
        this.client = client;
        this.activities = new Map(); // guildId -> activity data
        this.voiceSessions = new Map(); // userId -> voice session data
        this.richPresence = new Map(); // userId -> RPC data
    }

    /**
     * Initialize SDK features
     */
    initialize() {
        console.log('🎮 Discord SDK System initializing...');

        // Voice state monitoring
        this.client.on('voiceStateUpdate', (oldState, newState) => {
            this.handleVoiceStateUpdate(oldState, newState);
        });

        // Interaction handling for SDK features
        this.client.on('interactionCreate', async (interaction) => {
            if (interaction.isButton()) {
                await this.handleButtonInteraction(interaction);
            } else if (interaction.isModalSubmit()) {
                await this.handleModalSubmit(interaction);
            }
        });

        console.log('✅ Discord SDK System initialized');
    }

    /**
     * Create Discord Activity (Games, Watch Together, etc.)
     */
    async createActivity(interaction, activityType) {
        try {
            const channel = interaction.member.voice.channel;
            
            if (!channel) {
                return interaction.reply({
                    content: '❌ You must be in a voice channel to start an activity!',
                    ephemeral: true
                });
            }

            const activities = {
                'youtube': {
                    name: 'YouTube Together',
                    appId: '880218394199220334',
                    emoji: '📺',
                    description: 'Watch YouTube videos together'
                },
                'poker': {
                    name: 'Poker Night',
                    appId: '755827207812677713',
                    emoji: '🃏',
                    description: 'Play poker with friends'
                },
                'betrayal': {
                    name: 'Betrayal.io',
                    appId: '773336526917861400',
                    emoji: '🔪',
                    description: 'Among Us style game'
                },
                'fishing': {
                    name: 'Fishington.io',
                    appId: '814288819477020702',
                    emoji: '🎣',
                    description: 'Relaxing fishing game'
                },
                'chess': {
                    name: 'Chess in the Park',
                    appId: '832012774040141894',
                    emoji: '♟️',
                    description: 'Play chess together'
                },
                'checkers': {
                    name: 'Checkers in the Park',
                    appId: '832013003968348200',
                    emoji: '🎲',
                    description: 'Play checkers together'
                },
                'doodlecrew': {
                    name: 'Doodle Crew',
                    appId: '878067389634314250',
                    emoji: '🎨',
                    description: 'Draw and guess game'
                },
                'wordsnack': {
                    name: 'Word Snack',
                    appId: '879863976006127627',
                    emoji: '📝',
                    description: 'Word puzzle game'
                },
                'sketchheads': {
                    name: 'Sketch Heads',
                    appId: '902271654783242291',
                    emoji: '✏️',
                    description: 'Drawing game'
                },
                'ocho': {
                    name: 'Ocho',
                    appId: '832025144389533716',
                    emoji: '🎴',
                    description: 'UNO-style card game'
                }
            };

            const activity = activities[activityType];
            if (!activity) {
                return interaction.reply({
                    content: '❌ Invalid activity type!',
                    ephemeral: true
                });
            }

            // Create invite with activity
            const invite = await channel.createInvite({
                maxAge: 3600, // 1 hour
                maxUses: 0,
                targetApplication: activity.appId,
                targetType: 2 // Embedded Application
            });

            const embed = new EmbedBuilder()
                .setTitle(`${activity.emoji} ${activity.name}`)
                .setDescription(activity.description)
                .addFields(
                    { name: 'Channel', value: channel.name, inline: true },
                    { name: 'Started By', value: interaction.user.tag, inline: true }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Join Activity')
                        .setURL(invite.url)
                        .setStyle(ButtonStyle.Link)
                        .setEmoji(activity.emoji)
                );

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });

            // Track activity
            this.activities.set(channel.id, {
                type: activityType,
                name: activity.name,
                startedBy: interaction.user.id,
                startedAt: Date.now(),
                channelId: channel.id,
                inviteUrl: invite.url
            });

        } catch (error) {
            console.error('Create activity error:', error);
            await interaction.reply({
                content: '❌ Failed to create activity. Make sure the bot has proper permissions!',
                ephemeral: true
            });
        }
    }

    /**
     * Create custom Rich Presence for users
     */
    async setRichPresence(userId, data) {
        this.richPresence.set(userId, {
            details: data.details || 'Playing',
            state: data.state || '',
            largeImageKey: data.largeImageKey || '',
            largeImageText: data.largeImageText || '',
            smallImageKey: data.smallImageKey || '',
            smallImageText: data.smallImageText || '',
            partySize: data.partySize || 0,
            partyMax: data.partyMax || 0,
            startTimestamp: data.startTimestamp || Date.now(),
            buttons: data.buttons || []
        });

        return this.richPresence.get(userId);
    }

    /**
     * Voice state monitoring and analytics
     */
    async handleVoiceStateUpdate(oldState, newState) {
        const userId = newState.id;

        // User joined voice
        if (!oldState.channelId && newState.channelId) {
            this.voiceSessions.set(userId, {
                channelId: newState.channelId,
                joinedAt: Date.now(),
                muted: newState.mute,
                deafened: newState.deaf,
                streaming: newState.streaming,
                video: newState.selfVideo
            });

            // Check if there's an active activity
            const activity = this.activities.get(newState.channelId);
            if (activity) {
                // Notify about ongoing activity
                const member = newState.member;
                try {
                    await member.send({
                        embeds: [new EmbedBuilder()
                            .setTitle('🎮 Activity in Progress!')
                            .setDescription(`There's an active **${activity.name}** session in ${newState.channel.name}`)
                            .addFields({ name: 'Join', value: `[Click here](${activity.inviteUrl})` })
                            .setColor(0x5865F2)]
                    });
                } catch (error) {
                    // User has DMs disabled
                }
            }
        }

        // User left voice
        if (oldState.channelId && !newState.channelId) {
            const session = this.voiceSessions.get(userId);
            if (session) {
                const duration = Date.now() - session.joinedAt;
                
                // Store session data for analytics
                this.voiceSessions.delete(userId);
                
                // Clean up activity if creator left
                const activity = this.activities.get(oldState.channelId);
                if (activity && activity.startedBy === userId) {
                    this.activities.delete(oldState.channelId);
                }
            }
        }

        // User switched channels
        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            const session = this.voiceSessions.get(userId);
            if (session) {
                session.channelId = newState.channelId;
            }
        }
    }

    /**
     * Create interactive stage channel
     */
    async createStageInstance(channel, topic, interaction) {
        try {
            if (channel.type !== 13) { // GUILD_STAGE_VOICE
                return interaction.reply({
                    content: '❌ This command only works in Stage channels!',
                    ephemeral: true
                });
            }

            const stageInstance = await channel.createStageInstance({
                topic: topic,
                privacyLevel: 2, // GUILD_ONLY
                sendStartNotification: true
            });

            const embed = new EmbedBuilder()
                .setTitle('🎤 Stage Started!')
                .setDescription(`**${topic}**`)
                .addFields(
                    { name: 'Channel', value: channel.name, inline: true },
                    { name: 'Host', value: interaction.user.tag, inline: true }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            return stageInstance;

        } catch (error) {
            console.error('Create stage error:', error);
            await interaction.reply({
                content: '❌ Failed to create stage instance!',
                ephemeral: true
            });
        }
    }

    /**
     * Create scheduled event
     */
    async createScheduledEvent(guild, eventData, interaction) {
        try {
            const event = await guild.scheduledEvents.create({
                name: eventData.name,
                description: eventData.description,
                scheduledStartTime: eventData.startTime,
                scheduledEndTime: eventData.endTime,
                privacyLevel: 2, // GUILD_ONLY
                entityType: eventData.entityType || 3, // EXTERNAL
                entityMetadata: eventData.metadata || { location: 'Discord' }
            });

            const embed = new EmbedBuilder()
                .setTitle('📅 Event Created!')
                .setDescription(`**${event.name}**`)
                .addFields(
                    { name: 'Description', value: event.description || 'No description' },
                    { name: 'Start Time', value: `<t:${Math.floor(event.scheduledStartTimestamp / 1000)}:F>` },
                    { name: 'Event Link', value: `[Click here](${event.url})` }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            return event;

        } catch (error) {
            console.error('Create event error:', error);
            await interaction.reply({
                content: '❌ Failed to create scheduled event!',
                ephemeral: true
            });
        }
    }

    /**
     * Create custom webhook with avatar
     */
    async createWebhook(channel, name, avatarURL) {
        try {
            const webhook = await channel.createWebhook({
                name: name,
                avatar: avatarURL
            });

            return webhook;

        } catch (error) {
            console.error('Create webhook error:', error);
            return null;
        }
    }

    /**
     * Send message as webhook (custom avatar/name)
     */
    async sendAsWebhook(channel, webhookData) {
        try {
            const webhooks = await channel.fetchWebhooks();
            let webhook = webhooks.find(wh => wh.name === webhookData.name);

            if (!webhook) {
                webhook = await this.createWebhook(channel, webhookData.name, webhookData.avatar);
            }

            await webhook.send({
                content: webhookData.content,
                username: webhookData.username || webhookData.name,
                avatarURL: webhookData.avatar,
                embeds: webhookData.embeds || []
            });

            return true;

        } catch (error) {
            console.error('Send webhook error:', error);
            return false;
        }
    }

    /**
     * Create interactive poll
     */
    async createPoll(channel, question, options, duration) {
        try {
            const embed = new EmbedBuilder()
                .setTitle('📊 Poll')
                .setDescription(question)
                .setColor(0x5865F2)
                .setFooter({ text: `Poll ends in ${duration} minutes` })
                .setTimestamp();

            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
            
            let description = question + '\n\n';
            options.forEach((option, index) => {
                description += `${emojis[index]} ${option}\n`;
            });

            embed.setDescription(description);

            const message = await channel.send({ embeds: [embed] });

            // Add reactions
            for (let i = 0; i < options.length; i++) {
                await message.react(emojis[i]);
            }

            // Set timeout to end poll
            setTimeout(async () => {
                const updatedMessage = await channel.messages.fetch(message.id);
                const results = [];

                for (let i = 0; i < options.length; i++) {
                    const reaction = updatedMessage.reactions.cache.get(emojis[i]);
                    const count = reaction ? reaction.count - 1 : 0; // -1 for bot's reaction
                    results.push({ option: options[i], votes: count });
                }

                // Sort by votes
                results.sort((a, b) => b.votes - a.votes);

                const resultEmbed = new EmbedBuilder()
                    .setTitle('📊 Poll Results')
                    .setDescription(question)
                    .setColor(0x00ff00)
                    .setTimestamp();

                let resultText = '';
                results.forEach((result, index) => {
                    const percentage = results.reduce((sum, r) => sum + r.votes, 0) > 0
                        ? Math.round((result.votes / results.reduce((sum, r) => sum + r.votes, 0)) * 100)
                        : 0;
                    resultText += `${emojis[index]} **${result.option}**: ${result.votes} votes (${percentage}%)\n`;
                });

                resultEmbed.addFields({ name: 'Results', value: resultText });

                await channel.send({ embeds: [resultEmbed] });

            }, duration * 60 * 1000);

            return message;

        } catch (error) {
            console.error('Create poll error:', error);
            return null;
        }
    }

    /**
     * Create giveaway
     */
    async createGiveaway(channel, prize, duration, winnerCount) {
        try {
            const endTime = Date.now() + (duration * 60 * 1000);

            const embed = new EmbedBuilder()
                .setTitle('🎉 GIVEAWAY!')
                .setDescription(`**Prize:** ${prize}`)
                .addFields(
                    { name: 'Winners', value: `${winnerCount}`, inline: true },
                    { name: 'Ends', value: `<t:${Math.floor(endTime / 1000)}:R>`, inline: true }
                )
                .setColor(0xff0000)
                .setFooter({ text: 'React with 🎉 to enter!' })
                .setTimestamp();

            const message = await channel.send({ embeds: [embed] });
            await message.react('🎉');

            // Set timeout to pick winners
            setTimeout(async () => {
                const updatedMessage = await channel.messages.fetch(message.id);
                const reaction = updatedMessage.reactions.cache.get('🎉');
                
                if (!reaction) return;

                const users = await reaction.users.fetch();
                const participants = users.filter(user => !user.bot);

                if (participants.size === 0) {
                    return channel.send('❌ No one entered the giveaway!');
                }

                const winners = [];
                const participantArray = Array.from(participants.values());

                for (let i = 0; i < Math.min(winnerCount, participants.size); i++) {
                    const randomIndex = Math.floor(Math.random() * participantArray.length);
                    winners.push(participantArray.splice(randomIndex, 1)[0]);
                }

                const winnerEmbed = new EmbedBuilder()
                    .setTitle('🎉 Giveaway Ended!')
                    .setDescription(`**Prize:** ${prize}`)
                    .addFields(
                        { name: 'Winners', value: winners.map(w => `${w}`).join('\n') }
                    )
                    .setColor(0x00ff00)
                    .setTimestamp();

                await channel.send({
                    content: winners.map(w => `${w}`).join(' '),
                    embeds: [winnerEmbed]
                });

            }, duration * 60 * 1000);

            return message;

        } catch (error) {
            console.error('Create giveaway error:', error);
            return null;
        }
    }

    /**
     * Get voice analytics
     */
    getVoiceAnalytics(guildId) {
        const sessions = Array.from(this.voiceSessions.values())
            .filter(session => {
                const channel = this.client.channels.cache.get(session.channelId);
                return channel && channel.guild.id === guildId;
            });

        const totalUsers = sessions.length;
        const mutedUsers = sessions.filter(s => s.muted).length;
        const deafenedUsers = sessions.filter(s => s.deafened).length;
        const streamingUsers = sessions.filter(s => s.streaming).length;
        const videoUsers = sessions.filter(s => s.video).length;

        return {
            totalUsers,
            mutedUsers,
            deafenedUsers,
            streamingUsers,
            videoUsers,
            sessions
        };
    }

    /**
     * Get active activities
     */
    getActiveActivities(guildId) {
        const activities = [];
        
        for (const [channelId, activity] of this.activities.entries()) {
            const channel = this.client.channels.cache.get(channelId);
            if (channel && channel.guild.id === guildId) {
                activities.push({
                    ...activity,
                    channelName: channel.name,
                    duration: Date.now() - activity.startedAt
                });
            }
        }

        return activities;
    }

    /**
     * Handle button interactions
     */
    async handleButtonInteraction(interaction) {
        // Handle SDK-related button clicks
        if (interaction.customId.startsWith('sdk_')) {
            // Custom SDK button handling
        }
    }

    /**
     * Handle modal submissions
     */
    async handleModalSubmit(interaction) {
        // Handle SDK-related modal submissions
        if (interaction.customId.startsWith('sdk_')) {
            // Custom SDK modal handling
        }
    }
}

module.exports = DiscordSDKSystem;
