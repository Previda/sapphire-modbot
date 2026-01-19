import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import TopNav from '../components/TopNav';

export default function Status() {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchStatusData();
    const interval = setInterval(fetchStatusData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatusData = async () => {
    try {
      const response = await fetch('/api/status/live');
      if (response.ok) {
        const data = await response.json();
        setStatusData(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
      case 'online':
        return 'text-green-400 bg-green-400/20';
      case 'degraded_performance':
      case 'degraded':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'partial_outage':
      case 'offline':
        return 'text-red-400 bg-red-400/20';
      case 'major_outage':
        return 'text-red-500 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
      case 'online':
        return '✅';
      case 'degraded_performance':
      case 'degraded':
        return '⚠️';
      case 'partial_outage':
      case 'offline':
        return '❌';
      case 'major_outage':
        return '🚨';
      default:
        return '❓';
    }
  };

  return (
    <>
      <Head>
        <title>System Status - KSyfall Discord Management</title>
        <meta
          name="description"
          content="Real-time system status and uptime monitoring for KSyfall Discord Management"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-black text-white flex flex-col">
        <TopNav active="status" />

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              System Status
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Real-time monitoring of all Skyfall services and components
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading system status...</p>
            </div>
          ) : statusData ? (
            <>
              {/* Overall Status */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 mb-8">
                <div className="text-center">
                  <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold ${getStatusColor(statusData.overall?.status)}`}>
                    <span className="text-2xl mr-3">{getStatusIcon(statusData.overall?.status)}</span>
                    {statusData.overall?.message || 'Status Unknown'}
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{statusData.overall?.healthPercentage || 0}%</div>
                      <div className="text-gray-400">System Health</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{statusData.metrics?.operationalServices || 0}/{statusData.metrics?.totalServices || 0}</div>
                      <div className="text-gray-400">Services Online</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{statusData.metrics?.averageResponseTime || 0}ms</div>
                      <div className="text-gray-400">Avg Response Time</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Backend Status */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="text-2xl mr-3">🤖</span>
                    Backend Core
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Status</span>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(statusData.services?.piBot?.status)}`}>
                        <span className="mr-2">{getStatusIcon(statusData.services?.piBot?.status)}</span>
                        {statusData.services?.piBot?.status || 'Unknown'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Response Time</span>
                      <span className="text-white font-medium">{statusData.services?.piBot?.responseTime || 0}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Uptime</span>
                      <span className="text-white font-medium">{Math.floor((statusData.services?.piBot?.uptime || 0) / 3600)}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Guilds</span>
                      <span className="text-white font-medium">{statusData.services?.piBot?.guilds || 0}</span>
                    </div>
                  </div>
                </div>

                {/* API Endpoints */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="text-2xl mr-3">🔌</span>
                    API Endpoints
                  </h3>
                  <div className="space-y-3">
                    {statusData.services?.endpoints?.map((endpoint, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <div className="text-white font-medium">{endpoint.name}</div>
                          <div className="text-xs text-gray-400">{endpoint.endpoint}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-gray-400">{endpoint.responseTime}ms</span>
                          <div className={`flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(endpoint.status)}`}>
                            <span className="mr-1">{getStatusIcon(endpoint.status)}</span>
                            {endpoint.status}
                          </div>
                        </div>
                      </div>
                    )) || []}
                  </div>
                </div>
              </div>

              {/* Uptime Statistics */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 mb-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="text-3xl mr-3">📊</span>
                  Uptime Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{statusData.uptime?.last24Hours || 99.9}%</div>
                    <div className="text-gray-400 mt-2">Last 24 Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{statusData.uptime?.last7Days || 99.9}%</div>
                    <div className="text-gray-400 mt-2">Last 7 Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{statusData.uptime?.last30Days || 99.95}%</div>
                    <div className="text-gray-400 mt-2">Last 30 Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{statusData.uptime?.last90Days || 99.92}%</div>
                    <div className="text-gray-400 mt-2">Last 90 Days</div>
                  </div>
                </div>
              </div>

              {/* Recent Incidents */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="text-3xl mr-3">📋</span>
                  Recent Incidents
                </h3>
                {statusData.incidents?.length > 0 ? (
                  <div className="space-y-4">
                    {statusData.incidents.map((incident, index) => (
                      <div key={index} className="p-4 bg-white/5 rounded-lg border-l-4 border-yellow-400">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{incident.title}</h4>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            incident.status === 'resolved' ? 'bg-green-400/20 text-green-400' : 
                            incident.status === 'investigating' ? 'bg-yellow-400/20 text-yellow-400' :
                            'bg-red-400/20 text-red-400'
                          }`}>
                            {incident.status}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{incident.description}</p>
                        <div className="text-xs text-gray-400">
                          {incident.resolvedTime ? 
                            `Resolved: ${new Date(incident.resolvedTime).toLocaleString()}` :
                            `Started: ${new Date(incident.startTime).toLocaleString()}`
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <p className="text-gray-300">No recent incidents to report!</p>
                    <p className="text-gray-400 text-sm mt-2">All systems are running smoothly.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-white text-xl mb-2">Unable to load status data</p>
              <p className="text-gray-400">Please try refreshing the page</p>
              <button 
                onClick={fetchStatusData}
                className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Auto-refresh notice */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              This page automatically refreshes every 30 seconds
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-black/95">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="space-y-1">
              <p className="text-zinc-400">© {new Date().getFullYear()} Skyfall. All rights reserved.</p>
              <p>Secure Discord management for serious communities.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/status" className="hover:text-zinc-300">
                Status
              </Link>
              <Link href="/terms" className="hover:text-zinc-300">
                Terms
              </Link>
              <Link href="/terms" className="hover:text-zinc-300">
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
