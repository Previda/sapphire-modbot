'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { 
  ChevronDown,
  Moon,
  Sun,
  HelpCircle,
  Shield,
  Zap,
  Users,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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

  const faqs = [
    {
      category: 'General',
      icon: HelpCircle,
      questions: [
        {
          q: 'What is Sapphire ModBot?',
          a: 'Sapphire ModBot is a professional Discord moderation and management bot designed to help server administrators maintain order, automate tasks, and enhance their community experience with powerful features and an intuitive dashboard.'
        },
        {
          q: 'Is Sapphire ModBot free to use?',
          a: 'Yes! Sapphire ModBot is completely free to use with all core features available. We believe in providing quality moderation tools accessible to all Discord communities.'
        },
        {
          q: 'How do I add the bot to my server?',
          a: 'Click the "Get Started" button on our homepage, log in with Discord, select your server, and authorize the bot. The bot will join your server immediately and you can start using it right away.'
        },
        {
          q: 'What permissions does the bot need?',
          a: 'The bot requires Administrator permissions to function properly. This allows it to manage roles, kick/ban users, delete messages, and perform all moderation tasks. You can customize permissions after adding the bot.'
        }
      ]
    },
    {
      category: 'Moderation',
      icon: Shield,
      questions: [
        {
          q: 'What moderation commands are available?',
          a: 'Sapphire includes ban, kick, warn, mute, timeout, purge messages, and more. All commands support custom durations, reasons, and can be logged to a dedicated channel for transparency.'
        },
        {
          q: 'Can I set up auto-moderation?',
          a: 'Yes! The bot includes auto-moderation features for spam detection, link filtering, bad word filtering, and raid protection. Configure these settings in the dashboard to match your server\'s needs.'
        },
        {
          q: 'How do warnings work?',
          a: 'Warnings are tracked per user and stored in the database. You can set thresholds to automatically take action (mute, kick, or ban) when a user reaches a certain number of warnings.'
        },
        {
          q: 'Can I view moderation history?',
          a: 'Absolutely! All moderation actions are logged and can be viewed in the dashboard. You can see who performed the action, when, why, and against whom - perfect for accountability.'
        }
      ]
    },
    {
      category: 'Features',
      icon: Zap,
      questions: [
        {
          q: 'Does the bot have a dashboard?',
          a: 'Yes! We provide a modern, beautiful web dashboard where you can manage commands, view statistics, configure settings, and monitor your server in real-time without using Discord commands.'
        },
        {
          q: 'Can I customize the bot\'s prefix?',
          a: 'Yes, you can set a custom prefix for your server through the dashboard or using the setprefix command. The default prefix is "!" but you can change it to anything you like.'
        },
        {
          q: 'Does the bot support slash commands?',
          a: 'Yes! All commands are available as Discord slash commands, making them easy to discover and use. Just type "/" in Discord to see all available bot commands.'
        },
        {
          q: 'What analytics does the bot provide?',
          a: 'The dashboard shows command usage statistics, moderation action trends, user activity, server growth, and more. All data is presented in beautiful charts and graphs for easy analysis.'
        }
      ]
    },
    {
      category: 'Server Management',
      icon: Users,
      questions: [
        {
          q: 'Can I manage multiple servers?',
          a: 'Yes! If you have the bot in multiple servers, you can switch between them in the dashboard and manage each server\'s settings independently.'
        },
        {
          q: 'How do I set up welcome messages?',
          a: 'Use the dashboard to configure welcome messages. You can customize the message, choose which channel to send it to, and even include user mentions and server information.'
        },
        {
          q: 'Can I create custom roles?',
          a: 'While the bot doesn\'t create roles directly, it can manage existing roles - assigning them, removing them, and setting up role-based permissions for commands.'
        },
        {
          q: 'Is there a verification system?',
          a: 'Yes! You can set up a verification system where new members must complete a captcha or react to a message before gaining access to your server.'
        }
      ]
    },
    {
      category: 'Technical',
      icon: Settings,
      questions: [
        {
          q: 'What is the bot\'s uptime?',
          a: 'We maintain 99.9% uptime. The bot runs on reliable infrastructure with automatic failover and monitoring to ensure it\'s always available for your server.'
        },
        {
          q: 'How fast does the bot respond?',
          a: 'Commands typically execute in under 100ms. We\'ve optimized the bot for speed and efficiency, ensuring instant responses to keep your moderation workflow smooth.'
        },
        {
          q: 'Is my data secure?',
          a: 'Absolutely! All data is encrypted in transit and at rest. We follow Discord\'s best practices and never store sensitive information like passwords or tokens.'
        },
        {
          q: 'Can I export my data?',
          a: 'Yes, you can export all your server\'s data (logs, warnings, settings) at any time through the dashboard. We believe in data portability and transparency.'
        }
      ]
    }
  ];

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
              <Link href="/status" className="text-secondary hover:text-primary transition-smooth">
                Status
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Everything you need to know about Sapphire ModBot
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="glass p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <category.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold">{category.category}</h2>
                </div>

                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex;
                    const isOpen = openIndex === globalIndex;

                    return (
                      <div
                        key={faqIndex}
                        className="border border-border rounded-xl overflow-hidden transition-smooth"
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between bg-secondary/50 hover:bg-secondary transition-smooth text-left"
                        >
                          <span className="font-semibold pr-4">{faq.q}</span>
                          <ChevronDown
                            className={`h-5 w-5 text-accent transition-transform duration-300 flex-shrink-0 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isOpen ? 'max-h-96' : 'max-h-0'
                          }`}
                        >
                          <div className="px-6 py-4 text-secondary bg-secondary/20">
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Still Have Questions */}
          <div className="mt-16 glass p-8 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-secondary mb-6">
              Can't find the answer you're looking for? Join our Discord server for support.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover-scale hover-glow transition-smooth font-medium"
            >
              Get Started
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
