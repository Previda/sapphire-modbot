'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { 
  Moon,
  Sun,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
              <Link href="/faq" className="text-secondary hover:text-primary transition-smooth">
                FAQ
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
              <FileText className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-secondary">Last updated: October 24, 2025</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Terms of Service
            </h1>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Please read these terms carefully before using Sapphire ModBot
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Acceptance */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p>
                  By accessing or using Sapphire ModBot ("the Bot"), you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use the Bot.
                </p>
                <p>
                  We reserve the right to modify these terms at any time. Continued use of the Bot after changes 
                  constitutes acceptance of the modified terms.
                </p>
              </div>
            </section>

            {/* Use of Service */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold">2. Use of Service</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p className="font-semibold text-primary">You agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the Bot in compliance with Discord's Terms of Service and Community Guidelines</li>
                  <li>Not use the Bot for any illegal or unauthorized purpose</li>
                  <li>Not abuse, harass, or harm other users through the Bot</li>
                  <li>Not attempt to exploit, hack, or reverse engineer the Bot</li>
                  <li>Not use the Bot to spam, raid, or disrupt Discord servers</li>
                  <li>Respect the intellectual property rights of the Bot and its creators</li>
                </ul>
                <p>
                  Violation of these terms may result in immediate termination of your access to the Bot.
                </p>
              </div>
            </section>

            {/* Data Collection */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-purple-400" />
                <h2 className="text-2xl font-bold">3. Data Collection & Privacy</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p className="font-semibold text-primary">We collect and store:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Server IDs and basic server information</li>
                  <li>User IDs for moderation actions and command usage</li>
                  <li>Moderation logs (warnings, bans, kicks, etc.)</li>
                  <li>Command usage statistics</li>
                  <li>Server settings and configurations</li>
                </ul>
                <p className="font-semibold text-primary mt-4">We do NOT collect:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Message content (except when explicitly using moderation commands)</li>
                  <li>Personal information beyond Discord user IDs</li>
                  <li>Payment information (the Bot is free)</li>
                  <li>Private conversations or DMs</li>
                </ul>
                <p className="mt-4">
                  All data is encrypted and stored securely. We never sell or share your data with third parties.
                  You can request deletion of your data at any time.
                </p>
              </div>
            </section>

            {/* Disclaimer */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
                <h2 className="text-2xl font-bold">4. Disclaimer of Warranties</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p>
                  THE BOT IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. We make no guarantees about:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Uptime or availability (though we strive for 99.9%)</li>
                  <li>Accuracy of data or commands</li>
                  <li>Compatibility with all Discord servers</li>
                  <li>Freedom from bugs or errors</li>
                </ul>
                <p>
                  We are not responsible for any damages resulting from the use or inability to use the Bot.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-red-400" />
                <h2 className="text-2xl font-bold">5. Limitation of Liability</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p>
                  To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages resulting from:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your use or inability to use the Bot</li>
                  <li>Any unauthorized access to or use of our servers</li>
                  <li>Any bugs, viruses, or harmful code transmitted through the Bot</li>
                  <li>Any errors or omissions in any content</li>
                  <li>Loss of data or server disruption</li>
                </ul>
              </div>
            </section>

            {/* Termination */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-orange-400" />
                <h2 className="text-2xl font-bold">6. Termination</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p>
                  We reserve the right to terminate or suspend access to the Bot immediately, without prior notice, 
                  for any reason, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violation of these Terms of Service</li>
                  <li>Violation of Discord's Terms of Service</li>
                  <li>Abusive or harmful behavior</li>
                  <li>Suspected fraudulent or illegal activity</li>
                </ul>
                <p>
                  Upon termination, your right to use the Bot will immediately cease.
                </p>
              </div>
            </section>

            {/* Changes to Service */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-bold">7. Changes to Service</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p>
                  We reserve the right to modify, suspend, or discontinue the Bot (or any part thereof) at any time 
                  with or without notice. We shall not be liable to you or any third party for any modification, 
                  suspension, or discontinuance of the Bot.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-indigo-400" />
                <h2 className="text-2xl font-bold">8. Governing Law</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p>
                  These Terms shall be governed by and construed in accordance with applicable laws, without regard 
                  to conflict of law provisions. Any disputes arising from these terms shall be resolved through 
                  binding arbitration.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="glass p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-green-400" />
                <h2 className="text-2xl font-bold">9. Contact Information</h2>
              </div>
              <div className="text-secondary space-y-4">
                <p>
                  If you have any questions about these Terms of Service, please contact us through our Discord 
                  server or via the dashboard support system.
                </p>
                <p className="font-semibold text-primary">
                  By using Sapphire ModBot, you acknowledge that you have read, understood, and agree to be bound 
                  by these Terms of Service.
                </p>
              </div>
            </section>
          </div>

          {/* Quick Links */}
          <div className="mt-16 grid md:grid-cols-2 gap-6">
            <Link
              href="/privacy"
              className="glass p-6 rounded-xl hover-lift transition-smooth text-center"
            >
              <Shield className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Privacy Policy</h3>
              <p className="text-sm text-secondary">Learn how we protect your data</p>
            </Link>
            
            <Link
              href="/faq"
              className="glass p-6 rounded-xl hover-lift transition-smooth text-center"
            >
              <FileText className="h-8 w-8 text-accent mx-auto mb-3" />
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
