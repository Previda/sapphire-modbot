import Link from 'next/link';

export default function TopNav({ active }) {
  const linkClass = (key) =>
    `text-sm ${active === key ? 'text-white font-medium' : 'text-zinc-400'} hover:text-white transition-colors`;

  return (
    <nav className="sticky top-0 z-20 border-b border-white/5 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-400 text-black shadow-lg">
            <span className="text-lg font-semibold">S</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">Skyfall</span>
            <span className="text-xs text-zinc-500">Enterprise Discord Management</span>
          </div>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/dashboard" className={linkClass('dashboard')}>
            Dashboard
          </Link>
          <Link href="/status" className={linkClass('status')}>
            Status
          </Link>
          <Link href="/faq" className={linkClass('faq')}>
            FAQ
          </Link>
          <Link href="/terms" className={linkClass('terms')}>
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
  );
}
