import { Link, Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="min-h-screen px-4 py-4 md:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col rounded-[2rem] border border-white/60 bg-white/30 shadow-[0_40px_120px_rgba(32,26,23,0.08)] backdrop-blur">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/50 px-6 py-5 md:px-8">
          <Link className="flex items-center gap-3" to="/">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-950 font-display text-lg text-stone-100">
              SF
            </div>
            <div>
              <p className="font-display text-xl text-ink-950">StudioFlow</p>
              <p className="text-sm text-ink-700">
                Service studio management platform
              </p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-ink-900">
            <Link
              className="rounded-full border border-ink-900/10 px-4 py-2 transition hover:border-rosewood-500/30 hover:bg-white/70"
              to="/login"
            >
              Login
            </Link>
            <Link
              className="rounded-full bg-ink-950 px-5 py-2 text-white transition hover:bg-rosewood-500"
              to="/register"
            >
              Start free
            </Link>
          </nav>
        </header>

        <main className="flex-1 px-6 py-8 md:px-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
