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

export default function DashboardPage() {
  const stats = [
    { label: 'Servers', value: '5', icon: Server, color: 'text-blue-400' },
    { label: 'Total Members', value: '1,234', icon: Users, color: 'text-green-400' },
    { label: 'Mod Actions', value: '89', icon: Shield, color: 'text-red-400' },
    { label: 'Commands Used', value: '45.6K', icon: Zap, color: 'text-yellow-400' },
  ];

  const recentActivity = [
    { action: 'User banned', user: 'User#1234', time: '2 min ago', type: 'ban' },
    { action: 'Warning issued', user: 'User#5678', time: '5 min ago', type: 'warn' },
    { action: 'Member joined', user: 'User#9012', time: '10 min ago', type: 'join' },
    { action: 'Message deleted', user: 'User#3456', time: '15 min ago', type: 'delete' },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Overview</h1>
        <p className="text-secondary">Welcome back! Here's your server overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="glass p-6 rounded-xl hover-lift transition-smooth">
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
                <Activity className="h-5 w-5 text-green-400" />
                <span className="font-medium">Status</span>
              </div>
              <span className="text-green-400 font-semibold">Online</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-400" />
                <span className="font-medium">Uptime</span>
              </div>
              <span className="font-semibold">99.9%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span className="font-medium">Response Time</span>
              </div>
              <span className="font-semibold">&lt;100ms</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
