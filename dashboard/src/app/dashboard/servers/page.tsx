'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Server, Users, Crown, Settings, ExternalLink } from 'lucide-react';
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Your Servers</h1>
        <p className="text-secondary">Manage all servers where you have the bot installed</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => (
          <div
            key={server.id}
            className="glass p-6 rounded-xl hover-lift transition-smooth"
          >
            {/* Server Icon & Name */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-3xl">
                {server.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{server.name}</h3>
                  {server.owner && (
                    <Crown className="h-4 w-4 text-yellow-400" title="Owner" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Users className="h-4 w-4" />
                  <span>{server.members.toLocaleString()} members</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mb-4">
              {server.botAdded ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span>Bot Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-secondary text-sm">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span>Bot Not Added</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {server.botAdded ? (
                <>
                  <Link
                    href={`/dashboard/servers/${server.id}`}
                    className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover-scale transition-smooth text-center font-medium"
                  >
                    <Settings className="h-4 w-4 inline mr-2" />
                    Manage
                  </Link>
                  <button className="px-4 py-2 bg-secondary rounded-lg hover:bg-tertiary transition-smooth">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button className="flex-1 px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-tertiary transition-smooth font-medium">
                  Add Bot
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Server Card */}
      <div className="mt-6 glass p-8 rounded-xl text-center hover-lift transition-smooth cursor-pointer">
        <Server className="h-12 w-12 text-accent mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Add Bot to Server</h3>
        <p className="text-secondary mb-4">
          Invite the bot to another server you manage
        </p>
        <button className="px-6 py-3 bg-accent text-white rounded-lg hover-scale transition-smooth font-medium">
          Invite Bot
        </button>
      </div>
    </DashboardLayout>
  );
}
