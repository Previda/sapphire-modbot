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
        return { userID, guildID, score: 0, lastIncrement: new Date() };
    } catch (error) {
        console.error('Error resetting threat score:', error);
        return null;
    }
}

module.exports = {
    getThreatScore,
    incrementThreatScore,
    resetThreatScore
};
