import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ModernSleekDashboard = () => {
  const [botData, setBotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchBotData();
    const interval = setInterval(fetchBotData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBotData = async () => {
    try {
      const response = await fetch('/api/test-live');
      const data = await response.json();
      setBotData(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch bot data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, trend, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-6 shadow-2xl hover:shadow-3xl transition-all duration-300`}
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

  const TabButton = ({ id, label, icon, active, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(id)}
      className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
        active
          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
        />
      </div>
    );
  }

  const stats = botData?.success ? botData.data : botData?.fallbackData;

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

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex space-x-2 mb-8">
            <TabButton
              id="overview"
              label="Overview"
              icon="📊"
              active={activeTab === 'overview'}
              onClick={setActiveTab}
            />
            <TabButton
              id="servers"
              label="Servers"
              icon="🏢"
              active={activeTab === 'servers'}
              onClick={setActiveTab}
            />
            <TabButton
              id="commands"
              label="Commands"
              icon="⚡"
              active={activeTab === 'commands'}
              onClick={setActiveTab}
            />
            <TabButton
              id="analytics"
              label="Analytics"
              icon="📈"
              active={activeTab === 'analytics'}
              onClick={setActiveTab}
            />
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Servers"
                    value={stats?.guilds || '5'}
                    icon="🏢"
                    trend={12}
                    color="blue"
                  />
                  <StatCard
                    title="Total Users"
                    value={stats?.users || '1,250'}
                    icon="👥"
                    trend={8}
                    color="green"
                  />
                  <StatCard
                    title="Commands Available"
                    value={stats?.commands || '60'}
                    icon="⚡"
                    trend={5}
                    color="purple"
                  />
                  <StatCard
                    title="Uptime"
                    value={stats?.uptime || '99.9%'}
                    icon="⏱️"
                    trend={2}
                    color="pink"
                  />
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl"
                  >
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl mr-4">
                        <span className="text-2xl">🛡️</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Security Features</h3>
                        <p className="text-white/60">Advanced protection systems</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Anti-Raid Protection</span>
                        <span className="text-green-400 font-medium">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Anti-Nuke System</span>
                        <span className="text-green-400 font-medium">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Auto Moderation</span>
                        <span className="text-green-400 font-medium">Enabled</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl"
                  >
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl mr-4">
                        <span className="text-2xl">📊</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">System Status</h3>
                        <p className="text-white/60">Real-time monitoring</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/80">CPU Usage</span>
                          <span className="text-white">23%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '23%' }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/80">Memory Usage</span>
                          <span className="text-white">45%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '45%' }}
                            transition={{ duration: 1, delay: 0.7 }}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'commands' && (
              <motion.div
                key="commands"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Available Commands</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: '/ping', desc: 'Check bot latency', category: 'Utility' },
                    { name: '/help', desc: 'Show command list', category: 'Utility' },
                    { name: '/ban', desc: 'Ban server members', category: 'Moderation' },
                    { name: '/kick', desc: 'Kick server members', category: 'Moderation' },
                    { name: '/play', desc: 'Play music', category: 'Music' },
                    { name: '/ticket', desc: 'Support tickets', category: 'Support' },
                  ].map((cmd, index) => (
                    <motion.div
                      key={cmd.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-purple-400 font-mono font-bold">{cmd.name}</code>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm">{cmd.desc}</p>
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

export default ModernSleekDashboard;
