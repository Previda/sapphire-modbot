import Head from 'next/head'
import EnhancedDashboard from '../components/EnhancedDashboard';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard - Skyfall</title>
        <meta name="description" content="Modern Discord bot dashboard with sleek design" />
        <meta name="description" content="Modern Discord bot dashboard with glassmorphism design" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <EnhancedDashboard />
    </>
  )
}
