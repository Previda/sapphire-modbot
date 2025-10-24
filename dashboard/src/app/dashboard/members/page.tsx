'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Users, Search, UserPlus, UserMinus, Shield, Crown } from 'lucide-react';

export default function MembersPage() {
  const members = [
    {
      id: '1',
      username: 'Admin#5678',
      avatar: '👑',
      role: 'Owner',
      joinedAt: '2 years ago',
      status: 'online',
    },
    {
      id: '2',
      username: 'Moderator#1234',
      avatar: '🛡️',
      role: 'Moderator',
      joinedAt: '1 year ago',
      status: 'online',
    },
    {
      id: '3',
      username: 'Member#9012',
      avatar: '👤',
      role: 'Member',
      joinedAt: '6 months ago',
      status: 'idle',
    },
    {
      id: '4',
      username: 'NewUser#3456',
      avatar: '🆕',
      role: 'Member',
      joinedAt: '1 week ago',
      status: 'offline',
    },
  ];

  const stats = [
    { label: 'Total Members', value: '1,234', icon: Users, color: 'text-blue-400' },
    { label: 'Online', value: '567', icon: UserPlus, color: 'text-green-400' },
    { label: 'Moderators', value: '12', icon: Shield, color: 'text-purple-400' },
    { label: 'New Today', value: '8', icon: UserPlus, color: 'text-yellow-400' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Members</h1>
        <p className="text-secondary">Manage your server members</p>
      </div>

      {/* Stats */}
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

      {/* Search & Filter */}
      <div className="glass p-6 rounded-xl mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
            <input
              type="text"
              placeholder="Search members..."
              className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button className="px-6 py-3 bg-accent text-white rounded-lg hover-scale transition-smooth">
            Search
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="glass p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-6">All Members</h2>
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-smooth"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-tertiary rounded-full flex items-center justify-center text-2xl">
                  {member.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{member.username}</span>
                    {member.role === 'Owner' && <Crown className="h-4 w-4 text-yellow-400" />}
                    {member.role === 'Moderator' && <Shield className="h-4 w-4 text-purple-400" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <div className={`w-2 h-2 rounded-full ${
                      member.status === 'online' ? 'bg-green-400' :
                      member.status === 'idle' ? 'bg-yellow-400' :
                      'bg-gray-400'
                    }`} />
                    <span>{member.role}</span>
                    <span>•</span>
                    <span>Joined {member.joinedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-secondary rounded-lg hover:bg-tertiary transition-smooth">
                  View
                </button>
                <button className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-smooth">
                  <UserMinus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
