'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Server, Users, Crown, Settings, ExternalLink, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ServersPage() {
  const servers = [
    {
      id: '1',
      name: 'My Awesome Server',
      icon: '🎮',
      members: 1234,
      owner: true,
      botAdded: true,
    },
    {
      id: '2',
      name: 'Community Hub',
      icon: '🌟',
      members: 5678,
      owner: false,
      botAdded: true,
    },
    {
      id: '3',
      name: 'Gaming Squad',
      icon: '🎯',
      members: 890,
      owner: true,
      botAdded: true,
    },
    {
      id: '4',
      name: 'Tech Talk',
      icon: '💻',
      members: 2345,
      owner: false,
      botAdded: false,
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 fade-in">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Your Servers
        </h1>
        <p className="text-secondary">Manage all servers where you have the bot installed</p>
      </div>

      {/* Server Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {servers.map((server, index) => (
          <div
            key={server.id}
            className="group relative glass backdrop-blur-xl p-6 rounded-2xl hover-lift transition-all duration-500 border border-white/5 hover:border-accent/30 fade-in overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Server Icon & Name */}
              <div className="flex items-start gap-4 mb-5">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-tertiary rounded-xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {server.icon}
                  </div>
                  {server.owner && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-yellow-400/30">
                      <Crown className="h-3 w-3 text-yellow-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold mb-1 truncate group-hover:text-accent transition-colors">
                    {server.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-secondary">
                    <Users className="h-3.5 w-3.5" />
                    <span>{server.members.toLocaleString()} members</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-5">
                {server.botAdded ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-medium text-green-400">Bot Active</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-500/10 border border-gray-500/20 rounded-full backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <span className="text-xs font-medium text-gray-400">Bot Not Added</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {server.botAdded ? (
                  <>
                    <Link
                      href={`/dashboard/servers/${server.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent/90 hover:bg-accent text-white rounded-xl transition-all duration-300 text-sm font-medium shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:scale-105"
                    >
                      <Settings className="h-4 w-4" />
                      Manage
                    </Link>
                    <button className="p-2.5 bg-secondary/50 hover:bg-secondary rounded-xl transition-all duration-300 backdrop-blur-sm hover:scale-105">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary/50 hover:bg-secondary text-primary rounded-xl transition-all duration-300 text-sm font-medium backdrop-blur-sm hover:scale-105">
                    <Plus className="h-4 w-4" />
                    Add Bot
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Server Card */}
        <div 
          className="group relative glass backdrop-blur-xl p-6 rounded-2xl hover-lift transition-all duration-500 border border-dashed border-white/10 hover:border-accent/50 cursor-pointer fade-in overflow-hidden"
          style={{ animationDelay: `${servers.length * 100}ms` }}
        >
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center py-4">
            <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Plus className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">
              Add New Server
            </h3>
            <p className="text-xs text-secondary mb-4 max-w-[200px]">
              Invite the bot to another server you manage
            </p>
            <button className="px-5 py-2 bg-accent/90 hover:bg-accent text-white rounded-xl transition-all duration-300 text-sm font-medium shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:scale-105">
              Invite Bot
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
