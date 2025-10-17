import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Commands() {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCommands();
  }, []);

  const fetchCommands = async () => {
    try {
      const response = await fetch('/api/commands/list');
      if (response.ok) {
        const data = await response.json();
        setCommands(data.commands || []);
      }
    } catch (error) {
      console.error('Failed to fetch commands:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(commands.map(cmd => cmd.category))];
  
  const filteredCommands = commands.filter(cmd => {
    const matchesFilter = filter === 'all' || cmd.category === filter;
    const matchesSearch = cmd.name.toLowerCase().includes(search.toLowerCase()) ||
                         cmd.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    const icons = {
      'moderation': '🛡️',
      'utility': '🔧',
      'fun': '🎮',
      'music': '🎵',
      'admin': '👑',
      'info': 'ℹ️',
      'verification': '✅',
      'tickets': '🎫',
      'appeals': '⚖️'
    };
    return icons[category?.toLowerCase()] || '📝';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Commands...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Commands - Skyfall Bot</title>
        <meta name="description" content="Complete list of Skyfall Discord bot commands" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-white hover:text-purple-300 transition-colors">
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-white">All Commands</h1>
            <Link href="/dashboard" className="text-white hover:text-purple-300 transition-colors">
              Dashboard →
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-3xl font-bold text-white">{commands.length}</p>
              <p className="text-gray-400">Total Commands</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl mb-2">📁</div>
              <p className="text-3xl font-bold text-white">{categories.length}</p>
              <p className="text-gray-400">Categories</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-3xl font-bold text-white">{commands.filter(c => c.enabled).length}</p>
              <p className="text-gray-400">Active</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl mb-2">⚡</div>
              <p className="text-3xl font-bold text-white">{commands.reduce((sum, c) => sum + (c.usageCount || 0), 0)}</p>
              <p className="text-gray-400">Total Uses</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="🔍 Search commands..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                      filter === category
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {getCategoryIcon(category)} {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Commands Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommands.map((command) => (
              <div
                key={command.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all hover:transform hover:scale-105"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{getCategoryIcon(command.category)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">/{command.name}</h3>
                      <span className="text-xs text-purple-300">{command.category}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    command.enabled
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {command.enabled ? 'Active' : 'Disabled'}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-4">{command.description}</p>

                {/* Usage */}
                {command.usage && (
                  <div className="bg-black/30 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-400 mb-1">Usage:</p>
                    <code className="text-purple-300 text-sm">/{command.usage}</code>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-white/10 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">Uses</p>
                    <p className="text-white font-bold">{command.usageCount || 0}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">Cooldown</p>
                    <p className="text-white font-bold">{command.cooldown || 0}s</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">Success</p>
                    <p className="text-white font-bold">{command.successRate || 100}%</p>
                  </div>
                </div>

                {/* Permissions */}
                {command.permissions && command.permissions.length > 0 && (
                  <div className="border-t border-white/10 pt-3">
                    <p className="text-xs text-gray-400 mb-2">Required Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {command.permissions.map((perm, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aliases */}
                {command.aliases && command.aliases.length > 0 && (
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <p className="text-xs text-gray-400 mb-2">Aliases:</p>
                    <div className="flex flex-wrap gap-1">
                      {command.aliases.map((alias, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30"
                        >
                          /{alias}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredCommands.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Commands Found</h3>
              <p className="text-gray-400">Try adjusting your search or filter</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
