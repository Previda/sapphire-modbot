import { useEffect, useState } from 'react';

export default function SystemStatusOverlay({ isOnline, isLoading }) {
  const [show, setShow] = useState(!isOnline);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isOnline && show) {
      // Start fade out animation
      setFadeOut(true);
      setTimeout(() => {
        setShow(false);
        setFadeOut(false);
      }, 1200); // Smoother fade
    } else if (!isOnline && !isLoading) {
      setShow(true);
    }
  }, [isOnline, isLoading]);

  if (!show && !isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 ease-out ${
        fadeOut ? 'opacity-0 backdrop-blur-0' : 'opacity-100 backdrop-blur-2xl'
      }`}
      style={{
        background: fadeOut 
          ? 'transparent'
          : 'linear-gradient(135deg, rgba(88, 28, 135, 0.95) 0%, rgba(29, 78, 216, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%)',
      }}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-500/20 animate-float"
            style={{
              width: Math.random() * 100 + 50 + 'px',
              height: Math.random() * 100 + 50 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 10 + 's',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className={`relative z-10 text-center transform transition-all duration-1000 ${
        fadeOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {isLoading ? (
          // Loading State
          <div className="space-y-8">
            <div className="relative">
              {/* Spinning Ring */}
              <div className="w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500 animate-spin-slow"></div>
              </div>
              
              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl animate-pulse">🚀</div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white animate-pulse">
                Initializing System
              </h2>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-gray-300 text-lg">Please wait while we connect to the server...</p>
            </div>
          </div>
        ) : isOnline ? (
          // Success State (Fading Out)
          <div className="space-y-8">
            <div className="relative">
              <div className="w-32 h-32 mx-auto bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500/50 animate-scale-in">
                <div className="text-6xl">✅</div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white">System Online</h2>
              <p className="text-green-300 text-lg">All systems operational</p>
            </div>
          </div>
        ) : (
          // Offline State - Ultra Modern Design
          <div className="space-y-10 max-w-2xl mx-auto px-6">
            {/* Animated Icon Container */}
            <div className="relative">
              {/* Outer Glow Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 animate-ping" style={{ animationDuration: '3s' }}></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-gradient-to-r from-red-500/30 to-orange-500/30 animate-ping" style={{ animationDuration: '2s' }}></div>
              </div>
              
              {/* Main Icon Circle */}
              <div className="relative w-40 h-40 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/40 to-orange-500/40 backdrop-blur-xl border-2 border-red-400/50 shadow-2xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl animate-pulse-slow filter drop-shadow-2xl">⚠️</div>
                </div>
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center space-y-3">
              <h2 className="text-5xl font-black text-white tracking-tight">
                System <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Offline</span>
              </h2>
              <p className="text-xl text-gray-300 font-medium">
                Unable to connect to Pi Bot
              </p>
            </div>

            {/* Info Card */}
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl opacity-20 group-hover:opacity-30 blur transition duration-500"></div>
              
              {/* Card Content */}
              <div className="relative bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center border border-red-400/30">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Troubleshooting Steps</h3>
                    <p className="text-sm text-gray-400">The bot server is currently unavailable</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { icon: '🤖', text: 'Pi bot is running', cmd: 'pm2 status' },
                    { icon: '🌐', text: 'ngrok tunnel is active', cmd: 'screen -r ngrok' },
                    { icon: '📡', text: 'Network connection is stable', cmd: 'ping 8.8.8.8' }
                  ].map((item, i) => (
                    <div 
                      key={i}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/10 group/item"
                    >
                      <span className="text-2xl group-hover/item:scale-110 transition-transform duration-300">{item.icon}</span>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{item.text}</p>
                        <code className="text-xs text-gray-500 font-mono">{item.cmd}</code>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-red-400 group-hover/item:bg-orange-400 transition-colors"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-red-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center space-x-2">
                  <span className="text-xl group-hover:rotate-180 transition-transform duration-500">🔄</span>
                  <span>Retry Connection</span>
                </span>
              </button>
              
              <a
                href="/status"
                className="group relative px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-xl"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span className="text-xl">📊</span>
                  <span>View Status Page</span>
                </span>
              </a>
            </div>

            {/* Help Text */}
            <p className="text-center text-sm text-gray-500">
              Need help? Check the{' '}
              <a href="/faq" className="text-purple-400 hover:text-purple-300 underline transition-colors">
                FAQ
              </a>
              {' '}or run{' '}
              <code className="px-2 py-1 bg-white/10 rounded text-purple-400 font-mono text-xs">
                npm install && pm2 restart discord-bot
              </code>
              {' '}on your Pi
            </p>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(20px);
            opacity: 0.6;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
