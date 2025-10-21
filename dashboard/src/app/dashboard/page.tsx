'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Users,
  Shield,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Command,
  Ticket,
  FileText,
  Settings,
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalMembers: 1234,
    onlineMembers: 567,
    totalCases: 89,
    activeCases: 12,
    pendingAppeals: 5,
    openTickets: 8,
    commandsUsed: 45678,
    uptime: '99.9%',
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'ban', user: 'User#1234', moderator: 'Mod#5678', time: '2 minutes ago' },
    { id: 2, type: 'appeal', user: 'User#9012', status: 'pending', time: '5 minutes ago' },
    { id: 3, type: 'ticket', user: 'User#3456', category: 'Support', time: '10 minutes ago' },
    { id: 4, type: 'warn', user: 'User#7890', moderator: 'Mod#1234', time: '15 minutes ago' },
  ]);

  const statCards = [
    {
      title: 'Total Members',
      value: formatNumber(stats.totalMembers),
      change: '+12%',
      icon: <Users className="h-6 w-6" />,
      color: 'text-discord-blurple',
    },
    {
      title: 'Online Now',
      value: formatNumber(stats.onlineMembers),
      change: '+5%',
      icon: <Activity className="h-6 w-6" />,
      color: 'text-discord-green',
    },
    {
      title: 'Total Cases',
      value: formatNumber(stats.totalCases),
      change: '+3',
      icon: <Shield className="h-6 w-6" />,
      color: 'text-discord-red',
    },
    {
      title: 'Commands Used',
      value: formatNumber(stats.commandsUsed),
      change: '+23%',
      icon: <Command className="h-6 w-6" />,
      color: 'text-discord-fuchsia',
    },
  ];

  const quickActions = [
    {
      title: 'Pending Appeals',
      value: stats.pendingAppeals,
      icon: <FileText className="h-5 w-5" />,
      action: 'Review',
      href: '/dashboard/appeals',
    },
    {
      title: 'Open Tickets',
      value: stats.openTickets,
      icon: <Ticket className="h-5 w-5" />,
      action: 'Manage',
      href: '/dashboard/tickets',
    },
    {
      title: 'Active Cases',
      value: stats.activeCases,
      icon: <AlertCircle className="h-5 w-5" />,
      action: 'View',
      href: '/dashboard/cases',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sapphire-black via-sapphire-darkgray to-sapphire-black p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-dark-muted">Welcome back! Here's what's happening with your server.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card variant="glass" hover padding="md">
              <div className="flex items-center justify-between mb-4">
                <div className={stat.color}>{stat.icon}</div>
                <span className="text-sm text-discord-green font-medium">{stat.change}</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-dark-muted">{stat.title}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="glass" padding="md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quickActions.map((action) => (
                  <div
                    key={action.title}
                    className="flex items-center justify-between p-4 bg-dark-elevated rounded-lg hover:bg-dark-border transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-discord-blurple">{action.icon}</div>
                      <div>
                        <p className="text-sm font-medium text-white">{action.title}</p>
                        <p className="text-2xl font-bold text-discord-blurple">{action.value}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {action.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card variant="glass" padding="md">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-dark-elevated rounded-lg hover:bg-dark-border transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'ban' ? 'bg-discord-red' :
                        activity.type === 'appeal' ? 'bg-discord-yellow' :
                        activity.type === 'ticket' ? 'bg-discord-blurple' :
                        'bg-discord-green'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {activity.type === 'ban' && `${activity.user} was banned by ${activity.moderator}`}
                          {activity.type === 'appeal' && `${activity.user} submitted an appeal`}
                          {activity.type === 'ticket' && `${activity.user} opened a ${activity.category} ticket`}
                          {activity.type === 'warn' && `${activity.user} was warned by ${activity.moderator}`}
                        </p>
                        <p className="text-xs text-dark-muted">{activity.time}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Server Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6"
      >
        <Card variant="glass" padding="md">
          <CardHeader>
            <CardTitle>Server Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-discord-green/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-discord-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.uptime}</p>
                  <p className="text-sm text-dark-muted">Uptime</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-discord-blurple/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-discord-blurple" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">&lt;100ms</p>
                  <p className="text-sm text-dark-muted">Response Time</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-discord-fuchsia/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-discord-fuchsia" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">Excellent</p>
                  <p className="text-sm text-dark-muted">Performance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
