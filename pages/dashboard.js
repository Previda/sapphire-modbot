import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ServerSelector from '../components/ServerSelector';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [discordData, setDiscordData] = useState(null);
  const [commands, setCommands] = useState([]);
  const [logs, setLogs] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [statusData, setStatusData] = useState(null);
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await checkAuthentication();
        await fetchAllData();
      } catch (error) {
        console.error('Dashboard initialization failed:', error);
        setLoading(false);
      }
    };

    initializeDashboard();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      if (selectedServer) {
        fetchServerData(selectedServer.id);
      }
      fetchStatusData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedServer) {
      fetchServerData(selectedServer.id);
    }
  }, [selectedServer]);

  const checkAuthentication = async () => {
    try {
      // Check session from server
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.authenticated && data.user) {
          setUser(data.user);
          // Set servers from user's Discord guilds
          if (data.guilds && data.guilds.length > 0) {
            const userServers = data.guilds.map(guild => ({
              id: guild.id,
              name: guild.name,
              icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
              memberCount: 0, // Will be updated from Pi bot
              onlineMembers: 0,
              boostLevel: 0,
              boostCount: 0,
              isOwner: guild.owner,
              canManage: true,
              permissions: guild.permissions
            }));
            setServers(userServers);
            if (!selectedServer && userServers.length > 0) {
              setSelectedServer(userServers[0]);
            }
            addNotification(`Logged in as ${data.user.username}`, 'success');
          }
          return true;
        } else if (data.expired) {
          addNotification('Session expired - please login again', 'warning');
          router.push('/login');
          return false;
        }
      }

      // No session - use demo mode
      const demoUser = { username: 'Demo User', id: 'demo', isAdmin: false };
      setUser(demoUser);
      addNotification('Using demo mode - Login with Discord for full access', 'info');
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      const demoUser = { username: 'Demo User', id: 'demo', isAdmin: false };
      setUser(demoUser);
      addNotification('Using demo mode - authentication error', 'warning');
      return true;
    }
  };

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers/list', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setServers(data.servers || []);
        
        // Auto-select first server if none selected
        if (data.servers?.length > 0 && !selectedServer) {
          setSelectedServer(data.servers[0]);
        }
        
        if (data.source === 'fallback') {
          addNotification('Using demo servers - connect Pi bot for real data', 'info');
        }
      } else {
        // Use fallback servers if API fails
        const fallbackServers = [
          {
            id: '1234567890123456789',
            name: 'Demo Server',
            memberCount: 1247,
            onlineMembers: 342,
            boostLevel: 2,
            boostCount: 14,
            isOwner: true,
            canManage: true
          }
        ];
        setServers(fallbackServers);
        setSelectedServer(fallbackServers[0]);
        addNotification('Using fallback demo server', 'info');
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error);
      // Use fallback servers on error
      const fallbackServers = [
        {
          id: '1234567890123456789',
          name: 'Demo Server',
          memberCount: 1247,
          onlineMembers: 342,
          boostLevel: 2,
          boostCount: 14,
          isOwner: true,
          canManage: true
        }
      ];
      setServers(fallbackServers);
      setSelectedServer(fallbackServers[0]);
      addNotification('Using fallback demo server - API error', 'warning');
    }
  };

  const fetchServerData = async (serverId) => {
    if (!serverId) return;
    
    try {
      const response = await fetch(`/api/servers/${serverId}/data`);
      if (response.ok) {
        const data = await response.json();
        setCommands(data.data.commands || []);
        setLogs(data.data.logs || []);
        setAppeals(data.data.appeals || []);
        
        if (data.source === 'fallback') {
          addNotification(`Using demo data for ${selectedServer?.name}`, 'info');
        }
      } else {
        // Use fallback data
        setFallbackData();
      }
    } catch (error) {
      console.error('Failed to fetch server data:', error);
      setFallbackData();
      addNotification('Using fallback data - API error', 'warning');
    }
  };

  const setFallbackData = () => {
    const fallbackCommands = [
      { id: 'ban', name: 'ban', description: 'Ban a user from the server', category: 'moderation', enabled: true, usageCount: 45, cooldown: 5 },
      { id: 'kick', name: 'kick', description: 'Kick a user from the server', category: 'moderation', enabled: true, usageCount: 78, cooldown: 3 },
      { id: 'mute', name: 'mute', description: 'Mute a user in the server', category: 'moderation', enabled: true, usageCount: 156, cooldown: 2 },
      { id: 'ping', name: 'ping', description: 'Check bot latency and status', category: 'utility', enabled: true, usageCount: 567, cooldown: 0 }
    ];
    
    const fallbackLogs = [
      { id: 1, action: 'User banned', user: 'Moderator#1234', details: 'Banned @Spammer#5678 for spam', type: 'moderation', timestamp: new Date(Date.now() - 300000).toISOString(), guild: 'Demo Server' },
      { id: 2, action: 'Command executed', user: 'User#9876', details: 'Used /ping command', type: 'command', timestamp: new Date(Date.now() - 600000).toISOString(), guild: 'Demo Server' }
    ];
    
    const fallbackAppeals = [
      { id: 1, username: 'ApologeticUser#1234', banReason: 'Spam in multiple channels', appealMessage: 'I apologize for my behavior and promise to follow the rules.', status: 'pending', submittedAt: new Date(Date.now() - 86400000).toISOString() }
    ];
    
    setCommands(fallbackCommands);
    setLogs(fallbackLogs);
    setAppeals(fallbackAppeals);
  };

  const fetchStatusData = async () => {
    try {
      // First check Pi bot connection
      const piResponse = await fetch('/api/pi-bot/status');
      if (piResponse.ok) {
        const piData = await piResponse.json();
        setStatusData(piData);
        
        if (piData.overall.status === 'online') {
          addNotification('Pi bot connected successfully!', 'success');
        } else if (piData.overall.status === 'degraded') {
          addNotification('Pi bot partially connected', 'warning');
        }
        return;
      }
      
      // Fallback to regular status
      const response = await fetch('/api/status/live');
      if (response.ok) {
        const data = await response.json();
        setStatusData(data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
      addNotification('Status check failed - using demo data', 'warning');
    }
  };

  const fetchAllData = async () => {
    try {
      // Set a maximum timeout for loading
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Loading timeout')), 10000)
      );
      
      await Promise.race([
        Promise.all([
          fetchServers(),
          fetchStatusData()
        ]),
        timeout
      ]);
    } catch (error) {
      console.error('Fetch all data error:', error);
      // Ensure we have fallback data
      if (servers.length === 0) {
        const fallbackServers = [
          {
            id: '1234567890123456789',
            name: 'Demo Server',
            memberCount: 1247,
            onlineMembers: 342,
            boostLevel: 2,
            boostCount: 14,
            isOwner: true,
            canManage: true
          }
        ];
        setServers(fallbackServers);
        setSelectedServer(fallbackServers[0]);
        setFallbackData();
      }
      addNotification('Using demo data - loading timeout', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const testPiBotConnection = async () => {
    addNotification('Testing Pi bot connection...', 'info');
    
    try {
      const response = await fetch('/api/pi-bot/connect');
      if (response.ok) {
        const data = await response.json();
        
        if (data.connected) {
          addNotification(`Pi bot connected! ${data.bestConnection.url}`, 'success');
          // Refresh status data
          await fetchStatusData();
        } else {
          addNotification('No Pi bot connections found', 'warning');
        }
      } else {
        addNotification('Connection test failed', 'error');
      }
    } catch (error) {
      console.error('Pi bot connection test failed:', error);
      addNotification('Connection test error', 'error');
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
        setCommands(prev => prev.map(cmd => 
          cmd.id === commandId ? { ...cmd, enabled } : cmd
        ));
        addNotification(`Command ${enabled ? 'enabled' : 'disabled'} successfully`, 'success');
      }
    } catch (error) {
      addNotification('Failed to update command', 'error');
    }
  };

  const handleCommandEdit = async (commandId, updates) => {
    try {
      const response = await fetch('/api/commands/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commandId, ...updates })
      });

      if (response.ok) {
        setCommands(prev => prev.map(cmd => 
          cmd.id === commandId ? { ...cmd, ...updates } : cmd
        ));
        addNotification('Command updated successfully', 'success');
      }
    } catch (error) {
      addNotification('Failed to update command', 'error');
    }
  };

  const handleAppealAction = async (appealId, action) => {
    try {
      const response = await fetch('/api/appeals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appealId, status: action })
      });

      if (response.ok) {
        setAppeals(prev => prev.map(appeal => 
          appeal.id === appealId ? { ...appeal, status: action } : appeal
        ));
        addNotification(`Appeal ${action} successfully`, 'success');
      }
    } catch (error) {
      addNotification('Failed to update appeal', 'error');
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'commands', label: 'Commands', icon: '⚡' },
    { id: 'logs', label: 'Activity Logs', icon: '📋' },
    { id: 'appeals', label: 'Appeals', icon: '⚖️' },
    { id: 'status', label: 'System Status', icon: '🔧' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Skyfall Discord Management</title>
        <meta name="description" content="Professional Discord bot management dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-black/20 backdrop-blur-lg border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center px-6 py-4 border-b border-white/10">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-3">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Skyfall</h1>
                <p className="text-xs text-gray-400">Discord Management</p>
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="px-6 py-4 border-b border-white/10">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-white">{user.username?.[0] || 'U'}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.username || 'Admin User'}</p>
                    <p className="text-xs text-gray-400">Administrator</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Quick Links */}
            <div className="px-4 py-4 border-t border-white/10">
              <div className="space-y-2">
                <Link href="/status" className="flex items-center px-4 py-2 text-gray-300 hover:text-white transition-colors">
                  <span className="text-lg mr-3">🔍</span>
                  System Status
                </Link>
                <Link href="/faq" className="flex items-center px-4 py-2 text-gray-300 hover:text-white transition-colors">
                  <span className="text-lg mr-3">❓</span>
                  Help & FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:ml-64">
          {/* Top Bar */}
          <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors mr-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-white capitalize">
                  {activeTab === 'overview' ? 'Dashboard Overview' : activeTab}
                </h2>
              </div>

              <div className="flex items-center space-x-4">
                {/* Status Indicator */}
                {statusData && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      statusData.overall?.status === 'operational' ? 'bg-green-400' :
                      statusData.overall?.status === 'degraded_performance' ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`}></div>
                    <span className="text-gray-300 text-sm">
                      {statusData.overall?.message || 'Status Unknown'}
                    </span>
                  </div>
                )}

                {/* Logout */}
                <button
                  onClick={() => {
                    localStorage.removeItem('skyfall_auth');
                    router.push('/login');
                  }}
                  className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="fixed top-4 right-4 z-50 space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg backdrop-blur-lg border animate-slide-in-right ${
                    notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
                    notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
                    notification.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300' :
                    'bg-blue-500/20 border-blue-500/30 text-blue-300'
                  }`}
                >
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-xs opacity-75">{notification.timestamp.toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          )}

          {/* Main Content Area */}
          <main className="p-6">
            {/* Server Selector */}
            <div className="mb-8">
              <ServerSelector
                servers={servers}
                selectedServer={selectedServer}
                onServerSelect={setSelectedServer}
                className="max-w-md"
              />
            </div>

            {/* Pi Bot Connection Status */}
            <div className="mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Pi Bot Connection</h3>
                  <button
                    onClick={testPiBotConnection}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Test Connection
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-4xl mb-2 ${statusData?.overall?.status === 'online' ? 'text-green-400' : statusData?.overall?.status === 'degraded' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {statusData?.overall?.status === 'online' ? '✅' : 
                       statusData?.overall?.status === 'degraded' ? '⚠️' : '❌'}
                    </div>
                    <p className="text-white font-medium">
                      {statusData?.overall?.status === 'online' ? 'Connected' : 
                       statusData?.overall?.status === 'degraded' ? 'Partial' : 'Offline'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {statusData?.overall?.healthPercentage || 0}% Health
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2 text-blue-400">🏰</div>
                    <p className="text-white font-medium">
                      {statusData?.piBot?.guilds || 0} Servers
                    </p>
                    <p className="text-gray-400 text-sm">
                      {statusData?.piBot?.responseTime || 0}ms response
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2 text-purple-400">⚡</div>
                    <p className="text-white font-medium">
                      {statusData?.endpoints?.filter(e => e.status === 'online').length || 0} APIs
                    </p>
                    <p className="text-gray-400 text-sm">
                      {statusData?.piBot?.version || 'v1.0.0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Server Members</p>
                        <p className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                          {selectedServer?.memberCount?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-green-400 mt-1">
                          {selectedServer?.onlineMembers?.toLocaleString() || 0} online
                        </p>
                      </div>
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-300">👥</div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Active Commands</p>
                        <p className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                          {commands.filter(cmd => cmd.enabled).length}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          of {commands.length} total
                        </p>
                      </div>
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-300">⚡</div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Pending Appeals</p>
                        <p className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                          {appeals.filter(appeal => appeal.status === 'pending').length}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {appeals.length} total appeals
                        </p>
                      </div>
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-300">⚖️</div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Server Boost</p>
                        <p className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                          Level {selectedServer?.boostLevel || 0}
                        </p>
                        <p className="text-sm text-purple-400 mt-1">
                          {selectedServer?.boostCount || 0} boosts
                        </p>
                      </div>
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {selectedServer?.boostLevel >= 3 ? '💎' : 
                         selectedServer?.boostLevel >= 2 ? '🚀' : 
                         selectedServer?.boostLevel >= 1 ? '⭐' : '📈'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {logs.slice(0, 5).map((log, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                          <div className="text-2xl">{log.type === 'command' ? '⚡' : log.type === 'moderation' ? '🛡️' : '📝'}</div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{log.action}</p>
                            <p className="text-gray-400 text-sm">{log.user} • {new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('commands')}
                        className="w-full p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                      >
                        ⚡ Manage Commands
                      </button>
                      <button
                        onClick={() => setActiveTab('appeals')}
                        className="w-full p-4 bg-white/10 rounded-xl text-white font-medium border border-white/20 hover:bg-white/20 transition-all duration-200"
                      >
                        ⚖️ Review Appeals
                      </button>
                      <Link
                        href="/status"
                        className="block w-full p-4 bg-white/10 rounded-xl text-white font-medium border border-white/20 hover:bg-white/20 transition-all duration-200 text-center"
                      >
                        🔍 System Status
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'commands' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Command Management</h3>
                  <div className="text-gray-400">
                    {commands.filter(cmd => cmd.enabled).length} of {commands.length} commands enabled
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {commands.map((command) => (
                    <div key={command.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-white">{command.name}</h4>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={command.enabled}
                            onChange={(e) => handleCommandToggle(command.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
                        </label>
                      </div>

                      <p className="text-gray-300 mb-4">{command.description}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Category:</span>
                          <span className="text-white">{command.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Usage:</span>
                          <span className="text-white">{command.usageCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cooldown:</span>
                          <span className="text-white">{command.cooldown || 0}s</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/10">
                        <button
                          onClick={() => {
                            const newDescription = prompt('Enter new description:', command.description);
                            if (newDescription && newDescription !== command.description) {
                              handleCommandEdit(command.id, { description: newDescription });
                            }
                          }}
                          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                        >
                          ✏️ Edit Command
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">Activity Logs</h3>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-white">Recent Activity</h4>
                      <span className="text-gray-400">{logs.length} entries</span>
                    </div>
                  </div>

                  <div className="divide-y divide-white/10">
                    {logs.map((log, index) => (
                      <div key={index} className="p-6 hover:bg-white/5 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">
                            {log.type === 'command' ? '⚡' : 
                             log.type === 'moderation' ? '🛡️' : 
                             log.type === 'system' ? '🔧' : '📝'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="text-white font-medium">{log.action}</h5>
                              <span className="text-gray-400 text-sm">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-gray-300 text-sm">{log.details}</p>
                            <p className="text-gray-400 text-xs mt-1">User: {log.user} • Guild: {log.guild}</p>
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
                <h3 className="text-2xl font-bold text-white">Ban Appeals</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {appeals.map((appeal, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-white">{appeal.username}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appeal.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                          appeal.status === 'approved' ? 'bg-green-400/20 text-green-400' :
                          'bg-red-400/20 text-red-400'
                        }`}>
                          {appeal.status}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-gray-400">Reason for ban:</span>
                          <p className="text-white mt-1">{appeal.banReason}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Appeal message:</span>
                          <p className="text-white mt-1">{appeal.appealMessage}</p>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Submitted:</span>
                          <span className="text-white">{new Date(appeal.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {appeal.status === 'pending' && (
                        <div className="mt-4 pt-4 border-t border-white/10 flex space-x-3">
                          <button 
                            onClick={() => handleAppealAction(appeal.id, 'approved')}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            ✅ Approve
                          </button>
                          <button 
                            onClick={() => handleAppealAction(appeal.id, 'denied')}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            ❌ Deny
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'status' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">System Status</h3>
                
                {statusData ? (
                  <>
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                      <div className="text-center">
                        <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold ${
                          statusData.overall?.status === 'operational' ? 'text-green-400 bg-green-400/20' :
                          statusData.overall?.status === 'degraded_performance' ? 'text-yellow-400 bg-yellow-400/20' :
                          'text-red-400 bg-red-400/20'
                        }`}>
                          <span className="text-2xl mr-3">
                            {statusData.overall?.status === 'operational' ? '✅' :
                             statusData.overall?.status === 'degraded_performance' ? '⚠️' : '❌'}
                          </span>
                          {statusData.overall?.message || 'Status Unknown'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
                        <div className="text-3xl font-bold text-white">{statusData.overall?.healthPercentage || 0}%</div>
                        <div className="text-gray-400">System Health</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
                        <div className="text-3xl font-bold text-white">{statusData.metrics?.operationalServices || 0}/{statusData.metrics?.totalServices || 0}</div>
                        <div className="text-gray-400">Services Online</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
                        <div className="text-3xl font-bold text-white">{statusData.metrics?.averageResponseTime || 0}ms</div>
                        <div className="text-gray-400">Avg Response Time</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Link
                        href="/status"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                      >
                        View Detailed Status Page
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-white text-xl">Unable to load status data</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
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
