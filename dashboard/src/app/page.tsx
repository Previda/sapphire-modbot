'use client';

import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Moon,
  Sun,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
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

  const features = [
    {
      icon: Shield,
      title: 'Advanced Moderation',
      description: 'Powerful tools for ban, kick, warn, mute, and timeout with customizable settings.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance with instant command execution and real-time updates.',
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Complete user tracking, verification system, and role management.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights and analytics about your server activity.',
    },
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime' },
    { value: '<100ms', label: 'Response Time' },
    { value: '65+', label: 'Commands' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <div className="min-h-screen bg-primary">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-primary/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover-scale">
              <Logo size="sm" showText />
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/dashboard" className="text-secondary hover:text-primary transition-smooth">
                Dashboard
              </Link>
              <Link href="/status" className="text-secondary hover:text-primary transition-smooth">
                Status
              </Link>
              <Link href="/faq" className="text-secondary hover:text-primary transition-smooth">
                FAQ
              </Link>
              <Link href="/terms" className="text-secondary hover:text-primary transition-smooth">
                Terms
              </Link>
            </div>

            {/* Theme Toggle & CTA */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-secondary hover-lift hover-glow transition-smooth"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-primary" />
                ) : (
                  <Moon className="h-5 w-5 text-primary" />
                )}
              </button>
              
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-accent text-white rounded-lg hover-scale hover-glow transition-smooth font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6">
              Professional
              <br />
              <span className="gradient-text">Discord Management</span>
            </h1>
            
            <p className="text-xl text-secondary max-w-2xl mx-auto mb-8">
              Advanced moderation, real-time monitoring, and seamless command management
              with a beautiful modern dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-accent text-white rounded-xl hover-scale hover-glow transition-smooth font-semibold text-lg inline-flex items-center justify-center gap-2"
              >
                Launch Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <Link
                href="/status"
                className="px-8 py-4 bg-secondary text-primary rounded-xl hover-lift transition-smooth font-semibold text-lg"
              >
                View Status
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="glass p-6 rounded-2xl hover-lift transition-smooth"
              >
                <div className="text-3xl font-bold text-accent mb-2">{stat.value}</div>
                <div className="text-sm text-secondary">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Powerful features designed to make Discord server management effortless
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass p-8 rounded-2xl hover-lift hover-glow transition-smooth"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass p-12 rounded-3xl text-center hover-lift transition-smooth"
          >
            <Sparkles className="h-12 w-12 text-accent mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-primary mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto">
              Join thousands of servers using Sapphire for professional Discord management
            </p>
            <Link
              href="/dashboard"
              className="px-10 py-4 bg-accent text-white rounded-xl hover-scale hover-glow transition-smooth font-semibold text-lg inline-flex items-center gap-2"
            >
              Launch Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <Logo size="sm" showText />
              </div>
              <p className="text-sm text-secondary">
                Professional Discord management made simple.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-primary mb-4">Product</h4>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-sm text-secondary hover:text-primary transition-smooth">
                  Dashboard
                </Link>
                <Link href="/status" className="block text-sm text-secondary hover:text-primary transition-smooth">
                  Status
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-primary mb-4">Resources</h4>
              <div className="space-y-2">
                <Link href="/faq" className="block text-sm text-secondary hover:text-primary transition-smooth">
                  FAQ
                </Link>
                <Link href="/docs" className="block text-sm text-secondary hover:text-primary transition-smooth">
                  Documentation
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-primary mb-4">Legal</h4>
              <div className="space-y-2">
                <Link href="/terms" className="block text-sm text-secondary hover:text-primary transition-smooth">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="block text-sm text-secondary hover:text-primary transition-smooth">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-secondary">
            <p>© 2025 Sapphire ModBot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
