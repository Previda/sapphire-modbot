'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { BarChart3, TrendingUp, Activity, Users, MessageSquare, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  const stats = [
    { label: 'Total Commands', value: '45.6K', change: '+12%', icon: Zap, color: 'text-yellow-400' },
    { label: 'Active Users', value: '1,234', change: '+5%', icon: Users, color: 'text-blue-400' },
    { label: 'Messages', value: '89.2K', change: '+18%', icon: MessageSquare, color: 'text-green-400' },
    { label: 'Server Growth', value: '+234', change: '+23%', icon: TrendingUp, color: 'text-purple-400' },
  ];

  const topCommands = [
    { name: '/ban', uses: 1234, percentage: 85 },
    { name: '/kick', uses: 987, percentage: 70 },
    { name: '/warn', uses: 756, percentage: 55 },
    { name: '/mute', uses: 543, percentage: 40 },
    { name: '/purge', uses: 321, percentage: 25 },
  ];

  const activityData = [
    { day: 'Mon', value: 65 },
    { day: 'Tue', value: 78 },
    { day: 'Wed', value: 90 },
    { day: 'Thu', value: 72 },
    { day: 'Fri', value: 95 },
    { day: 'Sat', value: 88 },
    { day: 'Sun', value: 70 },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-secondary">Track your server's performance and growth</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="glass p-6 rounded-xl hover-lift transition-smooth">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-green-400 text-sm font-semibold">{stat.change}</span>
            </div>
            <p className="text-sm text-secondary mb-1">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-6">Weekly Activity</h2>
          <div className="space-y-4">
            {activityData.map((day) => (
              <div key={day.day} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{day.day}</span>
                  <span className="text-secondary">{day.value}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-accent rounded-full h-2 transition-all duration-500"
                    style={{ width: `${day.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Commands */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-6">Top Commands</h2>
          <div className="space-y-4">
            {topCommands.map((command, index) => (
              <div key={command.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-secondary">#{index + 1}</span>
                    <span className="font-mono font-semibold">{command.name}</span>
                  </div>
                  <span className="text-secondary">{command.uses.toLocaleString()} uses</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-full h-2 transition-all duration-500"
                    style={{ width: `${command.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 glass p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-6">Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Activity className="h-8 w-8 text-blue-400 mb-3" />
            <h3 className="font-bold mb-2">Peak Activity</h3>
            <p className="text-sm text-secondary">
              Most activity occurs on Friday evenings between 6-9 PM
            </p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="font-bold mb-2">Growth Trend</h3>
            <p className="text-sm text-secondary">
              Your server is growing 23% faster than last month
            </p>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <BarChart3 className="h-8 w-8 text-purple-400 mb-3" />
            <h3 className="font-bold mb-2">Top Feature</h3>
            <p className="text-sm text-secondary">
              Moderation commands are your most used feature
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
