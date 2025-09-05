import React, { useState, useEffect } from 'react';

function VerificationTab({ selectedServer, liveData }) {
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (selectedServer?.id) {
      fetchVerificationData();
    }
  }, [selectedServer]);

  const fetchVerificationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/verification/${selectedServer.id}`);
      if (response.ok) {
        const data = await response.json();
        setVerificationData(data);
      }
    } catch (error) {
      console.error('Failed to fetch verification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (action, settings = null) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/verification/${selectedServer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, settings })
      });

      if (response.ok) {
        await fetchVerificationData();
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (!selectedServer?.hasSkyfall) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6 opacity-50">🔐</div>
        <h3 className="text-2xl font-bold text-white mb-4">Skyfall Not Added</h3>
        <p className="text-white/70 text-lg">Add Skyfall to manage verification settings</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin text-4xl mb-4">🔄</div>
        <p className="text-white/70">Loading verification data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          🔐 Verification System
        </h2>
        
        {verificationData?.config ? (
          <VerificationConfigured 
            config={verificationData.config} 
            stats={verificationData.stats}
            onUpdate={updateSettings}
            updating={updating}
          />
        ) : (
          <VerificationNotConfigured />
        )}
      </div>

      {/* Statistics */}
      {verificationData?.config && (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            📊 Verification Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Verified"
              value={verificationData.stats.totalVerifications}
              color="green"
              icon="✅"
            />
            <StatCard
              title="Pending"
              value={verificationData.stats.pendingVerifications}
              color="yellow"
              icon="⏳"
            />
            <StatCard
              title="Failed Attempts"
              value={verificationData.stats.failedAttempts}
              color="red"
              icon="❌"
            />
            <StatCard
              title="Success Rate"
              value={`${verificationData.stats.verificationRate}%`}
              color="blue"
              icon="📈"
            />
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {verificationData?.recentLogs?.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              📝 Recent Verification Activity
            </h3>
            <button
              onClick={() => updateSettings('clear_logs')}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
              disabled={updating}
            >
              Clear Logs
            </button>
          </div>
          
          <div className="space-y-3">
            {verificationData.recentLogs.slice(0, 10).map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(log.success)}`}></div>
                  <div>
                    <div className="text-white text-sm">{getLogMessage(log)}</div>
                    <div className="text-gray-400 text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-gray-300 text-sm">{log.type}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VerificationConfigured({ config, stats, onUpdate, updating }) {
  const [settings, setSettings] = useState({
    dmWelcome: config.dmWelcome,
    removeUnverified: config.removeUnverified,
    timeoutHours: config.timeoutHours,
    welcomeMessage: config.welcomeMessage
  });

  const handleSaveSettings = () => {
    onUpdate('update_settings', settings);
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`flex items-center justify-between p-4 rounded-xl border ${
        config.enabled 
          ? 'bg-green-500/20 border-green-500/30 text-green-400'
          : 'bg-red-500/20 border-red-500/30 text-red-400'
      }`}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">{config.enabled ? '✅' : '❌'}</div>
          <div>
            <div className="font-bold">
              Verification {config.enabled ? 'Enabled' : 'Disabled'}
            </div>
            <div className="text-sm opacity-80">
              Type: {config.type.charAt(0).toUpperCase() + config.type.slice(1)}
            </div>
          </div>
        </div>
        <button
          onClick={() => onUpdate('toggle_enabled')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            config.enabled
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          }`}
          disabled={updating}
        >
          {config.enabled ? 'Disable' : 'Enable'}
        </button>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Welcome Settings</h4>
          
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <div className="text-white font-medium">Send Welcome DM</div>
              <div className="text-gray-400 text-sm">Send DM after verification</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="dmWelcome"
                name="dmWelcome"
                type="checkbox"
                checked={settings.dmWelcome}
                onChange={(e) => setSettings(prev => ({ ...prev, dmWelcome: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="text-white font-medium mb-2 block">Welcome Message</label>
            <textarea
              value={settings.welcomeMessage}
              onChange={(e) => setSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
              className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 resize-none"
              rows={3}
              placeholder="Custom welcome message..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Security Settings</h4>
          
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <div className="text-white font-medium">Auto Remove Unverified</div>
              <div className="text-gray-400 text-sm">Remove members who don't verify</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="removeUnverified"
                name="removeUnverified"
                type="checkbox"
                checked={settings.removeUnverified}
                onChange={(e) => setSettings(prev => ({ ...prev, removeUnverified: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.removeUnverified && (
            <div>
              <label className="text-white font-medium mb-2 block">Timeout (Hours)</label>
              <input
                id="timeoutHours"
                name="timeoutHours"
                type="number"
                min="1"
                max="168"
                value={settings.timeoutHours}
                onChange={(e) => setSettings(prev => ({ ...prev, timeoutHours: parseInt(e.target.value) }))}
                className="w-24 px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-center"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={updating}
          className="px-6 py-3 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all font-medium"
        >
          {updating ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function VerificationNotConfigured() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-6">🔧</div>
      <h3 className="text-xl font-bold text-white mb-4">Verification Not Configured</h3>
      <p className="text-white/70 mb-6">
        Set up the verification system using the <code className="bg-white/10 px-2 py-1 rounded text-blue-400">/verification setup</code> command in your Discord server.
      </p>
      <div className="bg-blue-500/20 rounded-xl p-6 border border-blue-500/30">
        <h4 className="text-blue-400 font-bold mb-3">Setup Instructions:</h4>
        <div className="text-left text-white/80 space-y-2 text-sm">
          <div>1. Use <code className="bg-white/10 px-1 rounded">/verification setup</code></div>
          <div>2. Select verification channel and role</div>
          <div>3. Choose verification type (Button, Captcha, or Email)</div>
          <div>4. Configure additional settings here in the dashboard</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }) {
  const colorClasses = {
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    red: 'bg-red-500/20 border-red-500/30 text-red-400',
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400'
  };

  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium opacity-80">{title}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function getStatusColor(success) {
  if (success === true) return 'bg-green-400';
  if (success === false) return 'bg-red-400';
  return 'bg-yellow-400';
}

function getLogMessage(log) {
  if (log.type === 'member_join') {
    return `${log.userTag || `User ${log.userId}`} joined the server`;
  }
  if (log.success === true) {
    return `${log.userTag || `User ${log.userId}`} successfully verified (${log.type})`;
  }
  if (log.success === false) {
    return `${log.userTag || `User ${log.userId}`} failed verification (${log.type})`;
  }
  return `${log.userTag || `User ${log.userId}`} pending verification`;
}

export default VerificationTab;
