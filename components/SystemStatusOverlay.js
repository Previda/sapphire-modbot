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
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-800 ease-out ${
        fadeOut ? 'opacity-0 backdrop-blur-0' : 'opacity-100 backdrop-blur-xl'
      }`}
      style={{
        background: fadeOut
          ? 'transparent'
          : 'radial-gradient(circle at top left, rgba(56, 189, 248, 0.12), transparent 55%), radial-gradient(circle at bottom right, rgba(244, 114, 182, 0.12), transparent 55%), rgba(0, 0, 0, 0.96)',
      }}
    >
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
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
                <div className="absolute inset-0 rounded-full border-4 border-zinc-500/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-zinc-200 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-zinc-400 animate-spin-slow"></div>
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
                <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
          // Offline State - cleaner dark design
          <div className="space-y-10 max-w-2xl mx-auto px-6">
            {/* Icon & title */}
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-500/40 bg-gray-500/10 shadow-[0_0_40px_rgba(128,128,128,0.35)]">
                <span className="text-3xl">⚠️</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  <span className="text-zinc-100">System</span>{' '}
                  <span className="text-gray-400">offline</span>
                </h2>
                <p className="text-sm text-zinc-400 sm:text-base">
                  Unable to reach your Skyfall backend right now. Follow the quick checks below, then retry.
                </p>
              </div>
            </div>

            {/* Info Card */}
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-gray-500/40 to-gray-400/40 opacity-30 blur-xl" />
              <div className="relative rounded-3xl border border-white/10 bg-black/70 px-6 py-6 backdrop-blur-2xl sm:px-8">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-lg">🔍</div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">Quick checks on your Pi</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Run these in order; each step should turn green once confirmed.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: '🤖', text: 'Bot process is running', cmd: 'pm2 status' },
                    { icon: '🌐', text: 'Tunnel (ngrok / reverse proxy) is active', cmd: 'screen -r tunnel' },
                    { icon: '📡', text: 'Network connection is stable', cmd: 'ping 8.8.8.8' }
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="group/item flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-left transition-all duration-200 hover:border-white/15 hover:bg-white/10"
                    >
                      <span className="text-xl transition-transform duration-200 group-hover/item:scale-110">{item.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-100">{item.text}</p>
                        <code className="mt-0.5 inline-block rounded bg-black/50 px-2 py-1 text-[11px] font-mono text-zinc-400">
                          {item.cmd}
                        </code>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-rose-400/80" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-semibold text-black shadow-lg shadow-rose-900/40 transition-transform hover:scale-[1.02] active:scale-95"
              >
                <span className="text-base">🔄</span>
                <span>Retry connection</span>
              </button>

              <a
                href="/status"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-medium text-zinc-200 backdrop-blur-md transition-colors hover:border-white/35 hover:bg-white/10"
              >
                <span className="text-base">📊</span>
                <span>Open full status page</span>
              </a>
            </div>

            {/* Help Text */}
            <p className="text-center text-xs text-zinc-500">
              Need help? Check the{' '}
              <a href="/faq" className="text-sky-400 hover:text-sky-300 underline transition-colors">
                FAQ
              </a>
              {' '}or run{' '}
              <code className="px-2 py-1 bg-white/5 rounded text-zinc-300 font-mono text-[11px]">
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
