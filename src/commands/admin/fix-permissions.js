const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fix-permissions')
        .setDescription('🔧 Check and fix bot permissions')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const guild = interaction.guild;
        const botMember = guild.members.me;

        // Required permissions for full functionality
        const requiredPermissions = {
            'Moderation': [
                { name: 'Ban Members', flag: PermissionFlagsBits.BanMembers },
                { name: 'Kick Members', flag: PermissionFlagsBits.KickMembers },
                { name: 'Moderate Members', flag: PermissionFlagsBits.ModerateMembers },
                { name: 'Manage Messages', flag: PermissionFlagsBits.ManageMessages },
                { name: 'Manage Roles', flag: PermissionFlagsBits.ManageRoles }
            ],
            'Tickets': [
                { name: 'Manage Channels', flag: PermissionFlagsBits.ManageChannels },
                { name: 'View Channels', flag: PermissionFlagsBits.ViewChannel },
                { name: 'Send Messages', flag: PermissionFlagsBits.SendMessages },
                { name: 'Embed Links', flag: PermissionFlagsBits.EmbedLinks },
                { name: 'Attach Files', flag: PermissionFlagsBits.AttachFiles }
            ],
            'General': [
                { name: 'Read Message History', flag: PermissionFlagsBits.ReadMessageHistory },
                { name: 'Add Reactions', flag: PermissionFlagsBits.AddReactions },
                { name: 'Use External Emojis', flag: PermissionFlagsBits.UseExternalEmojis },
                { name: 'Manage Webhooks', flag: PermissionFlagsBits.ManageWebhooks }
            ]
        };

        const embed = new EmbedBuilder()
            .setTitle('🔧 Bot Permission Check')
            .setDescription(`Checking permissions for **${botMember.user.tag}**`)
            .setColor('#00ff00')
            .setTimestamp();

        let allGood = true;
        let missingPerms = [];

        // Check each category
        for (const [category, perms] of Object.entries(requiredPermissions)) {
            let categoryStatus = '';
            
            for (const perm of perms) {
                const hasPermission = botMember.permissions.has(perm.flag);
                const emoji = hasPermission ? '✅' : '❌';
                categoryStatus += `${emoji} ${perm.name}\n`;
                
                if (!hasPermission) {
                    allGood = false;
                    missingPerms.push(perm.name);
                }
            }
            
            embed.addFields({ name: `**${category}**`, value: categoryStatus, inline: true });
        }

        // Add summary
        if (allGood) {
            embed.addFields({
                name: '✅ Status',
                value: 'All required permissions are granted! Bot is fully functional.',
                inline: false
            });
        } else {
            embed.setColor('#ff0000');
            embed.addFields({
                name: '❌ Missing Permissions',
                value: `The following permissions are missing:\n${missingPerms.map(p => `• ${p}`).join('\n')}`,
                inline: false
            });
            embed.addFields({
                name: '🔧 How to Fix',
                value: `1. Go to **Server Settings** → **Roles**\n2. Find the bot's role (${botMember.roles.highest.name})\n3. Enable the missing permissions\n4. Run this command again to verify`,
                inline: false
            });
        }

        // Check role hierarchy
        const highestRole = botMember.roles.highest;
        const everyoneRole = guild.roles.everyone;
        const rolePosition = highestRole.position;
        
        embed.addFields({
            name: '📊 Role Information',
            value: `**Highest Role:** ${highestRole}\n**Position:** ${rolePosition}\n**Can Moderate:** ${rolePosition > 1 ? '✅ Yes' : '❌ No (role too low)'}`,
            inline: false
        });

        // Generate invite link with all permissions
        const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`;
        
        embed.addFields({
            name: '🔗 Re-invite Bot (if needed)',
            value: `If permissions are still missing, [click here to re-invite](${inviteLink}) with full permissions.`,
            inline: false
        });

        await interaction.editReply({ embeds: [embed] });
    }
};
