import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function TermsOfService() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Terms of Service • Skyfall Bot</title>
        <meta name="description" content="Terms of Service for Skyfall Discord Bot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.07l7 3.5v7.36l-7-3.5V9.07zm16 0v7.36l-7 3.5v-7.36l7-3.5z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-gray-300 text-lg">Skyfall Discord Bot</p>
            <p className="text-gray-400 mt-2">Last Updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="prose prose-invert max-w-none text-gray-100">
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                <p className="mb-4">
                  By inviting, using, or interacting with Skyfall Bot ("the Bot"), you agree to be bound by these Terms of Service ("Terms"). 
                  If you do not agree to these Terms, please do not use the Bot.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                <p className="mb-4">
                  Skyfall Bot is a Discord bot that provides moderation, music, utility, and entertainment features for Discord servers. 
                  The Bot includes features such as:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Server moderation tools (kick, ban, timeout, warnings)</li>
                  <li>Music playback and queue management</li>
                  <li>Ticket support system</li>
                  <li>Server analytics and statistics</li>
                  <li>Economy and leveling systems</li>
                  <li>Utility commands and server management</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
                <p className="mb-4">You agree to:</p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Use the Bot in compliance with Discord's Terms of Service and Community Guidelines</li>
                  <li>Not use the Bot for any illegal, harmful, or malicious activities</li>
                  <li>Not attempt to exploit, hack, or abuse the Bot's functionality</li>
                  <li>Not use the Bot to spam, harass, or violate others' rights</li>
                  <li>Respect the intellectual property rights of others when using music features</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">4. Data Collection and Privacy</h2>
                <p className="mb-4">
                  The Bot may collect and store certain data necessary for its functionality, including:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Server IDs, channel IDs, and user IDs</li>
                  <li>Message content for moderation purposes</li>
                  <li>User interaction data for commands and features</li>
                  <li>Server configuration settings</li>
                </ul>
                <p className="mb-4">
                  For detailed information about data handling, please refer to our Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">5. Availability and Reliability</h2>
                <p className="mb-4">
                  While we strive to maintain high availability, the Bot is provided "as is" without warranties of any kind. 
                  We do not guarantee uninterrupted service and reserve the right to modify, suspend, or discontinue the Bot at any time.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
                <p className="mb-4">
                  In no event shall Skyfall Bot or its developers be liable for any indirect, incidental, special, consequential, 
                  or punitive damages arising out of or relating to your use of the Bot.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">7. Termination</h2>
                <p className="mb-4">
                  We reserve the right to terminate or restrict access to the Bot for any user or server that violates these Terms 
                  or engages in harmful behavior.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
                <p className="mb-4">
                  We may update these Terms from time to time. Continued use of the Bot after changes constitutes acceptance of the new Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
                <p className="mb-4">
                  For questions about these Terms or the Bot, please contact us through our Discord server or GitHub repository.
                </p>
              </section>

            </div>
          </div>

          {/* Footer Navigation */}
          <div className="mt-12 text-center">
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              <a 
                href="/" 
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                ← Back to Dashboard
              </a>
              <a 
                href="/privacy" 
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="/about" 
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                About
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Skyfall Bot. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
