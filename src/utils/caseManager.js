const fs = require('fs').promises;
const path = require('path');

// Local storage for case data
const CASES_FILE = path.join(process.cwd(), 'data', 'cases.json');

// Load cases data from local storage
async function loadCasesData() {
    try {
        const data = await fs.readFile(CASES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// Save cases data to local storage
async function saveCasesData(casesData) {
    try {
        const dataDir = path.dirname(CASES_FILE);
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(CASES_FILE, JSON.stringify(casesData, null, 2));
    } catch (error) {
        console.error('Failed to save cases data:', error);
    }
}

// Generate unique case ID
function generateCaseId(guildId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 4);
    const guildShort = guildId.slice(-4);
    return `${guildShort}-${timestamp}-${random}`.toUpperCase();
}

// Create a new case
async function createCase(caseData) {
    const casesData = await loadCasesData();
    const guildId = caseData.guildId;
    
    if (!casesData[guildId]) {
        casesData[guildId] = [];
    }
    
    // Generate unique case ID
    const caseId = generateCaseId(guildId);
    
    const newCase = {
        caseId: caseId,
        type: caseData.type,
        userId: caseData.userId,
        moderatorId: caseData.moderatorId,
        guildId: guildId,
        reason: caseData.reason,
        status: caseData.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expires: caseData.expires || null,
        channelId: caseData.channelId || null,
        messageId: caseData.messageId || null,
        evidence: caseData.evidence || [],
        notes: caseData.notes || [],
        appealable: caseData.appealable !== false,
        appealed: false,
        appealReason: null,
        appealedAt: null
    };
    
    casesData[guildId].push(newCase);
    await saveCasesData(casesData);
    
    return newCase;
}

// Get case by ID
async function getCaseById(caseId, guildId = null) {
    const casesData = await loadCasesData();
    
    if (guildId) {
        const guildCases = casesData[guildId] || [];
        return guildCases.find(c => c.caseId === caseId);
    }
    
    // Search all guilds if guildId not provided
    for (const guild in casesData) {
        const cases = casesData[guild];
        const foundCase = cases.find(c => c.caseId === caseId);
        if (foundCase) return foundCase;
    }
    
    return null;
}

// Get cases for a user
async function getUserCases(userId, guildId, type = null, status = null) {
    const casesData = await loadCasesData();
    const guildCases = casesData[guildId] || [];
    
    let userCases = guildCases.filter(c => c.userId === userId);
    
    if (type) {
        userCases = userCases.filter(c => c.type === type);
    }
    
    if (status) {
        userCases = userCases.filter(c => c.status === status);
    }
    
    return userCases;
}

// Get cases by moderator
async function getModeratorCases(moderatorId, guildId, type = null) {
    const casesData = await loadCasesData();
    const guildCases = casesData[guildId] || [];
    
    let modCases = guildCases.filter(c => c.moderatorId === moderatorId);
    
    if (type) {
        modCases = modCases.filter(c => c.type === type);
    }
    
    return modCases;
}

// Update case status
async function updateCaseStatus(caseId, newStatus, updatedBy = null) {
    const casesData = await loadCasesData();
    
    for (const guildId in casesData) {
        const cases = casesData[guildId];
        const caseIndex = cases.findIndex(c => c.caseId === caseId);
        
        if (caseIndex !== -1) {
            casesData[guildId][caseIndex].status = newStatus;
            casesData[guildId][caseIndex].updatedAt = new Date().toISOString();
            
            if (updatedBy) {
                casesData[guildId][caseIndex].notes.push({
                    content: `Status changed to: ${newStatus}`,
                    author: updatedBy,
                    timestamp: new Date().toISOString()
                });
            }
            
            await saveCasesData(casesData);
            return casesData[guildId][caseIndex];
        }
    }
    
    return null;
}

// Appeal a case
async function appealCase(caseId, appealReason, appealedBy) {
    const casesData = await loadCasesData();
    
    for (const guildId in casesData) {
        const cases = casesData[guildId];
        const caseIndex = cases.findIndex(c => c.caseId === caseId);
        
        if (caseIndex !== -1) {
            const caseData = casesData[guildId][caseIndex];
            
            // Check if case is appealable
            if (!caseData.appealable) {
                return { success: false, reason: 'Case is not appealable' };
            }
            
            // Check if already appealed
            if (caseData.appealed) {
                return { success: false, reason: 'Case has already been appealed' };
            }
            
            // Update case with appeal info
            casesData[guildId][caseIndex].appealed = true;
            casesData[guildId][caseIndex].appealReason = appealReason;
            casesData[guildId][caseIndex].appealedAt = new Date().toISOString();
            casesData[guildId][caseIndex].appealedBy = appealedBy;
            casesData[guildId][caseIndex].status = 'appealed';
            casesData[guildId][caseIndex].updatedAt = new Date().toISOString();
            
            casesData[guildId][caseIndex].notes.push({
                content: `Case appealed: ${appealReason}`,
                author: appealedBy,
                timestamp: new Date().toISOString()
            });
            
            await saveCasesData(casesData);
            return { success: true, case: casesData[guildId][caseIndex] };
        }
    }
    
    return { success: false, reason: 'Case not found' };
}

// Add note to case
async function addCaseNote(caseId, note, author) {
    const casesData = await loadCasesData();
    
    for (const guildId in casesData) {
        const cases = casesData[guildId];
        const caseIndex = cases.findIndex(c => c.caseId === caseId);
        
        if (caseIndex !== -1) {
            casesData[guildId][caseIndex].notes.push({
                content: note,
                author: author,
                timestamp: new Date().toISOString()
            });
            
            casesData[guildId][caseIndex].updatedAt = new Date().toISOString();
            await saveCasesData(casesData);
            return true;
        }
    }
    
    return false;
}

// Get all cases for a guild
async function getGuildCases(guildId, limit = 50, offset = 0) {
    const casesData = await loadCasesData();
    const guildCases = casesData[guildId] || [];
    
    // Sort by creation date (newest first)
    const sortedCases = guildCases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return sortedCases.slice(offset, offset + limit);
}

// Get case statistics for a guild
async function getCaseStats(guildId) {
    const casesData = await loadCasesData();
    const guildCases = casesData[guildId] || [];
    
    const stats = {
        total: guildCases.length,
        active: guildCases.filter(c => c.status === 'active').length,
        closed: guildCases.filter(c => c.status === 'closed').length,
        appealed: guildCases.filter(c => c.appealed).length,
        types: {}
    };
    
    // Count by type
    guildCases.forEach(c => {
        stats.types[c.type] = (stats.types[c.type] || 0) + 1;
    });
    
    return stats;
}

module.exports = {
    createCase,
    getCaseById,
    getUserCases,
    getModeratorCases,
    updateCaseStatus,
    appealCase,
    addCaseNote,
    getGuildCases,
    getCaseStats,
    generateCaseId
};
