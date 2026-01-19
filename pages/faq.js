import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import TopNav from '../components/TopNav';

export default function FAQ() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "What is KSyfall Discord Management?",
          answer: "KSyfall is a professional Discord bot management system that provides advanced moderation, command management, and server analytics. It features a modern web dashboard for easy administration of your Discord servers."
        },
        {
          question: "How do I add KSyfall to my Discord server?",
          answer: "To add KSyfall to your server, you need administrator permissions. Contact our support team or use the Discord OAuth integration in the dashboard to connect your servers."
        },
        {
          question: "Is Skyfall free to use?",
          answer: "Skyfall offers both free and premium tiers. The free tier includes basic moderation commands and limited analytics. Premium features include advanced command customization, detailed analytics, and priority support."
        }
      ]
    },
    {
      category: "Commands & Features",
      questions: [
        {
          question: "What commands does KSyfall support?",
          answer: "KSyfall supports a comprehensive set of commands including moderation (ban, kick, mute), utility (ping, serverinfo, help), verification systems, and appeal management. All commands can be enabled/disabled and customized through the dashboard."
        },
        {
          question: "Can I customize command permissions?",
          answer: "Yes! Through the dashboard, you can set custom permissions for each command, adjust cooldowns, modify descriptions, and even disable commands you don't need. Changes take effect immediately."
        },
        {
          question: "How does the appeal system work?",
          answer: "Users who have been banned or muted can submit appeals through the bot. These appeals are reviewed in the dashboard where moderators can approve, deny, or request more information."
        }
      ]
    },
    {
      category: "Dashboard & Management",
      questions: [
        {
          question: "How do I access the dashboard?",
          answer: "Access the dashboard using the official KSyfall dashboard URL. You can log in using Discord OAuth to manage your servers."
        },
        {
          question: "What can I do in the dashboard?",
          answer: "The dashboard provides real-time server statistics, command management, activity logs, appeal reviews, and system status monitoring. You can enable/disable commands, view analytics, and manage all aspects of your bot."
        },
        {
          question: "Is the dashboard mobile-friendly?",
          answer: "Yes! The dashboard features a responsive design that works perfectly on desktop, tablet, and mobile devices with smooth animations and intuitive navigation."
        }
      ]
    },
    {
      category: "Technical & Support",
      questions: [
        {
          question: "What happens if the bot goes offline?",
          answer: "KSyfall is designed for high availability. If the main bot goes offline, you'll be notified through the dashboard. We maintain 99.9% uptime and have automatic failover systems in place."
        },
        {
          question: "How do I report bugs or request features?",
          answer: "You can report bugs or request features through our support channels. We actively monitor feedback and regularly update Skyfall with new features and improvements."
        },
        {
          question: "Is my server data secure?",
          answer: "Absolutely. We follow Discord's Terms of Service and best security practices. All data is encrypted in transit and at rest. We only store necessary operational data and never access private messages."
        }
      ]
    },
    {
      category: "Troubleshooting",
      questions: [
        {
          question: "Commands aren't working in my server",
          answer: "First, check if the commands are enabled in the dashboard. Ensure the bot has the necessary permissions in your server. If issues persist, check the activity logs in the dashboard for error details."
        },
        {
          question: "Dashboard shows 'backend unavailable'",
          answer: "This indicates a temporary connection issue with the KSyfall backend services. The dashboard will automatically retry and show real data once the connection is restored. Check the status page for current system health."
        },
        {
          question: "How do I reset command settings?",
          answer: "In the dashboard's command management section, you can reset individual commands to their default settings or contact support for a full reset if needed."
        }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>FAQ - KSyfall Discord Management</title>
        <meta
          name="description"
          content="Frequently asked questions about Skyfall Discord bot management system"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-black text-white flex flex-col">
        <TopNav active="faq" />

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Find answers to common questions about Skyfall Discord Management
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search FAQ..."
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <svg className="absolute right-4 top-4 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <span className="text-3xl mr-3">
                      {categoryIndex === 0 ? '🚀' : 
                       categoryIndex === 1 ? '⚡' : 
                       categoryIndex === 2 ? '📊' : 
                       categoryIndex === 3 ? '🔧' : '🛠️'}
                    </span>
                    {category.category}
                  </h2>
                </div>

                <div className="divide-y divide-white/10">
                  {category.questions.map((item, itemIndex) => {
                    const globalIndex = `${categoryIndex}-${itemIndex}`;
                    const isOpen = openItems[globalIndex];

                    return (
                      <div key={itemIndex} className="transition-all duration-200">
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full px-6 py-4 text-left hover:bg-white/5 transition-colors duration-200 flex items-center justify-between"
                        >
                          <span className="text-white font-medium pr-4">{item.question}</span>
                          <svg
                            className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="px-6 pb-4">
                            <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
              <p className="text-gray-300 mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  Access Dashboard
                </Link>
                <Link
                  href="/status"
                  className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200"
                >
                  Check System Status
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-black/95">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="space-y-1">
              <p className="text-zinc-400"> a9 {new Date().getFullYear()} KSyfall. All rights reserved.</p>
              <p>Secure Discord management for serious communities.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/status" className="hover:text-zinc-300">
                Status
              </Link>
              <Link href="/terms" className="hover:text-zinc-300">
                Terms
              </Link>
              <Link href="/terms" className="hover:text-zinc-300">
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
