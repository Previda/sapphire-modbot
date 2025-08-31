// Modern Dashboard JavaScript - Professional Grade
class ModernDashboard {
    constructor() {
        this.currentPage = 'overview';
        this.isNavCollapsed = false;
        this.animationQueue = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSplashScreen();
        this.loadBotStatus();
        this.startAnimationLoop();
        this.setupCounters();
        this.loadActivityFeed();
    }

    // Splash Screen Animation
    loadSplashScreen() {
        setTimeout(() => {
            document.querySelector('.splash-screen').classList.add('hidden');
            this.animateStatsCards();
        }, 2000);
    }

    // Smooth Navigation
    bindEvents() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(link.dataset.page);
                this.createRippleEffect(e, link);
            });
        });

        // Mobile navigation
        const mobileToggle = document.querySelector('.mobile-nav-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                document.querySelector('.nav-sidebar').classList.toggle('open');
            });
        }

        // Search functionality
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }

        // Quick action buttons
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.createRippleEffect(e, card);
                this.performQuickAction(card.dataset.action);
            });
        });
    }

    // Smooth page transitions
    navigateTo(page) {
        const currentPage = document.querySelector('.page.active');
        const newPage = document.querySelector(`[data-page="${page}"]`);
        
        if (!newPage || newPage === currentPage) return;

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Smooth page transition
        if (currentPage) {
            currentPage.style.transform = 'translateX(-20px)';
            currentPage.style.opacity = '0';
            
            setTimeout(() => {
                currentPage.classList.remove('active');
                newPage.classList.add('active');
                newPage.style.transform = 'translateX(20px)';
                newPage.style.opacity = '0';
                
                requestAnimationFrame(() => {
                    newPage.style.transform = 'translateX(0)';
                    newPage.style.opacity = '1';
                });
            }, 150);
        } else {
            newPage.classList.add('active');
        }

        this.currentPage = page;
        this.updatePageTitle(page);
    }

    // Ripple effect for interactions
    createRippleEffect(event, element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;

        const rippleContainer = element.querySelector('.nav-ripple') || element;
        rippleContainer.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    // Animated counters
    setupCounters() {
        const counters = document.querySelectorAll('[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const start = Date.now();
        const startValue = 0;

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - start) / duration, 1);
            const easeProgress = this.easeOutQuart(progress);
            const current = Math.floor(startValue + (target - startValue) * easeProgress);
            
            element.textContent = this.formatNumber(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // Smooth easing function
    easeOutQuart(x) {
        return 1 - Math.pow(1 - x, 4);
    }

    // Number formatting
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    // Bot status updates
    loadBotStatus() {
        // Simulate real-time status
        setInterval(() => {
            this.updateBotMetrics();
        }, 5000);
    }

    updateBotMetrics() {
        const metrics = [
            { selector: '[data-metric="cpu"]', value: Math.random() * 30 + 10 },
            { selector: '[data-metric="memory"]', value: Math.random() * 40 + 30 },
            { selector: '[data-metric="uptime"]', value: 99.8 }
        ];

        metrics.forEach(metric => {
            const element = document.querySelector(metric.selector);
            if (element) {
                this.animateProgress(element, metric.value);
            }
        });
    }

    // Smooth progress bar animation
    animateProgress(element, targetValue) {
        const progressBar = element.querySelector('.progress-fill');
        const valueDisplay = element.querySelector('.metric-value');
        
        if (progressBar && valueDisplay) {
            progressBar.style.width = `${targetValue}%`;
            valueDisplay.textContent = `${targetValue.toFixed(1)}%`;
        }
    }

    // Activity feed with real-time updates
    loadActivityFeed() {
        const activities = [
            { type: 'success', icon: 'fas fa-user-check', text: 'User <strong>@Alex#1234</strong> joined the server', time: '2 minutes ago' },
            { type: 'warning', icon: 'fas fa-exclamation-triangle', text: 'Warning issued to <strong>@BadUser#5678</strong>', time: '5 minutes ago' },
            { type: 'info', icon: 'fas fa-shield-alt', text: 'Auto-mod blocked spam message', time: '8 minutes ago' },
            { type: 'success', icon: 'fas fa-gavel', text: 'Appeal approved for <strong>@ReformedUser#9012</strong>', time: '12 minutes ago' }
        ];

        this.updateActivityFeed(activities);
        
        // Simulate new activities
        setInterval(() => {
            this.addNewActivity();
        }, 30000);
    }

    updateActivityFeed(activities) {
        const timeline = document.querySelector('.activity-timeline');
        if (!timeline) return;

        timeline.innerHTML = '';
        
        activities.forEach((activity, index) => {
            const item = this.createActivityItem(activity);
            item.style.animationDelay = `${index * 0.1}s`;
            timeline.appendChild(item);
        });
    }

    createActivityItem(activity) {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.style.animation = 'slideInLeft 0.5s ease-out forwards';
        
        item.innerHTML = `
            <div class="activity-icon ${activity.type}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        
        return item;
    }

    addNewActivity() {
        const newActivities = [
            { type: 'info', icon: 'fas fa-message', text: 'New ticket created by <strong>@HelpSeeker#3456</strong>', time: 'Just now' },
            { type: 'success', icon: 'fas fa-crown', text: 'User <strong>@Helper#7890</strong> promoted to Moderator', time: 'Just now' },
            { type: 'warning', icon: 'fas fa-volume-mute', text: 'User temporarily muted for spam', time: 'Just now' }
        ];

        const randomActivity = newActivities[Math.floor(Math.random() * newActivities.length)];
        const timeline = document.querySelector('.activity-timeline');
        
        if (timeline) {
            const newItem = this.createActivityItem(randomActivity);
            timeline.insertBefore(newItem, timeline.firstChild);
            
            // Remove oldest item if too many
            const items = timeline.querySelectorAll('.activity-item');
            if (items.length > 8) {
                const oldestItem = items[items.length - 1];
                oldestItem.style.animation = 'slideOutRight 0.3s ease-out forwards';
                setTimeout(() => oldestItem.remove(), 300);
            }
        }
    }

    // Stats card stagger animation
    animateStatsCards() {
        const cards = document.querySelectorAll('.stat-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'slideInUp 0.6s ease-out forwards';
            }, index * 100);
        });
    }

    // Search functionality
    performSearch(query) {
        if (query.length < 2) return;
        
        // Add search highlighting
        this.highlightSearchResults(query);
    }

    highlightSearchResults(query) {
        const searchableElements = document.querySelectorAll('.activity-text, .stat-label, .action-title');
        
        searchableElements.forEach(element => {
            const text = element.textContent;
            if (text.toLowerCase().includes(query.toLowerCase())) {
                element.style.background = 'rgba(88, 101, 242, 0.2)';
                element.style.borderRadius = '4px';
                element.style.padding = '2px 4px';
            } else {
                element.style.background = '';
                element.style.padding = '';
            }
        });
    }

    // Quick actions
    performQuickAction(action) {
        const notifications = {
            'view-appeals': 'Opening appeal management...',
            'mod-logs': 'Loading moderation logs...',
            'ban-user': 'Opening ban interface...',
            'mute-user': 'Opening mute interface...'
        };

        if (notifications[action]) {
            this.showNotification(notifications[action], 'info');
        }
    }

    // Toast notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: var(--dark-2);
            border: 1px solid var(--dark-4);
            border-radius: 12px;
            padding: 1rem 1.5rem;
            color: var(--white);
            font-weight: 500;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Animation loop for smooth effects
    startAnimationLoop() {
        const animate = () => {
            this.updateProgressBars();
            this.processAnimationQueue();
            requestAnimationFrame(animate);
        };
        animate();
    }

    updateProgressBars() {
        document.querySelectorAll('.progress-fill').forEach(bar => {
            const shimmer = bar.querySelector('::before');
            // Continuous shimmer effect handled by CSS
        });
    }

    processAnimationQueue() {
        if (this.animationQueue.length > 0) {
            const animation = this.animationQueue.shift();
            animation();
        }
    }

    // Page title updates
    updatePageTitle(page) {
        const titles = {
            'overview': 'Dashboard Overview',
            'moderation': 'Moderation Center',
            'management': 'Server Management',
            'system': 'System Controls'
        };
        
        const titleElement = document.querySelector('.page-title');
        if (titleElement) {
            titleElement.style.opacity = '0';
            setTimeout(() => {
                titleElement.textContent = titles[page] || 'Dashboard';
                titleElement.style.opacity = '1';
            }, 150);
        }
    }

    // Responsive handling
    handleResize() {
        if (window.innerWidth <= 768) {
            this.isNavCollapsed = true;
            document.querySelector('.nav-sidebar').classList.add('collapsed');
        } else {
            this.isNavCollapsed = false;
            document.querySelector('.nav-sidebar').classList.remove('collapsed');
        }
    }

    // Smooth scroll to top
    scrollToTop() {
        document.querySelector('.content-container').scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Utility functions for smooth interactions
function addHoverEffects() {
    document.querySelectorAll('.stat-card, .action-card, .nav-link').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            e.target.style.transform += ' scale(1.02)';
        });
        
        element.addEventListener('mouseleave', (e) => {
            e.target.style.transform = e.target.style.transform.replace(' scale(1.02)', '');
        });
    });
}

// Additional CSS animations via JavaScript
function addCustomAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(30px);
            }
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .nav-ripple {
            position: absolute;
            inset: 0;
            border-radius: 10px;
            overflow: hidden;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new ModernDashboard();
    addHoverEffects();
    addCustomAnimations();
    
    // Handle window resize
    window.addEventListener('resize', () => dashboard.handleResize());
    
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    console.log('🚀 Modern Dashboard initialized successfully');
});

// Export for potential external use
window.ModernDashboard = ModernDashboard;
