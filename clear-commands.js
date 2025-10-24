const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

async function clearCommands() {
    try {
        console.log('🗑️ Clearing all application commands...');

        // Clear global commands
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: [] }
        );
        console.log('✅ Successfully cleared all global commands.');

        // Clear guild commands for all guilds (if you have guild-specific commands)
        // You can add specific guild IDs here if needed
        const guildIds = []; // Add your guild IDs here if you have guild-specific commands
        
        for (const guildId of guildIds) {
            await rest.put(
                Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, guildId),
                { body: [] }
            );
            console.log(`✅ Successfully cleared commands for guild ${guildId}.`);
        }

        console.log('✅ All commands cleared! You can now re-register them.');
        console.log('💡 Run: node deploy-commands.js');

    } catch (error) {
        console.error('❌ Error clearing commands:', error);
    }
}

clearCommands();
