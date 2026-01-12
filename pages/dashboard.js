import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ServerSelector from '../components/ServerSelector';
import SystemStatusOverlay from '../components/SystemStatusOverlay';

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

  // Suppress browser extension errors
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('message channel closed') ||
         args[0].includes('Extension context invalidated'))
      ) {
        return; // Ignore browser extension errors
      }
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

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
          setUser({ ...data.user, isAdmin: data.isAdmin, isGuest: false });
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
        }
      }

      // Not authenticated - show login prompt but don't redirect immediately
      setUser({ username: 'Guest', id: 'guest', isGuest: true });
      addNotification('Login with Discord to manage your servers', 'info');
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      setUser({ username: 'Guest', id: 'guest', isGuest: true });
      addNotification('Login with Discord to access all features', 'info');
      return true;
    }
  };

  const fetchServers = async () => {
    // Only fetch servers if user is authenticated
    if (user?.isGuest) {
      setServers([]);
      return;
    }

    try {
      const response = await fetch('/api/servers/list', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.servers && data.servers.length > 0) {
          setServers(data.servers);
          
          // Auto-select first server if none selected
          if (!selectedServer) {
            setSelectedServer(data.servers[0]);
          }
        } else {
          setServers([]);
          addNotification('No servers found - add the bot to your Discord servers', 'info');
        }
      } else {
        setServers([]);
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error);
      setServers([]);
    }
  };

  const fetchServerData = async (serverId) => {
    if (!serverId || user?.isGuest) return;
    
    try {
      const response = await fetch(`/api/servers/${serverId}/data`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCommands(data.data.commands || []);
        setLogs(data.data.logs || []);
        setAppeals(data.data.appeals || []);
      } else {
        setCommands([]);
        setLogs([]);
        setAppeals([]);
      }
    } catch (error) {
      console.error('Failed to fetch server data:', error);
      setCommands([]);
      setLogs([]);
      setAppeals([]);
    }
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
      await Promise.all([
        fetchServers(),
        fetchStatusData()
      ]);
    } catch (error) {
      console.error('Fetch all data error:', error);
      addNotification('Failed to load data', 'error');
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border border-white/10 border-t-white animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-400">Preparing your dashboard…</p>
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

      {/* System Status Overlay */}
      <SystemStatusOverlay
        isOnline={statusData?.overall?.status === 'online'}
        isLoading={loading}
      />

      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center px-6 py-4 border-b border-white/5">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-black border border-white/10">
                <img
                  src="/logo-skyfall.svg"
                  alt="Skyfall logo"
                  className="h-10 w-10 object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Skyfall</h1>
                <p className="text-xs text-gray-400">Discord Management</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 px-4 py-4">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-sm transition-colors duration-150 ${
                    activeTab === item.id
                      ? 'border border-white/10 bg-white/10 text-white'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Quick Links */}
            <div className="border-t border-white/5 px-4 py-4">
              <div className="space-y-2 text-sm">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-100 transition-colors hover:border-emerald-400/60 hover:bg-emerald-500/20"
                >
                  <span className="text-lg">👤</span>
                  <span>My Profile & Servers</span>
                </Link>
                <Link
                  href="/invite"
                  className="flex items-center gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sky-100 transition-colors hover:border-sky-400/60 hover:bg-sky-500/20"
                >
                  <span className="text-lg">🤖</span>
                  <span>Add bot to server</span>
                </Link>
                <Link
                  href="/status"
                  className="flex items-center gap-3 rounded-xl px-4 py-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <span className="text-lg">🔍</span>
                  <span>System Status</span>
                </Link>
                <Link
                  href="/faq"
                  className="flex items-center gap-3 rounded-xl px-4 py-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <span className="text-lg">❓</span>
                  <span>Help & FAQ</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:ml-64">
          {/* Top Bar */}
          <header className="border-b border-white/5 bg-black/10 px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="mr-4 rounded-lg p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold capitalize text-white">
                  {activeTab === 'overview' ? 'Dashboard Overview' : activeTab}
                </h2>
              </div>

              <div className="flex items-center space-x-4">
                {/* User Avatar & Name */}
                {user && !user.isGuest && (
                  <div className="flex items-center space-x-3 rounded-lg bg-zinc-900/80 px-4 py-2 border border-white/10">
                    {user.avatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`}
                        alt={user.username}
                        className="h-8 w-8 rounded-full border-2 border-green-400"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-400">
                        <span className="text-sm font-bold text-white">{user.username?.[0]}</span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{user.username}</p>
                        {user.isAdmin && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-green-400">● Online</p>
                    </div>
                  </div>
                )}

                {/* Status Indicator */}
                {statusData && (
                  <div className="flex items-center space-x-2 rounded-lg bg-zinc-900/80 px-4 py-2 border border-white/10">
                    <div
                      className={`h-3 w-3 rounded-full animate-pulse ${
                        statusData.overall?.status === 'online'
                          ? 'bg-emerald-400'
                          : statusData.overall?.status === 'degraded'
                          ? 'bg-sky-400'
                          : 'bg-red-400'
                      }`}
                    ></div>
                    <span className="text-sm font-medium text-white">
                      {statusData.overall?.status === 'online'
                        ? 'All Systems Online'
                        : statusData.overall?.status === 'degraded'
                        ? 'Partial Outage'
                        : 'System Offline'}
                    </span>
                  </div>
                )}

                {/* Login/Logout */}
                {user?.isGuest ? (
                  <Link
                    href="/api/auth/discord-oauth"
                    className="transform rounded-lg bg-white text-black px-6 py-2 text-sm font-medium transition-all duration-200 hover:bg-zinc-200 hover:scale-105"
                  >
                    🔐 Login with Discord
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      fetch('/api/auth/logout', { method: 'POST' });
                      router.push('/');
                    }}
                    className="rounded-lg bg-red-600/20 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-600/30"
                  >
                    Logout
                  </button>
                )}
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
              <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full animate-pulse ${
                      statusData?.overall?.status === 'online' ? 'bg-green-400' :
                      statusData?.overall?.status === 'degraded' ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`}></div>
                    <h3 className="text-2xl font-bold text-white">System Status</h3>
                  </div>
                  <button
                    onClick={testPiBotConnection}
                    className="px-6 py-2 rounded-lg border border-white/15 bg-zinc-950/60 text-sm font-medium text-white hover:bg-zinc-800/80 hover:border-white/30 transition-colors"
                  >
                    🔄 Refresh
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 rounded-xl p-6 text-center border border-white/20 hover:border-white/30 transition-smooth hover-lift cursor-pointer group">
                    <div className={`text-5xl mb-3 transition-spring group-hover:scale-110 ${
                      statusData?.overall?.status === 'online' ? 'text-green-400' :
                      statusData?.overall?.status === 'degraded' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {statusData?.overall?.status === 'online' ? '✅' : 
                       statusData?.overall?.status === 'degraded' ? '⚠️' : '❌'}
                    </div>
                    <p className="text-white font-bold text-xl mb-2 group-hover:text-white transition-smooth">
                      {statusData?.overall?.status === 'online' ? 'Online' : 
                       statusData?.overall?.status === 'degraded' ? 'Degraded' : 'Offline'}
                    </p>
                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-smooth">
                      Pi Bot Status
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-6 text-center border border-white/20 hover:border-blue-500/50 transition-smooth hover-lift cursor-pointer group">
                    <div className="text-5xl mb-3 text-blue-400 transition-spring group-hover:scale-110">🏰</div>
                    <p className="text-white font-bold text-xl mb-2 group-hover:text-blue-300 transition-smooth">
                      {servers.length || 0}
                    </p>
                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-smooth">
                      Your Servers
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-6 text-center border border-white/20 hover:border-emerald-500/50 transition-smooth hover-lift cursor-pointer group">
                    <div className="text-5xl mb-3 text-emerald-400 transition-spring group-hover:scale-110">⚡</div>
                    <p className="text-white font-bold text-xl mb-2 group-hover:text-emerald-300 transition-smooth">
                      {commands.filter(c => c.enabled).length || 0}
                    </p>
                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-smooth">
                      Active Commands
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass glass-hover rounded-3xl p-6 hover-lift cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-smooth">Server Members</p>
                        <p className="text-3xl font-bold text-white transition-smooth">
                          {selectedServer?.memberCount?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-green-400 mt-1">
                          {selectedServer?.onlineMembers?.toLocaleString() || 0} online
                        </p>
                      </div>
                      <div className="text-4xl group-hover:scale-110 transition-spring">👥</div>
                    </div>
                  </div>

                  <div className="glass glass-hover rounded-3xl p-6 hover-lift cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-smooth">Active Commands</p>
                        <p className="text-3xl font-bold text-white transition-smooth">
                          {commands.filter(cmd => cmd.enabled).length}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          of {commands.length} total
                        </p>
                      </div>
                      <div className="text-4xl group-hover:scale-110 transition-spring">⚡</div>
                    </div>
                  </div>

                  <div className="glass glass-hover rounded-3xl p-6 hover-lift cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-smooth">Pending Appeals</p>
                        <p className="text-3xl font-bold text-white transition-smooth">
                          {appeals.filter(appeal => appeal.status === 'pending').length}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {appeals.length} total appeals
                        </p>
                      </div>
                      <div className="text-4xl group-hover:scale-110 transition-spring">⚖️</div>
                    </div>
                  </div>

                  <div className="glass glass-hover rounded-3xl p-6 hover-lift cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-smooth">Server Boost</p>
                        <p className="text-3xl font-bold text-white transition-smooth">
                          Level {selectedServer?.boostLevel || 0}
                        </p>
                        <p className="text-sm text-zinc-300 mt-1">
                          {selectedServer?.boostCount || 0} boosts
                        </p>
                      </div>
                      <div className="text-4xl group-hover:scale-110 transition-spring">
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
                        className="w-full p-4 rounded-xl border border-white/15 bg-zinc-950/60 text-white font-medium hover:bg-zinc-800/80 hover:border-white/30 transition-all duration-200 transform hover:scale-105"
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
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
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
                          className="w-full px-4 py-2 rounded-lg border border-white/15 bg-zinc-950/60 text-white hover:bg-zinc-800/80 hover:border-white/30 transition-colors"
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
