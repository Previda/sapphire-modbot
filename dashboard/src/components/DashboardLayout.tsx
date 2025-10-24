'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  Server,
  Shield,
  Settings,
  Users,
  BarChart3,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  Home
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Servers', href: '/dashboard/servers', icon: Server },
    { name: 'Moderation', href: '/dashboard/moderation', icon: Shield },
    { name: 'Members', href: '/dashboard/members', icon: Users },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-primary">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full w-64 backdrop-blur-3xl flex flex-col" style={{
          background: 'linear-gradient(180deg, rgba(var(--bg-secondary), 0.5) 0%, rgba(var(--bg-secondary), 0.3) 100%)',
          borderRight: '1px solid rgba(var(--border), 0.1)',
        }}>
          {/* Logo */}
          <div className="p-6">
            <Link href="/" className="flex items-center gap-3 hover-scale">
              <Logo size="sm" showText />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-accent text-white shadow-lg shadow-accent/20'
                      : 'text-secondary hover:bg-secondary/50 hover:text-primary'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 space-y-1.5">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-secondary hover:bg-secondary/50 hover:text-primary transition-all duration-300"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium text-sm">Home</span>
            </Link>
            
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-secondary hover:bg-secondary/50 hover:text-primary transition-all duration-300"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-5 w-5" />
                  <span className="font-medium text-sm">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  <span className="font-medium text-sm">Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 backdrop-blur-3xl" style={{
          background: 'linear-gradient(180deg, rgba(var(--bg-primary), 0.8) 0%, rgba(var(--bg-primary), 0.6) 100%)',
          borderBottom: '1px solid rgba(var(--border), 0.1)',
        }}>
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-2xl hover:bg-secondary/50 transition-all duration-300 lg:hidden"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-xl" style={{
                background: 'linear-gradient(135deg, rgba(var(--bg-secondary), 0.4) 0%, rgba(var(--bg-secondary), 0.2) 100%)',
              }}>
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-medium text-secondary">Online</span>
              </div>
              
              <button className="p-2 rounded-2xl hover:bg-secondary/50 transition-all duration-300">
                <LogOut className="h-5 w-5 text-secondary" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
