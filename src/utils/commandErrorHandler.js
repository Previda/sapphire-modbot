const dashboardLogger = require('./dashboardLogger');

/**
 * Comprehensive error handler for all commands
 * Wraps command execution with proper error handling and logging
 */
async function handleCommandError(error, interaction, commandName) {
    console.error(`❌ Error in ${commandName} command:`, error);
    console.error('Error stack:', error.stack);
    
    // Log to dashboard
    try {
        await dashboardLogger.logError(error, interaction);
    } catch (logError) {
        console.error('Failed to log error to dashboard:', logError);
    }
    
    // Build user-friendly error message
    let errorMessage = `❌ **Command Failed: ${commandName}**\n\n`;
    
    // Discord API errors
    if (error.code === 50013) {
        errorMessage += '**Missing Permissions**\n';
        errorMessage += 'I don\'t have the required permissions to perform this action.\n\n';
        errorMessage += '**How to fix:**\n';
        errorMessage += '1. Go to **Server Settings** → **Roles**\n';
        errorMessage += '2. Find my role and ensure it has the necessary permissions\n';
        errorMessage += '3. Make sure my role is positioned correctly in the hierarchy\n\n';
        errorMessage += '💡 **Tip:** Use `/fix-permissions` to diagnose permission issues';
    } else if (error.code === 50001) {
        errorMessage += '**Missing Access**\n';
        errorMessage += 'I cannot access the target user or channel.\n\n';
        errorMessage += '**Possible reasons:**\n';
        errorMessage += '• My role is lower than the target user\'s role\n';
        errorMessage += '• I don\'t have access to the channel\n';
        errorMessage += '• The user left the server';
    } else if (error.code === 50007) {
        errorMessage += '**Cannot Send DM**\n';
        errorMessage += 'The user has DMs disabled or doesn\'t share a server with me.';
    } else if (error.code === 10007) {
        errorMessage += '**Unknown Member**\n';
        errorMessage += 'The specified user is not in this server.';
    } else if (error.code === 10008) {
        errorMessage += '**Unknown Message**\n';
        errorMessage += 'The message could not be found. It may have been deleted.';
    } else if (error.code === 10003) {
        errorMessage += '**Unknown Channel**\n';
        errorMessage += 'The channel could not be found. It may have been deleted.';
    } else if (error.code === 50035) {
        errorMessage += '**Invalid Form Body**\n';
        errorMessage += 'The data provided was invalid. Please check your input.';
    } else if (error.message?.includes('hierarchy')) {
        errorMessage += '**Role Hierarchy Issue**\n';
        errorMessage += 'My role is not high enough to perform this action.\n\n';
        errorMessage += '**How to fix:**\n';
        errorMessage += '1. Go to **Server Settings** → **Roles**\n';
        errorMessage += '2. Drag my role **above** the target user\'s highest role\n';
        errorMessage += '3. Try the command again';
    } else if (error.message?.includes('timeout')) {
        errorMessage += '**Request Timeout**\n';
        errorMessage += 'The operation took too long to complete. Please try again.';
    } else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ENOTFOUND')) {
        errorMessage += '**Connection Error**\n';
        errorMessage += 'Could not connect to external service. Please try again later.';
    } else {
        // Generic error
        errorMessage += '**Error Details:**\n';
        errorMessage += `\`${error.message}\`\n\n`;
        errorMessage += '💡 **Tip:** If this persists, please contact the bot administrator.';
    }
    
    // Send error message to user
    try {
        if (interaction.deferred) {
            await interaction.editReply({ content: errorMessage }).catch(console.error);
        } else if (!interaction.replied) {
            await interaction.reply({ 
                content: errorMessage, 
                flags: 64 
            }).catch(console.error);
        } else {
            await interaction.followUp({ 
                content: errorMessage, 
                flags: 64 
            }).catch(console.error);
        }
    } catch (replyError) {
        console.error('Failed to send error message to user:', replyError);
    }
}

/**
 * Wraps a command execute function with comprehensive error handling
 */
function wrapCommandExecute(commandName, executeFunction) {
    return async function(interaction) {
        try {
            await executeFunction(interaction);
        } catch (error) {
            await handleCommandError(error, interaction, commandName);
        }
    };
}

/**
 * Validates that a command has all required properties
 */
function validateCommand(command) {
    const errors = [];
    
    if (!command.data) {
        errors.push('Missing "data" property');
    }
    
    if (!command.execute) {
        errors.push('Missing "execute" function');
    }
    
    if (command.data && !command.data.name) {
        errors.push('Command data missing "name"');
    }
    
    if (command.data && !command.data.description) {
        errors.push('Command data missing "description"');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

module.exports = {
    handleCommandError,
    wrapCommandExecute,
    validateCommand
};
