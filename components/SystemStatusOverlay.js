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
      }, 1000); // Match animation duration
    } else if (!isOnline && !isLoading) {
      setShow(true);
    }
  }, [isOnline, isLoading]);

  if (!show && !isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 ${
        fadeOut ? 'opacity-0 backdrop-blur-0' : 'opacity-100 backdrop-blur-xl'
      }`}
      style={{
        background: fadeOut 
          ? 'transparent'
          : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
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
          // Offline State
          <div className="space-y-8">
            <div className="relative">
              {/* Pulsing Error Ring */}
              <div className="w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
                <div className="absolute inset-0 rounded-full bg-red-500/30 border-4 border-red-500/50"></div>
              </div>
              
              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl animate-pulse-slow">⚠️</div>
              </div>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <h2 className="text-4xl font-bold text-white">
                System Offline
              </h2>
              <p className="text-red-300 text-lg">
                Unable to connect to Pi Bot
              </p>
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
                <p className="text-gray-300 text-sm mb-4">
                  The bot server is currently unavailable. Please check:
                </p>
                <ul className="text-left text-gray-400 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span>Pi bot is running (pm2 status)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span>ngrok tunnel is active</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span>Network connection is stable</span>
                  </li>
                </ul>
              </div>
              
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95"
              >
                🔄 Retry Connection
              </button>
            </div>
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
