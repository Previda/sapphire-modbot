'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Command,
  Shield,
  FileText,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Commands', href: '/dashboard/commands', icon: Command },
  { name: 'Moderation', href: '/dashboard/moderation', icon: Shield },
  { name: 'Appeals', href: '/dashboard/appeals', icon: FileText },
  { name: 'Tickets', href: '/dashboard/tickets', icon: Ticket },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%',
        }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-dark-surface border-r border-dark-border',
          'lg:translate-x-0 lg:static lg:inset-auto'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-dark-border">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-discord-blurple to-discord-fuchsia rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Sapphire</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-dark-muted hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    'hover:bg-dark-elevated group relative',
                    isActive && 'bg-discord-blurple text-white'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-discord-blurple rounded-lg"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      'h-5 w-5 relative z-10',
                      isActive ? 'text-white' : 'text-dark-muted group-hover:text-discord-blurple'
                    )}
                  />
                  <span
                    className={cn(
                      'font-medium relative z-10',
                      isActive ? 'text-white' : 'text-dark-text group-hover:text-white'
                    )}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 ml-auto text-white relative z-10" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-dark-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-dark-elevated">
              <div className="w-10 h-10 bg-gradient-to-br from-discord-blurple to-discord-fuchsia rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-dark-muted">admin@example.com</p>
              </div>
            </div>
            <button className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-lg text-discord-red hover:bg-discord-red/10 transition-colors">
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-dark-surface border-b border-dark-border backdrop-blur-xl">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-dark-muted hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-discord-blurple to-discord-fuchsia rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Sapphire</span>
            </div>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
