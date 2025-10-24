'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { 
  Moon,
  Sun,
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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
              <Link href="/" className="text-secondary hover:text-primary transition-smooth">
                Home
              </Link>
              <Link href="/dashboard" className="text-secondary hover:text-primary transition-smooth">
                Dashboard
              </Link>
              <Link href="/terms" className="text-secondary hover:text-primary transition-smooth">
                Terms
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-secondary hover:bg-tertiary transition-smooth hover-scale"
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-secondary">Last updated: October 24, 2025</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Privacy Policy
            </h1>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Your privacy is important to us. Here's how we protect your data.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold">Introduction</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p>
                  Sapphire ModBot ("we", "our", or "the Bot") is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, and safeguard your information when you 
                  use our Discord bot and dashboard.
                </p>
                <p>
                  By using the Bot, you agree to the collection and use of information in accordance with this policy.
                </p>
              </div>
            </section>

            {/* Data We Collect */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-purple-400" />
                <h2 className="text-2xl font-bold">Information We Collect</h2>
              </div>
              <div className="text-secondary space-y-4">
                <div>
                  <p className="font-semibold text-primary mb-2">Automatically Collected Data:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Server Information:</strong> Server ID, name, member count, and settings</li>
                    <li><strong>User IDs:</strong> Discord user IDs for moderation actions and command usage</li>
                    <li><strong>Command Usage:</strong> Which commands are used and when</li>
                    <li><strong>Moderation Logs:</strong> Records of bans, kicks, warnings, and other moderation actions</li>
                    <li><strong>Server Settings:</strong> Custom prefixes, channel configurations, and bot settings</li>
                  </ul>
                </div>
                
                <div className="mt-6">
                  <p className="font-semibold text-primary mb-2">Data We DO NOT Collect:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Message content (except when explicitly using moderation commands like purge)</li>
                    <li>Personal information beyond Discord user IDs</li>
                    <li>IP addresses or device information</li>
                    <li>Payment or financial information</li>
                    <li>Private messages or DMs</li>
                    <li>Voice chat data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Data */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-green-400" />
                <h2 className="text-2xl font-bold">How We Use Your Data</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p>We use the collected data to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain the Bot's functionality</li>
                  <li>Store moderation history and server settings</li>
                  <li>Generate analytics and usage statistics</li>
                  <li>Improve the Bot's features and performance</li>
                  <li>Prevent abuse and enforce our Terms of Service</li>
                  <li>Provide customer support</li>
                </ul>
                <p className="mt-4 font-semibold text-primary">
                  We will NEVER:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Sell your data to third parties</li>
                  <li>Share your data without your consent (except as required by law)</li>
                  <li>Use your data for advertising or marketing purposes</li>
                  <li>Monitor your private conversations</li>
                </ul>
              </div>
            </section>

            {/* Data Storage */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-yellow-400" />
                <h2 className="text-2xl font-bold">Data Storage & Security</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p className="font-semibold text-primary">How We Protect Your Data:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest</li>
                  <li><strong>Secure Servers:</strong> Data is stored on secure, monitored servers</li>
                  <li><strong>Access Control:</strong> Strict access controls limit who can view data</li>
                  <li><strong>Regular Backups:</strong> Automated backups prevent data loss</li>
                  <li><strong>Security Audits:</strong> Regular security reviews and updates</li>
                </ul>
                <p className="mt-4">
                  <strong>Data Retention:</strong> We retain data for as long as necessary to provide our services. 
                  Moderation logs are kept indefinitely for accountability, but you can request deletion at any time.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-bold">Your Rights</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request a copy of all data we have about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                  <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
                  <li><strong>Export:</strong> Export your data in a machine-readable format</li>
                  <li><strong>Opt-Out:</strong> Stop using the Bot at any time by removing it from your server</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us through our Discord server or dashboard support system.
                </p>
              </div>
            </section>

            {/* Third-Party Services */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-red-400" />
                <h2 className="text-2xl font-bold">Third-Party Services</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p>The Bot integrates with the following third-party services:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Discord:</strong> We use Discord's API to provide bot functionality. Discord's Privacy Policy applies.</li>
                  <li><strong>Hosting Providers:</strong> Our servers are hosted on secure cloud infrastructure.</li>
                  <li><strong>Database Services:</strong> We use Neon PostgreSQL for secure data storage.</li>
                </ul>
                <p className="mt-4">
                  We carefully select third-party services that maintain high security and privacy standards.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="h-6 w-6 text-orange-400" />
                <h2 className="text-2xl font-bold">Children's Privacy</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p>
                  The Bot is not intended for users under 13 years of age. We do not knowingly collect personal 
                  information from children under 13. If you are a parent or guardian and believe your child has 
                  provided us with personal information, please contact us.
                </p>
              </div>
            </section>

            {/* Changes to Policy */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-indigo-400" />
                <h2 className="text-2xl font-bold">Changes to This Policy</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                  the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
                <p>
                  Continued use of the Bot after changes constitutes acceptance of the updated Privacy Policy.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-green-400" />
                <h2 className="text-2xl font-bold">Contact Us</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p>
                  If you have any questions about this Privacy Policy or how we handle your data, please contact us:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Through our Discord support server</li>
                  <li>Via the dashboard support system</li>
                  <li>By removing the Bot from your server (to stop data collection)</li>
                </ul>
                <p className="mt-4 font-semibold text-primary">
                  We take your privacy seriously and are committed to protecting your data.
                </p>
              </div>
            </section>
          </div>

          {/* Quick Links */}
          <div className="mt-16 grid md:grid-cols-2 gap-6">
            <Link
              href="/terms"
              className="glass p-6 rounded-xl hover-lift transition-smooth text-center"
            >
              <Shield className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Terms of Service</h3>
              <p className="text-sm text-secondary">Read our terms and conditions</p>
            </Link>
            
            <Link
              href="/faq"
              className="glass p-6 rounded-xl hover-lift transition-smooth text-center"
            >
              <Database className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">FAQ</h3>
              <p className="text-sm text-secondary">Common questions answered</p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-secondary text-sm">
          <p>© 2025 Sapphire ModBot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
