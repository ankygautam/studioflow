import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { navigationItems, type NavigationItem } from '../../data/navigation'
import { canAccessRoute, canCreateBookings, canManageSettings } from '../../features/auth/authorization'
import { useAuth } from '../../features/auth/use-auth'

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const showNewBooking = user ? canCreateBookings(user.role) : false

  const initials =
    user?.fullName
      .split(' ')
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase())
      .join('') ?? 'SF'

  const roleLabel = user?.role ? capitalize(user.role) : 'Admin'

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f8fc_0%,#eef2f7_100%)] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[292px] border-r border-white/5 bg-[#0d1321] px-5 py-5 shadow-[24px_0_80px_rgba(6,10,20,0.35)] lg:block">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileNavOpen ? (
          <>
            <motion.button
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              type="button"
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[320px] border-r border-white/8 bg-[#0d1321] px-5 py-5 shadow-[24px_0_80px_rgba(6,10,20,0.45)] lg:hidden"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="min-h-screen lg:pl-[292px]">
        <header className="sticky top-0 z-20 p-3 md:p-4">
          <div className="rounded-[28px] border border-white/70 bg-white/88 px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-white lg:hidden"
                onClick={() => setMobileNavOpen(true)}
                type="button"
              >
                <ShellIcon icon="menu" />
              </button>

              <label className="order-1 flex min-w-0 basis-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] md:order-none md:flex-1 md:basis-auto">
                <ShellIcon icon="search" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder="Search bookings, clients, staff, or services"
                />
              </label>

              <div className="flex min-w-0 flex-1 items-center justify-end gap-3 md:flex-none">
                <button className="hidden h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white md:inline-flex">
                  {user?.businessName ?? 'Atelier North'}
                  <ShellIcon icon="chevron" />
                </button>

                <button className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-white">
                  <ShellIcon icon="bell" />
                  <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-[#7c89ff]" />
                </button>

                <button className="hidden h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-left transition hover:border-slate-300 hover:bg-white sm:inline-flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#b7d9ff,#b5ead8)] text-sm font-semibold text-slate-950">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {user?.fullName ?? 'A. North'}
                    </p>
                    <p className="text-xs text-slate-500">{roleLabel}</p>
                  </div>
                  <ShellIcon icon="chevron" />
                </button>

                <button
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  type="button"
                >
                  <ShellIcon icon="logout" />
                  <span>Logout</span>
                </button>

                {showNewBooking ? (
                  <button
                    className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#0f172a] px-4 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.2)] transition hover:bg-slate-800 sm:px-5"
                    onClick={() => navigate('/calendar?newBooking=1')}
                    type="button"
                  >
                    <ShellIcon icon="plus" />
                    <span className="hidden sm:inline">New Booking</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="px-3 pb-3 md:px-4 md:pb-4">
          <div className="min-h-[calc(100vh-5.75rem)] rounded-[32px] border border-slate-200/80 bg-[#fbfcfe] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.06)] md:p-6 xl:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const initials =
    user?.fullName
      .split(' ')
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase())
      .join('') ?? 'SF'

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 rounded-[26px] px-2 py-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold text-white">
          SF
        </div>
        <div>
          <p className="font-display text-[1.7rem] leading-none text-white">StudioFlow</p>
          <p className="mt-1 text-sm text-slate-400">Control center</p>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-slate-300">
        A premium operations workspace for appointments, staff coordination,
        clients, payments, and studio performance.
      </div>

      <nav className="mt-6 flex-1 space-y-2 overflow-y-auto pr-1">
        {navigationItems
          .filter((item) => (user ? canAccessRoute(user.role, item.slug) : true))
          .map((item) => (
          <NavLink
            key={item.slug}
            onClick={onNavigate}
            to={`/${item.slug}`}
          >
            {({ isActive }) => (
              <motion.span
                className={[
                  'flex w-full items-start gap-3 rounded-[26px] border px-4 py-3 transition',
                  isActive
                    ? 'border-slate-200 bg-white text-slate-950 shadow-[0_18px_40px_rgba(15,23,42,0.22)]'
                    : 'border-transparent text-slate-300 hover:bg-white/6 hover:text-white',
                ].join(' ')}
                whileHover={{ x: isActive ? 0 : 2 }}
              >
                <span
                  className={[
                    'mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border',
                    isActive
                      ? 'border-slate-200 bg-slate-100 text-slate-900'
                      : 'border-white/10 bg-white/5',
                  ].join(' ')}
                >
                  <ShellIcon icon={item.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span
                    className={[
                      'mt-1 block text-sm leading-6',
                      isActive ? 'text-slate-600' : 'text-slate-400',
                    ].join(' ')}
                  >
                    {item.description}
                  </span>
                </span>
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 rounded-[28px] border border-white/8 bg-white/4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#cdd7ff,#b5ead8)] text-sm font-semibold text-slate-950">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{user?.fullName ?? 'Studio profile'}</p>
            <p className="text-xs text-slate-400">
              {user?.email ?? 'Settings and workflow controls'}
            </p>
          </div>
        </div>
        {user && canManageSettings(user.role) ? (
          <button
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            onClick={() => {
              navigate('/settings')
              onNavigate?.()
            }}
            type="button"
          >
            <ShellIcon icon="settings" />
            Open settings
          </button>
        ) : null}
        <button
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/6 hover:text-white"
          onClick={() => {
            logout()
            navigate('/login')
            onNavigate?.()
          }}
          type="button"
        >
          <ShellIcon icon="logout" />
          Sign out
        </button>
      </div>
    </div>
  )
}

function ShellIcon({ icon }: { icon: NavigationItem['icon'] | 'bell' | 'chevron' | 'logout' | 'menu' | 'plus' | 'search' | 'settings' }) {
  const common = 'h-5 w-5'

  switch (icon) {
    case 'dashboard':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="M4 5h7v7H4zM13 5h7v5h-7zM13 12h7v7h-7zM4 14h7v5H4z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      )
    case 'calendar':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 3.5v3M16 3.5v3M4 9.5h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )
    case 'appointments':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <rect x="5" y="4.5" width="14" height="15" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )
    case 'clients':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3.5 19c.9-2.8 3.1-4.5 5.5-4.5S13.6 16.2 14.5 19M14.5 18.5c.7-1.9 2.1-3 3.9-3 1.1 0 2.1.4 3.1 1.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )
    case 'staff':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5 19c1.1-3.1 3.8-5 7-5s5.9 1.9 7 5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )
    case 'services':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 9h8M8 13h5M15.5 13h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )
    case 'payments':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <rect x="3.5" y="6" width="17" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3.5 10h17M8 14h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )
    case 'consent':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="M8 3.5h6l4 4V19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M14 3.5v4h4M9 12h6M9 16h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )
    case 'analytics':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="M4 19.5h16M7 16V10M12 16V6M17 16v-3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )
    case 'settings':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="m12 3 1.2 2.7 3 .5-.8 2.9 2 2-2 2 .8 2.9-3 .5L12 21l-1.2-2.7-3-.5.8-2.9-2-2 2-2-.8-2.9 3-.5L12 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      )
    case 'search':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )
    case 'bell':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="M7 10a5 5 0 1 1 10 0v4l1.5 2H5.5L7 14v-4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )
    case 'chevron':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="m8 10 4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      )
    case 'logout':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="M10 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="m14 8 5 4-5 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M19 12H9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )
    case 'menu':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )
    case 'plus':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )
  }
}

export function SurfaceCard({
  action,
  children,
  className = '',
  title,
}: {
  action?: ReactNode
  children: ReactNode
  className?: string
  title: string
}) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[28px] border border-slate-200/90 bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.05)] md:p-6 ${className}`}
      initial={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.28 }}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-display text-[1.45rem] leading-none text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </motion.section>
  )
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
