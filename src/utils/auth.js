/**
 * Authentication & Token Management System
 * Handles Discord bot authentication with proper error handling
 */

const { Client } = require('discord.js');

class AuthManager {
  constructor() {
    this.token = null;
    this.clientId = null;
    this.isValidated = false;
  }

  /**
   * Validate Discord bot token format
   * @param {string} token - Discord bot token
   * @returns {Object} Validation result
   */
  validateToken(token) {
    if (!token) {
      return {
        valid: false,
        error: 'Token is missing or empty'
      };
    }

    // Remove whitespace
    token = token.trim();

    // Check minimum length
    if (token.length < 50) {
      return {
        valid: false,
        error: 'Token is too short (should be 70+ characters)'
      };
    }

    // Check for placeholder text
    const placeholders = [
      'YOUR_TOKEN_HERE',
      'YOUR_NEW_TOKEN',
      'DISCORD_BOT_TOKEN',
      'YOUR_BOT_TOKEN',
      'TOKEN_HERE'
    ];

    if (placeholders.some(p => token.includes(p))) {
      return {
        valid: false,
        error: 'Token contains placeholder text. Please use your actual Discord bot token.'
      };
    }

    // Discord token format: 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        valid: false,
        error: 'Invalid token format. Discord tokens have 3 parts separated by dots.'
      };
    }

    // Check each part has content
    if (parts.some(part => part.length === 0)) {
      return {
        valid: false,
        error: 'Token has empty parts. Make sure you copied the complete token.'
      };
    }

    return {
      valid: true,
      token: token
    };
  }

  /**
   * Validate Client ID
   * @param {string} clientId - Discord application client ID
   * @returns {Object} Validation result
   */
  validateClientId(clientId) {
    if (!clientId) {
      return {
        valid: false,
        error: 'Client ID is missing'
      };
    }

    clientId = clientId.trim();

    // Should be numeric and 17-19 digits
    if (!/^\d{17,19}$/.test(clientId)) {
      return {
        valid: false,
        error: 'Invalid Client ID format. Should be 17-19 digits.'
      };
    }

    return {
      valid: true,
      clientId: clientId
    };
  }

  /**
   * Load and validate credentials from environment
   * @returns {Object} Validation result with credentials
   */
  loadCredentials() {
    // Support both common environment variable names
    const token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;
    const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;

    const tokenValidation = this.validateToken(token);
    if (!tokenValidation.valid) {
      return {
        success: false,
        error: `Token validation failed: ${tokenValidation.error}`,
        help: this.getSetupHelp()
      };
    }

    const clientIdValidation = this.validateClientId(clientId);
    if (!clientIdValidation.valid) {
      return {
        success: false,
        error: `Client ID validation failed: ${clientIdValidation.error}`,
        help: this.getSetupHelp()
      };
    }

    this.token = tokenValidation.token;
    this.clientId = clientIdValidation.clientId;
    this.isValidated = true;

    return {
      success: true,
      token: this.token,
      clientId: this.clientId
    };
  }

  /**
   * Get setup help message
   * @returns {string} Help message
   */
  getSetupHelp() {
    return `
╔════════════════════════════════════════════════════════════════╗
║                    BOT SETUP REQUIRED                          ║
╚════════════════════════════════════════════════════════════════╝

Your bot credentials are missing or invalid. Follow these steps:

1. Get your Discord Bot Token:
   • Go to https://discord.com/developers/applications
   • Click your bot application
   • Click "Bot" in the left sidebar
   • Click "Reset Token" button
   • Click "Yes, do it!"
   • Copy the ENTIRE token (it will look like: MTxxxxx.GYxxxx.xxxxxxxxxx)

2. Get your Client ID:
   • Click "OAuth2" in the left sidebar
   • Copy the "Client ID"

3. Update your .env file:
   • Open .env file in the bot directory
   • Set DISCORD_BOT_TOKEN=<your token here> (or DISCORD_TOKEN)
   • Set DISCORD_CLIENT_ID=<your client ID here> (or CLIENT_ID)

4. Restart the bot:
   • pm2 restart skyfall-bot --update-env

OR run the setup wizard:
   • node setup-bot.js

Need help? Check the documentation or contact support.
`;
  }

  /**
   * Attempt to login to Discord
   * @param {Client} client - Discord.js client
   * @returns {Promise<Object>} Login result
   */
  async login(client) {
    if (!this.isValidated) {
      const result = this.loadCredentials();
      if (!result.success) {
        return result;
      }
    }

    try {
      console.log('🔐 Attempting to login to Discord...');
      await client.login(this.token);
      
      return {
        success: true,
        message: '✅ Successfully logged in to Discord!'
      };
    } catch (error) {
      let errorMessage = 'Failed to login to Discord';
      let help = '';

      if (error.code === 'TokenInvalid') {
        errorMessage = 'Invalid Discord bot token';
        help = `
The token in your .env file is invalid or has been reset.

SOLUTION:
1. Go to https://discord.com/developers/applications
2. Click your bot → Bot section
3. Click "Reset Token"
4. Copy the NEW token
5. Update .env file with the new token
6. Restart: pm2 restart skyfall-bot --update-env
`;
      } else if (error.code === 'DisallowedIntents') {
        errorMessage = 'Missing required intents';
        help = `
Your bot is missing required Gateway Intents.

SOLUTION:
1. Go to https://discord.com/developers/applications
2. Click your bot → Bot section
3. Scroll to "Privileged Gateway Intents"
4. Enable: Server Members Intent, Message Content Intent
5. Save changes
6. Restart the bot
`;
      }

      return {
        success: false,
        error: errorMessage,
        details: error.message,
        help: help || this.getSetupHelp()
      };
    }
  }
}

module.exports = new AuthManager();
