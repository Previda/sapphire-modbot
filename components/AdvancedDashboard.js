import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AdvancedDashboard = () => {
  const [botData, setBotData] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedServer, setSelectedServer] = useState(null);
  const [commands, setCommands] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchUserData(),
      fetchBotData(),
      fetchCommands(),
      fetchLogs()
    ]);
    setLoading(false);
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchBotData = async () => {
    try {
      const response = await fetch('/api/test-live');
      const data = await response.json();
      setBotData(data);
    } catch (error) {
      console.error('Dashboard error:', error);
    }
  };

  const fetchCommands = async () => {
    try {
      const response = await fetch('/api/commands');
      const data = await response.json();
      setCommands(data.commands || []);
    } catch (error) {
      console.error('Failed to fetch commands:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const toggleCommand = async (commandId, enabled) => {
    try {
      const response = await fetch('/api/commands/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commandId, enabled, serverId: selectedServer?.id })
      });
      
      if (response.ok) {
        fetchCommands();
      }
    } catch (error) {
      console.error('Failed to toggle command:', error);
    }
  };

  const StatCard = ({ title, value, icon, trend, color = "blue", onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-50"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r from-${color}-500/20 to-${color}-600/20 backdrop-blur-sm`}>
            <span className="text-2xl">{icon}</span>
          </div>
          {trend && (
            <div className={`flex items-center text-sm font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              <span className="mr-1">{trend > 0 ? '↗' : '↘'}</span>
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-sm text-white/70 font-medium">{title}</p>
        </div>
      </div>
    </motion.div>
  );

  const ServerCard = ({ server, onSelect, isSelected }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(server)}
      className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl border ${
        isSelected ? 'border-purple-500/50 ring-2 ring-purple-500/30' : 'border-white/20'
      } p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
          <span className="text-2xl">{server.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{server.name}</h3>
          <p className="text-white/60">{server.members.toLocaleString()} members</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${server.status === 'online' ? 'bg-green-400' : 'bg-gray-400'} animate-pulse`}></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{server.commandsUsed.toLocaleString()}</p>
          <p className="text-white/60 text-sm">Commands Used</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{server.activeTickets}</p>
          <p className="text-white/60 text-sm">Active Tickets</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-green-400 text-sm font-medium">✓ Connected</span>
        {isSelected && <span className="text-purple-400 text-sm font-medium">Selected</span>}
      </div>
    </motion.div>
  );

  const CommandCard = ({ command, onToggle, onEdit }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <code className="text-purple-400 font-mono font-bold">/{command.name}</code>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            command.category === 'moderation' ? 'bg-red-500/20 text-red-400' :
            command.category === 'utility' ? 'bg-blue-500/20 text-blue-400' :
            command.category === 'music' ? 'bg-green-500/20 text-green-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {command.category}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggle(command.id, !command.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              command.enabled ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              command.enabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
          <button
            onClick={() => onEdit(command)}
            className="p-1 text-white/60 hover:text-white transition-colors"
          >
            ⚙️
          </button>
        </div>
      </div>
      <p className="text-white/80 text-sm mb-2">{command.description}</p>
      <div className="flex justify-between text-xs text-white/60">
        <span>Used {command.usageCount} times</span>
        <span>{command.enabled ? 'Enabled' : 'Disabled'}</span>
      </div>
    </motion.div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center max-w-md"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to Skyfall</h2>
          <p className="text-white/70 mb-6">Login with Discord to access your advanced dashboard</p>
          <a
            href="/api/auth/login"
            className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <span>🔗</span>
            <span>Login with Discord</span>
          </a>
        </motion.div>
      </div>
    );
  }

  const stats = botData?.success ? botData.data : botData?.fallbackData;
  const servers = stats?.servers || [
    { id: '1', name: 'Skyfall | Softworks', members: 1250, commandsUsed: 1547, activeTickets: 12, status: 'online', icon: '🏢' },
    { id: '2', name: 'Development Hub', members: 45, commandsUsed: 234, activeTickets: 3, status: 'online', icon: '⚙️' },
    { id: '3', name: 'Community Center', members: 892, commandsUsed: 891, activeTickets: 7, status: 'online', icon: '🌟' },
    { id: '4', name: 'Gaming Lounge', members: 567, commandsUsed: 445, activeTickets: 2, status: 'online', icon: '🎮' },
    { id: '5', name: 'Support Server', members: 234, commandsUsed: 123, activeTickets: 18, status: 'online', icon: '🎫' }
  ];

  const mockCommands = [
    { id: 1, name: 'ban', description: 'Ban members from the server', category: 'moderation', enabled: true, usageCount: 45 },
    { id: 2, name: 'kick', description: 'Kick members from the server', category: 'moderation', enabled: true, usageCount: 23 },
    { id: 3, name: 'play', description: 'Play music in voice channels', category: 'music', enabled: true, usageCount: 156 },
    { id: 4, name: 'help', description: 'Show available commands', category: 'utility', enabled: true, usageCount: 89 },
    { id: 5, name: 'ticket', description: 'Create support tickets', category: 'tickets', enabled: true, usageCount: 67 },
    { id: 6, name: 'warn', description: 'Warn users for violations', category: 'moderation', enabled: false, usageCount: 12 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/20 backdrop-blur-xl border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-white font-bold text-xl">S</span>
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Skyfall Dashboard</h1>
                  <p className="text-white/60">Advanced Discord Management System</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                  <span className="text-white font-medium">{user.username}</span>
                </div>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                  botData?.success ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    botData?.success ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {botData?.success ? 'Connected' : 'Fallback Mode'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex space-x-2 mb-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'servers', label: 'Servers', icon: '🏢' },
              { id: 'commands', label: 'Commands', icon: '⚡' },
              { id: 'logs', label: 'Activity', icon: '📋' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'appeals', label: 'Appeals', icon: '⚖️' }
            ].map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Servers" value={stats?.guilds || '5'} icon="🏢" trend={12} color="blue" />
                  <StatCard title="Total Users" value={stats?.users?.toLocaleString() || '3,988'} icon="👥" trend={8} color="green" />
                  <StatCard title="Commands Available" value={stats?.commands || '60'} icon="⚡" trend={5} color="purple" />
                  <StatCard title="Uptime" value={stats?.uptime || '99.9%'} icon="⏱️" trend={2} color="pink" />
                </div>
              </motion.div>
            )}

            {activeTab === 'servers' && (
              <motion.div
                key="servers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Server Management</h2>
                  <span className="text-white/60">{servers.length} servers connected</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {servers.map((server, index) => (
                    <motion.div
                      key={server.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ServerCard 
                        server={server} 
                        onSelect={setSelectedServer}
                        isSelected={selectedServer?.id === server.id}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'commands' && (
              <motion.div
                key="commands"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Command Management</h2>
                    <p className="text-white/60">
                      {selectedServer ? `Managing commands for ${selectedServer.name}` : 'Select a server to manage commands'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors">
                      Enable All
                    </button>
                    <button className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors">
                      Disable All
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockCommands.map((command, index) => (
                    <motion.div
                      key={command.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CommandCard 
                        command={command}
                        onToggle={toggleCommand}
                        onEdit={(cmd) => console.log('Edit command:', cmd)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
