import React, { useState, useEffect } from 'react';
import { 
  HomeIcon,
  MusicNoteIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  CommandLineIcon,
  BellIcon,
  ServerIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { logout } from '../utils/auth';

const ModernDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedServer, setSelectedServer] = useState(null);
  const [userGuilds, setUserGuilds] = useState([]);
  const [liveData, setLiveData] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserGuilds();
    const interval = setInterval(fetchLiveData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [selectedServer]);

  const fetchUserGuilds = async () => {
    try {
      // Try to get token from localStorage, but don't require it
      let token = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('discord_token');
      }

      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/discord/guilds', {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setUserGuilds(data.guilds || []);
        if (data.guilds?.length > 0 && !selectedServer) {
          setSelectedServer(data.guilds[0]);
        }
      } else {
        console.warn('Failed to fetch guilds, using fallback data');
        // Set fallback data if API fails
        setUserGuilds([
          {
            id: 'demo-server',
            name: '🎮 Demo Server',
            hasSkyfall: true,
            memberCount: 1337,
            onlineMembers: 420,
            status: 'online',
            canManageBot: true,
            userRole: 'Owner'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching guilds:', error);
      // Set fallback data on error
      setUserGuilds([
        {
          id: 'demo-server',
          name: '🎮 Demo Server',
          hasSkyfall: true,
          memberCount: 1337,
          onlineMembers: 420,
          status: 'online',
          canManageBot: true,
          userRole: 'Owner'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveData = async () => {
    if (!selectedServer) return;
    
    setRefreshing(true);
    try {
      const response = await fetch(`/api/live-data?serverId=${selectedServer.id}`);
      if (response.ok) {
        const data = await response.json();
        setLiveData(data);
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: HomeIcon },
    { id: 'music', name: 'Music', icon: MusicNoteIcon },
    { id: 'verification', name: 'Verification', icon: ShieldCheckIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'members', name: 'Members', icon: UserGroupIcon },
    { id: 'commands', name: 'Commands', icon: CommandLineIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span>{trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={liveData?.stats?.memberCount || 0}
          icon={UserGroupIcon}
          color="blue"
          subtitle={`${liveData?.stats?.onlineMembers || 0} online`}
        />
        <StatCard
          title="Commands Today"
          value={liveData?.stats?.commandsToday || 0}
          icon={CommandLineIcon}
          color="green"
          trend={12}
        />
        <StatCard
          title="Verifications"
          value={liveData?.verification?.totalToday || 0}
          icon={ShieldCheckIcon}
          color="purple"
          subtitle="Today"
        />
        <StatCard
          title="Server Health"
          value={`${liveData?.stats?.serverHealth || 100}%`}
          icon={CheckCircleIcon}
          color="emerald"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Verifications</h3>
            <BellIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {liveData?.verification?.recentVerifications?.slice(0, 5).map((verification, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {verification.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(verification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded-full">
                  {verification.type}
                </span>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <ShieldCheckIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent verifications</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h3>
            <div className={`h-3 w-3 rounded-full ${liveData?.error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Bot Status</span>
              <span className={`text-sm font-medium ${liveData?.error ? 'text-red-600' : 'text-green-600'}`}>
                {liveData?.error ? 'Offline' : 'Online'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {liveData?.uptime || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {liveData?.memoryUsage || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {liveData?.responseTime || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MusicTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Music Player</h3>
          <div className={`h-3 w-3 rounded-full ${liveData?.music?.isPlaying ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`}></div>
        </div>
        
        {liveData?.music?.currentSong ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <MusicNoteIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                  {liveData.music.currentSong.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {liveData.music.currentSong.artist}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <BackwardIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                {liveData.music.isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6" />
                )}
              </button>
              <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <ForwardIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <SpeakerWaveIcon className="h-4 w-4 text-gray-400" />
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${liveData.music.volume || 75}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{liveData.music.volume || 75}%</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <MusicNoteIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No music playing</p>
            <p className="text-sm">Use /play command in Discord to start music</p>
          </div>
        )}
      </div>

      {/* Queue */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Queue</h3>
        {liveData?.music?.queue?.length > 0 ? (
          <div className="space-y-3">
            {liveData.music.queue.slice(0, 10).map((song, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {song.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {song.artist} • {song.duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Queue is empty</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <ServerIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sapphire</h1>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Server Selector */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Server
            </label>
            <select 
              value={selectedServer?.id || ''}
              onChange={(e) => {
                const server = userGuilds.find(g => g.id === e.target.value);
                setSelectedServer(server);
              }}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {userGuilds.map(guild => (
                <option key={guild.id} value={guild.id}>
                  {guild.name}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <img 
                src={user?.avatar || '/default-avatar.png'} 
                alt={user?.username}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  #{user?.discriminator}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Bars3Icon className="h-5 w-5 text-gray-500" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {activeTab}
                </h2>
                {selectedServer && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedServer.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchLiveData}
                disabled={refreshing}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-5 w-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                liveData?.error 
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                  : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
              }`}>
                <div className={`h-2 w-2 rounded-full ${liveData?.error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                <span>{liveData?.error ? 'Offline' : 'Online'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'music' && <MusicTab />}
          {activeTab === 'verification' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verification System</h3>
              <p className="text-gray-600 dark:text-gray-400">Verification management coming soon...</p>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">Analytics dashboard coming soon...</p>
            </div>
          )}
          {activeTab === 'members' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Member Management</h3>
              <p className="text-gray-600 dark:text-gray-400">Member management coming soon...</p>
            </div>
          )}
          {activeTab === 'commands' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Command Management</h3>
              <p className="text-gray-600 dark:text-gray-400">Command management coming soon...</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
              <p className="text-gray-600 dark:text-gray-400">Settings panel coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ModernDashboard;
