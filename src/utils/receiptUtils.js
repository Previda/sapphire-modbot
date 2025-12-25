const fs = require('fs').promises;
const path = require('path');

// Local storage for receipt data (Discord-only, Pi-friendly JSON)
const RECEIPTS_FILE = path.join(process.cwd(), 'data', 'receipts.json');

async function loadReceiptsData() {
    try {
        const raw = await fs.readFile(RECEIPTS_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (error) {
        return {};
    }
}

async function saveReceiptsData(data) {
    try {
        const dataDir = path.dirname(RECEIPTS_FILE);
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(RECEIPTS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Failed to save receipts data:', error);
    }
}

// Create a new receipt and return it
async function createReceipt({
    guildId,
    customerId,
    createdBy,
    amount,
    currency,
    description,
    ticketId,
    ticketChannelId,
    companyName = null,
    companyLogoUrl = null,
    items = []
}) {
    const data = await loadReceiptsData();

    if (!data[guildId]) {
        data[guildId] = [];
    }

    const guildReceipts = data[guildId];
    const nextNumber = guildReceipts.length + 1;
    const orderNumber = `R-${String(nextNumber).padStart(4, '0')}`;

    const now = new Date().toISOString();

    const receipt = {
        orderNumber,
        receiptId: orderNumber,
        guildId,
        customerId,
        createdBy,
        amount,
        currency,
        description,
        ticketId: ticketId || null,
        ticketChannelId: ticketChannelId || null,
        status: 'open',
        createdAt: now,
        companyName: companyName || null,
        companyLogoUrl: companyLogoUrl || null,
        items: Array.isArray(items) ? items : []
    };

    guildReceipts.push(receipt);
    await saveReceiptsData(data);

    return receipt;
}

async function getReceiptByOrderNumber(guildId, orderNumber) {
    const data = await loadReceiptsData();
    const guildReceipts = data[guildId] || [];
    const target = (orderNumber || '').trim().toUpperCase();

    return guildReceipts.find(r => r.orderNumber.toUpperCase() === target) || null;
}

async function getReceiptsForCustomer(guildId, customerId, limit = 10) {
    const data = await loadReceiptsData();
    const guildReceipts = data[guildId] || [];

    const filtered = guildReceipts
        .filter(r => r.customerId === customerId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filtered.slice(0, limit);
}

async function getReceiptsForTicket(guildId, ticketIdOrChannelId) {
    const data = await loadReceiptsData();
    const guildReceipts = data[guildId] || [];

    return guildReceipts.filter(r =>
        r.ticketId === ticketIdOrChannelId || r.ticketChannelId === ticketIdOrChannelId
    );
}

module.exports = {
    loadReceiptsData,
    saveReceiptsData,
    createReceipt,
    getReceiptByOrderNumber,
    getReceiptsForCustomer,
    getReceiptsForTicket
};
