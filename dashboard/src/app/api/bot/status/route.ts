import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const botApiUrl = process.env.BOT_API_URL || 'http://192.168.1.62:3001';
    
    // Try to connect to bot API
    const response = await fetch(`${botApiUrl}/api/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error('Bot API returned error');
    }

    const data = await response.json();
    
    return NextResponse.json({
      online: true,
      ...data,
    });
  } catch (error: any) {
    console.error('Bot status check failed:', error.message);
    
    return NextResponse.json({
      online: false,
      error: error.message,
      message: 'Unable to connect to bot',
    }, { status: 503 });
  }
}
