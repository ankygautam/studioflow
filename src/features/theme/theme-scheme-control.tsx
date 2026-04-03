import { useEffect, useState } from 'react'
import {
  getStoredThemePreference,
  getThemePreferenceChangeEventName,
  persistThemePreference,
  type ThemePreference,
} from './theme-preference'

export function ThemeSchemeControl({ compact = false }: { compact?: boolean }) {
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
    <label
      className={[
        'inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-3 py-2 text-sm text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur',
        compact ? 'h-12' : '',
      ].join(' ')}
    >
      {!compact ? <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Theme</span> : null}
      <select
        aria-label="Theme scheme"
        className="appearance-none bg-transparent pr-1 font-semibold text-slate-700 outline-none"
        onChange={(event) => {
          const nextPreference = event.target.value as ThemePreference
          setPreference(nextPreference)
          persistThemePreference(nextPreference)
        }}
        value={preference}
      >
        <option value="auto">Auto</option>
        <option value="light">Day</option>
        <option value="dark">Night</option>
      </select>
    </label>
  )
}
