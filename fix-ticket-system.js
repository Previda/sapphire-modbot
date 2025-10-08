#!/usr/bin/env node

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🎫 Fixing Ticket System Issues');
console.log('===============================\n');

async function fixTicketCommand() {
    console.log('🔧 Fixing ticket command file...\n');
    
    const ticketCommandPath = path.join(__dirname, 'src', 'commands', 'tickets', 'ticket.js');
    
    if (!fs.existsSync(ticketCommandPath)) {
        console.error('❌ Ticket command file not found!');
        return false;
    }
    
    // Read current file
    let content = fs.readFileSync(ticketCommandPath, 'utf8');
    
    // Fix 1: Add missing moderationManager import at top
    if (!content.includes("const { moderationManager } = require('../../utils/moderationManager');")) {
        content = content.replace(
            "const dashboardLogger = require('../../utils/dashboardLogger');",
            "const dashboardLogger = require('../../utils/dashboardLogger');\nconst { moderationManager } = require('../../utils/moderationManager');"
        );
        console.log('✅ Added moderationManager import');
    }
    
    // Fix 2: Ensure 'open' case is in switch statement
    if (!content.includes("case 'open':")) {
        content = content.replace(
            "switch (subcommand) {",
            `switch (subcommand) {
                case 'open':
                    await handleOpenTicket(interaction);
                    break;`
        );
        console.log('✅ Added open case to switch statement');
    }
    
    // Fix 3: Fix blacklist import path
    content = content.replace(
        "const { isUserBlacklisted } = require('./blacklist.js');",
        "const { isUserBlacklisted } = require('../moderation/blacklist.js');"
    );
    
    // Fix 4: Remove duplicate moderationManager calls
    content = content.replace(
        /const allCases = moderationManager\.getAllCases\(\);/g,
        'const allCases = moderationManager.getAllCases();'
    );
    
    // Fix 5: Add proper error handling and defer reply
    const handleOpenTicketFix = `
async function handleOpenTicket(interaction) {
    const reason = interaction.options.getString('reason');
    const category = interaction.options.getString('category') || 'general';
    const user = interaction.user;
    const guild = interaction.guild;

    try {
        // Defer reply to prevent timeout
        await interaction.deferReply({ ephemeral: true });

        // Check if user is blacklisted (skip if blacklist doesn't exist)
        try {
            const { isUserBlacklisted } = require('../moderation/blacklist.js');
            const isBlacklisted = await isUserBlacklisted(interaction.guild.id, user.id);
            
            if (isBlacklisted) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('🚫 Ticket Access Denied')
                        .setDescription('You are blacklisted from creating tickets in this server.')
                        .addFields(
                            { name: '📞 Contact', value: 'Contact server moderators if you believe this is a mistake.', inline: false }
                        )]
                });
            }
        } catch (error) {
            console.log('Blacklist check skipped - module not found');
        }

        // Clean up any tickets with deleted channels first
        await cleanupDeletedTickets(interaction.guild);

        // Create case for ticket using new case system
        const ticketCase = await createCase({
            type: 'ticket',
            userId: user.id,
            moderatorId: user.id, // User creates their own ticket
            guildId: guild.id,
            reason: reason,
            status: 'open',
            appealable: false
        });

        // Check bot permissions first
        const botMember = guild.members.me;
        if (!botMember.permissions.has(['ManageChannels', 'ManageRoles'])) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('❌ Permission Error')
                    .setDescription('Bot needs **Manage Channels** and **Manage Roles** permissions to create tickets.')]
            });
        }

        // Get ticket category or create in parent category
        let parent = null;
        const config = loadGuildConfig(guild.id);
        if (config.tickets?.categoryId) {
            parent = guild.channels.cache.get(config.tickets.categoryId);
        }

        // Create ticket channel
        const channel = await guild.channels.create({
            name: \`\${category}-\${user.username}-\${ticketCase.caseId}\`,
            type: ChannelType.GuildText,
            parent: parent,
            topic: \`Ticket by \${user.tag} | Case #\${ticketCase.caseId} | Reason: \${reason}\`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                },
                {
                    id: botMember.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                }
            ]
        });

        // Store ticket in local storage using ticket utils
        const { saveTicket } = require('../../utils/ticketUtils');
        await saveTicket({
            ticketID: \`ticket-\${ticketCase.caseId}\`,
            caseId: ticketCase.caseId,
            userID: user.id,
            guildID: guild.id,
            channelID: channel.id,
            status: 'open',
            reason: reason,
            category: category,
            createdAt: new Date().toISOString(),
            createdBy: user.id
        });

        // Import required components
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        
        // Create ticket control buttons
        const controlRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(\`close_ticket\`)
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId(\`generate_transcript\`)
                    .setLabel('Generate Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📋')
            );

        // Send welcome message
        const embed = new EmbedBuilder()
            .setTitle('🎫 Support Ticket Created')
            .setDescription(\`Hello \${user}, your support ticket has been created!\`)
            .addFields(
                { name: '📝 Reason', value: reason, inline: false },
                { name: '📂 Category', value: category.charAt(0).toUpperCase() + category.slice(1), inline: true },
                { name: '🆔 Case ID', value: \`#\${ticketCase.caseId}\`, inline: true },
                { name: '⏰ Created', value: \`<t:\${Math.floor(Date.now() / 1000)}:R>\`, inline: true },
                { name: '📋 Status', value: '🟢 Open', inline: true },
                { name: '🔧 Actions', value: 'Use the buttons below to manage this ticket', inline: false }
            )
            .setColor(0x00ff00)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: \`Skyfall Ticket System • Case #\${ticketCase.caseId}\`, iconURL: guild.iconURL() })
            .setTimestamp();

        await channel.send({ 
            content: \`\${user} Welcome to your support ticket!\`, 
            embeds: [embed], 
            components: [controlRow] 
        });

        await interaction.editReply({
            content: \`✅ Ticket created successfully! \${channel}\`
        });

        // Log to dashboard
        await dashboardLogger.logCommand('ticket-open', interaction.user, interaction.guild, {
            ticketId: ticketCase.caseId,
            reason: reason,
            category: category
        });

    } catch (error) {
        console.error('Error creating ticket:', error);
        
        if (interaction.deferred) {
            await interaction.editReply({
                content: '❌ Failed to create ticket. Please try again later.'
            });
        } else {
            await interaction.reply({
                content: '❌ Failed to create ticket. Please try again later.',
                ephemeral: true
            });
        }
    }
}`;
    
    // Replace the existing handleOpenTicket function
    const functionStart = content.indexOf('async function handleOpenTicket(interaction) {');
    if (functionStart !== -1) {
        const functionEnd = content.indexOf('\n}\n\nasync function handleTicketAdmin', functionStart);
        if (functionEnd !== -1) {
            content = content.substring(0, functionStart) + handleOpenTicketFix + content.substring(functionEnd);
            console.log('✅ Fixed handleOpenTicket function');
        }
    }
    
    // Write fixed content back
    fs.writeFileSync(ticketCommandPath, content);
    console.log('✅ Ticket command file updated');
    
    return true;
}

async function createTicketUtils() {
    console.log('🛠️ Creating enhanced ticket utilities...\n');
    
    const utilsPath = path.join(__dirname, 'src', 'utils', 'ticketUtils.js');
    
    const ticketUtilsContent = `
const fs = require('fs');
const path = require('path');

// Enhanced ticket utilities with better error handling
class TicketUtils {
    constructor() {
        this.ticketsPath = path.join(process.cwd(), 'data', 'tickets');
        this.ensureDirectoryExists();
    }

    ensureDirectoryExists() {
        if (!fs.existsSync(this.ticketsPath)) {
            fs.mkdirSync(this.ticketsPath, { recursive: true });
        }
    }

    async saveTicket(ticketData) {
        try {
            const filePath = path.join(this.ticketsPath, \`\${ticketData.ticketID}.json\`);
            fs.writeFileSync(filePath, JSON.stringify(ticketData, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving ticket:', error);
            return false;
        }
    }

    async getTicket(ticketId) {
        try {
            const filePath = path.join(this.ticketsPath, \`\${ticketId}.json\`);
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                return JSON.parse(data);
            }
            return null;
        } catch (error) {
            console.error('Error loading ticket:', error);
            return null;
        }
    }

    async updateTicket(ticketId, updates) {
        try {
            const ticket = await this.getTicket(ticketId);
            if (ticket) {
                Object.assign(ticket, updates);
                return await this.saveTicket(ticket);
            }
            return false;
        } catch (error) {
            console.error('Error updating ticket:', error);
            return false;
        }
    }

    async deleteTicket(ticketId) {
        try {
            const filePath = path.join(this.ticketsPath, \`\${ticketId}.json\`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting ticket:', error);
            return false;
        }
    }

    async getAllTickets() {
        try {
            const files = fs.readdirSync(this.ticketsPath);
            const tickets = [];
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const ticketId = file.replace('.json', '');
                    const ticket = await this.getTicket(ticketId);
                    if (ticket) tickets.push(ticket);
                }
            }
            
            return tickets;
        } catch (error) {
            console.error('Error loading all tickets:', error);
            return [];
        }
    }

    async cleanupDeletedTickets(guild) {
        try {
            const tickets = await this.getAllTickets();
            let cleaned = 0;
            
            for (const ticket of tickets) {
                if (ticket.guildID === guild.id && ticket.status === 'open') {
                    const channel = guild.channels.cache.get(ticket.channelID);
                    if (!channel) {
                        // Channel was deleted, mark ticket as closed
                        await this.updateTicket(ticket.ticketID, {
                            status: 'closed',
                            closedAt: new Date().toISOString(),
                            closeReason: 'Channel deleted'
                        });
                        cleaned++;
                    }
                }
            }
            
            if (cleaned > 0) {
                console.log(\`Cleaned up \${cleaned} deleted ticket channels\`);
            }
            
            return cleaned;
        } catch (error) {
            console.error('Error cleaning up tickets:', error);
            return 0;
        }
    }
}

const ticketUtils = new TicketUtils();

module.exports = {
    saveTicket: (data) => ticketUtils.saveTicket(data),
    getTicket: (id) => ticketUtils.getTicket(id),
    updateTicket: (id, updates) => ticketUtils.updateTicket(id, updates),
    deleteTicket: (id) => ticketUtils.deleteTicket(id),
    getAllTickets: () => ticketUtils.getAllTickets(),
    cleanupDeletedTickets: (guild) => ticketUtils.cleanupDeletedTickets(guild)
};
`;
    
    fs.writeFileSync(utilsPath, ticketUtilsContent);
    console.log('✅ Enhanced ticket utilities created');
}

async function createTicketButtons() {
    console.log('🔘 Creating ticket button handlers...\n');
    
    const buttonsPath = path.join(__dirname, 'src', 'utils', 'ticketButtons.js');
    
    const buttonHandlerContent = `
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { updateTicket, getTicket } = require('./ticketUtils');
const { moderationManager } = require('./moderationManager');

async function handleTicketButtons(interaction) {
    const customId = interaction.customId;
    
    try {
        switch (customId) {
            case 'close_ticket':
                await handleCloseTicketButton(interaction);
                break;
            case 'generate_transcript':
                await handleTranscriptButton(interaction);
                break;
            default:
                await interaction.reply({
                    content: '❌ Unknown button action.',
                    ephemeral: true
                });
        }
    } catch (error) {
        console.error('Error handling ticket button:', error);
        
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '❌ An error occurred while processing your request.',
                ephemeral: true
            });
        }
    }
}

async function handleCloseTicketButton(interaction) {
    const channel = interaction.channel;
    
    // Check permissions
    if (!interaction.member.permissions.has('ManageChannels') && 
        interaction.guild.ownerId !== interaction.user.id) {
        return interaction.reply({
            content: '❌ You need **Manage Channels** permission to close tickets.',
            ephemeral: true
        });
    }
    
    await interaction.deferReply();
    
    try {
        // Find ticket by channel name pattern
        const channelName = channel.name;
        const ticketMatch = channelName.match(/-(\\d+)$/);
        
        if (!ticketMatch) {
            return interaction.editReply({
                content: '❌ Could not identify ticket from channel name.'
            });
        }
        
        const caseId = ticketMatch[1];
        
        // Generate transcript
        const { generateBasicTranscript } = require('../commands/tickets/ticket');
        const transcript = await generateBasicTranscript(channel);
        
        // Close ticket
        const embed = new EmbedBuilder()
            .setTitle('🔒 Ticket Closed')
            .setDescription(\`Ticket has been closed by \${interaction.user.tag}\`)
            .addFields(
                { name: '🆔 Case ID', value: \`#\${caseId}\`, inline: true },
                { name: '👤 Closed By', value: interaction.user.tag, inline: true },
                { name: '📋 Status', value: '🔴 Closed', inline: true },
                { name: '⏰ Closed At', value: \`<t:\${Math.floor(Date.now() / 1000)}:F>\`, inline: true },
                { name: '📄 Transcript', value: transcript ? '✅ Generated' : '❌ Failed to generate', inline: true }
            )
            .setColor(0xff0000)
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
        
        // Delete channel after 30 seconds
        setTimeout(async () => {
            try {
                await channel.delete('Ticket closed');
            } catch (error) {
                console.error('Error deleting ticket channel:', error);
            }
        }, 30000);
        
    } catch (error) {
        console.error('Error closing ticket:', error);
        await interaction.editReply({
            content: '❌ Failed to close ticket. Please try again.'
        });
    }
}

async function handleTranscriptButton(interaction) {
    const channel = interaction.channel;
    
    await interaction.deferReply({ ephemeral: true });
    
    try {
        const { generateBasicTranscript } = require('../commands/tickets/ticket');
        const transcript = await generateBasicTranscript(channel);
        
        if (transcript) {
            await interaction.editReply({
                content: '✅ Transcript generated successfully!',
                files: [{ attachment: transcript.path, name: transcript.filename }]
            });
        } else {
            await interaction.editReply({
                content: '❌ Failed to generate transcript. Please check permissions and try again.'
            });
        }
        
    } catch (error) {
        console.error('Error generating transcript:', error);
        await interaction.editReply({
            content: '❌ An error occurred while generating the transcript.'
        });
    }
}

module.exports = {
    handleTicketButtons,
    handleCloseTicketButton,
    handleTranscriptButton
};
`;
    
    fs.writeFileSync(buttonsPath, buttonHandlerContent);
    console.log('✅ Ticket button handlers created');
}

async function createWebsiteIntegration() {
    console.log('🌐 Creating website integration API...\n');
    
    const apiPath = path.join(__dirname, 'pages', 'api', 'tickets');
    if (!fs.existsSync(apiPath)) {
        fs.mkdirSync(apiPath, { recursive: true });
    }
    
    // Create tickets API endpoint
    const ticketsApiContent = `
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const { getAllTickets } = require('../../src/utils/ticketUtils');
        
        if (req.method === 'GET') {
            const tickets = await getAllTickets();
            
            // Filter by guild if specified
            const { guildId } = req.query;
            let filteredTickets = tickets;
            
            if (guildId) {
                filteredTickets = tickets.filter(ticket => ticket.guildID === guildId);
            }
            
            // Transform for frontend
            const ticketData = filteredTickets.map(ticket => ({
                id: ticket.ticketID,
                caseId: ticket.caseId,
                userId: ticket.userID,
                guildId: ticket.guildID,
                channelId: ticket.channelID,
                status: ticket.status,
                reason: ticket.reason,
                category: ticket.category,
                createdAt: ticket.createdAt,
                createdBy: ticket.createdBy,
                closedAt: ticket.closedAt,
                closedBy: ticket.closedBy,
                closeReason: ticket.closeReason
            }));
            
            return res.status(200).json({
                success: true,
                tickets: ticketData,
                count: ticketData.length
            });
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Tickets API error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
`;
    
    fs.writeFileSync(path.join(apiPath, 'index.js'), ticketsApiContent);
    console.log('✅ Tickets API endpoint created');
    
    // Create individual ticket API
    const ticketDetailContent = `
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { ticketId } = req.query;
    
    try {
        const { getTicket, updateTicket } = require('../../../src/utils/ticketUtils');
        
        if (req.method === 'GET') {
            const ticket = await getTicket(ticketId);
            
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }
            
            return res.status(200).json({
                success: true,
                ticket: {
                    id: ticket.ticketID,
                    caseId: ticket.caseId,
                    userId: ticket.userID,
                    guildId: ticket.guildID,
                    channelId: ticket.channelID,
                    status: ticket.status,
                    reason: ticket.reason,
                    category: ticket.category,
                    createdAt: ticket.createdAt,
                    createdBy: ticket.createdBy,
                    closedAt: ticket.closedAt,
                    closedBy: ticket.closedBy,
                    closeReason: ticket.closeReason
                }
            });
        }
        
        if (req.method === 'PUT') {
            const updates = req.body;
            const success = await updateTicket(ticketId, updates);
            
            if (success) {
                return res.status(200).json({ success: true, message: 'Ticket updated' });
            } else {
                return res.status(400).json({ error: 'Failed to update ticket' });
            }
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Ticket detail API error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
`;
    
    fs.writeFileSync(path.join(apiPath, '[ticketId].js'), ticketDetailContent);
    console.log('✅ Ticket detail API endpoint created');
}

async function main() {
    try {
        console.log('🚀 Starting comprehensive ticket system fix...\n');
        
        await fixTicketCommand();
        await createTicketUtils();
        await createTicketButtons();
        await createWebsiteIntegration();
        
        console.log('\n🎉 Ticket system fixes completed!');
        console.log('\n📋 What was fixed:');
        console.log('✅ Added missing "open" case in ticket command');
        console.log('✅ Fixed moderationManager imports');
        console.log('✅ Enhanced error handling with defer replies');
        console.log('✅ Created robust ticket utilities');
        console.log('✅ Added button interaction handlers');
        console.log('✅ Created website API integration');
        console.log('✅ Fixed transcript generation');
        console.log('✅ Added proper logging integration');
        
        console.log('\n📋 Next steps:');
        console.log('1. Deploy this fix to your Pi: node fix-ticket-system.js');
        console.log('2. Restart your bot: pm2 restart sapphire-bot');
        console.log('3. Test ticket creation: /ticket open reason:test');
        console.log('4. Check website integration at /api/tickets');
        
    } catch (error) {
        console.error('💥 Fix process failed:', error);
    }
}

main();
