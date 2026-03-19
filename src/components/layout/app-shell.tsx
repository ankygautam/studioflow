import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  appRoleMeta,
  roleNavigation,
  type AppRole,
  type NavItem,
} from '../../data/navigation'

type AppShellProps = {
  role: AppRole
}

export function AppShell({ role }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const meta = appRoleMeta[role]
  const navigation = roleNavigation[role]

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#eef2f7_100%)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-24 border-r border-white/10 bg-[#0f1728] px-4 py-6 text-slate-200 shadow-[20px_0_60px_rgba(15,23,40,0.18)] md:flex xl:w-72 xl:px-5">
        <SidebarContent navigation={navigation} role={role} />
      </aside>

      {mobileNavOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm md:hidden"
          onClick={() => setMobileNavOpen(false)}
          type="button"
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-80 max-w-[86vw] border-r border-white/10 bg-[#0f1728] px-5 py-6 text-slate-200 shadow-[20px_0_60px_rgba(15,23,40,0.18)] transition-transform duration-300 md:hidden',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <SidebarContent
          navigation={navigation}
          onNavigate={() => setMobileNavOpen(false)}
          role={role}
        />
      </aside>

      <div className="min-h-screen md:pl-24 xl:pl-72">
        <header className="sticky top-0 z-20 px-3 pt-3 md:px-4 md:pt-4">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/92 px-4 py-4 shadow-[0_14px_40px_rgba(15,23,40,0.08)] backdrop-blur md:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
                onClick={() => setMobileNavOpen((open) => !open)}
                type="button"
              >
                <ShellIcon icon="menu" />
              </button>

              <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <ShellIcon icon="search" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="Search bookings, clients, staff, or services"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="hidden h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white md:inline-flex"
                  type="button"
                >
                  Atelier North
                  <ShellIcon icon="chevron" />
                </button>

                <button
                  className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-white"
                  type="button"
                >
                  <ShellIcon icon="bell" />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rosewood-500" />
                </button>

                <button
                  className="hidden h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-left transition hover:border-slate-300 hover:bg-white sm:inline-flex"
                  type="button"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#9ed7d2,#a8c6f1)] font-display text-sm text-ink-950">
                    AN
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">A. North</p>
                    <p className="text-xs text-slate-500">{meta.label}</p>
                  </div>
                  <ShellIcon icon="chevron" />
                </button>

                <button
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,40,0.2)] transition hover:bg-slate-800"
                  type="button"
                >
                  <ShellIcon icon="plus" />
                  <span className="hidden sm:inline">New Booking</span>
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4">
              <div>
                <p className="font-display text-2xl text-ink-950">{meta.label}</p>
                <p className="text-sm text-slate-500">
                  Premium StudioFlow workspace with responsive operational
                  navigation.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {['Today', 'This week', 'All staff'].map((chip) => (
                  <button
                    key={chip}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white"
                    type="button"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="p-3 md:p-4">
          <div className="min-h-[calc(100vh-7.5rem)] rounded-[2rem] border border-slate-200/70 bg-[#fbfcff] p-4 shadow-[0_20px_60px_rgba(15,23,40,0.06)] md:p-6 xl:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

type SidebarContentProps = {
  navigation: NavItem[]
  onNavigate?: () => void
  role: AppRole
}

function SidebarContent({
  navigation,
  onNavigate,
  role,
}: SidebarContentProps) {
  const meta = appRoleMeta[role]

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 xl:px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 font-display text-lg text-white">
          SF
        </div>
        <div className="hidden xl:block">
          <p className="font-display text-2xl text-white">StudioFlow</p>
          <p className="text-sm text-slate-400">{meta.badge}</p>
        </div>
      </div>

      <div className="mt-8 hidden rounded-[1.5rem] border border-white/8 bg-white/4 p-4 text-sm leading-6 text-slate-300 xl:block">
        {meta.summary}
      </div>

      <nav className="mt-8 flex-1 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={`${item.label}-${item.to}`}
            end={item.exact}
            onClick={onNavigate}
            to={item.to}
          >
            {({ isActive }) => (
              <span
                className={[
                  'group flex w-full items-center gap-3 rounded-2xl px-3 py-3 transition duration-200 xl:px-4',
                  isActive
                    ? 'border border-slate-200 bg-white text-slate-950 shadow-[0_14px_34px_rgba(15,23,40,0.24)]'
                    : 'text-slate-300 hover:bg-white/6 hover:text-white',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition',
                    isActive
                      ? 'border-slate-200 bg-slate-100 text-slate-900'
                      : 'border-current/10 bg-current/5',
                  ].join(' ')}
                >
                  <ShellIcon icon={item.icon} />
                </span>
                <span className="hidden min-w-0 xl:block">
                  <span
                    className={[
                      'block font-semibold',
                      isActive ? 'text-slate-950' : '',
                    ].join(' ')}
                  >
                    {item.label}
                  </span>
                  <span
                    className={[
                      'mt-0.5 block truncate text-xs',
                      isActive ? 'text-slate-600 opacity-100' : 'opacity-70',
                    ].join(' ')}
                  >
                    {item.description}
                  </span>
                </span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-white/4 p-3 xl:p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8fd0c7,#cdbcf1)] font-display text-sm text-slate-950">
            SF
          </div>
          <div className="hidden xl:block">
            <p className="text-sm font-semibold text-white">Studio profile</p>
            <p className="text-xs text-slate-400">Settings and account controls</p>
          </div>
        </div>
        <button
          className="mt-3 hidden w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 xl:inline-flex"
          type="button"
        >
          <ShellIcon icon="settings" />
          Open settings
        </button>
      </div>
    </div>
  )
}

type ShellIconName =
  | 'analytics'
  | 'appointments'
  | 'bell'
  | 'calendar'
  | 'chevron'
  | 'clients'
  | 'consent'
  | 'dashboard'
  | 'menu'
  | 'payments'
  | 'plus'
  | 'search'
  | 'services'
  | 'settings'
  | 'staff'

function ShellIcon({ icon }: { icon: ShellIconName }) {
  const common = 'h-5 w-5'

  switch (icon) {
    case 'dashboard':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M4 5.5C4 4.67 4.67 4 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4ZM13 5.5c0-.83.67-1.5 1.5-1.5h4c.83 0 1.5.67 1.5 1.5v4c0 .83-.67 1.5-1.5 1.5h-4A1.5 1.5 0 0 1 13 9.5v-4ZM4 14.5c0-.83.67-1.5 1.5-1.5h4c.83 0 1.5.67 1.5 1.5v4c0 .83-.67 1.5-1.5 1.5h-4A1.5 1.5 0 0 1 4 18.5v-4ZM13 14.5c0-.83.67-1.5 1.5-1.5h4c.83 0 1.5.67 1.5 1.5v4c0 .83-.67 1.5-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'calendar':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M7 3v3M17 3v3M4 9h16M6.2 5.5h11.6c.94 0 1.7.76 1.7 1.7v10.6c0 .94-.76 1.7-1.7 1.7H6.2a1.7 1.7 0 0 1-1.7-1.7V7.2c0-.94.76-1.7 1.7-1.7Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'appointments':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M7 6.5h10M7 12h10M7 17.5h6M4.8 20h14.4c.99 0 1.8-.8 1.8-1.8V5.8c0-.99-.81-1.8-1.8-1.8H4.8C3.8 4 3 4.81 3 5.8v12.4c0 .99.8 1.8 1.8 1.8Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'clients':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M8 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM16.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM4 19c0-2.76 2.69-5 6-5s6 2.24 6 5M15 18.5c.4-1.82 2.12-3.2 4.18-3.45"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'staff':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0M19 8h2M20 7v2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'services':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="m5 7 5 5m0-5-5 5m8-4h6m-6 5h6M5.8 19.5h12.4c1 0 1.8-.8 1.8-1.8V6.3c0-1-.8-1.8-1.8-1.8H5.8C4.8 4.5 4 5.3 4 6.3v11.4c0 1 .8 1.8 1.8 1.8Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'payments':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9ZM4 9h16M16 14h2.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'consent':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M8 4.5h6l4 4v10.7c0 .72-.58 1.3-1.3 1.3H8a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2ZM14 4.5v4h4M9 13h6M9 17h4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'analytics':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M4 19.5h16M7.5 16v-5M12 16V9M16.5 16V6.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'settings':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6ZM19.2 13.1a1 1 0 0 0 .2 1.1l.1.1a1.9 1.9 0 0 1 0 2.7l-.2.2a1.9 1.9 0 0 1-2.7 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9v.3A1.9 1.9 0 0 1 12.9 21h-1.8a1.9 1.9 0 0 1-1.9-1.9v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.2.1a1.9 1.9 0 0 1-2.6 0l-.2-.2a1.9 1.9 0 0 1 0-2.7l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6h-.3A1.9 1.9 0 0 1 2 12.9v-1.8a1.9 1.9 0 0 1 1.9-1.9h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.2a1.9 1.9 0 0 1 0-2.6l.2-.2a1.9 1.9 0 0 1 2.7 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9v-.3A1.9 1.9 0 0 1 11.1 2h1.8a1.9 1.9 0 0 1 1.9 1.9v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.2-.1a1.9 1.9 0 0 1 2.6 0l.2.2a1.9 1.9 0 0 1 0 2.7l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.3A1.9 1.9 0 0 1 22 11.1v1.8a1.9 1.9 0 0 1-1.9 1.9h-.2a1 1 0 0 0-.7.3Z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      )
    case 'search':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="m16 16 4 4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'bell':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M7.5 9a4.5 4.5 0 1 1 9 0v3.2c0 .8.27 1.58.76 2.22L18.5 16H5.5l1.24-1.58c.49-.64.76-1.42.76-2.22V9ZM10 18a2 2 0 0 0 4 0"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'plus':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'menu':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'chevron':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="m8 10 4 4 4-4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      )
  }
}
