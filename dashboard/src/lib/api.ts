// API client for connecting to the Pi bot
const API_BASE_URL = process.env.NEXT_PUBLIC_PI_BOT_API_URL || 'http://localhost:3001';

export interface BotStats {
  servers: number;
  totalMembers: number;
  modActions: number;
  commandsUsed: number;
  uptime: number;
  responseTime: number;
  status: 'online' | 'offline';
}

export interface Server {
  id: string;
  name: string;
  icon: string | null;
  members: number;
  owner: boolean;
  botAdded: boolean;
}

export interface ModerationLog {
  id: string;
  action: string;
  user: string;
  moderator: string;
  reason: string;
  timestamp: string;
  type: 'ban' | 'kick' | 'warn' | 'timeout' | 'delete';
}

export interface RecentActivity {
  action: string;
  user: string;
  time: string;
  type: 'ban' | 'warn' | 'join' | 'delete';
}

class BotAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  async getStats(): Promise<BotStats> {
    return this.fetch<BotStats>('/api/stats');
  }

  async getServers(): Promise<Server[]> {
    return this.fetch<Server[]>('/api/servers');
  }

  async getModerationLogs(): Promise<ModerationLog[]> {
    return this.fetch<ModerationLog[]>('/api/moderation/logs');
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    return this.fetch<RecentActivity[]>('/api/activity/recent');
  }

  async getBotStatus(): Promise<{ status: string; uptime: number; responseTime: number }> {
    return this.fetch('/api/status');
  }
}

export const botAPI = new BotAPI();
