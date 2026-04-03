import { useEffect, useState, type ReactNode } from 'react'
import {
  getStoredThemePreference,
  getThemePreferenceChangeEventName,
  persistThemePreference,
  type ThemePreference,
} from './theme-preference'

const OPTIONS: Array<{
  icon: (isActive: boolean) => ReactNode
  label: string
  value: ThemePreference
}> = [
  {
    label: 'Day mode',
    value: 'light',
    icon: (isActive) => (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" fill="currentColor" fillOpacity={isActive ? '1' : '0.9'} r="4.25" />
        <path
          d="M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12h-2.5M18.54 5.46l-1.77 1.77M7.23 16.77l-1.77 1.77M18.54 18.54l-1.77-1.77M7.23 7.23 5.46 5.46"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
  {
    label: 'Night mode',
    value: 'dark',
    icon: (isActive) => (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          d="M14.7 3.6a8.7 8.7 0 1 0 5.7 14.9A9.4 9.4 0 0 1 14.7 3.6Z"
          fill="currentColor"
          fillOpacity={isActive ? '1' : '0.92'}
        />
      </svg>
    ),
  },
  {
    label: 'Auto mode',
    value: 'auto',
    icon: (isActive) => (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <rect
          fill="currentColor"
          fillOpacity={isActive ? '1' : '0.92'}
          height="10"
          rx="2"
          width="14"
          x="5"
          y="6"
        />
        <path
          d="M9 19h6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
]

export function ThemeSchemeControl({ floating = false }: { floating?: boolean }) {
  const [preference, setPreference] = useState<ThemePreference>(getStoredThemePreference)

  useEffect(() => {
    const syncPreference = () => {
      setPreference(getStoredThemePreference())
    }

    const changeEventName = getThemePreferenceChangeEventName()
    window.addEventListener(changeEventName, syncPreference as EventListener)
    window.addEventListener('storage', syncPreference)

    return () => {
      window.removeEventListener(changeEventName, syncPreference as EventListener)
      window.removeEventListener('storage', syncPreference)
    }
  }, [])

  return (
    <div
      aria-label="Theme scheme"
      className={[
        'theme-theme-switcher inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/92 p-1.5 text-slate-500 shadow-[0_18px_44px_rgba(15,23,42,0.18)] backdrop-blur-xl',
        floating ? 'fixed right-4 top-4 z-[70] md:right-6 md:top-6' : '',
      ].join(' ')}
      role="toolbar"
    >
      {OPTIONS.map(({ icon, label, value }) => {
        const isActive = preference === value

        return (
          <button
            key={value}
            aria-label={label}
            aria-pressed={isActive}
            className={[
              'inline-flex h-10 w-10 items-center justify-center rounded-full transition outline-none',
              isActive
                ? 'bg-slate-800 text-white shadow-[0_10px_24px_rgba(15,23,42,0.28)]'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
            ].join(' ')}
            onClick={() => {
              setPreference(value)
              persistThemePreference(value)
            }}
            type="button"
          >
            {icon(isActive)}
          </button>
        )
      })}
    </div>
  )
}
