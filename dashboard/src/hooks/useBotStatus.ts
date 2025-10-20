'use client';

import { useEffect, useState } from 'react';

interface BotStatus {
  online: boolean;
  guilds?: number;
  users?: number;
  uptime?: number;
  ping?: number;
  error?: string;
  message?: string;
}

export function useBotStatus() {
  const [status, setStatus] = useState<BotStatus>({ online: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/bot/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check bot status:', error);
      setStatus({ 
        online: false, 
        error: 'Connection failed',
        message: 'Unable to connect to bot'
      });
    } finally {
      setLoading(false);
    }
  };

  return { status, loading, refresh: checkStatus };
}
