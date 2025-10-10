import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EnhancedDashboard = () => {
  const [botData, setBotData] = useState(null);
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchBotData();
    fetchLogs();
    const interval = setInterval(() => {
      fetchBotData();
      fetchLogs();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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
    } finally {
      setLoading(false);
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

  const executeCommand = async (command, data) => {
    try {
      const response = await fetch('/api/bot-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: command, data })
      });
      
      const result = await response.json();
      if (result.success) {
        fetchLogs(); // Refresh logs after command
      }
      return result;
    } catch (error) {
      console.error('Command execution failed:', error);
      return { success: false, error: error.message };
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

  const LogEntry = ({ log, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${
            log.type === 'error' ? 'bg-red-400' :
            log.type === 'warning' ? 'bg-yellow-400' :
            log.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
          }`}></span>
          <span className="text-white font-medium">{log.action}</span>
          <span className="text-white/60 text-sm">by {log.user}</span>
        </div>
        <span className="text-white/40 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
      </div>
      <p className="text-white/80 text-sm">{log.message}</p>
    </motion.div>
  );

  const ServerCard = ({ server, onManage }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
          <span className="text-2xl">{server.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{server.name}</h3>
          <p className="text-white/60">{server.members} members</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${server.status === 'online' ? 'bg-green-400' : 'bg-gray-400'} animate-pulse`}></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{server.commands}</p>
          <p className="text-white/60 text-sm">Commands Used</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{server.tickets}</p>
          <p className="text-white/60 text-sm">Active Tickets</p>
        </div>
      </div>
      
      <button
        onClick={() => onManage(server)}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors font-medium"
      >
        Manage Server
      </button>
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
          <p className="text-white/70 mb-6">Login with Discord to access your dashboard and manage your servers</p>
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
  const servers = [
    { id: 1, name: "Skyfall | Softworks", members: 1250, status: "online", icon: "🏢", commands: 1547, tickets: 12 },
    { id: 2, name: "Development Hub", members: 45, status: "online", icon: "⚙️", commands: 234, tickets: 3 },
    { id: 3, name: "Community Center", members: 892, status: "online", icon: "🌟", commands: 891, tickets: 7 },
    { id: 4, name: "Gaming Lounge", members: 567, status: "online", icon: "🎮", commands: 445, tickets: 2 },
    { id: 5, name: "Support Server", members: 234, status: "online", icon: "🎫", commands: 123, tickets: 18 }
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
                  <p className="text-white/60">Advanced Discord Management</p>
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
          <div className="flex space-x-2 mb-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'servers', label: 'Servers', icon: '🏢' },
              { id: 'logs', label: 'Logs', icon: '📋' },
              { id: 'appeals', label: 'Appeals', icon: '⚖️' }
            ].map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
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
                  <StatCard title="Total Users" value={stats?.users || '1,250'} icon="👥" trend={8} color="green" />
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
                  <h2 className="text-2xl font-bold text-white">Your Servers</h2>
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
                      <ServerCard server={server} onManage={(s) => console.log('Managing', s.name)} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
                  <button
                    onClick={fetchLogs}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🔄 Refresh
                  </button>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 max-h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-white/60 text-center py-8">No recent activity</p>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log, index) => (
                        <LogEntry key={log.id || index} log={log} index={index} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
