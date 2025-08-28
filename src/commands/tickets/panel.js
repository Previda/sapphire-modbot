const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { isSuperuser } = require('../../utils/superuserManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('🎫 Create an interactive ticket panel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the ticket panel (optional - defaults to current)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Custom title for the ticket panel')
                .setRequired(false)
                .setMaxLength(100))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Custom description for the ticket panel')
                .setRequired(false)
                .setMaxLength(500))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        try {
            // Check permissions
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild) && 
                !isSuperuser(interaction.user.id)) {
                return await interaction.editReply({
                    content: '❌ You need **Manage Server** permissions to create ticket panels.'
                });
            }

            const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
            const customTitle = interaction.options.getString('title');
            const customDescription = interaction.options.getString('description');

            // Create ticket panel embed
            const panelEmbed = new EmbedBuilder()
                .setTitle(customTitle || '🎫 Support Ticket System')
                .setDescription(
                    customDescription || 
                    `Welcome to our support system! Click the buttons below to get help.\n\n` +
                    `🎫 **General Support** - For general questions and assistance\n` +
                    `❓ **Technical Help** - For technical issues and bugs\n` +
                    `📝 **Report Issue** - To report problems or violations\n` +
                    `💰 **Billing Support** - For billing and payment questions\n\n` +
                    `*Staff will respond as soon as possible.*`
                )
                .setColor('#3742FA')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
                .addFields(
                    {
                        name: '📋 How it works',
                        value: '• Click a button to create your ticket\n• Fill out the form with details\n• Wait for staff to respond\n• Only you and staff can see your ticket',
                        inline: false
                    },
                    {
                        name: '⚡ Quick Tips',
                        value: '• Be specific about your issue\n• Include screenshots if helpful\n• One ticket per issue\n• Be patient - staff will help!',
                        inline: false
                    }
                )
                .setFooter({ 
                    text: `${interaction.guild.name} Support System`,
                    iconURL: interaction.guild.iconURL() 
                })
                .setTimestamp();

            // Create action row with ticket buttons
            const ticketRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_ticket_general')
                        .setLabel('General Support')
                        .setEmoji('🎫')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('create_ticket_technical')
                        .setLabel('Technical Help')
                        .setEmoji('⚙️')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('create_ticket_report')
                        .setLabel('Report Issue')
                        .setEmoji('📝')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('create_ticket_billing')
                        .setLabel('Billing Support')
                        .setEmoji('💰')
                        .setStyle(ButtonStyle.Success)
                );

            // Send the panel to target channel
            const panelMessage = await targetChannel.send({
                embeds: [panelEmbed],
                components: [ticketRow]
            });

            // Create success embed
            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Ticket Panel Created!')
                .setDescription(`Successfully created ticket panel in ${targetChannel}`)
                .setColor('#00FF00')
                .addFields(
                    { name: '📺 Channel', value: `${targetChannel}`, inline: true },
                    { name: '🆔 Message ID', value: `${panelMessage.id}`, inline: true },
                    { name: '⏰ Created', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                )
                .setFooter({ text: 'Ticket panel is now active and ready to use!' });

            await interaction.editReply({
                embeds: [successEmbed]
            });

        } catch (error) {
            console.error('Error creating ticket panel:', error);
            
            await interaction.editReply({
                content: '❌ **Error:** Failed to create ticket panel. Please try again.'
            }).catch(() => {});
        }
    }
};
