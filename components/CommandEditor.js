import { useState, useEffect } from 'react'

export default function CommandEditor({ serverId }) {
  const [commands, setCommands] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCommand, setEditingCommand] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Utility',
    enabled: true,
    cooldown: 2,
    permissions: ['SEND_MESSAGES'],
    options: []
  })

  const categories = ['Music', 'Moderation', 'Utility', 'Games', 'Admin']
  const permissionsList = [
    'SEND_MESSAGES', 'MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS',
    'ADMINISTRATOR', 'MANAGE_GUILD', 'MANAGE_CHANNELS', 'MANAGE_ROLES'
  ]

  useEffect(() => {
    fetchCommands()
  }, [serverId])

  const fetchCommands = async () => {
    try {
      const response = await fetch(`/api/commands/${serverId}/manage`)
      const data = await response.json()
      setCommands(data.commands || [])
    } catch (error) {
      console.error('Failed to fetch commands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/commands/${serverId}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        await fetchCommands()
        setShowCreateForm(false)
        resetForm()
      }
    } catch (error) {
      console.error('Failed to create command:', error)
    }
  }

  const handleUpdate = async (commandId) => {
    try {
      const response = await fetch(`/api/commands/${serverId}/manage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: commandId })
      })
      
      if (response.ok) {
        await fetchCommands()
        setEditingCommand(null)
        resetForm()
      }
    } catch (error) {
      console.error('Failed to update command:', error)
    }
  }

  const handleDelete = async (commandId) => {
    if (!confirm('Are you sure you want to delete this command?')) return
    
    try {
      const response = await fetch(`/api/commands/${serverId}/manage`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commandId })
      })
      
      if (response.ok) {
        await fetchCommands()
      }
    } catch (error) {
      console.error('Failed to delete command:', error)
    }
  }

  const toggleEnabled = async (command) => {
    try {
      const response = await fetch(`/api/commands/${serverId}/manage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...command, enabled: !command.enabled })
      })
      
      if (response.ok) {
        await fetchCommands()
      }
    } catch (error) {
      console.error('Failed to toggle command:', error)
    }
  }

  const startEdit = (command) => {
    setFormData({
      name: command.name,
      description: command.description,
      category: command.category,
      enabled: command.enabled,
      cooldown: command.cooldown,
      permissions: command.permissions,
      options: command.options || []
    })
    setEditingCommand(command.id)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Utility',
      enabled: true,
      cooldown: 2,
      permissions: ['SEND_MESSAGES'],
      options: []
    })
  }

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { name: '', type: 'STRING', description: '', required: false }]
    }))
  }

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const updateOption = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }))
  }

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Command Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span className="text-lg">➕</span>
          Add Command
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingCommand) && (
        <div className="mb-6 bg-gray-800/50 rounded-xl p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingCommand ? 'Edit Command' : 'Create New Command'}
          </h3>
          
          <form onSubmit={editingCommand ? (e) => { e.preventDefault(); handleUpdate(editingCommand) } : handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="commandName" className="block text-sm font-medium text-gray-300 mb-2">Command Name</label>
                <input
                  id="commandName"
                  name="commandName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="command-name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="commandCategory" className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="commandDescription" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                id="commandDescription"
                name="commandDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                rows="2"
                placeholder="Command description..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="commandCooldown" className="block text-sm font-medium text-gray-300 mb-2">Cooldown (seconds)</label>
                <input
                  id="commandCooldown"
                  name="commandCooldown"
                  type="number"
                  value={formData.cooldown}
                  onChange={(e) => setFormData(prev => ({ ...prev, cooldown: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Permissions</label>
                <select
                  multiple
                  value={formData.permissions}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    permissions: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-20"
                >
                  {permissionsList.map(perm => (
                    <option key={perm} value={perm}>{perm}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="enabled" className="text-sm font-medium text-gray-300">Command Enabled</label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {editingCommand ? 'Update' : 'Create'} Command
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingCommand(null)
                  resetForm()
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Commands List */}
      <div className="space-y-4">
        {commands.map((command) => (
          <div key={command.id} className="bg-gray-800/30 rounded-xl p-4 border border-gray-600/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-semibold text-white">/{command.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    command.category === 'Music' ? 'bg-purple-500/20 text-purple-300' :
                    command.category === 'Moderation' ? 'bg-red-500/20 text-red-300' :
                    command.category === 'Utility' ? 'bg-blue-500/20 text-blue-300' :
                    command.category === 'Games' ? 'bg-green-500/20 text-green-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {command.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    command.enabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {command.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-2">{command.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Usage: {command.usage}</span>
                  <span>Cooldown: {command.cooldown}s</span>
                  <span>Permissions: {command.permissions?.join(', ')}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleEnabled(command)}
                  className={`p-2 rounded-lg transition-colors ${
                    command.enabled ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300' : 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                  }`}
                  title={command.enabled ? 'Disable' : 'Enable'}
                >
                  {command.enabled ? '❌' : '✅'}
                </button>
                
                <button
                  onClick={() => startEdit(command)}
                  className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors"
                  title="Edit"
                >
                  ✏️
                </button>
                
                <button
                  onClick={() => handleDelete(command.id)}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
