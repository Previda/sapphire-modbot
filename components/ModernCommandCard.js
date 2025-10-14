import { useState } from 'react';

export default function ModernCommandCard({ command, onToggle, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    description: command.description,
    cooldown: command.cooldown,
    permissions: command.permissions
  });

  const handleSave = async () => {
    try {
      await onEdit(command.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update command:', error);
    }
  };

  const getStatusColor = () => {
    if (!command.enabled) return 'bg-red-500';
    if (command.successRate >= 98) return 'bg-green-500';
    if (command.successRate >= 90) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getCategoryIcon = () => {
    switch (command.category) {
      case 'moderation': return '🛡️';
      case 'utility': return '⚙️';
      case 'fun': return '🎉';
      default: return '⚡';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getCategoryIcon()}</div>
          <div>
            <h3 className="text-xl font-bold text-white">{command.name}</h3>
            <span className="text-sm text-gray-400 capitalize">{command.category}</span>
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
          <span className="text-sm text-gray-300">
            {command.enabled ? 'Active' : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        {isEditing ? (
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({...editData, description: e.target.value})}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={2}
          />
        ) : (
          <p className="text-gray-300 text-sm leading-relaxed">{command.description}</p>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{command.usageCount}</div>
          <div className="text-xs text-gray-400">Uses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{command.successRate}%</div>
          <div className="text-xs text-gray-400">Success</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{command.cooldown}s</div>
          <div className="text-xs text-gray-400">Cooldown</div>
        </div>
      </div>

      {/* Permissions */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Required Permissions:</div>
        <div className="flex flex-wrap gap-1">
          {command.permissions.map((perm, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg border border-purple-500/30"
            >
              {perm}
            </span>
          ))}
        </div>
      </div>

      {/* Last Used */}
      <div className="mb-4">
        <div className="text-xs text-gray-400">
          Last used: {new Date(command.lastUsed).toLocaleString()}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Enable/Disable Toggle */}
          <button
            onClick={() => onToggle(command.id, !command.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              command.enabled ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                command.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-gray-300">
            {command.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {/* Edit Button */}
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors duration-200"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors duration-200 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Aliases */}
      {command.aliases && command.aliases.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-gray-400 mb-2">Aliases:</div>
          <div className="flex flex-wrap gap-1">
            {command.aliases.map((alias, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg border border-blue-500/30"
              >
                {alias}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
