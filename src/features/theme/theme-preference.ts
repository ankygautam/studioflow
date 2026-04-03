export type ThemePreference = 'auto' | 'dark' | 'light'

const DAY_START_HOUR = 6
const NIGHT_START_HOUR = 18
const STORAGE_KEY = 'studioflow-theme-preference'
const CHANGE_EVENT = 'studioflow-theme-preference-change'

export function resolveTheme(now: Date) {
  const hour = now.getHours()
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? 'light' : 'dark'
}

export function getNextBoundary(now: Date) {
  const next = new Date(now)
  const hour = now.getHours()

  if (hour < DAY_START_HOUR) {
    next.setHours(DAY_START_HOUR, 0, 0, 0)
    return next
  }

  if (hour < NIGHT_START_HOUR) {
    next.setHours(NIGHT_START_HOUR, 0, 0, 0)
    return next
  }

  next.setDate(next.getDate() + 1)
  next.setHours(DAY_START_HOUR, 0, 0, 0)
  return next
}

export function resolveThemeFromPreference(preference: ThemePreference, now: Date = new Date()) {
  return preference === 'auto' ? resolveTheme(now) : preference
}

export function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'auto'
  }

  const value = window.localStorage.getItem(STORAGE_KEY)

  if (value === 'light' || value === 'dark' || value === 'auto') {
    return value
  }

  return 'auto'
}

export function persistThemePreference(preference: ThemePreference) {
  window.localStorage.setItem(STORAGE_KEY, preference)
  window.dispatchEvent(new CustomEvent<ThemePreference>(CHANGE_EVENT, { detail: preference }))
}

export function applyResolvedTheme(theme: 'dark' | 'light') {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function getThemePreferenceChangeEventName() {
  return CHANGE_EVENT
}
