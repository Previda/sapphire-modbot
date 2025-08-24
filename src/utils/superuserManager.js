/**
 * Superuser management utility for Pi compatibility
 */

// Default superusers (can be configured via environment)
const defaultSuperusers = process.env.SUPERUSERS ? 
    process.env.SUPERUSERS.split(',') : 
    ['123456789012345678']; // Replace with actual Discord user IDs

let superusers = new Set(defaultSuperusers);

const isSuperuser = (userId) => {
    return superusers.has(userId.toString());
};

const addSuperuser = (userId) => {
    superusers.add(userId.toString());
    console.log(`Added superuser: ${userId}`);
    return true;
};

const removeSuperuser = (userId) => {
    const removed = superusers.delete(userId.toString());
    if (removed) {
        console.log(`Removed superuser: ${userId}`);
    }
    return removed;
};

const getSuperusers = () => {
    return Array.from(superusers);
};

const isAdmin = (member) => {
    if (!member) return false;
    
    // Check if superuser
    if (isSuperuser(member.id || member.user?.id)) return true;
    
    // Check Discord permissions
    if (member.permissions) {
        return member.permissions.has('Administrator') || 
               member.permissions.has('ManageGuild');
    }
    
    return false;
};

module.exports = {
    isSuperuser,
    addSuperuser,
    removeSuperuser,
    getSuperusers,
    isAdmin
};
