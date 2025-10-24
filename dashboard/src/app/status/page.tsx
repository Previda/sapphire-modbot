'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { 
  Activity, 
  Server, 
  Users, 
  MessageSquare,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  Moon,
  Sun
} from 'lucide-react';
import Link from 'next/link';

interface BotStatus {
  online: boolean;
  uptime: number;
  guilds: number;
  users: number;
  commands: number;
  ping: number;
  memory: number;
  cpu: number;
}

export default function StatusPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    
    // Fetch bot status
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      // Mock data for now - replace with actual API call
      setStatus({
        online: true,
        uptime: 86400000, // 1 day in ms
        guilds: 5,
        users: 1234,
        commands: 42,
        ping: 45,
        memory: 128,
        cpu: 12
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const formatUptime = (ms: number) => {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const stats = status ? [
    { icon: Server, label: 'Servers', value: status.guilds.toLocaleString(), color: 'text-blue-400' },
    { icon: Users, label: 'Users', value: status.users.toLocaleString(), color: 'text-green-400' },
    { icon: MessageSquare, label: 'Commands', value: status.commands.toLocaleString(), color: 'text-purple-400' },
    { icon: Clock, label: 'Uptime', value: formatUptime(status.uptime), color: 'text-yellow-400' },
    { icon: Zap, label: 'Ping', value: `${status.ping}ms`, color: 'text-cyan-400' },
    { icon: Activity, label: 'Memory', value: `${status.memory}MB`, color: 'text-pink-400' },
  ] : [];

  return (
    <div className="min-h-screen bg-primary text-primary">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover-scale">
              <Logo size="sm" showText />
            </Link>
            
            <div className="flex items-center gap-6">
              <Link href="/" className="text-secondary hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/dashboard" className="text-secondary hover:text-primary transition-colors">
                Dashboard
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-secondary hover:bg-tertiary transition-all hover-scale"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-accent" />
                ) : (
                  <Moon className="h-5 w-5 text-accent" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass mb-6">
              {loading ? (
                <>
                  <div className="h-3 w-3 rounded-full bg-gray-400 animate-pulse" />
                  <span className="text-sm font-medium text-secondary">Checking status...</span>
                </>
              ) : status?.online ? (
                <>
                  <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-medium text-green-400">All Systems Operational</span>
                </>
              ) : (
                <>
                  <div className="h-3 w-3 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-sm font-medium text-red-400">System Offline</span>
                </>
              )}
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Bot Status
            </h1>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Real-time monitoring of bot performance and availability
            </p>
          </motion.div>

          {/* Stats Grid */}
          {!loading && status && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="glass p-6 rounded-xl hover-lift"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-secondary mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* System Health */}
          {!loading && status && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass p-8 rounded-xl"
            >
              <h2 className="text-2xl font-bold mb-6">System Health</h2>
              
              <div className="space-y-4">
                <HealthItem 
                  label="Bot Connection" 
                  status={status.online ? 'operational' : 'offline'}
                  value={status.online ? 'Connected' : 'Disconnected'}
                />
                <HealthItem 
                  label="API Response Time" 
                  status={status.ping < 100 ? 'operational' : 'degraded'}
                  value={`${status.ping}ms`}
                />
                <HealthItem 
                  label="Memory Usage" 
                  status={status.memory < 200 ? 'operational' : 'warning'}
                  value={`${status.memory}MB / 512MB`}
                />
                <HealthItem 
                  label="CPU Usage" 
                  status={status.cpu < 50 ? 'operational' : 'warning'}
                  value={`${status.cpu}%`}
                />
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-secondary text-sm">
          <p>© 2024 Sapphire ModBot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function HealthItem({ 
  label, 
  status, 
  value 
}: { 
  label: string; 
  status: 'operational' | 'degraded' | 'warning' | 'offline';
  value: string;
}) {
  const statusConfig = {
    operational: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
    degraded: { icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    warning: { icon: Activity, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    offline: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <span className="text-secondary">{value}</span>
    </div>
  );
}
