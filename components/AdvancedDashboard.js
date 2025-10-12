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
        console.log('✅ Real Discord user authenticated:', userData.username);
      } else if (response.status === 401) {
        console.log('❌ Authentication required - redirecting to login');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      s
    }
  };

  const fetchBotData = async () => {
    try {
      // Only try real Discord data from Pi bot
      const response = await fetch('/api/discord-real-data');
      if (response.ok) {
        const data = await response.json();
        setBotData(data);
        console.log('✅ Using REAL Discord data from Pi bot:', data.mode);
        return;
      } else {
        console.log('❌ Pi bot unavailable - no real data available');
        setBotData({ 
          success: false, 
          error: 'Pi bot offline',
          message: 'Real Discord data unavailable. Pi bot must be online.',
          mode: 'ERROR_NO_PI_BOT'
        });
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      setBotData({ 
        success: false, 
        error: 'Connection failed',
        message: 'Cannot connect to Pi bot for real data.',
        mode: 'ERROR_CONNECTION'
      });
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
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 ${onClick ? 'cursor-pointer' : ''} group`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className={`p-4 rounded-2xl bg-gradient-to-r from-${color}-500/30 to-${color}-600/20 backdrop-blur-sm shadow-lg`}
          >
            <span className="text-3xl filter drop-shadow-lg">{icon}</span>
          </motion.div>
          {trend && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg ${trend > 0 ? 'bg-green-500/20 text-green-300 shadow-green-500/20' : 'bg-red-500/20 text-red-300 shadow-red-500/20'}`}
            >
              <span className="mr-2 text-lg">{trend > 0 ? '↗' : '↘'}</span>
              {Math.abs(trend)}%
            </motion.div>
          )}
        </div>
        <div className="space-y-3">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black text-white tracking-tight"
          >
            {value}
          </motion.p>
          <p className="text-lg font-semibold text-white/90">{title}</p>
        </div>
      </div>
    </motion.div>
  );

  const ServerCard = ({ server, onSelect, isSelected }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(server)}
      className={`bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl border transition-all duration-500 cursor-pointer shadow-2xl hover:shadow-3xl group ${
        isSelected ? 'border-purple-500/50 ring-2 ring-purple-400/30 shadow-purple-500/20' : 'border-white/20 hover:border-white/30'
      } p-8`}
    >
      <div className="flex items-center space-x-6 mb-6">
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className="w-20 h-20 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg"
        >
          <span className="text-3xl filter drop-shadow-lg">{server.icon}</span>
        </motion.div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-white mb-2 group-hover:text-purple-300 transition-colors">{server.name}</h3>
          <p className="text-white/70 font-semibold text-lg">{server.members.toLocaleString()} members</p>
        </div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-4 h-4 rounded-full shadow-lg ${server.status === 'online' ? 'bg-green-400 shadow-green-400/50' : 'bg-gray-400'}`}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300"
        >
          <p className="text-3xl font-black text-white mb-2">{server.commandsUsed.toLocaleString()}</p>
          <p className="text-white/70 text-sm font-semibold">Commands Used</p>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300"
        >
          <p className="text-3xl font-black text-white mb-2">{server.activeTickets}</p>
          <p className="text-white/70 text-sm font-semibold">Active Tickets</p>
        </motion.div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-green-400 text-sm font-bold flex items-center">
          <motion.span 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-green-400 rounded-full mr-2"
          />
          Connected
        </span>
        {isSelected && (
          <motion.span 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-purple-400 text-sm font-bold flex items-center"
          >
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"/>
            Selected
          </motion.span>
        )}
      </div>
    </motion.div>
  );

  const CommandCard = ({ command, onToggle, onEdit }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <motion.code 
            whileHover={{ scale: 1.05 }}
            className="text-purple-400 font-black text-lg bg-purple-500/20 px-4 py-2 rounded-xl border border-purple-500/30"
          >
            /{command.name}
          </motion.code>
          <motion.span 
            whileHover={{ scale: 1.1 }}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${
              command.category === 'moderation' ? 'bg-red-500/30 text-red-300 shadow-red-500/20' :
              command.category === 'utility' ? 'bg-blue-500/30 text-blue-300 shadow-blue-500/20' :
              command.category === 'music' ? 'bg-green-500/30 text-green-300 shadow-green-500/20' :
              'bg-gray-500/30 text-gray-300 shadow-gray-500/20'
            }`}
          >
            {command.category}
          </motion.span>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggle(command.id, !command.enabled)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 shadow-lg ${
              command.enabled ? 'bg-green-500 shadow-green-500/30' : 'bg-gray-600 shadow-gray-600/30'
            }`}
          >
            <motion.span 
              animate={{ x: command.enabled ? 24 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg"
            />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(command)}
            className="p-3 text-white/60 hover:text-white transition-colors bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/20"
          >
            ⚙️
          </motion.button>
        </div>
      </div>
      <p className="text-white/90 text-sm mb-4 font-medium leading-relaxed group-hover:text-white transition-colors">{command.description}</p>
      <div className="flex justify-between items-center text-xs">
        <span className="text-white/60 font-semibold">Used {command.usageCount} times</span>
        <motion.span 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`font-bold px-3 py-1 rounded-full ${command.enabled ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'}`}
        >
          {command.enabled ? 'Enabled' : 'Disabled'}
        </motion.span>
      </div>
    </motion.div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-10 text-center max-w-lg"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <span className="text-white font-black text-3xl">S</span>
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-4">Skyfall Dashboard</h2>
          <p className="text-white/70 mb-8 text-lg">Real Discord Authentication Required</p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/api/auth/discord-login"
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl transition-all duration-300 font-bold shadow-2xl"
          >
            <span>🔗</span>
            <span>Login with Discord</span>
          </motion.a>
          <p className="text-white/50 text-sm mt-4">Only real Discord users can access real data</p>
        </motion.div>
      </div>
    );
  }

  // Show error if Pi bot is offline
  if (botData && !botData.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 backdrop-blur-xl rounded-3xl border border-red-500/20 p-10 text-center max-w-lg"
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <span className="text-red-400 font-black text-3xl">⚠️</span>
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-4">Pi Bot Offline</h2>
          <p className="text-red-300 mb-6 text-lg">{botData.message}</p>
          <p className="text-white/70 mb-8">Real Discord data unavailable. Please start your Pi bot to access live data.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl transition-all duration-300 font-bold shadow-2xl"
          >
            <span>🔄</span>
            <span>Retry Connection</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const stats = botData?.data || {};
  const servers = stats?.realGuilds || [];

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
      {/* Ultra Modern Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            rotate: [360, 0],
            scale: [1.2, 1, 1.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-900/20 to-transparent"></div>
      </div>

      <div className="relative z-10">
        {/* Ultra Modern Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 backdrop-blur-2xl border-b border-white/20 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30"
                >
                  <span className="text-white font-black text-2xl">S</span>
                </motion.div>
                <div>
                  <motion.h1 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl font-black text-white bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
                  >
                    Skyfall Dashboard
                  </motion.h1>
                  <p className="text-white/70 font-semibold text-lg">Ultra Modern Discord Management</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20"
                >
                  <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full shadow-lg" />
                  <span className="text-white font-bold text-lg">{user.username}</span>
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl shadow-lg ${
                    botData?.success ? 'bg-green-500/20 text-green-300 shadow-green-500/20' : 'bg-yellow-500/20 text-yellow-300 shadow-yellow-500/20'
                  }`}
                >
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`w-3 h-3 rounded-full ${
                      botData?.success ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-yellow-400 shadow-lg shadow-yellow-400/50'
                    }`}
                  />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    {botData?.success ? 'Connected' : 'Fallback Mode'}
                  </span>
                </motion.div>
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
