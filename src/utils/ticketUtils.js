const fs = require('fs').promises;
const path = require('path');

// Local storage for ticket data
const TICKETS_FILE = path.join(process.cwd(), 'data', 'tickets.json');

// Load tickets data from local storage
async function loadTicketsData() {
    try {
        const data = await fs.readFile(TICKETS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// Save tickets data to local storage
async function saveTicketsData(ticketsData) {
    try {
        const dataDir = path.dirname(TICKETS_FILE);
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(TICKETS_FILE, JSON.stringify(ticketsData, null, 2));
    } catch (error) {
        console.error('Failed to save tickets data:', error);
    }
}

// Save a single ticket
async function saveTicket(ticketData) {
    const ticketsData = await loadTicketsData();
    const guildId = ticketData.guildID;
    
    if (!ticketsData[guildId]) {
        ticketsData[guildId] = [];
    }
    
    ticketsData[guildId].push(ticketData);
    await saveTicketsData(ticketsData);
}

// Get all tickets for a guild
async function getGuildTickets(guildId, status = null) {
    const ticketsData = await loadTicketsData();
    const guildTickets = ticketsData[guildId] || [];
    
    if (status) {
        return guildTickets.filter(ticket => ticket.status === status);
    }
    
    return guildTickets;
}

// Get tickets for a specific user
async function getUserTickets(userId, guildId, status = null) {
    const ticketsData = await loadTicketsData();
    const guildTickets = ticketsData[guildId] || [];
    let userTickets = guildTickets.filter(ticket => ticket.userID === userId);
    
    if (status) {
        userTickets = userTickets.filter(ticket => ticket.status === status);
    }
    
    return userTickets;
}

// Get ticket by channel ID
async function getTicketByChannel(channelId) {
    const ticketsData = await loadTicketsData();
    
    for (const guildId in ticketsData) {
        const tickets = ticketsData[guildId];
        const ticket = tickets.find(t => t.channelID === channelId);
        if (ticket) return ticket;
    }
    
    return null;
}

// Update ticket status
async function updateTicketStatus(channelId, newStatus) {
    const ticketsData = await loadTicketsData();
    
    for (const guildId in ticketsData) {
        const tickets = ticketsData[guildId];
        const ticketIndex = tickets.findIndex(t => t.channelID === channelId);
        
        if (ticketIndex !== -1) {
            ticketsData[guildId][ticketIndex].status = newStatus;
            ticketsData[guildId][ticketIndex].updatedAt = new Date().toISOString();
            await saveTicketsData(ticketsData);
            return true;
        }
    }
    
    return false;
}

// Close a ticket
async function closeTicket(channelId, closedBy) {
    const ticketsData = await loadTicketsData();
    
    for (const guildId in ticketsData) {
        const tickets = ticketsData[guildId];
        const ticketIndex = tickets.findIndex(t => t.channelID === channelId);
        
        if (ticketIndex !== -1) {
            ticketsData[guildId][ticketIndex].status = 'closed';
            ticketsData[guildId][ticketIndex].closedAt = new Date().toISOString();
            ticketsData[guildId][ticketIndex].closedBy = closedBy;
            await saveTicketsData(ticketsData);
            return ticketsData[guildId][ticketIndex];
        }
    }
    
    return null;
}

// Delete a ticket from records
async function deleteTicket(channelId) {
    const ticketsData = await loadTicketsData();
    
    for (const guildId in ticketsData) {
        const tickets = ticketsData[guildId];
        const ticketIndex = tickets.findIndex(t => t.channelID === channelId);
        
        if (ticketIndex !== -1) {
            const deletedTicket = tickets.splice(ticketIndex, 1)[0];
            await saveTicketsData(ticketsData);
            return deletedTicket;
        }
    }
    
    return null;
}

// Clean up tickets with deleted channels
async function cleanupDeletedTickets(guild) {
    const ticketsData = await loadTicketsData();
    const guildTickets = ticketsData[guild.id] || [];
    let cleanedUp = 0;

    for (let i = guildTickets.length - 1; i >= 0; i--) {
        const ticket = guildTickets[i];
        const channel = guild.channels.cache.get(ticket.channelID);
        
        if (!channel && ticket.status === 'open') {
            console.log(`🧹 Cleaning up deleted ticket channel: ${ticket.ticketID}`);
            guildTickets.splice(i, 1);
            cleanedUp++;
        }
    }

    if (cleanedUp > 0) {
        ticketsData[guild.id] = guildTickets;
        await saveTicketsData(ticketsData);
        console.log(`🧹 Cleaned up ${cleanedUp} tickets with deleted channels`);
    }

    return cleanedUp;
}

module.exports = {
    loadTicketsData,
    saveTicketsData,
    saveTicket,
    getGuildTickets,
    getUserTickets,
    getTicketByChannel,
    updateTicketStatus,
    closeTicket,
    deleteTicket,
    cleanupDeletedTickets
};
