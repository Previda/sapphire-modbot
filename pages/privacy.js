import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function PrivacyPolicy() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Privacy Policy • Skyfall Bot</title>
        <meta name="description" content="Privacy Policy for Skyfall Discord Bot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1l3.09 6.26L22 9l-5 4.87L18.18 21 12 17.77 5.82 21 7 13.87 2 9l6.91-1.74L12 1z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-300 text-lg">Skyfall Discord Bot</p>
            <p className="text-gray-400 mt-2">Last Updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="prose prose-invert max-w-none text-gray-100">
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                <p className="mb-4">
                  Skyfall Bot collects and processes the following types of information to provide its services:
                </p>
                
                <h3 className="text-xl font-semibold text-white mb-3">Automatically Collected Data</h3>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li><strong>Discord IDs:</strong> Server IDs, channel IDs, user IDs, and role IDs</li>
                  <li><strong>Message Data:</strong> Message content for moderation and command processing</li>
                  <li><strong>User Interactions:</strong> Command usage, button clicks, and bot interactions</li>
                  <li><strong>Server Information:</strong> Server settings, member counts, and channel structures</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">User-Provided Data</h3>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li><strong>Configuration Settings:</strong> Bot settings and preferences you configure</li>
                  <li><strong>Support Tickets:</strong> Information you provide in support requests</li>
                  <li><strong>Music Requests:</strong> Songs and playlists you request through the bot</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                <p className="mb-4">We use the collected information for the following purposes:</p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li><strong>Core Functionality:</strong> Providing moderation, music, and utility features</li>
                  <li><strong>Security:</strong> Detecting and preventing abuse, spam, and violations</li>
                  <li><strong>Analytics:</strong> Understanding usage patterns to improve the bot</li>
                  <li><strong>Support:</strong> Providing customer support and troubleshooting</li>
                  <li><strong>Compliance:</strong> Meeting legal obligations and Discord's requirements</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">3. Data Storage and Security</h2>
                <p className="mb-4">
                  We implement appropriate technical and organizational measures to protect your data:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li><strong>Encryption:</strong> Data is encrypted in transit and at rest</li>
                  <li><strong>Access Control:</strong> Limited access to authorized personnel only</li>
                  <li><strong>Retention:</strong> Data is retained only as long as necessary for service provision</li>
                  <li><strong>Backups:</strong> Regular backups with appropriate security measures</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">4. Data Sharing and Disclosure</h2>
                <p className="mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties, except:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li><strong>Service Providers:</strong> Trusted partners who assist in bot operations</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                  <li><strong>Discord API:</strong> Necessary data sharing through Discord's API for functionality</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights and Choices</h2>
                <p className="mb-4">You have the following rights regarding your data:</p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li><strong>Access:</strong> Request information about data we have collected about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate personal information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a structured format</li>
                  <li><strong>Opt-out:</strong> Remove the bot from your server to stop data collection</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
                <p className="mb-4">
                  We retain different types of data for varying periods:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li><strong>Command Logs:</strong> 30 days for debugging and analytics</li>
                  <li><strong>Moderation Actions:</strong> 1 year for appeal and audit purposes</li>
                  <li><strong>Server Configurations:</strong> Until the bot is removed from the server</li>
                  <li><strong>Support Tickets:</strong> 1 year after resolution</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">7. Third-Party Services</h2>
                <p className="mb-4">
                  The bot may integrate with third-party services for enhanced functionality:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li><strong>YouTube API:</strong> For music search and playback features</li>
                  <li><strong>Spotify API:</strong> For playlist and music information</li>
                  <li><strong>Analytics Services:</strong> For usage statistics and performance monitoring</li>
                </ul>
                <p className="mb-4">
                  These services have their own privacy policies and terms of service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
                <p className="mb-4">
                  The bot is not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13. If we become aware of such collection, 
                  we will take steps to delete the information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
                <p className="mb-4">
                  We may update this Privacy Policy from time to time. We will notify users of significant 
                  changes through the bot or our support channels. Continued use of the bot after changes 
                  constitutes acceptance of the updated policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
                <p className="mb-4">
                  If you have questions about this Privacy Policy or want to exercise your rights, 
                  please contact us through:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Our Discord support server</li>
                  <li>GitHub repository issues</li>
                  <li>The bot's support commands</li>
                </ul>
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
                href="/terms" 
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Terms of Service
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
