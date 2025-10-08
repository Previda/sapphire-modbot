import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import ErrorBoundary from '../components/ErrorBoundary'
import { useEffect } from 'react'

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  // Prevent hydration issues
  useEffect(() => {
    // Remove any SSR-only styles
    const ssrStyles = document.querySelectorAll('[data-emotion]');
    ssrStyles.forEach(style => style.remove());
  }, []);

  return (
    <ErrorBoundary>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </ErrorBoundary>
  )
}

// Disable SSR for this app to prevent hydration issues
MyApp.getInitialProps = async () => {
  return { pageProps: {} };
};

export default MyApp
