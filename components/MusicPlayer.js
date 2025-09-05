import { useState, useEffect } from 'react';

export default function MusicPlayer({ serverId }) {
  const [musicState, setMusicState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(75);

  useEffect(() => {
    if (serverId) {
      fetchMusicState();
      const interval = setInterval(fetchMusicState, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [serverId]);

  const fetchMusicState = async () => {
    try {
      const response = await fetch(`/api/music/${serverId}`);
      if (response.ok) {
        const data = await response.json();
        setMusicState(data);
      } else {
        setError('Failed to fetch music state');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const sendMusicCommand = async (action, data = {}) => {
    try {
      const response = await fetch(`/api/music/${serverId}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...data }),
      });
      
      if (response.ok) {
        fetchMusicState(); // Refresh state after command
      } else {
        setError(`Failed to ${action}`);
      }
    } catch (err) {
      setError(`Error: ${action} failed`);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const createProgressBar = (current, total) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    const blocks = 20;
    const filled = Math.round((percentage / 100) * blocks);
    return '█'.repeat(filled) + '░'.repeat(blocks - filled);
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
        <div className="text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-xl font-bold text-white mb-2">Music Player Offline</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={fetchMusicState}
            className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg text-white transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          🎵 Music Player
        </h2>
        <div className={`px-3 py-1 rounded-full text-sm ${
          musicState?.isPlaying ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
        }`}>
          {musicState?.isPlaying ? '▶ Playing' : '⏸ Paused'}
        </div>
      </div>

      {/* Current Song */}
      {musicState?.currentSong ? (
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            {musicState.currentSong.thumbnail && (
              <img 
                src={musicState.currentSong.thumbnail} 
                alt="Song thumbnail" 
                className="w-20 h-20 rounded-lg object-cover"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-1 truncate">
                {musicState.currentSong.title}
              </h3>
              <p className="text-gray-300 mb-2 truncate">
                {musicState.currentSong.author}
              </p>
              <div className="text-sm text-gray-400">
                {formatTime(musicState.currentSong.currentTime)} / {formatTime(musicState.currentSong.duration)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${musicState.currentSong.duration > 0 
                    ? (musicState.currentSong.currentTime / musicState.currentSong.duration) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 mb-8">
          <div className="text-6xl mb-4">🎶</div>
          <p className="text-gray-300">No song currently playing</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <button 
          onClick={() => sendMusicCommand('previous')}
          className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all duration-200 border border-white/20"
          title="Previous"
        >
          ⏮️
        </button>
        
        <button 
          onClick={() => sendMusicCommand(musicState?.isPlaying ? 'pause' : 'resume')}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 p-4 rounded-full text-white transition-all duration-200 text-xl"
          title={musicState?.isPlaying ? 'Pause' : 'Play'}
        >
          {musicState?.isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <button 
          onClick={() => sendMusicCommand('skip')}
          className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all duration-200 border border-white/20"
          title="Skip"
        >
          ⏭️
        </button>
        
        <button 
          onClick={() => sendMusicCommand('stop')}
          className="bg-red-500/20 hover:bg-red-500/30 p-3 rounded-full text-red-400 transition-all duration-200 border border-red-500/20"
          title="Stop"
        >
          ⏹️
        </button>
      </div>

      {/* Volume and Settings */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-white text-sm">🔊</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={musicState?.volume || volume}
            onChange={(e) => {
              const newVolume = parseInt(e.target.value);
              setVolume(newVolume);
              sendMusicCommand('volume', { volume: newVolume });
            }}
            className="w-24 accent-purple-500"
          />
          <span className="text-gray-300 text-sm w-10">{musicState?.volume || volume}%</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => sendMusicCommand('shuffle')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              musicState?.shuffle 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' 
                : 'bg-white/10 text-gray-400 border border-white/20 hover:bg-white/20'
            }`}
            title="Shuffle"
          >
            🔀
          </button>
          
          <button 
            onClick={() => sendMusicCommand('repeat')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              musicState?.repeat !== 'off'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' 
                : 'bg-white/10 text-gray-400 border border-white/20 hover:bg-white/20'
            }`}
            title={`Repeat: ${musicState?.repeat || 'off'}`}
          >
            {musicState?.repeat === 'one' ? '🔂' : '🔁'}
          </button>
        </div>
      </div>

      {/* Queue */}
      {musicState?.queue && musicState.queue.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Queue ({musicState.queue.length})</h3>
            <button 
              onClick={() => sendMusicCommand('clear')}
              className="text-red-400 hover:text-red-300 text-sm transition-colors"
            >
              Clear Queue
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {musicState.queue.slice(0, 10).map((song, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                <span className="text-gray-400 text-sm w-6">{index + 1}</span>
                {song.thumbnail && (
                  <img 
                    src={song.thumbnail} 
                    alt="" 
                    className="w-10 h-10 rounded object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{song.title}</p>
                  <p className="text-gray-400 text-sm truncate">{song.author}</p>
                </div>
                <div className="text-gray-400 text-sm">
                  {formatTime(song.duration)}
                </div>
                <button 
                  onClick={() => sendMusicCommand('remove', { position: index + 1 })}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all duration-200"
                >
                  ❌
                </button>
              </div>
            ))}
            
            {musicState.queue.length > 10 && (
              <div className="text-center text-gray-400 text-sm py-2">
                ... and {musicState.queue.length - 10} more songs
              </div>
            )}
          </div>
        </div>
      )}

      {/* Play URL Input */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <PlayUrlInput onPlay={(url) => sendMusicCommand('play', { url })} />
      </div>
    </div>
  );
}

function PlayUrlInput({ onPlay }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setLoading(true);
    try {
      await onPlay(url.trim());
      setUrl('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input 
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter YouTube URL or search term..."
        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
        disabled={loading}
      />
      <button 
        type="submit" 
        disabled={loading || !url.trim()}
        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg text-white font-medium transition-all duration-200"
      >
        {loading ? '🔄' : '🎵'} Play
      </button>
    </form>
  );
}
