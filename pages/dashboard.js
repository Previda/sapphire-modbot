import Head from 'next/head'
import ModernGlassDashboard from '../components/ModernGlassDashboard'

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard - Skyfall</title>
        <meta name="description" content="Modern Discord bot dashboard with glassmorphism design" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <ModernGlassDashboard />
    </>
  )
}
