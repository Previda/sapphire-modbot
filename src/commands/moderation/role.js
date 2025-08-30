const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Manage server roles')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a role to a user')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to give the role to')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role to add')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Reason for adding the role')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a role from a user')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to remove the role from')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role to remove')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Reason for removing the role')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new role')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Name of the new role')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('color')
                        .setDescription('Role color (hex code like #ff0000 or color name)')
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option
                        .setName('mentionable')
                        .setDescription('Whether the role can be mentioned')
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option
                        .setName('hoist')
                        .setDescription('Whether to display the role separately in member list')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a role')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role to delete')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Reason for deleting the role')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Get information about a role')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role to get info about')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all roles in the server')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('members')
                .setDescription('List members with a specific role')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role to check members for')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'add':
                    await handleAddRole(interaction);
                    break;
                case 'remove':
                    await handleRemoveRole(interaction);
                    break;
                case 'create':
                    await handleCreateRole(interaction);
                    break;
                case 'delete':
                    await handleDeleteRole(interaction);
                    break;
                case 'info':
                    await handleRoleInfo(interaction);
                    break;
                case 'list':
                    await handleListRoles(interaction);
                    break;
                case 'members':
                    await handleListMembers(interaction);
                    break;
                default:
                    await interaction.editReply({
                        content: '❌ Unknown subcommand.',
                        flags: 64
                    });
            }
        } catch (error) {
            console.error('Error in role command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while processing the role command.',
                flags: 64
            });
        }
    }
};

async function handleAddRole(interaction) {
    const targetUser = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
        const member = await interaction.guild.members.fetch(targetUser.id);
        
        if (!member) {
            return await interaction.editReply({
                content: '❌ User not found in this server.',
                flags: 64
            });
        }

        // Check if user already has the role
        if (member.roles.cache.has(role.id)) {
            return await interaction.editReply({
                content: `❌ ${targetUser.tag} already has the ${role.name} role.`,
                flags: 64
            });
        }

        // Check role hierarchy
        const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
        if (role.position >= botMember.roles.highest.position) {
            return await interaction.editReply({
                content: `❌ I cannot manage the ${role.name} role because it's higher than my highest role.`,
                flags: 64
            });
        }

        if (role.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
            return await interaction.editReply({
                content: `❌ You cannot manage the ${role.name} role because it's higher than your highest role.`,
                flags: 64
            });
        }

        await member.roles.add(role, reason);

        const embed = new EmbedBuilder()
            .setTitle('✅ Role Added')
            .setColor(role.color || 0x00ff00)
            .addFields(
                { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                { name: '🏷️ Role', value: `${role.name}`, inline: true },
                { name: '👮 Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: '📝 Reason', value: reason, inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        // Log the action
        await logRoleAction(interaction, 'ROLE_ADD', targetUser, role, reason);

    } catch (error) {
        console.error('Error adding role:', error);
        await interaction.editReply({
            content: '❌ Failed to add the role. Please check my permissions.',
            flags: 64
        });
    }
}

async function handleRemoveRole(interaction) {
    const targetUser = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
        const member = await interaction.guild.members.fetch(targetUser.id);
        
        if (!member) {
            return await interaction.editReply({
                content: '❌ User not found in this server.',
                flags: 64
            });
        }

        // Check if user has the role
        if (!member.roles.cache.has(role.id)) {
            return await interaction.editReply({
                content: `❌ ${targetUser.tag} doesn't have the ${role.name} role.`,
                flags: 64
            });
        }

        // Check role hierarchy
        const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
        if (role.position >= botMember.roles.highest.position) {
            return await interaction.editReply({
                content: `❌ I cannot manage the ${role.name} role because it's higher than my highest role.`,
                flags: 64
            });
        }

        if (role.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
            return await interaction.editReply({
                content: `❌ You cannot manage the ${role.name} role because it's higher than your highest role.`,
                flags: 64
            });
        }

        await member.roles.remove(role, reason);

        const embed = new EmbedBuilder()
            .setTitle('✅ Role Removed')
            .setColor(role.color || 0xff0000)
            .addFields(
                { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                { name: '🏷️ Role', value: `${role.name}`, inline: true },
                { name: '👮 Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: '📝 Reason', value: reason, inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        // Log the action
        await logRoleAction(interaction, 'ROLE_REMOVE', targetUser, role, reason);

    } catch (error) {
        console.error('Error removing role:', error);
        await interaction.editReply({
            content: '❌ Failed to remove the role. Please check my permissions.',
            flags: 64
        });
    }
}

async function handleCreateRole(interaction) {
    const name = interaction.options.getString('name');
    const colorInput = interaction.options.getString('color');
    const mentionable = interaction.options.getBoolean('mentionable') ?? false;
    const hoist = interaction.options.getBoolean('hoist') ?? false;

    try {
        // Parse color
        let color = null;
        if (colorInput) {
            const colorNames = {
                'red': '#ff0000', 'green': '#00ff00', 'blue': '#0000ff',
                'yellow': '#ffff00', 'purple': '#800080', 'orange': '#ffa500',
                'pink': '#ffc0cb', 'black': '#000000', 'white': '#ffffff',
                'gray': '#808080', 'brown': '#a52a2a'
            };

            if (colorInput.startsWith('#') && /^#[0-9A-Fa-f]{6}$/.test(colorInput)) {
                color = colorInput;
            } else if (colorNames[colorInput.toLowerCase()]) {
                color = colorNames[colorInput.toLowerCase()];
            } else {
                return await interaction.editReply({
                    content: '❌ Invalid color. Use a hex code (#ff0000) or color name (red, blue, etc.)',
                    flags: 64
                });
            }
        }

        const role = await interaction.guild.roles.create({
            name: name,
            color: color,
            hoist: hoist,
            mentionable: mentionable,
            reason: `Role created by ${interaction.user.tag}`
        });

        const embed = new EmbedBuilder()
            .setTitle('✅ Role Created')
            .setColor(role.color || 0x00ff00)
            .addFields(
                { name: '🏷️ Role Name', value: role.name, inline: true },
                { name: '🆔 Role ID', value: role.id, inline: true },
                { name: '🎨 Color', value: color || 'Default', inline: true },
                { name: '📢 Mentionable', value: mentionable ? 'Yes' : 'No', inline: true },
                { name: '📋 Hoisted', value: hoist ? 'Yes' : 'No', inline: true },
                { name: '👮 Created by', value: interaction.user.tag, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        // Log the action
        await logRoleAction(interaction, 'ROLE_CREATE', null, role, `Created role: ${name}`);

    } catch (error) {
        console.error('Error creating role:', error);
        await interaction.editReply({
            content: '❌ Failed to create the role. Please check my permissions.',
            flags: 64
        });
    }
}

async function handleDeleteRole(interaction) {
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
        // Check role hierarchy
        const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
        if (role.position >= botMember.roles.highest.position) {
            return await interaction.editReply({
                content: `❌ I cannot delete the ${role.name} role because it's higher than my highest role.`,
                flags: 64
            });
        }

        if (role.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
            return await interaction.editReply({
                content: `❌ You cannot delete the ${role.name} role because it's higher than your highest role.`,
                flags: 64
            });
        }

        const roleName = role.name;
        const roleColor = role.color;
        const memberCount = role.members.size;

        await role.delete(reason);

        const embed = new EmbedBuilder()
            .setTitle('✅ Role Deleted')
            .setColor(roleColor || 0xff0000)
            .addFields(
                { name: '🏷️ Role Name', value: roleName, inline: true },
                { name: '👥 Members Had Role', value: memberCount.toString(), inline: true },
                { name: '👮 Deleted by', value: interaction.user.tag, inline: true },
                { name: '📝 Reason', value: reason, inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        // Log the action
        await logRoleAction(interaction, 'ROLE_DELETE', null, { name: roleName, id: role.id }, reason);

    } catch (error) {
        console.error('Error deleting role:', error);
        await interaction.editReply({
            content: '❌ Failed to delete the role. Please check my permissions.',
            flags: 64
        });
    }
}

async function handleRoleInfo(interaction) {
    const role = interaction.options.getRole('role');

    try {
        const permissions = role.permissions.toArray();
        const memberCount = role.members.size;
        
        const embed = new EmbedBuilder()
            .setTitle(`🏷️ Role Information: ${role.name}`)
            .setColor(role.color || 0x99aab5)
            .addFields(
                { name: '🆔 ID', value: role.id, inline: true },
                { name: '🎨 Color', value: role.hexColor, inline: true },
                { name: '👥 Members', value: memberCount.toString(), inline: true },
                { name: '📍 Position', value: role.position.toString(), inline: true },
                { name: '📢 Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
                { name: '📋 Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
                { name: '🤖 Managed', value: role.managed ? 'Yes (Bot Role)' : 'No', inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '🔧 Permissions', value: permissions.length > 0 ? permissions.slice(0, 10).join(', ') + (permissions.length > 10 ? '...' : '') : 'None', inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error getting role info:', error);
        await interaction.editReply({
            content: '❌ Failed to get role information.',
            flags: 64
        });
    }
}

async function handleListRoles(interaction) {
    try {
        const roles = interaction.guild.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(role => `${role} - ${role.members.size} members`)
            .slice(0, 20); // Limit to first 20 roles

        const embed = new EmbedBuilder()
            .setTitle(`🏷️ Server Roles (${interaction.guild.roles.cache.size - 1})`)
            .setDescription(roles.length > 0 ? roles.join('\n') : 'No roles found.')
            .setColor(0x5865f2)
            .setFooter({ text: roles.length === 20 ? 'Showing first 20 roles' : `Showing all ${roles.length} roles` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error listing roles:', error);
        await interaction.editReply({
            content: '❌ Failed to list roles.',
            flags: 64
        });
    }
}

async function handleListMembers(interaction) {
    const role = interaction.options.getRole('role');

    try {
        const members = role.members
            .map(member => `${member.user.tag} (${member.id})`)
            .slice(0, 20); // Limit to first 20 members

        const embed = new EmbedBuilder()
            .setTitle(`👥 Members with ${role.name} (${role.members.size})`)
            .setDescription(members.length > 0 ? members.join('\n') : 'No members have this role.')
            .setColor(role.color || 0x5865f2)
            .setFooter({ text: members.length === 20 ? 'Showing first 20 members' : `Showing all ${members.length} members` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error listing role members:', error);
        await interaction.editReply({
            content: '❌ Failed to list role members.',
            flags: 64
        });
    }
}

async function logRoleAction(interaction, action, targetUser, role, reason) {
    try {
        const { logEvent } = require('../../utils/logger');
        await logEvent(interaction.guild, {
            type: action,
            executor: interaction.user,
            target: targetUser,
            role: role,
            reason: reason,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error logging role action:', error);
    }
}
