// Modern Dashboard JavaScript
class SapphireDashboard {
    constructor() {
        this.baseURL = 'http://localhost:3000';
        this.token = localStorage.getItem('dashboard_token') || 'your-dashboard-secret';
        this.currentSection = 'overview';
        this.stats = {};
        this.commands = [];
        this.logs = [];
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.showLoading();
        
        try {
            await this.loadStats();
            await this.loadCommands();
            await this.loadLogs();
            await this.loadSecuritySettings();
        } catch (error) {
            this.showNotification('Failed to load dashboard data', 'error');
            console.error('Init error:', error);
        }
        
        this.hideLoading();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refreshAll();
        });

        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.executeAction(action);
            });
        });

        // Command search
        document.getElementById('command-search').addEventListener('input', (e) => {
            this.filterCommands(e.target.value);
        });

        // Security settings
        document.getElementById('save-security').addEventListener('click', () => {
            this.saveSecuritySettings();
        });

        // Log filters
        document.getElementById('log-type-filter').addEventListener('change', (e) => {
            this.filterLogs(e.target.value);
        });
    }

    switchSection(section) {
        // Update sidebar
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        // Update header
        const titles = {
            overview: { title: 'Dashboard Overview', subtitle: 'Monitor and manage your Discord bot' },
            servers: { title: 'Server Management', subtitle: 'Manage bot settings across servers' },
            commands: { title: 'Command Management', subtitle: 'Enable or disable bot commands' },
            moderation: { title: 'Moderation Tools', subtitle: 'Configure moderation features' },
            appeals: { title: 'Appeal System', subtitle: 'Manage user appeals and reviews' },
            tickets: { title: 'Ticket System', subtitle: 'Configure support tickets' },
            security: { title: 'Security Settings', subtitle: 'Configure anti-raid and anti-nuke protection' },
            logs: { title: 'System Logs', subtitle: 'Monitor bot activity and events' },
            settings: { title: 'Bot Settings', subtitle: 'Configure general bot settings' }
        };

        const sectionInfo = titles[section] || titles.overview;
        document.getElementById('page-title').textContent = sectionInfo.title;
        document.getElementById('page-subtitle').textContent = sectionInfo.subtitle;

        this.currentSection = section;
    }

    async apiRequest(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
                ...options.headers
            },
            ...options
        };

        const response = await fetch(`${this.baseURL}${endpoint}`, config);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    async loadStats() {
        try {
            this.stats = await this.apiRequest('/api/stats');
            this.updateStatsDisplay();
        } catch (error) {
            console.error('Failed to load stats:', error);
            this.showNotification('Failed to load bot statistics', 'error');
        }
    }

    updateStatsDisplay() {
        document.getElementById('server-count').textContent = this.stats.servers || 0;
        document.getElementById('user-count').textContent = this.formatNumber(this.stats.users || 0);
        document.getElementById('command-count').textContent = this.stats.commands || 0;
        document.getElementById('uptime').textContent = this.formatUptime(this.stats.uptime || 0);

        // Update bot status
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.bot-status span');
        
        if (this.stats.status === 'online') {
            statusIndicator.className = 'status-indicator online';
            statusText.textContent = 'Bot Online';
        } else {
            statusIndicator.className = 'status-indicator offline';
            statusText.textContent = 'Bot Offline';
        }
    }

    async loadCommands() {
        try {
            this.commands = await this.apiRequest('/api/commands');
            this.updateCommandsDisplay();
        } catch (error) {
            console.error('Failed to load commands:', error);
            this.showNotification('Failed to load commands', 'error');
        }
    }

    updateCommandsDisplay() {
        const tbody = document.getElementById('commands-tbody');
        
        if (this.commands.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No commands found</td></tr>';
            return;
        }

        tbody.innerHTML = this.commands.map(cmd => `
            <tr>
                <td>
                    <strong>/${cmd.name}</strong>
                </td>
                <td>
                    <span class="category-badge">${cmd.category}</span>
                </td>
                <td>${cmd.description}</td>
                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" ${cmd.enabled ? 'checked' : ''} 
                               onchange="dashboard.toggleCommand('${cmd.name}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </td>
                <td>
                    <button class="btn btn-sm" onclick="dashboard.showCommandDetails('${cmd.name}')">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async toggleCommand(commandName, enabled) {
        try {
            await this.apiRequest(`/api/commands/${commandName}/toggle`, {
                method: 'POST',
                body: JSON.stringify({ 
                    enabled, 
                    userId: 'dashboard-user' 
                })
            });
            
            this.showNotification(`Command /${commandName} ${enabled ? 'enabled' : 'disabled'}`, 'success');
            
            // Update local data
            const cmd = this.commands.find(c => c.name === commandName);
            if (cmd) cmd.enabled = enabled;
            
        } catch (error) {
            console.error('Failed to toggle command:', error);
            this.showNotification('Failed to update command status', 'error');
            
            // Revert checkbox
            const checkbox = document.querySelector(`input[onchange*="${commandName}"]`);
            if (checkbox) checkbox.checked = !enabled;
        }
    }

    filterCommands(searchTerm) {
        const rows = document.querySelectorAll('#commands-tbody tr');
        
        rows.forEach(row => {
            const commandName = row.querySelector('strong')?.textContent || '';
            const description = row.cells[2]?.textContent || '';
            const category = row.cells[1]?.textContent || '';
            
            const matchesSearch = [commandName, description, category]
                .some(text => text.toLowerCase().includes(searchTerm.toLowerCase()));
            
            row.style.display = matchesSearch ? '' : 'none';
        });
    }

    async loadLogs() {
        try {
            this.logs = await this.apiRequest('/api/logs?limit=20');
            this.updateLogsDisplay();
        } catch (error) {
            console.error('Failed to load logs:', error);
            this.showNotification('Failed to load logs', 'error');
        }
    }

    updateLogsDisplay() {
        const container = document.getElementById('logs-container');
        
        if (this.logs.length === 0) {
            container.innerHTML = '<div class="log-entry"><div class="log-message">No logs found</div></div>';
            return;
        }

        container.innerHTML = this.logs.map(log => `
            <div class="log-entry">
                <div class="log-time">${this.formatTime(log.timestamp)}</div>
                <div class="log-type">${log.type}</div>
                <div class="log-message">${log.message}</div>
            </div>
        `).join('');

        // Update recent activity
        const recentActivity = document.getElementById('recent-activity');
        const recentLogs = this.logs.slice(0, 5);
        
        recentActivity.innerHTML = recentLogs.map(log => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-content">
                    <p>${log.message}</p>
                    <small>${this.formatTimeAgo(log.timestamp)}</small>
                </div>
            </div>
        `).join('');
    }

    filterLogs(type) {
        const entries = document.querySelectorAll('.log-entry');
        
        entries.forEach(entry => {
            const logType = entry.querySelector('.log-type').textContent;
            entry.style.display = (!type || logType === type) ? '' : 'none';
        });
    }

    async loadSecuritySettings() {
        try {
            const settings = await this.apiRequest('/api/security/settings');
            this.updateSecurityDisplay(settings);
        } catch (error) {
            console.error('Failed to load security settings:', error);
        }
    }

    updateSecurityDisplay(settings) {
        // Anti-raid settings
        document.getElementById('antiraid-enabled').checked = settings.antiRaid?.enabled || false;
        document.getElementById('join-threshold').value = settings.antiRaid?.joinThreshold || 10;
        document.getElementById('time-window').value = settings.antiRaid?.timeWindow || 30;

        // Anti-nuke settings
        document.getElementById('antinuke-enabled').checked = settings.antiNuke?.enabled || false;
        document.getElementById('channel-delete-limit').value = settings.antiNuke?.channelDeleteLimit || 3;
    }

    async saveSecuritySettings() {
        try {
            const settings = {
                antiRaid: {
                    enabled: document.getElementById('antiraid-enabled').checked,
                    joinThreshold: parseInt(document.getElementById('join-threshold').value),
                    timeWindow: parseInt(document.getElementById('time-window').value),
                    autoKick: true
                },
                antiNuke: {
                    enabled: document.getElementById('antinuke-enabled').checked,
                    channelDeleteLimit: parseInt(document.getElementById('channel-delete-limit').value),
                    autoResponse: true,
                    removePerms: true
                },
                userId: 'dashboard-user'
            };

            await this.apiRequest('/api/security/settings', {
                method: 'POST',
                body: JSON.stringify(settings)
            });

            this.showNotification('Security settings saved successfully', 'success');
        } catch (error) {
            console.error('Failed to save security settings:', error);
            this.showNotification('Failed to save security settings', 'error');
        }
    }

    async executeAction(action) {
        this.showLoading();
        
        try {
            const result = await this.apiRequest(`/api/actions/${action}`, {
                method: 'POST',
                body: JSON.stringify({ userId: 'dashboard-user' })
            });

            this.showNotification(result.result?.message || `${action} completed successfully`, 'success');
            
            if (action === 'refresh') {
                await this.refreshAll();
            }
            
        } catch (error) {
            console.error(`Failed to execute ${action}:`, error);
            this.showNotification(`Failed to execute ${action}`, 'error');
        }
        
        this.hideLoading();
    }

    async refreshAll() {
        this.showLoading();
        
        try {
            await Promise.all([
                this.loadStats(),
                this.loadCommands(),
                this.loadLogs()
            ]);
            
            this.showNotification('Dashboard refreshed successfully', 'success');
        } catch (error) {
            this.showNotification('Failed to refresh dashboard', 'error');
        }
        
        this.hideLoading();
    }

    startAutoRefresh() {
        // Refresh stats every 30 seconds
        setInterval(() => {
            this.loadStats();
        }, 30000);

        // Refresh logs every 60 seconds
        setInterval(() => {
            this.loadLogs();
        }, 60000);
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; padding: 0 0 0 1rem;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    showLoading() {
        document.getElementById('loading-overlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('active');
    }

    // Utility functions
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now - time) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    showCommandDetails(commandName) {
        const command = this.commands.find(c => c.name === commandName);
        if (!command) return;
        
        this.showNotification(`Command: /${command.name} - ${command.description}`, 'info');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new SapphireDashboard();
});

// Add some CSS for category badges
const style = document.createElement('style');
style.textContent = `
    .category-badge {
        background: rgba(88, 101, 242, 0.1);
        color: var(--primary-color);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .btn-sm {
        padding: 0.5rem;
        font-size: 0.75rem;
        background: rgba(88, 101, 242, 0.1);
        color: var(--primary-color);
        border: 1px solid rgba(88, 101, 242, 0.2);
    }
    
    .btn-sm:hover {
        background: rgba(88, 101, 242, 0.2);
    }
    
    .status-indicator.offline {
        background: var(--error-color);
        box-shadow: 0 0 10px var(--error-color);
    }
`;
document.head.appendChild(style);
