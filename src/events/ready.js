const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`🤖 ${client.user.tag} is online and ready!`);
        console.log(`📊 Serving ${client.guilds.cache.size} servers`);
        console.log(`👥 Watching ${client.users.cache.size} users`);
        
        // Set bot activity
        client.user.setActivity('Moderating servers', { type: 'WATCHING' });
    },
};
