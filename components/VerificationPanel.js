import { useState, useEffect } from 'react'

export default function VerificationPanel({ selectedServer }) {
  const [verificationData, setVerificationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState({
    enabled: false,
    channelId: '',
    roleId: '',
    welcomeMessage: 'Welcome to the server! Please verify yourself by clicking the button below.',
    verifyButtonText: '✅ Verify',
    successMessage: 'You have been successfully verified!',
    requiredAge: 0,
    kickOnFail: false,
    logChannelId: ''
  })

  useEffect(() => {
    if (selectedServer?.id) {
      fetchVerificationData()
    }
  }, [selectedServer])

  const fetchVerificationData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/verification/${selectedServer.id}`)
      const data = await response.json()
      
      setVerificationData(data)
      if (data.config) {
        setConfig({ ...config, ...data.config })
      }
    } catch (error) {
      console.error('Failed to fetch verification data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveVerificationConfig = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/verification/${selectedServer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'configure',
          settings: config
        })
      })

      if (response.ok) {
        await fetchVerificationData()
        alert('Verification configuration saved successfully!')
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save verification configuration')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Verification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Verifications</p>
              <p className="text-2xl font-bold text-white">{verificationData?.stats?.totalVerifications || 0}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-white">{verificationData?.stats?.pendingVerifications || 0}</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Failed Attempts</p>
              <p className="text-2xl font-bold text-white">{verificationData?.stats?.failedAttempts || 0}</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-white">{verificationData?.stats?.verificationRate || 0}%</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Verification Configuration</h3>
          <label htmlFor="verificationEnabled" className="relative inline-flex items-center cursor-pointer">
            <input
              id="verificationEnabled"
              name="verificationEnabled"
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {config.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="verificationChannelId" className="block text-sm font-medium text-slate-300 mb-2">Verification Channel ID</label>
              <input
                id="verificationChannelId"
                name="verificationChannelId"
                type="text"
                value={config.channelId}
                onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
                placeholder="Enter channel ID"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="verifiedRoleId" className="block text-sm font-medium text-slate-300 mb-2">Verified Role ID</label>
              <input
                id="verifiedRoleId"
                name="verifiedRoleId"
                type="text"
                value={config.roleId}
                onChange={(e) => setConfig({ ...config, roleId: e.target.value })}
                placeholder="Enter role ID"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="welcomeMessage" className="block text-sm font-medium text-slate-300 mb-2">Welcome Message</label>
              <textarea
                id="welcomeMessage"
                name="welcomeMessage"
                value={config.welcomeMessage}
                onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                placeholder="Enter welcome message"
                rows={3}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div>
              <label htmlFor="verifyButtonText" className="block text-sm font-medium text-slate-300 mb-2">Verify Button Text</label>
              <input
                id="verifyButtonText"
                name="verifyButtonText"
                type="text"
                value={config.verifyButtonText}
                onChange={(e) => setConfig({ ...config, verifyButtonText: e.target.value })}
                placeholder="Button text"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="requiredAge" className="block text-sm font-medium text-slate-300 mb-2">Minimum Account Age (days)</label>
              <input
                id="requiredAge"
                name="requiredAge"
                type="number"
                value={config.requiredAge}
                onChange={(e) => setConfig({ ...config, requiredAge: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        {config.enabled && (
          <div className="flex justify-end mt-6">
            <button
              onClick={saveVerificationConfig}
              disabled={saving}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Save Configuration
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {verificationData?.recentAttempts?.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Verification Attempts</h3>
          <div className="space-y-2">
            {verificationData.recentAttempts.map((attempt, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${attempt.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-white font-medium">{attempt.username}</span>
                  <span className="text-slate-400 text-sm">{attempt.timestamp}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  attempt.success ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                }`}>
                  {attempt.success ? 'Verified' : 'Failed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {verificationData?.error && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span className="text-red-200 font-medium">Bot Connection Error</span>
          </div>
          <p className="text-red-300 text-sm mt-1">{verificationData.error}</p>
        </div>
      )}
    </div>
  )
}
