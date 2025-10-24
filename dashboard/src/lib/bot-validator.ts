/**
 * Bot Token Validator & Auto-Configuration
 * Validates bot token, fetches bot info, and syncs with .env
 */

interface BotInfo {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot: boolean;
  verified: boolean;
  publicKey: string;
}

interface ValidationResult {
  valid: boolean;
  botInfo?: BotInfo;
  error?: string;
  suggestions?: string[];
}

/**
 * Validate Discord Bot Token
 */
export async function validateBotToken(token: string): Promise<ValidationResult> {
  try {
    // Fetch bot info from Discord API
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          valid: false,
          error: 'Invalid bot token',
          suggestions: [
            'Check your token in Discord Developer Portal',
            'Make sure you copied the entire token',
            'Regenerate token if compromised',
          ],
        };
      }
      
      return {
        valid: false,
        error: `Discord API error: ${response.status}`,
      };
    }

    const botInfo: BotInfo = await response.json();

    // Verify it's actually a bot account
    if (!botInfo.bot) {
      return {
        valid: false,
        error: 'Token belongs to a user account, not a bot',
        suggestions: [
          'Use a bot token, not a user token',
          'Create a bot in Discord Developer Portal',
        ],
      };
    }

    return {
      valid: true,
      botInfo,
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'Failed to validate token',
    };
  }
}

/**
 * Fetch bot application info
 */
export async function fetchBotApplication(token: string) {
  try {
    const response = await fetch('https://discord.com/api/v10/oauth2/applications/@me', {
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch application: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching bot application:', error);
    return null;
  }
}

/**
 * Validate entire environment configuration
 */
export async function validateEnvironment() {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config: Record<string, any> = {};

  // Check required environment variables
  const required = [
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
  ];

  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      errors.push(`Missing required variable: ${key}`);
    } else {
      config[key] = value;
    }
  }

  // Check optional but recommended
  const recommended = [
    'BOT_API_URL',
    'DISCORD_REDIRECT_URI',
    'NEXTAUTH_URL',
  ];

  for (const key of recommended) {
    const value = process.env[key];
    if (!value) {
      warnings.push(`Missing recommended variable: ${key}`);
    } else {
      config[key] = value;
    }
  }

  // Validate JWT secrets are strong enough
  if (config.JWT_SECRET && config.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters');
  }

  if (config.NEXTAUTH_SECRET && config.NEXTAUTH_SECRET.length < 32) {
    warnings.push('NEXTAUTH_SECRET should be at least 32 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

/**
 * Auto-sync bot configuration
 */
export async function syncBotConfig(botApiUrl: string) {
  try {
    const response = await fetch(`${botApiUrl}/api/status`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error('Bot API not responding');
    }

    const data = await response.json();

    return {
      online: true,
      botInfo: data,
      synced: true,
    };
  } catch (error: any) {
    return {
      online: false,
      error: error.message,
      synced: false,
    };
  }
}

/**
 * Generate configuration suggestions
 */
export function generateConfigSuggestions(currentConfig: Record<string, any>) {
  const suggestions: string[] = [];

  // Check if using localhost
  if (currentConfig.BOT_API_URL?.includes('localhost')) {
    suggestions.push('Consider using your Pi IP address (192.168.1.62) instead of localhost');
  }

  // Check if using ngrok
  if (currentConfig.BOT_API_URL?.includes('ngrok')) {
    suggestions.push('Remember to update BOT_API_URL when ngrok URL changes');
  }

  // Check redirect URI
  if (currentConfig.DISCORD_REDIRECT_URI?.includes('localhost')) {
    suggestions.push('Update DISCORD_REDIRECT_URI to your actual domain for production');
  }

  return suggestions;
}

/**
 * Complete validation and setup check
 */
export async function performStartupValidation() {
  console.log('🔍 Performing startup validation...');

  // Step 1: Validate environment
  const envValidation = await validateEnvironment();
  console.log('📋 Environment validation:', envValidation.valid ? '✅' : '❌');

  if (envValidation.errors.length > 0) {
    console.error('❌ Environment errors:', envValidation.errors);
  }

  if (envValidation.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:', envValidation.warnings);
  }

  // Step 2: Check bot API connection
  const botApiUrl = process.env.BOT_API_URL || 'http://192.168.1.62:3001';
  const botSync = await syncBotConfig(botApiUrl);
  console.log('🤖 Bot API connection:', botSync.online ? '✅' : '❌');

  // Step 3: Generate suggestions
  const suggestions = generateConfigSuggestions(envValidation.config);
  if (suggestions.length > 0) {
    console.log('💡 Configuration suggestions:');
    suggestions.forEach(s => console.log(`   - ${s}`));
  }

  return {
    environment: envValidation,
    botConnection: botSync,
    suggestions,
    allValid: envValidation.valid && botSync.online,
  };
}
