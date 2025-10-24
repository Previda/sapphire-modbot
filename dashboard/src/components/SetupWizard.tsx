'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ValidationStatus {
  environment: {
    valid: boolean;
    errors: string[];
    warnings: string[];
    config: Record<string, any>;
  };
  botConnection: {
    online: boolean;
    error?: string;
    botInfo?: any;
  };
  suggestions: string[];
  allValid: boolean;
}

export function SetupWizard() {
  const [status, setStatus] = useState<ValidationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [botToken, setBotToken] = useState('');
  const [validating, setValidating] = useState(false);
  const [botInfo, setBotInfo] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/validate');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check status:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateToken = async () => {
    if (!botToken) return;

    setValidating(true);
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: botToken }),
      });

      const data = await response.json();
      
      if (data.success) {
        setBotInfo(data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Failed to validate: ${error.message}`);
    } finally {
      setValidating(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-sapphire-accent" />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center mb-2">Validation Failed</h2>
          <p className="text-gray-400 text-center mb-4">
            Unable to check configuration status
          </p>
          <Button onClick={checkStatus} className="w-full">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sapphire-black via-sapphire-darkgray to-sapphire-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard Setup</h1>
          <p className="text-gray-400">
            {status.allValid ? 'Everything looks good!' : 'Let\'s get you configured'}
          </p>
        </motion.div>

        {/* Overall Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            {status.allValid ? (
              <CheckCircle className="h-12 w-12 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-12 w-12 text-yellow-500 flex-shrink-0" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">
                {status.allValid ? 'All Systems Operational' : 'Configuration Needed'}
              </h2>
              <p className="text-gray-400">
                {status.allValid 
                  ? 'Your dashboard is fully configured and ready to use'
                  : 'Some configuration is missing or invalid'}
              </p>
            </div>
          </div>
        </Card>

        {/* Environment Variables */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            {status.environment.valid ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            <h3 className="text-xl font-bold text-white">Environment Variables</h3>
          </div>

          {/* Errors */}
          {status.environment.errors.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-red-400 mb-2">Errors:</h4>
              <ul className="space-y-1">
                {status.environment.errors.map((error, i) => (
                  <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                    <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {status.environment.warnings.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-yellow-400 mb-2">Warnings:</h4>
              <ul className="space-y-1">
                {status.environment.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-yellow-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Config Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(status.environment.config).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-sapphire-darkgray rounded-lg">
                <span className="text-sm text-gray-300">{key}</span>
                {value ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Bot Connection */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            {status.botConnection.online ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            <h3 className="text-xl font-bold text-white">Bot API Connection</h3>
          </div>

          {status.botConnection.online ? (
            <div className="space-y-2">
              <p className="text-green-400">✅ Connected to bot successfully</p>
              {status.botConnection.botInfo && (
                <div className="mt-4 p-4 bg-sapphire-darkgray rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">Bot Information:</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p>Guilds: {status.botConnection.botInfo.guilds}</p>
                    <p>Users: {status.botConnection.botInfo.users?.toLocaleString()}</p>
                    <p>Commands: {status.botConnection.botInfo.commands}</p>
                    <p>Uptime: {Math.floor(status.botConnection.botInfo.uptime / 60)} minutes</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-red-400">❌ Cannot connect to bot</p>
              {status.botConnection.error && (
                <p className="text-sm text-gray-400">Error: {status.botConnection.error}</p>
              )}
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-300">
                  Make sure your bot is running and BOT_API_URL is correct in .env.local
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Bot Token Validator */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Validate Bot Token</h3>
          <p className="text-gray-400 mb-4">
            Enter your bot token to automatically fetch configuration details
          </p>

          <div className="flex gap-3 mb-4">
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Paste your bot token here..."
              className="flex-1 px-4 py-2 bg-sapphire-darkgray border border-sapphire-lightgray rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sapphire-accent"
            />
            <Button
              onClick={validateToken}
              disabled={!botToken || validating}
              className="min-w-[120px]"
            >
              {validating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Validating</>
              ) : (
                'Validate'
              )}
            </Button>
          </div>

          {botInfo && botInfo.success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <h4 className="font-semibold text-white">{botInfo.bot.username}</h4>
                  <p className="text-sm text-gray-400">ID: {botInfo.bot.id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-sapphire-darkgray rounded">
                  <span className="text-sm text-gray-300">Client ID:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-white">{botInfo.recommendations.clientId}</code>
                    <button
                      onClick={() => copyToClipboard(botInfo.recommendations.clientId, 'clientId')}
                      className="p-1 hover:bg-sapphire-lightgray rounded"
                    >
                      {copied === 'clientId' ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-sapphire-darkgray rounded">
                  <span className="text-sm text-gray-300">Redirect URI:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-white truncate max-w-[200px]">
                      {botInfo.recommendations.redirectUri}
                    </code>
                    <button
                      onClick={() => copyToClipboard(botInfo.recommendations.redirectUri, 'redirectUri')}
                      className="p-1 hover:bg-sapphire-lightgray rounded"
                    >
                      {copied === 'redirectUri' ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                💡 Copy these values to your .env.local file
              </p>
            </motion.div>
          )}
        </Card>

        {/* Suggestions */}
        {status.suggestions.length > 0 && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-bold text-white">Suggestions</h3>
            </div>
            <ul className="space-y-2">
              {status.suggestions.map((suggestion, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">💡</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={checkStatus} variant="secondary" className="flex-1">
            Refresh Status
          </Button>
          {status.allValid && (
            <Button onClick={() => window.location.href = '/dashboard'} className="flex-1">
              Go to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
