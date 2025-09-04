const { Events } = require('discord.js');
const { handleTicketMenu } = require('../utils/ticketMenu');
const dashboardLogger = require('../utils/dashboardLogger');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            // Handle different interaction types
            if (interaction.isChatInputCommand()) {
                await handleSlashCommand(interaction);
            } else if (interaction.isButton()) {
                await handleButtonInteraction(interaction);
            } else if (interaction.isSelectMenu()) {
                await handleSelectMenuInteraction(interaction);
            } else if (interaction.isModalSubmit()) {
                await handleModalSubmit(interaction);
            }
        } catch (error) {
            console.error('Fatal interaction error:', error);
            
            // Send error to dashboard API for logging
            try {
                await fetch(`${process.env.DASHBOARD_API_URL || 'https://skyfall-omega.vercel.app'}/api/bot/errors`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: error.message,
                        stack: error.stack,
                        interaction: {
                            type: interaction.type,
                            commandName: interaction.commandName,
                            customId: interaction.customId,
                            user: interaction.user.id,
                            guild: interaction.guild?.id
                        }
                    })
                });
            } catch (apiError) {
                console.error('Failed to report error to dashboard:', apiError);
            }
            
            const errorReply = { 
                content: '❌ An unexpected error occurred. This has been reported to the dashboard.', 
                ephemeral: true 
            };
            
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorReply);
                } else {
                    await interaction.reply(errorReply);
                }
            } catch (replyError) {
                console.error('Failed to send error reply:', replyError);
            }
        }
    },
};

async function handleSlashCommand(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return await interaction.reply({
            content: `❌ Command \`${interaction.commandName}\` not found.`,
            ephemeral: true
        });
    }

    try {
        // Log command execution to dashboard
        await dashboardLogger.logCommand(interaction.commandName, interaction.user, interaction.guild, {
            options: interaction.options.data
        });
        
        await command.execute(interaction);
    } catch (error) {
        console.error('Error executing command:', error);
        
        // Report error to dashboard API
        await dashboardLogger.logError(error, interaction);

        const errorMessage = {
            content: '❌ There was an error while executing this command!',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
}

async function handleButtonInteraction(interaction) {
    const customId = interaction.customId;
    
    // Handle ticket-related buttons
    if (customId.startsWith('ticket_') || customId.includes('close') || customId.includes('transcript')) {
        return await handleTicketMenu(interaction);
    }
    
    // Handle other button interactions
    console.log(`Unhandled button interaction: ${customId}`);
    await interaction.reply({
        content: '❌ This button action is not implemented yet.',
        ephemeral: true
    });
}

async function handleSelectMenuInteraction(interaction) {
    const customId = interaction.customId;
    
    // Handle ticket-related select menus
    if (customId.startsWith('ticket_')) {
        return await handleTicketMenu(interaction);
    }
    
    console.log(`Unhandled select menu interaction: ${customId}`);
    await interaction.reply({
        content: '❌ This menu action is not implemented yet.',
        ephemeral: true
    });
}

async function handleModalSubmit(interaction) {
    const customId = interaction.customId;
    
    // Handle ticket-related modals
    if (customId.startsWith('ticket_')) {
        return await handleTicketMenu(interaction);
    }
    
    console.log(`Unhandled modal submit: ${customId}`);
    await interaction.reply({
        content: '❌ This form submission is not implemented yet.',
        ephemeral: true
    });
}
