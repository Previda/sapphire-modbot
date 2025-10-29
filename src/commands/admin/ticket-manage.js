const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-manage')
        .setDescription('🎫 Manage current ticket')
        .addSubcommand(subcommand =>
            subcommand
                .setName('menu')
                .setDescription('Show ticket management menu'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Close this ticket')
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Reason for closing')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('claim')
                .setDescription('Claim this ticket'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unclaim')
                .setDescription('Unclaim this ticket'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('pause')
                .setDescription('Pause this ticket (lock channel)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('resume')
                .setDescription('Resume this ticket (unlock channel)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('save')
                .setDescription('Save ticket transcript'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rename')
                .setDescription('Rename this ticket')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('New ticket name')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('priority')
                .setDescription('Set ticket priority')
                .addStringOption(option =>
                    option
                        .setName('level')
                        .setDescription('Priority level')
                        .setRequired(true)
                        .addChoices(
                            { name: '🔴 High', value: 'high' },
                            { name: '🟡 Medium', value: 'medium' },
                            { name: '🟢 Low', value: 'low' }
                        ))),

    async execute(interaction) {
        // Check if in ticket channel
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({
                content: '❌ This command can only be used in ticket channels!',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'menu':
                await handleMenu(interaction);
                break;
            case 'close':
                await handleClose(interaction);
                break;
            case 'claim':
                await handleClaim(interaction);
                break;
            case 'unclaim':
                await handleUnclaim(interaction);
                break;
            case 'pause':
                await handlePause(interaction);
                break;
            case 'resume':
                await handleResume(interaction);
                break;
            case 'save':
                await handleSave(interaction);
                break;
            case 'rename':
                await handleRename(interaction);
                break;
            case 'priority':
                await handlePriority(interaction);
                break;
        }
    }
};

async function handleMenu(interaction) {
    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎫 Ticket Management Menu')
        .setDescription('Use the buttons below to manage this ticket:')
        .addFields(
            { name: '🔒 Close', value: 'Close and delete this ticket', inline: true },
            { name: '✋ Claim', value: 'Claim this ticket', inline: true },
            { name: '💾 Save', value: 'Save transcript', inline: true },
            { name: '⏸️ Pause', value: 'Lock the ticket', inline: true },
            { name: '▶️ Resume', value: 'Unlock the ticket', inline: true },
            { name: '🏷️ Priority', value: 'Set priority level', inline: true }
        )
        .setFooter({ text: `Ticket: ${interaction.channel.name}` })
        .setTimestamp();

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_close')
                .setLabel('Close')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('ticket_claim')
                .setLabel('Claim')
                .setEmoji('✋')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('ticket_save')
                .setLabel('Save')
                .setEmoji('💾')
                .setStyle(ButtonStyle.Secondary)
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_pause')
                .setLabel('Pause')
                .setEmoji('⏸️')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('ticket_resume')
                .setLabel('Resume')
                .setEmoji('▶️')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('ticket_priority')
                .setLabel('Priority')
                .setEmoji('🏷️')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [embed],
        components: [row1, row2],
        ephemeral: true
    });
}

async function handleClose(interaction) {
    const reason = interaction.options.getString('reason') || 'No reason provided';

    await interaction.reply({
        embeds: [new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('🔒 Closing Ticket')
            .setDescription(`This ticket will be closed in 5 seconds...\n\n**Reason:** ${reason}\n**Closed by:** ${interaction.user}`)
            .setTimestamp()
        ]
    });

    setTimeout(async () => {
        try {
            await interaction.channel.delete();
        } catch (error) {
            console.error('Error closing ticket:', error);
        }
    }, 5000);
}

async function handleClaim(interaction) {
    await interaction.reply({
        embeds: [new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('✋ Ticket Claimed')
            .setDescription(`${interaction.user} is now handling this ticket.`)
            .setTimestamp()
        ]
    });
}

async function handleUnclaim(interaction) {
    await interaction.reply({
        embeds: [new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle('👋 Ticket Unclaimed')
            .setDescription(`${interaction.user} is no longer handling this ticket.`)
            .setTimestamp()
        ]
    });
}

async function handlePause(interaction) {
    try {
        // Lock channel for everyone except staff
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: false
        });

        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(0xFEE75C)
                .setTitle('⏸️ Ticket Paused')
                .setDescription(`This ticket has been paused by ${interaction.user}.\n\nThe channel is now locked.`)
                .setTimestamp()
            ]
        });
    } catch (error) {
        await interaction.reply({
            content: '❌ Failed to pause ticket!',
            ephemeral: true
        });
    }
}

async function handleResume(interaction) {
    try {
        // Unlock channel
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: null
        });

        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('▶️ Ticket Resumed')
                .setDescription(`This ticket has been resumed by ${interaction.user}.\n\nThe channel is now unlocked.`)
                .setTimestamp()
            ]
        });
    } catch (error) {
        await interaction.reply({
            content: '❌ Failed to resume ticket!',
            ephemeral: true
        });
    }
}

async function handleSave(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcript = messages.reverse().map(m => 
            `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`
        ).join('\n');

        const fs = require('fs').promises;
        const path = require('path');
        
        const transcriptDir = path.join(__dirname, '../../../data/transcripts');
        await fs.mkdir(transcriptDir, { recursive: true });
        
        const filename = `${interaction.channel.name}-${Date.now()}.txt`;
        const filepath = path.join(transcriptDir, filename);
        
        await fs.writeFile(filepath, transcript);

        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('💾 Transcript Saved')
                .setDescription(`Transcript saved as \`${filename}\`\n\nTotal messages: ${messages.size}`)
                .setTimestamp()
            ]
        });

    } catch (error) {
        console.error('Error saving transcript:', error);
        await interaction.editReply({
            content: '❌ Failed to save transcript!'
        });
    }
}

async function handleRename(interaction) {
    const newName = interaction.options.getString('name');

    try {
        const oldName = interaction.channel.name;
        await interaction.channel.setName(newName);

        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✏️ Ticket Renamed')
                .setDescription(`Ticket renamed from \`${oldName}\` to \`${newName}\``)
                .setTimestamp()
            ]
        });
    } catch (error) {
        await interaction.reply({
            content: '❌ Failed to rename ticket!',
            ephemeral: true
        });
    }
}

async function handlePriority(interaction) {
    const level = interaction.options.getString('level');
    
    const priorityEmojis = {
        high: '🔴',
        medium: '🟡',
        low: '🟢'
    };

    const priorityColors = {
        high: 0xED4245,
        medium: 0xFEE75C,
        low: 0x57F287
    };

    await interaction.reply({
        embeds: [new EmbedBuilder()
            .setColor(priorityColors[level])
            .setTitle(`${priorityEmojis[level]} Priority Set`)
            .setDescription(`This ticket's priority has been set to **${level.toUpperCase()}**`)
            .setTimestamp()
        ]
    });
}
