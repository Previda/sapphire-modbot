'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/Logo';
import { 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Lock, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Advanced Moderation',
      description: 'Powerful moderation tools with ban, kick, warn, mute, and timeout commands.',
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Lightning Fast',
      description: 'Optimized performance with instant command execution and real-time updates.',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Appeal System',
      description: 'Built-in appeal system with customizable questions and review workflow.',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and insights about your server activity.',
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: 'Verification System',
      description: 'Secure verification with server lockdown and role management.',
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'Modern UI',
      description: 'Beautiful, intuitive interface with smooth animations and transitions.',
    },
  ];

  const stats = [
    { value: '65+', label: 'Commands' },
    { value: '99.9%', label: 'Uptime' },
    { value: '<100ms', label: 'Response Time' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-discord-blurple/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-discord-fuchsia/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-dark-border/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Logo size="md" showText />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button
                variant="primary"
                size="md"
                icon={<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>}
                onClick={() => window.location.href = '/api/auth/login'}
              >
                Login with Discord
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Modern Discord
              <span className="block bg-gradient-to-r from-discord-blurple to-discord-fuchsia bg-clip-text text-transparent">
                Moderation Bot
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-dark-muted max-w-2xl mx-auto mb-8"
          >
            Powerful moderation tools with a beautiful dashboard. Keep your Discord server safe and organized with advanced features and real-time analytics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight className="h-5 w-5" />}
              onClick={() => window.location.href = '/api/auth/login'}
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open('https://github.com/your-repo', '_blank')}
            >
              View on GitHub
            </Button>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
        >
          {stats.map((stat, index) => (
            <Card key={index} variant="glass" padding="md" hover>
              <div className="text-center">
                <div className="text-3xl font-bold text-discord-blurple mb-2">{stat.value}</div>
                <div className="text-sm text-dark-muted">{stat.label}</div>
              </div>
            </Card>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-lg text-dark-muted max-w-2xl mx-auto">
            Everything you need to manage your Discord server effectively
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="glass" padding="lg" hover>
                <div className="text-discord-blurple mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-dark-muted">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-lg text-dark-muted mb-8 max-w-2xl mx-auto">
              Join thousands of servers using Sapphire ModBot to keep their communities safe and organized.
            </p>
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight className="h-5 w-5" />}
              onClick={() => window.location.href = '/api/auth/login'}
            >
              Login with Discord
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-dark-border/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-dark-muted">
            <p>&copy; 2025 Sapphire ModBot. Made with ❤️ by Skyfall Team</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
