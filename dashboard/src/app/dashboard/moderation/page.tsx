'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Shield, Ban, AlertTriangle, MessageSquareOff, Clock, User } from 'lucide-react';

export default function ModerationPage() {
  const moderationLogs = [
    {
      id: 1,
      action: 'Ban',
      user: 'BadUser#1234',
      moderator: 'Admin#5678',
      reason: 'Spamming',
      timestamp: '2 hours ago',
      type: 'ban',
    },
    {
      id: 2,
      action: 'Warning',
      user: 'NewUser#9012',
      moderator: 'Mod#3456',
      reason: 'Breaking rules',
      timestamp: '5 hours ago',
      type: 'warn',
    },
    {
      id: 3,
      action: 'Timeout',
      user: 'ToxicUser#7890',
      moderator: 'Admin#5678',
      reason: 'Toxic behavior',
      timestamp: '1 day ago',
      type: 'timeout',
    },
    {
      id: 4,
      action: 'Kick',
      user: 'Troll#2468',
      moderator: 'Mod#1357',
      reason: 'Trolling',
      timestamp: '2 days ago',
      type: 'kick',
    },
  ];

  const stats = [
    { label: 'Total Bans', value: '45', icon: Ban, color: 'text-red-400' },
    { label: 'Warnings', value: '128', icon: AlertTriangle, color: 'text-yellow-400' },
    { label: 'Timeouts', value: '67', icon: Clock, color: 'text-orange-400' },
    { label: 'Kicks', value: '23', icon: MessageSquareOff, color: 'text-purple-400' },
  ];

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'ban':
        return <Ban className="h-5 w-5 text-red-400" />;
      case 'warn':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'timeout':
        return <Clock className="h-5 w-5 text-orange-400" />;
      case 'kick':
        return <MessageSquareOff className="h-5 w-5 text-purple-400" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Moderation</h1>
        <p className="text-secondary">View and manage moderation actions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, index) => (
          <div key={stat.label} className="backdrop-blur-3xl p-6 rounded-3xl hover-lift transition-all duration-500 fade-in" style={{
            animationDelay: `${index * 100}ms`,
            background: 'linear-gradient(135deg, rgba(var(--bg-secondary), 0.4) 0%, rgba(var(--bg-secondary), 0.2) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-secondary mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Moderation Logs */}
      <div className="backdrop-blur-3xl p-6 rounded-3xl" style={{
        background: 'linear-gradient(135deg, rgba(var(--bg-secondary), 0.4) 0%, rgba(var(--bg-secondary), 0.2) 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Actions</h2>
          <button className="px-4 py-2 bg-accent text-white rounded-lg hover-scale transition-smooth">
            Export Logs
          </button>
        </div>

        <div className="space-y-4">
          {moderationLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-smooth"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-tertiary">
                  {getActionIcon(log.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{log.action}</span>
                    <span className="text-secondary">•</span>
                    <span className="text-secondary">{log.user}</span>
                  </div>
                  <div className="text-sm text-secondary">
                    <User className="h-3 w-3 inline mr-1" />
                    By {log.moderator} • {log.timestamp}
                  </div>
                  <p className="text-sm mt-1">
                    <span className="text-secondary">Reason:</span> {log.reason}
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-secondary rounded-lg hover:bg-tertiary transition-smooth text-sm">
                Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
