import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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
