import { NextRequest, NextResponse } from 'next/server';
import { performStartupValidation } from '@/lib/bot-validator';

/**
 * Validate entire dashboard configuration
 * Checks environment, bot connection, and provides suggestions
 */
export async function GET(request: NextRequest) {
  try {
    const validation = await performStartupValidation();

    return NextResponse.json({
      success: validation.allValid,
      timestamp: new Date().toISOString(),
      ...validation,
    });
  } catch (error: any) {
    console.error('Validation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * Validate specific bot token
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Bot token is required',
      }, { status: 400 });
    }

    // Validate token with Discord API
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Invalid bot token',
        status: response.status,
      }, { status: 401 });
    }

    const botInfo = await response.json();

    // Fetch application info
    const appResponse = await fetch('https://discord.com/api/v10/oauth2/applications/@me', {
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      },
    });

    let appInfo = null;
    if (appResponse.ok) {
      appInfo = await appResponse.json();
    }

    return NextResponse.json({
      success: true,
      bot: {
        id: botInfo.id,
        username: botInfo.username,
        discriminator: botInfo.discriminator,
        avatar: botInfo.avatar,
        verified: botInfo.verified,
        bot: botInfo.bot,
      },
      application: appInfo ? {
        id: appInfo.id,
        name: appInfo.name,
        description: appInfo.description,
        icon: appInfo.icon,
        publicKey: appInfo.verify_key,
      } : null,
      recommendations: {
        clientId: botInfo.id,
        redirectUri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback`,
      },
    });
  } catch (error: any) {
    console.error('Token validation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to validate token',
    }, { status: 500 });
  }
}
