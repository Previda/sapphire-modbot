'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Users, Search, UserPlus, Shield, Crown, X } from 'lucide-react';

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
    { label: 'Total Members', value: '1,234', icon: Users, color: 'bg-blue-500/20 text-blue-400' },
    { label: 'Online', value: '567', icon: UserPlus, color: 'bg-green-500/20 text-green-400' },
    { label: 'Moderators', value: '12', icon: Shield, color: 'bg-purple-500/20 text-purple-400' },
    { label: 'New Today', value: '8', icon: UserPlus, color: 'bg-yellow-500/20 text-yellow-400' },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 fade-in">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Members
        </h1>
        <p className="text-secondary">Manage your server members</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            className="glass p-5 rounded-xl hover-lift transition-smooth fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="glass p-4 rounded-xl mb-6 fade-in" style={{ animationDelay: '400ms' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
          <input
            type="text"
            placeholder="Search members..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="glass p-6 rounded-xl fade-in" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">All Members</h2>
          <span className="text-sm text-secondary">{members.length} members</span>
        </div>
        
        <div className="space-y-3">
          {members.map((member, index) => (
            <div
              key={member.id}
              className="group flex items-center justify-between p-4 bg-secondary/30 rounded-xl hover:bg-secondary/60 transition-all duration-300 border border-transparent hover:border-accent/20"
              style={{ animationDelay: `${(index + 6) * 100}ms` }}
            >
              {/* Member Info */}
              <div className="flex items-center gap-4 flex-1">
                {/* Avatar with Status */}
                <div className="relative">
                  <div className="w-11 h-11 bg-tertiary rounded-full flex items-center justify-center text-xl ring-2 ring-secondary group-hover:ring-accent/30 transition-all">
                    {member.avatar}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-secondary ${
                    member.status === 'online' ? 'bg-green-400' :
                    member.status === 'idle' ? 'bg-yellow-400' :
                    'bg-gray-500'
                  }`} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm truncate">{member.username}</span>
                    {member.role === 'Owner' && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 rounded-md">
                        <Crown className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs text-yellow-400 font-medium">Owner</span>
                      </div>
                    )}
                    {member.role === 'Moderator' && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 rounded-md">
                        <Shield className="h-3 w-3 text-purple-400" />
                        <span className="text-xs text-purple-400 font-medium">Moderator</span>
                      </div>
                    )}
                    {member.role === 'Member' && (
                      <span className="text-xs text-secondary px-2 py-0.5 bg-secondary/50 rounded-md">Member</span>
                    )}
                  </div>
                  <p className="text-xs text-secondary">Joined {member.joinedAt}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="px-3 py-1.5 text-sm bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-all">
                  View
                </button>
                <button className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
