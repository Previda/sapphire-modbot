const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { getTicketByChannel } = require('../../utils/ticketUtils');
const { createReceipt, getReceiptByOrderNumber, getReceiptsForCustomer } = require('../../utils/receiptUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('receipt')
        .setDescription('Create and manage order receipts linked to tickets')
        .addSubcommand(sub =>
            sub
                .setName('create')
                .setDescription('Create a receipt for a customer/order')
                // Required options (must come first)
                .addUserOption(opt =>
                    opt.setName('customer')
                        .setDescription('Customer to issue the receipt to')
                        .setRequired(true))
                .addNumberOption(opt =>
                    opt.setName('amount')
                        .setDescription('Order amount (e.g. 19.99)')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('currency')
                        .setDescription('Currency code (e.g. USD)')
                        .setRequired(true)
                        .addChoices(
                            { name: 'USD', value: 'USD' },
                            { name: 'EUR', value: 'EUR' },
                            { name: 'GBP', value: 'GBP' },
                            { name: 'CAD', value: 'CAD' },
                            { name: 'AUD', value: 'AUD' }
                        ))
                .addStringOption(opt =>
                    opt.setName('description')
                        .setDescription('What this order/receipt is for')
                        .setRequired(true))
                // Optional linking + company info
                .addChannelOption(opt =>
                    opt.setName('ticket_channel')
                        .setDescription('Link this receipt to an existing ticket channel')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false))
                .addStringOption(opt =>
                    opt.setName('company_name')
                        .setDescription('Company or brand name to show on the receipt')
                        .setRequired(false))
                .addStringOption(opt =>
                    opt.setName('company_logo')
                        .setDescription('Logo image URL to show on the receipt')
                        .setRequired(false))
                // Optional line items (up to 3)
                .addStringOption(opt =>
                    opt.setName('item1_desc')
                        .setDescription('Item 1 description')
                        .setRequired(false))
                .addNumberOption(opt =>
                    opt.setName('item1_price')
                        .setDescription('Item 1 price')
                        .setRequired(false))
                .addStringOption(opt =>
                    opt.setName('item2_desc')
                        .setDescription('Item 2 description')
                        .setRequired(false))
                .addNumberOption(opt =>
                    opt.setName('item2_price')
                        .setDescription('Item 2 price')
                        .setRequired(false))
                .addStringOption(opt =>
                    opt.setName('item3_desc')
                        .setDescription('Item 3 description')
                        .setRequired(false))
                .addNumberOption(opt =>
                    opt.setName('item3_price')
                        .setDescription('Item 3 price')
                        .setRequired(false)))
        .addSubcommand(sub =>
            sub
                .setName('get')
                .setDescription('Look up a receipt by order number')
                .addStringOption(opt =>
                    opt.setName('order')
                        .setDescription('Order/receipt number (e.g. R-0001)')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub
                .setName('list')
                .setDescription('List recent receipts for a customer')
                .addUserOption(opt =>
                    opt.setName('customer')
                        .setDescription('Customer (defaults to you)')
                        .setRequired(false)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (!interaction.guild) {
            return interaction.reply({
                content: '❌ This command can only be used in a server.',
                ephemeral: true
            });
        }

        try {
            if (sub === 'create') {
                return await handleCreateReceipt(interaction);
            } else if (sub === 'get') {
                return await handleGetReceipt(interaction);
            } else if (sub === 'list') {
                return await handleListReceipts(interaction);
            }
        } catch (error) {
            console.error('Receipt command error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ An error occurred while handling the receipt command.',
                    ephemeral: true
                });
            }
        }
    }
};

async function handleCreateReceipt(interaction) {
    const customer = interaction.options.getUser('customer', true);
    const amount = interaction.options.getNumber('amount', true);
    const currency = interaction.options.getString('currency', true);
    const description = interaction.options.getString('description', true);
    const ticketChannel = interaction.options.getChannel('ticket_channel');
    const companyName = interaction.options.getString('company_name') || null;
    const companyLogoUrl = interaction.options.getString('company_logo') || null;

    const items = [];
    for (let i = 1; i <= 3; i++) {
        const itemDesc = interaction.options.getString(`item${i}_desc`);
        const itemPrice = interaction.options.getNumber(`item${i}_price`);
        if (itemDesc && typeof itemPrice === 'number') {
            items.push({
                description: itemDesc,
                price: itemPrice,
                currency
            });
        }
    }

    let ticketId = null;
    let ticketChannelId = null;

    if (ticketChannel) {
        const ticket = await getTicketByChannel(ticketChannel.id);
        if (!ticket) {
            return interaction.reply({
                content: '❌ The selected channel is not a ticket channel.',
                ephemeral: true
            });
        }
        ticketId = ticket.ticketID || null;
        ticketChannelId = ticket.channelID || ticketChannel.id;
    } else {
        const ticket = await getTicketByChannel(interaction.channel.id);
        if (ticket) {
            ticketId = ticket.ticketID || null;
            ticketChannelId = ticket.channelID || interaction.channel.id;
        }
    }

    const receipt = await createReceipt({
        guildId: interaction.guild.id,
        customerId: customer.id,
        createdBy: interaction.user.id,
        amount,
        currency,
        description,
        ticketId,
        ticketChannelId,
        companyName,
        companyLogoUrl,
        items
    });

    const embed = new EmbedBuilder()
        .setTitle('🧾 Receipt Created')
        .setColor(0x57F287)
        .setTimestamp(new Date(receipt.createdAt));

    if (receipt.companyName) {
        if (receipt.companyLogoUrl) {
            embed.setAuthor({ name: receipt.companyName, iconURL: receipt.companyLogoUrl });
        } else {
            embed.setAuthor({ name: receipt.companyName });
        }
    } else if (receipt.companyLogoUrl) {
        embed.setThumbnail(receipt.companyLogoUrl);
    }

    embed
        .addFields(
            { name: 'Order Number', value: receipt.orderNumber, inline: true },
            { name: 'Customer', value: `${customer.tag} (${customer.id})`, inline: true },
            { name: 'Amount', value: `${receipt.amount.toFixed(2)} ${receipt.currency}`, inline: true },
            { name: 'Description', value: receipt.description, inline: false },
            { name: 'Linked Ticket', value: ticketChannelId ? `<#${ticketChannelId}>` : 'Not linked', inline: false }
        );

    if (receipt.items && receipt.items.length > 0) {
        const lines = receipt.items
            .map(it => `• ${it.description} — ${it.price.toFixed(2)} ${it.currency}`)
            .join('\n');
        embed.addFields({ name: 'Items', value: lines, inline: false });
    }

    await interaction.reply({
        embeds: [embed],
        ephemeral: true
    });

    try {
        const customerMember = await interaction.client.users.fetch(customer.id);
        await customerMember.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('🧾 Your Receipt')
                    .setColor(0x57F287)
                    .setDescription('Thank you! Here is your receipt for your order.')
                    .setTimestamp(new Date(receipt.createdAt))
            ]
        }).catch(() => {});
    } catch {
        // Ignore DM failures
    }
}

async function handleGetReceipt(interaction) {
    const order = interaction.options.getString('order', true);
    const receipt = await getReceiptByOrderNumber(interaction.guild.id, order);

    if (!receipt) {
        return interaction.reply({
            content: '❌ No receipt found with that order number.',
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setTitle('🧾 Receipt Details')
        .setColor(0x5865F2);

    if (receipt.companyName) {
        if (receipt.companyLogoUrl) {
            embed.setAuthor({ name: receipt.companyName, iconURL: receipt.companyLogoUrl });
        } else {
            embed.setAuthor({ name: receipt.companyName });
        }
    } else if (receipt.companyLogoUrl) {
        embed.setThumbnail(receipt.companyLogoUrl);
    }

    embed
        .addFields(
            { name: 'Order Number', value: receipt.orderNumber, inline: true },
            { name: 'Customer', value: `<@${receipt.customerId}>`, inline: true },
            { name: 'Amount', value: `${receipt.amount.toFixed(2)} ${receipt.currency}`, inline: true },
            { name: 'Description', value: receipt.description, inline: false },
            { name: 'Status', value: receipt.status || 'open', inline: true },
            { name: 'Created At', value: `<t:${Math.floor(new Date(receipt.createdAt).getTime() / 1000)}:F>`, inline: false },
            { name: 'Linked Ticket', value: receipt.ticketChannelId ? `<#${receipt.ticketChannelId}>` : 'Not linked', inline: false }
        )
        .setFooter({ text: `Guild ID: ${receipt.guildId}` });

    if (receipt.items && receipt.items.length > 0) {
        const lines = receipt.items
            .map(it => `• ${it.description} — ${it.price.toFixed(2)} ${it.currency}`)
            .join('\n');
        embed.addFields({ name: 'Items', value: lines, inline: false });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleListReceipts(interaction) {
    const customer = interaction.options.getUser('customer') || interaction.user;

    const receipts = await getReceiptsForCustomer(interaction.guild.id, customer.id, 10);

    if (receipts.length === 0) {
        return interaction.reply({
            content: `📋 No receipts found for ${customer.tag}.`,
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setTitle('🧾 Recent Receipts')
        .setColor(0x0099ff)
        .setDescription(`Showing ${receipts.length} most recent receipt(s) for ${customer.tag}`)
        .setTimestamp();

    for (const r of receipts) {
        embed.addFields({
            name: `${r.orderNumber} — ${r.amount.toFixed(2)} ${r.currency}`,
            value: `**Description:** ${r.description}\n**Date:** <t:${Math.floor(new Date(r.createdAt).getTime() / 1000)}:R>\n**Ticket:** ${r.ticketChannelId ? `<#${r.ticketChannelId}>` : 'Not linked'}`,
            inline: false
        });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
}
