'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Server, 
  Users, 
  Shield, 
  TrendingUp,
  Activity,
  Clock,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { botAPI, BotStats, RecentActivity } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<BotStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activityData] = await Promise.all([
          botAPI.getStats(),
          botAPI.getRecentActivity(),
        ]);
        setStats(statsData);
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback data
        setStats({
          servers: 5,
          totalMembers: 1234,
          modActions: 89,
          commandsUsed: 45600,
          uptime: 0,
          responseTime: 0,
          status: 'offline',
        });
        setRecentActivity([
          { action: 'User banned', user: 'User#1234', time: '2 min ago', type: 'ban' },
          { action: 'Warning issued', user: 'User#5678', time: '5 min ago', type: 'warn' },
          { action: 'Member joined', user: 'User#9012', time: '10 min ago', type: 'join' },
          { action: 'Message deleted', user: 'User#3456', time: '15 min ago', type: 'delete' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = stats ? [
    { label: 'Servers', value: stats.servers.toString(), icon: Server, color: 'text-blue-400' },
    { label: 'Total Members', value: stats.totalMembers.toLocaleString(), icon: Users, color: 'text-green-400' },
    { label: 'Mod Actions', value: stats.modActions.toString(), icon: Shield, color: 'text-red-400' },
    { label: 'Commands Used', value: stats.commandsUsed >= 1000 ? `${(stats.commandsUsed / 1000).toFixed(1)}K` : stats.commandsUsed.toString(), icon: Zap, color: 'text-yellow-400' },
  ] : [];

  return (
    <DashboardLayout>
      {/* Header with Gradient */}
      <div className="mb-8 fade-in">
        <h1 className="text-5xl font-bold mb-3 gradient-text">
          Overview
        </h1>
        <p className="text-secondary text-lg">Welcome back! Here's your server overview.</p>
      </div>

      {/* Stats Grid with Enhanced Blur */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="backdrop-blur-3xl p-6 rounded-3xl animate-pulse" style={{
              background: 'linear-gradient(135deg, rgba(var(--bg-secondary), 0.4) 0%, rgba(var(--bg-secondary), 0.2) 100%)',
            }}>
              <div className="h-20"></div>
            </div>
          ))
        ) : (
          statCards.map((stat, index) => (
          <div 
            key={stat.label} 
            className="group relative glass backdrop-blur-3xl p-6 rounded-2xl hover-lift transition-smooth overflow-hidden border border-white/5 hover:border-accent/30 fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Content */}
            <div className="relative z-10 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br from-secondary to-tertiary shadow-smooth group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-secondary mb-1 uppercase tracking-wide">{stat.label}</p>
                <p className="text-3xl font-bold group-hover:text-accent transition-colors">{stat.value}</p>
              </div>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-smooth">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'ban' ? 'bg-red-400' :
                    activity.type === 'warn' ? 'bg-yellow-400' :
                    activity.type === 'join' ? 'bg-green-400' :
                    'bg-blue-400'
                  }`} />
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-secondary">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bot Status */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-6">Bot Status</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className={`h-5 w-5 ${stats?.status === 'online' ? 'text-green-400' : 'text-gray-400'}`} />
                <span className="font-medium">Status</span>
              </div>
              <span className={`font-semibold ${stats?.status === 'online' ? 'text-green-400' : 'text-gray-400'}`}>
                {stats?.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-400" />
                <span className="font-medium">Uptime</span>
              </div>
              <span className="font-semibold">
                {stats?.uptime ? `${Math.floor(stats.uptime / 3600)}h ${Math.floor((stats.uptime % 3600) / 60)}m` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span className="font-medium">Response Time</span>
              </div>
              <span className="font-semibold">{stats?.responseTime ? `${stats.responseTime}ms` : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
