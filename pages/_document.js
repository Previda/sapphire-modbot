import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Content Security Policy */}
        <meta
          name="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: wss: ws:; media-src 'self' https: blob:; object-src 'none'; frame-src 'self' https:; worker-src 'self' blob:;"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        {/* Favicons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#8B5CF6" />
        
        {/* Meta tags */}
        <meta name="description" content="Sapphire Modbot - Advanced Discord server management dashboard" />
        <meta name="keywords" content="discord, bot, moderation, management, dashboard" />
        <meta name="author" content="Sapphire Modbot Team" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Sapphire Modbot Dashboard" />
        <meta property="og:description" content="Advanced Discord server management dashboard" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sapphire Modbot Dashboard" />
        <meta name="twitter:description" content="Advanced Discord server management dashboard" />
        <meta name="twitter:image" content="/og-image.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
