import { useState, useEffect, useRef } from 'react';

export default function ServerSelector({ servers, selectedServer, onServerSelect, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredServers = (servers || []).filter(server =>
    server?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getServerIcon = (server) => {
    if (server.icon) {
      return `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`;
    }
    // Generate a gradient based on server name for consistent colors
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-rose-500',
      'from-indigo-500 to-purple-500'
    ];
    const colorIndex = server.name.length % colors.length;
    return colors[colorIndex];
  };

  const formatMemberCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getBoostBadge = (level) => {
    if (level >= 3) return { emoji: '💎', color: 'text-purple-400', bg: 'bg-purple-500/20' };
    if (level >= 2) return { emoji: '🚀', color: 'text-pink-400', bg: 'bg-pink-500/20' };
    if (level >= 1) return { emoji: '⭐', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return null;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Server Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 group"
      >
        <div className="flex items-center space-x-4">
          {selectedServer ? (
            <>
              {selectedServer.icon ? (
                <img
                  src={getServerIcon(selectedServer)}
                  alt={selectedServer.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"
                />
              ) : (
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getServerIcon(selectedServer)} flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300`}>
                  {selectedServer.name[0]}
                </div>
              )}
              <div className="text-left">
                <h3 className="text-white font-bold text-lg group-hover:text-purple-300 transition-colors">
                  {selectedServer.name}
                </h3>
                <p className="text-gray-400 text-sm flex items-center space-x-3">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                    {formatMemberCount(selectedServer.onlineMembers)}
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-1.5"></span>
                    {formatMemberCount(selectedServer.memberCount)}
                  </span>
                  {getBoostBadge(selectedServer.boostLevel) && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBoostBadge(selectedServer.boostLevel).bg} ${getBoostBadge(selectedServer.boostLevel).color}`}>
                      {getBoostBadge(selectedServer.boostLevel).emoji} Level {selectedServer.boostLevel}
                    </span>
                  )}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-gray-400 text-xl">?</span>
              </div>
              <div>
                <h3 className="text-white font-bold">Select a Server</h3>
                <p className="text-gray-400 text-sm">Choose a server to manage</p>
              </div>
            </div>
          )}
        </div>

        <svg
          className={`w-6 h-6 text-gray-400 transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-down">
          {/* Search Bar */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <input
                type="text"
                placeholder="Search servers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Server List */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {filteredServers.length > 0 ? (
              <div className="p-2">
                {filteredServers.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => {
                      onServerSelect(server);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 hover:bg-white/10 group ${
                      selectedServer?.id === server.id ? 'bg-purple-500/20 ring-1 ring-purple-500/50' : ''
                    }`}
                  >
                    {/* Server Icon */}
                    {server.icon ? (
                      <img
                        src={getServerIcon(server)}
                        alt={server.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getServerIcon(server)} flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300`}>
                        {server.name[0]}
                      </div>
                    )}

                    {/* Server Info */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-bold group-hover:text-purple-300 transition-colors">
                          {server.name}
                        </h4>
                        {server.isOwner && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                            👑 Owner
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-gray-400 text-sm flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                          {formatMemberCount(server.onlineMembers)} online
                        </span>
                        <span className="text-gray-400 text-sm flex items-center">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-1.5"></span>
                          {formatMemberCount(server.memberCount)} members
                        </span>
                        {getBoostBadge(server.boostLevel) && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBoostBadge(server.boostLevel).bg} ${getBoostBadge(server.boostLevel).color}`}>
                            {getBoostBadge(server.boostLevel).emoji} {server.boostLevel}
                          </span>
                        )}
                      </div>

                      {server.description && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                          {server.description}
                        </p>
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {selectedServer?.id === server.id && (
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-gray-400">No servers found</p>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your search</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
}
