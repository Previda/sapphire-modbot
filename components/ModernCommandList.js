import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ModernCommandList({ commands, onToggle, onEdit }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingCommand, setEditingCommand] = useState(null);

  const categories = [
    { id: 'all', name: 'All Commands', icon: '📋', color: '#5865F2' },
    { id: 'moderation', name: 'Moderation', icon: '🛡️', color: '#ED4245' },
    { id: 'utility', name: 'Utility', icon: '🔧', color: '#57F287' },
    { id: 'fun', name: 'Fun', icon: '🎮', color: '#FEE75C' },
    { id: 'admin', name: 'Admin', icon: '👑', color: '#EB459E' },
    { id: 'music', name: 'Music', icon: '🎵', color: '#9B59B6' },
  ];

  const filteredCommands = commands.filter(cmd => {
    const matchesSearch = cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cmd.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    return categories.find(c => c.id === category)?.color || '#5865F2';
  };

  return (
    <div className="modern-command-list">
      {/* Header */}
      <div className="command-list-header">
        <h2>⚡ Command Management</h2>
        <p>Manage all {commands.length} commands • {filteredCommands.length} shown</p>
      </div>

      {/* Search & Filter */}
      <div className="command-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search commands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
              style={{ '--cat-color': cat.color }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Commands Grid */}
      <div className="commands-grid">
        <AnimatePresence>
          {filteredCommands.map((cmd, index) => (
            <motion.div
              key={cmd.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="command-card"
              style={{ '--category-color': getCategoryColor(cmd.category) }}
            >
              {/* Command Header */}
              <div className="command-header">
                <div className="command-info">
                  <h3>/{cmd.name}</h3>
                  <span className="category-badge">{cmd.category}</span>
                </div>
                
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={cmd.enabled !== false}
                    onChange={() => onToggle(cmd.name)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Command Description */}
              <p className="command-description">{cmd.description || 'No description'}</p>

              {/* Command Stats */}
              <div className="command-stats">
                <div className="stat">
                  <span className="stat-icon">📊</span>
                  <span className="stat-value">{cmd.usageCount || 0}</span>
                  <span className="stat-label">Uses</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">⏱️</span>
                  <span className="stat-value">{cmd.cooldown || 3}s</span>
                  <span className="stat-label">Cooldown</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">✅</span>
                  <span className="stat-value">{cmd.successRate || 100}%</span>
                  <span className="stat-label">Success</span>
                </div>
              </div>

              {/* Command Actions */}
              <div className="command-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => setEditingCommand(cmd)}
                >
                  ✏️ Edit
                </button>
                <button className="action-btn test">
                  🧪 Test
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      {editingCommand && (
        <div className="modal-overlay" onClick={() => setEditingCommand(null)}>
          <motion.div
            className="edit-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Edit Command: /{editingCommand.name}</h3>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                defaultValue={editingCommand.description}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Cooldown (seconds)</label>
              <input
                type="number"
                defaultValue={editingCommand.cooldown || 3}
                min={0}
                max={60}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select defaultValue={editingCommand.category}>
                {categories.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setEditingCommand(null)}>
                Cancel
              </button>
              <button className="btn-save" onClick={() => {
                onEdit(editingCommand.name, {
                  description: document.querySelector('textarea').value,
                  cooldown: parseInt(document.querySelector('input[type="number"]').value),
                  category: document.querySelector('select').value
                });
                setEditingCommand(null);
              }}>
                💾 Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <style jsx>{`
        .modern-command-list {
          padding: 2rem;
        }

        .command-list-header {
          margin-bottom: 2rem;
        }

        .command-list-header h2 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .command-list-header p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.95rem;
        }

        .command-controls {
          margin-bottom: 2rem;
        }

        .search-box {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.2rem;
        }

        .search-box input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #5865F2;
          background: rgba(255, 255, 255, 0.08);
        }

        .category-filters {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .category-btn {
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .category-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .category-btn.active {
          background: var(--cat-color);
          border-color: var(--cat-color);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .commands-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .command-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .command-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--category-color);
        }

        .command-card:hover {
          transform: translateY(-4px);
          border-color: var(--category-color);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }

        .command-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .command-info h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.5rem;
        }

        .category-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .toggle-switch {
          position: relative;
          width: 50px;
          height: 26px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.2);
          transition: 0.3s;
          border-radius: 34px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: #57F287;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }

        .command-description {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 1rem;
          min-height: 2.7rem;
        }

        .command-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        .stat {
          flex: 1;
          text-align: center;
        }

        .stat-icon {
          display: block;
          font-size: 1.2rem;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          display: block;
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .command-actions {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.edit {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .action-btn.test {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .edit-modal {
          background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
        }

        .edit-modal h3 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: white;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #5865F2;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-cancel,
        .btn-save {
          flex: 1;
          padding: 1rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-cancel {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .btn-save {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-cancel:hover,
        .btn-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
