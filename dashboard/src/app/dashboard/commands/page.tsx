'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Search,
  Filter,
  Command,
  Shield,
  Sparkles,
  Users,
  Settings as SettingsIcon,
  ToggleLeft,
  ToggleRight,
  Edit,
  TrendingUp,
} from 'lucide-react';
import { cn, getCategoryColor } from '@/lib/utils';

interface CommandData {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  usageCount: number;
  cooldown: number;
}

export default function CommandsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [commands, setCommands] = useState<CommandData[]>([
    { id: '1', name: 'ban', description: 'Ban a member from the server', category: 'moderation', enabled: true, usageCount: 234, cooldown: 5 },
    { id: '2', name: 'kick', description: 'Kick a member from the server', category: 'moderation', enabled: true, usageCount: 156, cooldown: 3 },
    { id: '3', name: 'warn', description: 'Warn a member for rule violations', category: 'moderation', enabled: true, usageCount: 445, cooldown: 1 },
    { id: '4', name: 'setup', description: 'Auto-setup server configuration', category: 'admin', enabled: true, usageCount: 89, cooldown: 0 },
    { id: '5', name: 'ping', description: 'Check bot latency', category: 'utility', enabled: true, usageCount: 1234, cooldown: 0 },
    { id: '6', name: 'userinfo', description: 'Get information about a user', category: 'utility', enabled: true, usageCount: 567, cooldown: 2 },
    { id: '7', name: 'serverinfo', description: 'Get information about the server', category: 'utility', enabled: true, usageCount: 345, cooldown: 2 },
    { id: '8', name: 'appeal', description: 'Submit or manage appeals', category: 'moderation', enabled: true, usageCount: 123, cooldown: 0 },
  ]);

  const categories = [
    { id: 'all', name: 'All Commands', icon: <Command className="h-4 w-4" />, count: commands.length },
    { id: 'moderation', name: 'Moderation', icon: <Shield className="h-4 w-4" />, count: commands.filter(c => c.category === 'moderation').length },
    { id: 'admin', name: 'Admin', icon: <SettingsIcon className="h-4 w-4" />, count: commands.filter(c => c.category === 'admin').length },
    { id: 'utility', name: 'Utility', icon: <Sparkles className="h-4 w-4" />, count: commands.filter(c => c.category === 'utility').length },
  ];

  const filteredCommands = commands.filter(cmd => {
    const matchesSearch = cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cmd.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleCommand = (id: string) => {
    setCommands(commands.map(cmd => 
      cmd.id === id ? { ...cmd, enabled: !cmd.enabled } : cmd
    ));
  };

  const totalUsage = commands.reduce((sum, cmd) => sum + cmd.usageCount, 0);
  const enabledCount = commands.filter(cmd => cmd.enabled).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Commands</h1>
        <p className="text-dark-muted">Manage and configure all bot commands</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass" padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-discord-blurple/20 rounded-lg flex items-center justify-center">
                <Command className="h-6 w-6 text-discord-blurple" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{commands.length}</p>
                <p className="text-sm text-dark-muted">Total Commands</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-discord-green/20 rounded-lg flex items-center justify-center">
                <ToggleRight className="h-6 w-6 text-discord-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{enabledCount}</p>
                <p className="text-sm text-dark-muted">Enabled</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass" padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-discord-fuchsia/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-discord-fuchsia" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalUsage.toLocaleString()}</p>
                <p className="text-sm text-dark-muted">Total Usage</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <Card variant="glass" padding="md">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-muted" />
              <input
                type="text"
                placeholder="Search commands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-elevated border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-discord-blurple"
              />
            </div>

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap',
                    selectedCategory === category.id
                      ? 'bg-discord-blurple text-white'
                      : 'bg-dark-elevated text-dark-text hover:bg-dark-border'
                  )}
                >
                  {category.icon}
                  <span>{category.name}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs',
                    selectedCategory === category.id
                      ? 'bg-white/20'
                      : 'bg-dark-border'
                  )}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Commands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommands.map((command, index) => (
          <motion.div
            key={command.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.05 }}
          >
            <Card variant="glass" padding="md" hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    getCategoryColor(command.category)
                  )}>
                    {command.category}
                  </div>
                  <span className="text-xs text-dark-muted">
                    {command.usageCount} uses
                  </span>
                </div>
                <button
                  onClick={() => toggleCommand(command.id)}
                  className="transition-transform hover:scale-110"
                >
                  {command.enabled ? (
                    <ToggleRight className="h-6 w-6 text-discord-green" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-dark-muted" />
                  )}
                </button>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">/{command.name}</h3>
              <p className="text-sm text-dark-muted mb-4">{command.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                <span className="text-xs text-dark-muted">
                  Cooldown: {command.cooldown}s
                </span>
                <Button variant="ghost" size="sm" icon={<Edit className="h-4 w-4" />}>
                  Edit
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCommands.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Command className="h-12 w-12 text-dark-muted mx-auto mb-4" />
          <p className="text-lg text-dark-muted">No commands found</p>
        </motion.div>
      )}
    </div>
  );
}
