/**
 * Simple Threat Score Management for Pi compatibility
 */

async function getThreatScore(userID, guildID) {
    try {
        // Mock implementation for Pi compatibility
        return { userID, guildID, score: 0, lastIncrement: new Date() };
    } catch (error) {
        console.error('Error getting threat score:', error);
        return { userID, guildID, score: 0, lastIncrement: new Date() };
    }
}

async function incrementThreatScore(userID, guildID, increment = 1) {
    try {
        console.log(`Mock: Incrementing threat score for ${userID} by ${increment}`);
        return { userID, guildID, score: increment, lastIncrement: new Date() };
    } catch (error) {
        console.error('Error incrementing threat score:', error);
        return null;
    }
}

async function resetThreatScore(userID, guildID) {
    try {
        console.log(`Mock: Resetting threat score for ${userID}`);
        return true;
    } catch (error) {
        console.error('Error resetting threat score:', error);
        return false;
    }
}

async function getAllThreatScores(guildID) {
    try {
        // Mock implementation - returns sample data
        console.log(`Mock: Getting all threat scores for guild ${guildID}`);
        return [
            { userID: '123456789', guildID, score: 3, lastIncrement: new Date() },
            { userID: '987654321', guildID, score: 1, lastIncrement: new Date() },
            { userID: '456789123', guildID, score: 7, lastIncrement: new Date() }
        ];
    } catch (error) {
        console.error('Error getting all threat scores:', error);
        return [];
    }
}

module.exports = {
    getThreatScore,
    incrementThreatScore,
    resetThreatScore,
    getAllThreatScores
};
