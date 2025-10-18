const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

const APPEAL_CONFIG_PATH = path.join(process.cwd(), 'data', 'appeal-configs');

async function loadAppealConfig(guildId) {
    try {
        const configPath = path.join(APPEAL_CONFIG_PATH, `${guildId}.json`);
        const data = await fs.readFile(configPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return default config
        return {
            enabled: true,
            questions: [
                {
                    id: 'reason',
                    label: 'Why should this punishment be reversed?',
                    placeholder: 'Explain why you believe this action was unfair or incorrect',
                    required: true,
                    style: 'paragraph'
                },
                {
                    id: 'evidence',
                    label: 'Evidence (Optional)',
                    placeholder: 'Provide any evidence, screenshots, or additional context',
                    required: false,
                    style: 'paragraph'
                },
                {
                    id: 'contact',
                    label: 'Preferred Contact Method',
                    placeholder: 'Discord DM, Email, etc.',
                    required: false,
                    style: 'short'
                }
            ],
            reviewChannel: null,
            autoApprove: false,
            cooldown: 86400000 // 24 hours
        };
    }
}

async function saveAppealConfig(guildId, config) {
    try {
        await fs.mkdir(APPEAL_CONFIG_PATH, { recursive: true });
        const configPath = path.join(APPEAL_CONFIG_PATH, `${guildId}.json`);
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving appeal config:', error);
        return false;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('appeal-config')
        .setDescription('⚙️ Configure the appeal system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View current appeal configuration'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable or disable the appeal system')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Enable appeals?')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Set the appeal review channel')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel where appeals will be reviewed')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit-questions')
                .setDescription('Edit appeal form questions'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset appeal configuration to defaults'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        switch (subcommand) {
            case 'view':
                await handleView(interaction, guildId);
                break;
            case 'enable':
                await handleEnable(interaction, guildId);
                break;
            case 'channel':
                await handleChannel(interaction, guildId);
                break;
            case 'edit-questions':
                await handleEditQuestions(interaction, guildId);
                break;
            case 'reset':
                await handleReset(interaction, guildId);
                break;
        }
    },

    loadAppealConfig,
    saveAppealConfig
};

async function handleView(interaction, guildId) {
    const config = await loadAppealConfig(guildId);
    
    const embed = new EmbedBuilder()
        .setTitle('⚙️ Appeal System Configuration')
        .setColor(config.enabled ? '#00ff00' : '#ff0000')
        .addFields(
            { name: '📊 Status', value: config.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '📋 Review Channel', value: config.reviewChannel ? `<#${config.reviewChannel}>` : '❌ Not set', inline: true },
            { name: '⏱️ Cooldown', value: `${config.cooldown / 3600000} hours`, inline: true },
            { name: '❓ Questions', value: `${config.questions.length} question(s) configured`, inline: false }
        )
        .setTimestamp();
    
    // Add questions preview
    let questionsText = '';
    config.questions.forEach((q, i) => {
        questionsText += `**${i + 1}. ${q.label}** ${q.required ? '(Required)' : '(Optional)'}\n`;
    });
    
    if (questionsText) {
        embed.addFields({ name: '📝 Current Questions', value: questionsText, inline: false });
    }
    
    await interaction.reply({ embeds: [embed], flags: 64 });
}

async function handleEnable(interaction, guildId) {
    const enabled = interaction.options.getBoolean('enabled');
    const config = await loadAppealConfig(guildId);
    
    config.enabled = enabled;
    await saveAppealConfig(guildId, config);
    
    await interaction.reply({
        content: `✅ Appeal system ${enabled ? 'enabled' : 'disabled'}!`,
        flags: 64
    });
}

async function handleChannel(interaction, guildId) {
    const channel = interaction.options.getChannel('channel');
    const config = await loadAppealConfig(guildId);
    
    config.reviewChannel = channel.id;
    await saveAppealConfig(guildId, config);
    
    await interaction.reply({
        content: `✅ Appeal review channel set to ${channel}!`,
        flags: 64
    });
}

async function handleEditQuestions(interaction, guildId) {
    const config = await loadAppealConfig(guildId);
    
    const modal = new ModalBuilder()
        .setCustomId('appeal_config_modal')
        .setTitle('Edit Appeal Questions');
    
    // Question 1
    const q1Label = new TextInputBuilder()
        .setCustomId('q1_label')
        .setLabel('Question 1 Label')
        .setStyle(TextInputStyle.Short)
        .setValue(config.questions[0]?.label || 'Why should this punishment be reversed?')
        .setRequired(true);
    
    const q1Placeholder = new TextInputBuilder()
        .setCustomId('q1_placeholder')
        .setLabel('Question 1 Placeholder')
        .setStyle(TextInputStyle.Short)
        .setValue(config.questions[0]?.placeholder || 'Explain your reasoning')
        .setRequired(false);
    
    // Question 2
    const q2Label = new TextInputBuilder()
        .setCustomId('q2_label')
        .setLabel('Question 2 Label (Optional)')
        .setStyle(TextInputStyle.Short)
        .setValue(config.questions[1]?.label || 'Evidence (Optional)')
        .setRequired(false);
    
    const q2Placeholder = new TextInputBuilder()
        .setCustomId('q2_placeholder')
        .setLabel('Question 2 Placeholder')
        .setStyle(TextInputStyle.Short)
        .setValue(config.questions[1]?.placeholder || 'Provide evidence')
        .setRequired(false);
    
    // Question 3
    const q3Label = new TextInputBuilder()
        .setCustomId('q3_label')
        .setLabel('Question 3 Label (Optional)')
        .setStyle(TextInputStyle.Short)
        .setValue(config.questions[2]?.label || 'Contact Method')
        .setRequired(false);
    
    modal.addComponents(
        new ActionRowBuilder().addComponents(q1Label),
        new ActionRowBuilder().addComponents(q1Placeholder),
        new ActionRowBuilder().addComponents(q2Label),
        new ActionRowBuilder().addComponents(q2Placeholder),
        new ActionRowBuilder().addComponents(q3Label)
    );
    
    await interaction.showModal(modal);
}

async function handleReset(interaction, guildId) {
    const defaultConfig = {
        enabled: true,
        questions: [
            {
                id: 'reason',
                label: 'Why should this punishment be reversed?',
                placeholder: 'Explain why you believe this action was unfair or incorrect',
                required: true,
                style: 'paragraph'
            },
            {
                id: 'evidence',
                label: 'Evidence (Optional)',
                placeholder: 'Provide any evidence, screenshots, or additional context',
                required: false,
                style: 'paragraph'
            },
            {
                id: 'contact',
                label: 'Preferred Contact Method',
                placeholder: 'Discord DM, Email, etc.',
                required: false,
                style: 'short'
            }
        ],
        reviewChannel: null,
        autoApprove: false,
        cooldown: 86400000
    };
    
    await saveAppealConfig(guildId, defaultConfig);
    
    await interaction.reply({
        content: '✅ Appeal configuration reset to defaults!',
        flags: 64
    });
}
