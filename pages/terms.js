import Head from 'next/head';
import Link from 'next/link';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service - Skyfall Discord Management</title>
        <meta name="description" content="Terms of Service for Skyfall Discord Management System" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
                <div className="h-10 w-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-white">S</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Skyfall</h1>
                  <p className="text-xs text-gray-400">Discord Management</p>
                </div>
              </Link>

              <nav className="flex items-center space-x-6">
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/status" className="text-gray-300 hover:text-white transition-colors">
                  Status
                </Link>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
                <Link href="/terms" className="text-white font-medium">
                  Terms
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using Skyfall Discord Management
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Terms Content */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-8 space-y-8">
              
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-3">📋</span>
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  By accessing and using Skyfall Discord Management, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-3">🔐</span>
                  2. Service Description
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Skyfall provides Discord server management tools including but not limited to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Automated moderation commands and tools</li>
                  <li>Server analytics and monitoring dashboard</li>
                  <li>Command management and customization</li>
                  <li>Appeal and ticket management systems</li>
                  <li>Real-time operational status monitoring</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-3">👤</span>
                  3. User Responsibilities
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  As a user of Skyfall, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Use the service in compliance with Discord&apos;s Terms of Service</li>
                  <li>Not use the service for any illegal or unauthorized purpose</li>
                  <li>Not attempt to gain unauthorized access to the service or its systems</li>
                  <li>Respect the rights and privacy of other users</li>
                  <li>Report any bugs or security vulnerabilities responsibly</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-3">🛡️</span>
                  4. Privacy and Data Protection
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We are committed to protecting your privacy:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>We only collect data necessary for service operation</li>
                  <li>All data is encrypted in transit and at rest</li>
                  <li>We never access private Discord messages</li>
                  <li>User data is not sold or shared with third parties</li>
                  <li>You can request data deletion at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-3">⚖️</span>
                  5. Limitation of Liability
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Skyfall is provided &quot;as is&quot; without any warranties, expressed or implied. We shall not be liable for any damages arising from the use or inability to use the service, including but not limited to direct, indirect, incidental, punitive, and consequential damages.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-3">🔄</span>
                  6. Service Availability
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. Scheduled maintenance will be announced in advance when possible. We reserve the right to modify or discontinue the service with reasonable notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-3">📝</span>
                  7. Modifications to Terms
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right to modify these terms at any time. Users will be notified of significant changes through the dashboard or email. Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-3">🌐</span>
                  8. Governing Law
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  These terms are governed by applicable laws. Any disputes will be resolved through binding arbitration. If any provision of these terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-3">📞</span>
                  9. Contact Information
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us through the dashboard support system or visit our FAQ page for common questions.
                </p>
              </section>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Ready to get started?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  Access Dashboard
                </Link>
                <Link
                  href="/faq"
                  className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200"
                >
                  View FAQ
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-400">
              <p>&copy; 2024 Skyfall Discord Management. All rights reserved.</p>
              <p className="mt-2">Professional Discord server management made simple.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
