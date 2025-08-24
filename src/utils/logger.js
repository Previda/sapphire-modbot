const { EmbedBuilder } = require('discord.js');

/**
 * Simple logging utility for Pi compatibility
 */

const logEvent = async (guild, eventData) => {
    try {
        // Try to find a log channel
        const logChannel = guild.channels.cache.find(ch => 
            ch.name.includes('log') || ch.name.includes('audit')
        );
        
        if (!logChannel) {
            console.log(`[${guild.name}] ${eventData.type}: ${eventData.reason || 'No reason provided'}`);
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(`📋 ${eventData.type}`)
            .setColor('#3498db')
            .setTimestamp(eventData.timestamp || new Date());

        if (eventData.executor) {
            embed.addFields({
                name: '👤 Executor',
                value: `${eventData.executor.tag} (${eventData.executor.id})`,
                inline: true
            });
        }

        if (eventData.target) {
            embed.addFields({
                name: '🎯 Target',
                value: `${eventData.target.tag || eventData.target.name} (${eventData.target.id})`,
                inline: true
            });
        }

        if (eventData.reason) {
            embed.addFields({
                name: '📝 Reason',
                value: eventData.reason,
                inline: false
            });
        }

        if (eventData.details) {
            embed.addFields({
                name: '📊 Details',
                value: eventData.details,
                inline: false
            });
        }

        await logChannel.send({ embeds: [embed] });
        console.log(`[${guild.name}] Logged: ${eventData.type}`);
    } catch (error) {
        console.error('Error logging event:', error.message);
        console.log(`[${guild.name}] ${eventData.type}: ${eventData.reason || 'No reason provided'}`);
    }
};

const logAction = async (guild, action, executor, target, reason) => {
    return await logEvent(guild, {
        type: action.toUpperCase(),
        executor,
        target,
        reason,
        timestamp: new Date()
    });
};

module.exports = {
    logEvent,
    logAction
};
