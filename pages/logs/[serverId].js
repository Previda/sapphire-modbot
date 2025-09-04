import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ModLogs() {
  const router = useRouter();
  const { serverId } = router.query;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serverId) {
      fetchLogs();
    }
  }, [serverId]);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/moderation/${serverId}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.recentActions || []);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Moderation Logs</h1>
            <p className="text-white/60">Server ID: {serverId}</p>
          </div>
          <button
            onClick={() => window.close()}
            className="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 px-4 py-2 rounded-xl text-gray-300 font-medium transition-all"
          >
            Close
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          {logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index} className="bg-black/20 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        {log.action === 'ban' ? '🔨' : 
                         log.action === 'kick' ? '👢' : 
                         log.action === 'timeout' ? '⏰' : 
                         log.action === 'warn' ? '⚠️' : '📋'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-medium">
                            {log.action.toUpperCase()}
                          </span>
                          <span className="text-white font-medium">{log.user}</span>
                        </div>
                        <p className="text-white/60 text-sm mt-1">{log.reason || 'No reason provided'}</p>
                        {log.duration && (
                          <p className="text-yellow-400 text-sm">Duration: {log.duration}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/80 font-medium">{log.moderator}</p>
                      <p className="text-white/40 text-sm">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown time'}
                      </p>
                      {log.caseId && (
                        <p className="text-purple-400 text-xs">Case #{log.caseId}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Logs Found</h3>
              <p className="text-white/60">No moderation actions have been recorded for this server yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
