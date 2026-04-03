import { useEffect } from 'react'
import {
  applyResolvedTheme,
  getNextBoundary,
  getStoredThemePreference,
  getThemePreferenceChangeEventName,
  resolveThemeFromPreference,
} from './theme-preference'

export function AutoThemeSync() {
  useEffect(() => {
    let timeoutId: number | undefined

    const applyTheme = () => {
      const now = new Date()
      const preference = getStoredThemePreference()
      const nextTheme = resolveThemeFromPreference(preference, now)
      applyResolvedTheme(nextTheme)

      if (timeoutId) {
        window.clearTimeout(timeoutId)
        timeoutId = undefined
      }

      if (preference === 'auto') {
        const nextBoundary = getNextBoundary(now)
        timeoutId = window.setTimeout(applyTheme, nextBoundary.getTime() - now.getTime())
      }
    }

    const handleThemeChange = () => applyTheme()
    const changeEventName = getThemePreferenceChangeEventName()

    applyTheme()
    window.addEventListener(changeEventName, handleThemeChange as EventListener)
    window.addEventListener('storage', handleThemeChange)

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }

      window.removeEventListener(changeEventName, handleThemeChange as EventListener)
      window.removeEventListener('storage', handleThemeChange)
    }
  }, [])

  return null
}
