import '../styles/globals.css'
import '../styles/premium-animations.css'
import '../styles/animations.css'
import { SessionProvider } from 'next-auth/react'
import ErrorBoundary from '../components/ErrorBoundary'
import { useState, useEffect } from 'react'

// NoSSR wrapper to prevent hydration issues
function NoSSR({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return children;
}

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <NoSSR>
      <ErrorBoundary>
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </ErrorBoundary>
    </NoSSR>
  )
}

// Disable SSR to prevent hydration mismatches
MyApp.getInitialProps = async () => {
  return { pageProps: {} };
};

export default MyApp
