const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

// Simple JSON storage for music settings (in production, use database)
const MUSIC_SETTINGS_FILE = path.join(__dirname, '../../data/music-settings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-music')
        .setDescription('Configure music bot settings and permissions')
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable music bot in this server'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable music bot in this server'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('role')
                .setDescription('Set required role for music commands')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role required to use music commands')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-role')
                .setDescription('Remove role requirement (allow everyone)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('View current music bot settings'))
        .setDefaultMemberPermissions(null) // Allow all users,

    async function execute(interaction) {
        try {
            await interaction.deferReply();

            const subcommand = interaction.options.getSubcommand();
            const guildId = interaction.guild.id;

            // Ensure data directory exists
            await this.ensureDataDir();

            // Load current settings
            const settings = await this.loadSettings();

            switch (subcommand) {
                case 'enable':
                    settings[guildId] = { ...settings[guildId], enabled: true };
                    await this.saveSettings(settings);

                    const enableEmbed = new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle('🎵 Music Bot Enabled')
                        .setDescription('Music commands are now **enabled** in this server!')
                        .addFields({
                            name: '📋 Available Commands',
                            value: '`/play` • `/stop` • `/skip` • `/volume` • `/queue`',
                            inline: false
                        })
                        .setFooter({ text: `Enabled by ${interaction.user.tag}` })
                        .setTimestamp();

                    return interaction.editReply({ embeds: [enableEmbed] });

                case 'disable':
                    settings[guildId] = { ...settings[guildId], enabled: false };
                    await this.saveSettings(settings);

                    const disableEmbed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('🔇 Music Bot Disabled')
                        .setDescription('Music commands are now **disabled** in this server.')
                        .setFooter({ text: `Disabled by ${interaction.user.tag}` })
                        .setTimestamp();

                    return interaction.editReply({ embeds: [disableEmbed] });

                case 'role':
                    const role = interaction.options.getRole('role');
                    settings[guildId] = { 
                        ...settings[guildId], 
                        enabled: settings[guildId]?.enabled ?? true,
                        requiredRole: role.id 
                    };
                    await this.saveSettings(settings);

                    const roleEmbed = new EmbedBuilder()
                        .setColor(0x5865f2)
                        .setTitle('🎭 Music Role Set')
                        .setDescription(`Music commands now require the **${role.name}** role.`)
                        .addFields({
                            name: '✅ Who Can Use Music',
                            value: `• Users with ${role} role\n• Server administrators`,
                            inline: false
                        })
                        .setFooter({ text: `Role set by ${interaction.user.tag}` })
                        .setTimestamp();

                    return interaction.editReply({ embeds: [roleEmbed] });

                case 'remove-role':
                    if (settings[guildId]) {
                        delete settings[guildId].requiredRole;
                        await this.saveSettings(settings);
                    }

                    const removeRoleEmbed = new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle('🌐 Role Requirement Removed')
                        .setDescription('Music commands are now available to **everyone** in the server.')
                        .setFooter({ text: `Role removed by ${interaction.user.tag}` })
                        .setTimestamp();

                    return interaction.editReply({ embeds: [removeRoleEmbed] });

                case 'status':
                    const guildSettings = settings[guildId] || { enabled: false };
                    const isEnabled = guildSettings.enabled || false;
                    const requiredRoleId = guildSettings.requiredRole;
                    const requiredRole = requiredRoleId ? interaction.guild.roles.cache.get(requiredRoleId) : null;

                    const statusEmbed = new EmbedBuilder()
                        .setColor(isEnabled ? 0x00ff00 : 0xff0000)
                        .setTitle('🎵 Music Bot Status')
                        .addFields(
                            {
                                name: '⚡ Status',
                                value: isEnabled ? '✅ **Enabled**' : '❌ **Disabled**',
                                inline: true
                            },
                            {
                                name: '🎭 Required Role',
                                value: requiredRole ? `${requiredRole}` : '🌐 **None** (Everyone)',
                                inline: true
                            },
                            {
                                name: '📋 Available Commands',
                                value: isEnabled ? 
                                    '`/play` • `/stop` • `/skip` • `/volume` • `/queue`' : 
                                    '*Music is currently disabled*',
                                inline: false
                            }
                        )
                        .setFooter({ text: `Requested by ${interaction.user.tag}` })
                        .setTimestamp();

                    return interaction.editReply({ embeds: [statusEmbed] });
            }

        } catch (error) {
            console.error('❌ Setup-music command error:', error);
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('❌ Error')
                    .setDescription('Failed to update music settings. Please try again.')]
            });
        }
    },

    // Helper functions
    async function ensureDataDir() {
        const dataDir = path.dirname(MUSIC_SETTINGS_FILE);
        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
        }
    },

    async function loadSettings() {
        try {
            const data = await fs.readFile(MUSIC_SETTINGS_FILE, 'utf8');
            return JSON.parse(data);
        } catch {
            return {};
        }
    },

    async function saveSettings(settings) {
        await fs.writeFile(MUSIC_SETTINGS_FILE, JSON.stringify(settings, null, 2));
    },

    // Function to check if music is enabled and user has permission
    async function checkMusicPermission(interaction) {
        const settings = await this.loadSettings();
        const guildSettings = settings[interaction.guild.id];
        
        // Check if music is enabled
        if (!guildSettings?.enabled) {
            return {
                allowed: false,
                reason: 'Music bot is disabled in this server. Use `/setup-music enable` to enable it.'
            };
        }

        // Check role requirement
        if (guildSettings.requiredRole) {
            const hasRole = interaction.member.roles.cache.has(guildSettings.requiredRole);
            const isAdmin = (interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) || interaction.guild.ownerId === interaction.user.id);
            
            if (!hasRole && !isAdmin) {
                const role = interaction.guild.roles.cache.get(guildSettings.requiredRole);
                return {
                    allowed: false,
                    reason: `You need the **${role?.name || 'required role'}** to use music commands.`
                };
            }
        }

        return { allowed: true };
    }
};
