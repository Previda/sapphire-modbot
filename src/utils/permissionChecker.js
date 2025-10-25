const { PermissionFlagsBits } = require('discord.js');

/**
 * Check if a moderator can perform an action on a target member
 * @param {GuildMember} moderator - The moderator performing the action
 * @param {GuildMember} target - The target member
 * @param {Guild} guild - The guild
 * @returns {Object} - { allowed: boolean, reason: string }
 */
function canModerate(moderator, target, guild) {
    // Can't moderate yourself
    if (moderator.id === target.id) {
        return { allowed: false, reason: '❌ You cannot moderate yourself.' };
    }

    // Can't moderate the server owner
    if (target.id === guild.ownerId) {
        return { allowed: false, reason: '❌ You cannot moderate the server owner.' };
    }

    // Server owner can moderate anyone
    if (moderator.id === guild.ownerId) {
        return { allowed: true };
    }

    // Administrators can moderate anyone (except owner, checked above)
    if (moderator.permissions.has(PermissionFlagsBits.Administrator)) {
        return { allowed: true };
    }

    // Check role hierarchy for non-admins
    if (target.roles.highest.position >= moderator.roles.highest.position) {
        return { allowed: false, reason: '❌ You cannot moderate this member due to role hierarchy.' };
    }

    return { allowed: true };
}

/**
 * Check if bot can moderate a member
 * @param {GuildMember} botMember - The bot's guild member
 * @param {GuildMember} target - The target member
 * @param {Guild} guild - The guild
 * @returns {Object} - { allowed: boolean, reason: string }
 */
function botCanModerate(botMember, target, guild) {
    // Can't moderate the server owner
    if (target.id === guild.ownerId) {
        return { allowed: false, reason: '❌ I cannot moderate the server owner.' };
    }

    // Check role hierarchy
    if (target.roles.highest.position >= botMember.roles.highest.position) {
        return { allowed: false, reason: '❌ I cannot moderate this member due to role hierarchy.' };
    }

    return { allowed: true };
}

module.exports = {
    canModerate,
    botCanModerate
};
