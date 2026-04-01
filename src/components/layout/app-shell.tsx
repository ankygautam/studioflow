import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { navigationItems, type NavigationItem } from '../../data/navigation'
import { canAccessRoute, canCreateBookings, canManageSettings } from '../../features/auth/authorization'
import { useAuth } from '../../features/auth/use-auth'
import { useNotifications } from '../../hooks/use-notifications'
import { useRemoteList } from '../../hooks/use-remote-list'
import { getLocations } from '../../lib/api/locations-api'
import { formatRelativeTime, humanizeEnum } from '../../lib/formatters'

// ─── Brand tokens ────────────────────────────────────────────────────────────
// Primary: deep violet  Secondary: electric indigo  Accents: teal, amber, rose
const SIDEBAR_BG = '#16123a'          // deep navy-violet
const SIDEBAR_W  = '220px'

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const navigate = useNavigate()
  const { selectedLocationId, setSelectedLocationId, user } = useAuth()
  const showNewBooking = user ? canCreateBookings(user.role) : false

  const loadLocations = useCallback(
    () => getLocations(user?.studioId, true),
    [user?.studioId],
  )
  const { data: locations } = useRemoteList(loadLocations)
  const {
    error: notificationsError,
    isLoading: notificationsLoading,
    markAllRead,
    markRead,
    notifications,
    refresh: refreshNotifications,
    unreadCount,
  } = useNotifications(Boolean(user))

  const initials =
    user?.fullName
      .split(' ')
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') ?? 'SF'

  const roleLabel = user?.role === 'admin' ? 'Owner' : user?.role ? capitalize(user.role) : 'Owner'
  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedLocationId) ?? null,
    [locations, selectedLocationId],
  )

  useEffect(() => {
    if (!locations.length) return
    if (!selectedLocationId || !locations.some((l) => l.id === selectedLocationId)) {
      setSelectedLocationId(locations[0].id)
    }
  }, [locations, selectedLocationId, setSelectedLocationId])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ── Desktop sidebar ── */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col"
        style={{ width: SIDEBAR_W, background: SIDEBAR_BG }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar ── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.button
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              type="button"
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden"
              style={{ width: '88vw', maxWidth: '280px', background: SIDEBAR_BG }}
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
            >
              <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="min-h-screen" style={{ paddingLeft: `var(--sidebar-offset, 0px)` }}>
        <style>{`@media(min-width:1024px){:root{--sidebar-offset:${SIDEBAR_W}}}`}</style>

        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
          {/* Mobile menu */}
          <button
            aria-label="Open navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            type="button"
          >
            <ShellIcon icon="menu" />
          </button>

          {/* Search */}
          <label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 hover:border-slate-300 md:max-w-xs">
            <ShellIcon icon="search" />
            <input
              className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Search…"
            />
          </label>

          <div className="ml-auto flex items-center gap-2">
            {/* Location picker */}
            <label className="relative hidden md:block">
              <select
                className="h-12 min-w-[180px] appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-11 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-300 focus:bg-white"
                onChange={(e) => setSelectedLocationId(e.target.value || null)}
                value={selectedLocationId ?? ''}
              >
                {!locations.length && <option value="">No locations</option>}
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">
                <ShellIcon icon="chevron" />
              </span>
            </label>

            {/* Notifications */}
            <div className="relative">
              <button
                aria-label="Notifications"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  const next = !notificationsOpen
                  setNotificationsOpen(next)
                  if (next) void refreshNotifications()
                }}
                type="button"
              >
                <ShellIcon icon="bell" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <motion.button
                      aria-label="Close notifications"
                      className="fixed inset-0 z-30"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setNotificationsOpen(false)}
                      type="button"
                    />
                    <motion.div
                      className="absolute right-0 top-[calc(100%+8px)] z-40 w-[min(92vw,360px)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                            onClick={() => void markAllRead()}
                            type="button"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="mt-3 space-y-2">
                        {notificationsLoading && (
                          <p className="rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-500">Loading…</p>
                        )}
                        {!notificationsLoading && notificationsError && (
                          <p className="rounded-xl bg-rose-50 px-4 py-4 text-sm text-rose-700">{notificationsError}</p>
                        )}
                        {!notificationsLoading && !notificationsError && notifications.length === 0 && (
                          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-400">
                            You're all caught up!
                          </p>
                        )}
                        {!notificationsLoading && !notificationsError && notifications.map((n) => (
                          <button
                            key={n.id}
                            className={[
                              'w-full rounded-xl border px-4 py-3 text-left text-sm transition',
                              n.isRead
                                ? 'border-slate-100 bg-slate-50'
                                : 'border-violet-200 bg-violet-50',
                            ].join(' ')}
                            onClick={async () => {
                              if (!n.isRead) await markRead(n.id)
                              setNotificationsOpen(false)
                              if (n.actionUrl) navigate(n.actionUrl)
                            }}
                            type="button"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-slate-900">{n.title}</p>
                              {!n.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-500" />}
                            </div>
                            <p className="mt-1 text-slate-500">{n.message}</p>
                            <div className="mt-2 flex justify-between text-xs text-slate-400">
                              <span>{humanizeEnum(n.type)}</span>
                              <span>{formatRelativeTime(n.createdAt)}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User chip */}
            <button
              className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 sm:inline-flex"
              type="button"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                {initials}
              </span>
              <span className="font-medium text-slate-800">{user?.fullName ?? 'You'}</span>
              <span className="text-xs text-slate-400">{selectedLocation?.name ?? roleLabel}</span>
            </button>

            {/* New booking */}
            {showNewBooking && (
              <button
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
                onClick={() => navigate('/calendar?newBooking=1')}
                type="button"
              >
                <ShellIcon icon="plus" />
                <span className="hidden sm:inline">New booking</span>
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const initials =
    user?.fullName
      .split(' ')
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') ?? 'SF'

  return (
    <div className="flex h-full flex-col px-3 py-4">
      {/* Logo */}
      <div className="mb-5 flex items-center gap-2.5 px-2">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white"
          style={{ background: 'linear-gradient(135deg,#7c5af6,#4f8ef7)' }}
        >
          S
        </div>
        <span className="text-lg font-bold tracking-tight text-white">StudioFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {navigationItems
          .filter((item) => (user ? canAccessRoute(user.role, item.slug) : true))
          .map((item) => (
            <NavLink key={item.slug} to={`/${item.slug}`} onClick={onNavigate}>
              {({ isActive }) => (
                <span
                  className={[
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:bg-white/8 hover:text-white',
                  ].join(' ')}
                  style={isActive ? {
                    background: 'linear-gradient(90deg,rgba(124,90,246,0.35),rgba(79,142,247,0.18))',
                    boxShadow: 'inset 3px 0 0 #7c5af6',
                  } : undefined}
                >
                  <span className={[
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                    isActive ? 'bg-violet-500/20 text-violet-300' : 'text-slate-500',
                  ].join(' ')}>
                    <ShellIcon icon={item.icon} />
                  </span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                      {item.eyebrow}
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          ))}
      </nav>

      {/* Footer */}
      <div className="mt-4 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="mb-3 flex items-center gap-2.5 rounded-lg px-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.fullName ?? 'Studio'}</p>
            <p className="truncate text-xs text-slate-500">{user?.email ?? ''}</p>
          </div>
        </div>

        {user && canManageSettings(user.role) && (
          <button
            className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/8 hover:text-white"
            onClick={() => { navigate('/settings'); onNavigate?.() }}
            type="button"
          >
            <ShellIcon icon="settings" />
            Settings
          </button>
        )}
        <button
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
          onClick={() => { logout(); navigate('/login'); onNavigate?.() }}
          type="button"
        >
          <ShellIcon icon="logout" />
          Sign out
        </button>
      </div>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ShellIcon({ icon }: { icon: NavigationItem['icon'] | 'bell' | 'chevron' | 'logout' | 'menu' | 'plus' | 'search' | 'settings' }) {
  const cls = 'h-4 w-4'
  switch (icon) {
    case 'dashboard':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><path d="M4 5h7v7H4zM13 5h7v5h-7zM13 12h7v7h-7zM4 14h7v5H4z" stroke="currentColor" strokeWidth="1.8"/></svg>
    case 'calendar':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M8 3.5v3M16 3.5v3M4 9.5h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>
    case 'appointments':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><rect x="5" y="4.5" width="14" height="15" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>
    case 'clients':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.8"/><circle cx="17" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8"/><path d="M3.5 19c.9-2.8 3.1-4.5 5.5-4.5S13.6 16.2 14.5 19M14.5 18.5c.7-1.9 2.1-3 3.9-3 1.1 0 2.1.4 3.1 1.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>
    case 'services':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M8 9h8M8 13h5M15.5 13h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>
    case 'payments':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><rect x="3.5" y="6" width="17" height="12" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M3.5 10h17M8 14h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>
    case 'consent':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><path d="M8 3.5h6l4 4V19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8"/><path d="M14 3.5v4h4M9 12h6M9 16h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>
    case 'analytics':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><path d="M4 19.5h16M7 16V10M12 16V6M17 16v-3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>
    case 'audit':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><path d="M12 3.5 5 6.5V12c0 4 2.5 6.7 7 8.5 4.5-1.8 7-4.5 7-8.5V6.5l-7-3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8"/><path d="M9.5 11.8 11.3 13.6l3.4-3.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"/></svg>
    case 'settings':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><path d="m12 3 1.2 2.7 3 .5-.8 2.9 2 2-2 2 .8 2.9-3 .5L12 21l-1.2-2.7-3-.5.8-2.9-2-2 2-2-.8-2.9 3-.5L12 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>
    case 'search':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8"/><path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>
    case 'bell':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><path d="M7 10a5 5 0 1 1 10 0v4l1.5 2H5.5L7 14v-4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8"/><path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>
    case 'chevron':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><path d="m8 10 4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"/></svg>
    case 'logout':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><path d="M10 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/><path d="m14 8 5 4-5 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"/><path d="M19 12H9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>
    case 'menu':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>
    case 'plus':
      return <svg className={cls} fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>
  }
}

// ─── SurfaceCard ──────────────────────────────────────────────────────────────

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
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 ${className}`}
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </motion.section>
  )
}

function capitalize(v: string) {
  return v.charAt(0).toUpperCase() + v.slice(1)
}
