const { isConnected } = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

// Local storage file
const PUNISHMENTS_FILE = path.join(process.cwd(), 'data', 'punishments.json');

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.dirname(PUNISHMENTS_FILE);
    try {
        await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
        console.error('Failed to create data directory:', error);
    }
}

// Load punishments from local file
async function loadPunishments() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(PUNISHMENTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save punishments to local file
async function savePunishments(punishments) {
    try {
        await ensureDataDir();
        await fs.writeFile(PUNISHMENTS_FILE, JSON.stringify(punishments, null, 2));
    } catch (error) {
        console.error('Failed to save punishments:', error);
    }
}

// Create a punishment record
async function createPunishment(data) {
    const { userID, modID, guildID, type, reason } = data;
    const caseID = 'CASE-' + uuidv4().slice(0, 6).toUpperCase();
    
    try {
        if (!isConnected()) {
            // Use local storage
            const punishments = await loadPunishments();
            const punishment = {
                id: punishments.length + 1,
                caseID,
                userID,
                modID,
                guildID,
                type,
                reason,
                timestamp: new Date(),
                appealStatus: 'none',
                appealReason: null,
                appealReviewed: false
            };
            
            punishments.push(punishment);
            await savePunishments(punishments);
            console.log(`📝 Created punishment ${caseID} (local storage)`);
            
            return { caseID, id: punishment.id };
        }
        
        console.log('📝 MongoDB punishment creation - not yet implemented');
        throw new Error('MongoDB punishment creation not implemented');
    } catch (error) {
        console.error('Error creating punishment:', error);
        throw error;
    }
}

// Get punishment by case ID
async function getPunishmentByCase(caseID) {
    try {
        if (!isConnected()) {
            // Use local storage
            const punishments = await loadPunishments();
            return punishments.find(p => p.caseID === caseID) || null;
        }
        
        console.log('📝 MongoDB punishment lookup - not yet implemented');
        return null;
    } catch (error) {
        console.error('Error getting punishment:', error);
        throw error;
    }
}

// Get user's punishment history
async function getUserPunishments(userID, guildID) {
    try {
        if (!isConnected()) {
            // Use local storage
            const punishments = await loadPunishments();
            return punishments
                .filter(p => p.userID === userID && p.guildID === guildID)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
        
        console.log('📝 MongoDB user punishment history - not yet implemented');
        return [];
    } catch (error) {
        console.error('Error getting user punishments:', error);
        throw error;
    }
}

// Update appeal status
async function updateAppealStatus(caseID, status, reason = null) {
    try {
        if (!isConnected()) {
            // Use local storage
            const punishments = await loadPunishments();
            const punishment = punishments.find(p => p.caseID === caseID);
            
            if (punishment) {
                punishment.appealStatus = status;
                punishment.appealReason = reason;
                await savePunishments(punishments);
                console.log(`📝 Updated appeal status for ${caseID}: ${status}`);
                return true;
            }
            
            return false;
        }
        
        console.log('📝 MongoDB appeal update - not yet implemented');
        return false;
    } catch (error) {
        console.error('Error updating appeal:', error);
        throw error;
    }
}

module.exports = {
    createPunishment,
    getPunishmentByCase,
    getUserPunishments,
    updateAppealStatus
};
