'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Settings, Bell, Shield, Palette, Database, Key } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-secondary">Configure your bot and server settings</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="backdrop-blur-3xl p-6 rounded-3xl" style={{
          background: 'linear-gradient(135deg, rgba(var(--bg-secondary), 0.4) 0%, rgba(var(--bg-secondary), 0.2) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}>
          <div className="flex items-center gap-3 mb-6">
            <Settings className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold">General Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <h3 className="font-semibold mb-1">Bot Prefix</h3>
                <p className="text-sm text-secondary">Change the command prefix for your server</p>
              </div>
              <input
                type="text"
                defaultValue="!"
                className="w-20 px-4 py-2 bg-tertiary rounded-lg text-center font-mono focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <h3 className="font-semibold mb-1">Language</h3>
                <p className="text-sm text-secondary">Select bot response language</p>
              </div>
              <select className="px-4 py-2 bg-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>

        {/* Moderation Settings */}
        <div className="backdrop-blur-3xl p-6 rounded-3xl" style={{
          background: 'linear-gradient(135deg, rgba(var(--bg-secondary), 0.4) 0%, rgba(var(--bg-secondary), 0.2) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-red-400" />
            <h2 className="text-2xl font-bold">Moderation</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <h3 className="font-semibold mb-1">Auto-Moderation</h3>
                <p className="text-sm text-secondary">Automatically moderate spam and bad words</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-tertiary rounded-full peer peer-checked:bg-accent transition-colors"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <h3 className="font-semibold mb-1">Mod Log Channel</h3>
                <p className="text-sm text-secondary">Channel for moderation logs</p>
              </div>
              <select className="px-4 py-2 bg-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                <option>#mod-logs</option>
                <option>#admin-logs</option>
                <option>#audit-logs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="backdrop-blur-3xl p-6 rounded-3xl" style={{
          background: 'linear-gradient(135deg, rgba(var(--bg-secondary), 0.4) 0%, rgba(var(--bg-secondary), 0.2) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}>
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-6 w-6 text-yellow-400" />
            <h2 className="text-2xl font-bold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <h3 className="font-semibold mb-1">Welcome Messages</h3>
                <p className="text-sm text-secondary">Send welcome messages to new members</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-tertiary rounded-full peer peer-checked:bg-accent transition-colors"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <h3 className="font-semibold mb-1">Leave Messages</h3>
                <p className="text-sm text-secondary">Announce when members leave</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-tertiary rounded-full peer peer-checked:bg-accent transition-colors"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="backdrop-blur-3xl p-6 rounded-3xl" style={{
          background: 'linear-gradient(135deg, rgba(var(--bg-secondary), 0.4) 0%, rgba(var(--bg-secondary), 0.2) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}>
          <div className="flex items-center gap-3 mb-6">
            <Palette className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bold">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <h3 className="font-semibold mb-1">Embed Color</h3>
                <p className="text-sm text-secondary">Default color for bot embeds</p>
              </div>
              <input
                type="color"
                defaultValue="#3B82F6"
                className="w-12 h-12 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button className="px-6 py-3 bg-secondary rounded-lg hover:bg-tertiary transition-smooth">
            Reset
          </button>
          <button className="px-6 py-3 bg-accent text-white rounded-lg hover-scale transition-smooth">
            Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
