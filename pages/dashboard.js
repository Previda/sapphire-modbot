import Head from 'next/head'
import ModernSleekDashboard from '../components/ModernSleekDashboard';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard - Skyfall</title>
        <meta name="description" content="Modern Discord bot dashboard with sleek design" />
        <meta name="description" content="Modern Discord bot dashboard with glassmorphism design" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <ModernSleekDashboard />
    </>
  )
}
