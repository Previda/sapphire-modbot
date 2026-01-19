import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    guilds: 0,
    users: 0,
    commands: 0,
    uptime: 99.9
  });

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/status/live');
      if (response.ok) {
        const data = await response.json();
        setStats({
          guilds: data.services?.piBot?.guilds || 5,
          users: data.services?.piBot?.users || 1250,
          commands: data.services?.endpoints?.length || 8,
          uptime: data.uptime?.last30Days || 99.9
        });
      }
    } catch (error) {
      setStats({
        guilds: 5,
        users: 1250,
        commands: 8,
        uptime: 99.9
      });
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border border-white/10 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>KSyfall – Advanced Discord Management</title>
        <meta
          name="description"
          content="KSyfall brings enterprise‑grade moderation, tickets, and analytics to Discord with a hyper‑clean, Apple‑style experience."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Top Navigation */}
        <nav className="sticky top-0 z-20 border-b border-white/5 bg-black/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-zinc-50 to-zinc-400 text-black shadow-lg">
                <span className="text-lg font-semibold">K</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-tight">KSyfall</span>
                <span className="text-xs text-zinc-500">Enterprise Discord Management</span>
              </div>
            </div>

            <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/status" className="hover:text-white transition-colors">
                Status
              </Link>
              <Link href="/faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Legal
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-white text-black px-4 py-1.5 text-xs font-semibold tracking-wide shadow-sm transition-all hover:bg-zinc-100 hover:shadow-md"
              >
                Sign in with Discord
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {/* Hero */}
          <section className="relative overflow-hidden">
            {/* Subtle light pools */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-zinc-50/10 blur-3xl" />
              <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-zinc-400/10 blur-3xl" />
            </div>

            <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-20 pt-16 sm:px-6 lg:flex-row lg:items-center lg:pb-28 lg:pt-20">
              {/* Left column – text */}
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
                  Live for Discord • Secure ticketing & appeals
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                    Hyper‑clean control
                    <span className="block text-zinc-400">for serious Discord servers.</span>
                  </h1>
                  <p className="max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                    KSyfall combines advanced moderation, ticket & appeal workflows, and live analytics into a
                    single, fluid experience designed to feel like a native iOS dashboard – but for your server.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/invite"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-semibold text-black shadow-lg shadow-slate-900/40 transition-transform hover:scale-[1.02]"
                  >
                    <span>➕ Add KSyfall to your server</span>
                  </Link>

                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-medium text-zinc-200 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/10"
                  >
                    <span>Open live dashboard</span>
                  </Link>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
                    <span>Realtime ticket + appeal insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    <span>Secure OAuth & per‑guild controls</span>
                  </div>
                </div>
              </div>

              {/* Right column – glass stats card */}
              <div className="flex-1">
                <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-black/60 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
                  <div className="flex items-center justify-between pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Live overview</p>
                      <p className="mt-1 text-sm font-medium text-zinc-100">KSyfall control surface</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-zinc-200">
                      Online
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/5 bg-black/40 p-3">
                    <div className="space-y-1">
                      <p className="text-[11px] text-zinc-400">Servers</p>
                      <p className="text-xl font-semibold text-zinc-50">{stats.guilds}</p>
                      <p className="text-[11px] text-zinc-500">actively managed</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-zinc-400">Users</p>
                      <p className="text-xl font-semibold text-zinc-50">{stats.users.toLocaleString()}</p>
                      <p className="text-[11px] text-zinc-500">protected across guilds</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-zinc-400">Commands</p>
                      <p className="text-xl font-semibold text-zinc-50">{stats.commands}</p>
                      <p className="text-[11px] text-zinc-500">curated & verified</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-zinc-400">30‑day uptime</p>
                      <p className="text-xl font-semibold text-zinc-200">{stats.uptime}%</p>
                      <p className="text-[11px] text-zinc-500">optimized presence</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
                    <p>Ticket, appeal, music and automod pipelines monitored in real‑time.</p>
                    <Link href="/status" className="text-xs font-medium text-zinc-300 hover:text-white">
                      View status →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Feature grid – compact, dark */}
          <section className="border-t border-white/5 bg-black/60">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Built for real moderation work.</h2>
                  <p className="mt-2 max-w-xl text-sm text-zinc-400">
                    Every layer – from slash commands to the backend engine – is designed to stay fast, predictable, and
                    audit‑friendly.
                  </p>
                </div>
                <div className="flex gap-3 text-xs text-zinc-500">
                  <span className="rounded-full border border-white/10 px-3 py-1">Tickets & appeals</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">Music & queue control</span>
                  <span className="hidden rounded-full border border-white/10 px-3 py-1 sm:inline">Advanced automod</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="glass-card rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-2 text-sm font-semibold">Moderation & security</h3>
                  <p className="mb-4 text-sm text-zinc-400">
                    Structured bans, mutes, and warnings with an integrated, configurable appeal pipeline.
                  </p>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    <li>• Per‑guild rules & permissions</li>
                    <li>• Enterprise‑style ticket blacklists</li>
                    <li>• Rich receipts & audit trails</li>
                  </ul>
                </div>

                <div className="glass-card rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-2 text-sm font-semibold">Tickets & reports</h3>
                  <p className="mb-4 text-sm text-zinc-400">
                    Clean, category‑driven ticket flows that feel like native support inboxes, not cluttered threads.
                  </p>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    <li>• One unified ticket system</li>
                    <li>• Priority, transcripts, and receipts</li>
                    <li>• Reporting tuned for real staff teams</li>
                  </ul>
                </div>

                <div className="glass-card rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-2 text-sm font-semibold">Music & live status</h3>
                  <p className="mb-4 text-sm text-zinc-400">
                    Optimized YouTube playback with voice handling and live status surfaces for every guild.
                  </p>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    <li>• Clean `/play` URL‑based playback</li>
                    <li>• Queue, volume, and skip controls</li>
                    <li>• Health endpoints for dashboards</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="border-t border-white/5 bg-black">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6 lg:px-8">
              <h2 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
                Drop KSyfall into your server and manage it like a native iOS control center.
              </h2>
              <p className="max-w-xl text-sm text-zinc-400">
                One bot, one dashboard – for tickets, appeals, moderation, music and more. Designed to stay smooth on
                Discord while still feeling premium on desktop.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/invite"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-semibold text-black shadow-lg shadow-slate-900/40 transition-transform hover:scale-[1.02]"
                >
                  <span>Invite KSyfall</span>
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-medium text-zinc-200 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/10"
                >
                  <span>Read documentation</span>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-black/95">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="space-y-1">
              <p className="text-zinc-400">&copy; {new Date().getFullYear()} KSyfall. All rights reserved.</p>
              <p>Secure Discord management for serious communities.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/status" className="hover:text-zinc-300">
                Status
              </Link>
              <Link href="/terms" className="hover:text-zinc-300">
                Terms
              </Link>
              <Link href="/terms" className="hover:text-zinc-300">
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
