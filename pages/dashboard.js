import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ModernCommandCard from '../components/ModernCommandCard';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [discordData, setDiscordData] = useState(null);
  const [commands, setCommands] = useState([]);
  const [logs, setLogs] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
    fetchAllData();
    
    // Set up real-time updates
    const interval = setInterval(fetchAllData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkAuthentication = async () => {
    try {
      // Check local storage first
      const storedAuth = localStorage.getItem('skyfall_auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        setUser(authData.user);
        return;
      }

      // Check with server
      const response = await fetch('/api/auth/check-admin');
      if (response.ok) {
        const data = await response.json();
        if (data.isAdmin) {
          setUser(data.user);
          localStorage.setItem('skyfall_auth', JSON.stringify(data));
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      router.push('/login');
    }
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchDiscordData(),
      fetchCommands(),
      fetchLogs(),
      fetchAppeals()
    ]);
    setLoading(false);
  };

  const fetchDiscordData = async () => {
    try {
      const response = await fetch('/api/discord-real-data');
      if (response.ok) {
        const data = await response.json();
        setDiscordData(data);
        
        // Add notification if Pi bot is connected
        if (data.mode === 'REAL_DISCORD_DATA') {
          addNotification('🟢 Connected to Pi Bot - Real data active', 'success');
        }
      }
    } catch (error) {
      console.error('Failed to fetch Discord data:', error);
      addNotification('⚠️ Failed to fetch Discord data', 'error');
    }
  };

  const fetchCommands = async () => {
    try {
      const response = await fetch('/api/commands/manage');
      if (response.ok) {
        const data = await response.json();
        setCommands(data.commands || []);
      }
    } catch (error) {
      console.error('Failed to fetch commands:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const fetchAppeals = async () => {
    try {
      const response = await fetch('/api/appeals');
      if (response.ok) {
        const data = await response.json();
        setAppeals(data.appeals || []);
      }
    } catch (error) {
      console.error('Failed to fetch appeals:', error);
    }
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const handleCommandToggle = async (commandId, enabled) => {
    try {
      const response = await fetch('/api/commands/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commandId, enabled })
      });

      if (response.ok) {
        await fetchCommands();
        addNotification(`Command ${commandId} ${enabled ? 'enabled' : 'disabled'}`, 'success');
      }
    } catch (error) {
      console.error('Failed to toggle command:', error);
      addNotification('Failed to update command', 'error');
    }
  };

  const handleCommandEdit = async (commandId, editData) => {
    try {
      const response = await fetch('/api/commands/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commandId, ...editData })
      });

      if (response.ok) {
        await fetchCommands();
        addNotification(`Command ${commandId} updated successfully`, 'success');
      }
    } catch (error) {
      console.error('Failed to edit command:', error);
      addNotification('Failed to update command', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('skyfall_auth');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Skyfall</title>
        <meta name="description" content="Ultra Modern Discord Management Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl backdrop-blur-lg border animate-slide-in-right ${
                notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-100' :
                notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-100' :
                'bg-blue-500/20 border-blue-500/30 text-blue-100'
              }`}
            >
              {notification.message}
            </div>
          ))}
        </div>

        {/* Header */}
        <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-white">S</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Skyfall Dashboard</h1>
                  <p className="text-sm text-gray-400">Ultra Modern Discord Management</p>
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-white font-medium">{user?.username || 'Bot Manager'}</p>
                  <p className="text-sm text-gray-400">{user?.role || 'Administrator'}</p>
                </div>
                <img
                  src={user?.avatar || 'https://cdn.discordapp.com/embed/avatars/1.png'}
                  alt="User Avatar"
                  className="h-10 w-10 rounded-full border-2 border-purple-400"
                />
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-black/10 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'servers', name: 'Servers', icon: '🏢' },
                { id: 'commands', name: 'Commands', icon: '⚡' },
                { id: 'activity', name: 'Activity', icon: '📝' },
                { id: 'appeals', name: 'Appeals', icon: '📋' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-purple-400 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Servers</p>
                      <p className="text-3xl font-bold text-white">{discordData?.data?.guilds || 5}</p>
                    </div>
                    <div className="text-4xl">🏢</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-white">{discordData?.data?.users || 3988}</p>
                    </div>
                    <div className="text-4xl">👥</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Commands</p>
                      <p className="text-3xl font-bold text-white">{commands.length}</p>
                    </div>
                    <div className="text-4xl">⚡</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Bot Status</p>
                      <p className="text-lg font-bold text-green-400">Online</p>
                    </div>
                    <div className="text-4xl">🟢</div>
                  </div>
                </div>
              </div>

              {/* Server Overview */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Server Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {discordData?.data?.realGuilds?.map((guild) => (
                    <div key={guild.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-2xl">{guild.icon}</div>
                        <div>
                          <h3 className="font-semibold text-white">{guild.name}</h3>
                          <p className="text-sm text-gray-400">{guild.members} members</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400">Commands Used</p>
                          <p className="text-white font-medium">{guild.commandsUsed}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Active Tickets</p>
                          <p className="text-white font-medium">{guild.activeTickets}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'commands' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">Command Management</h2>
                <div className="text-sm text-gray-400">
                  {commands.filter(cmd => cmd.enabled).length} of {commands.length} commands enabled
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {commands.map((command) => (
                  <ModernCommandCard
                    key={command.id}
                    command={command}
                    onToggle={handleCommandToggle}
                    onEdit={handleCommandEdit}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Recent Activity</h2>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
                <div className="space-y-0">
                  {logs.map((log, index) => (
                    <div key={log.id} className={`p-4 ${index !== logs.length - 1 ? 'border-b border-white/10' : ''}`}>
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          log.type === 'success' ? 'bg-green-400' :
                          log.type === 'error' ? 'bg-red-400' :
                          log.type === 'warning' ? 'bg-yellow-400' :
                          'bg-blue-400'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">{log.action}</h3>
                            <span className="text-sm text-gray-400">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mt-1">{log.message}</p>
                          <p className="text-gray-400 text-xs mt-1">by {log.user}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appeals' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Ban Appeals</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {appeals.map((appeal) => (
                  <div key={appeal.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {appeal.type === 'Ban' ? '🚫' : appeal.type === 'Mute' ? '🔇' : '👢'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{appeal.type} Appeal</h3>
                          <p className="text-sm text-gray-400">by {appeal.username}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appeal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        appeal.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {appeal.status}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">{appeal.reason}</p>
                    <div className="text-xs text-gray-400">
                      <p>Server: {appeal.serverName}</p>
                      <p>Submitted: {new Date(appeal.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
