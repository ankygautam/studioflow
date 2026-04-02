import { useEffect } from 'react'

const DAY_START_HOUR = 6
const NIGHT_START_HOUR = 18

function resolveTheme(now: Date) {
  const hour = now.getHours()
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? 'light' : 'dark'
}

function getNextBoundary(now: Date) {
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

export function AutoThemeSync() {
  useEffect(() => {
    let timeoutId: number | undefined

    const applyTheme = () => {
      const now = new Date()
      const nextTheme = resolveTheme(now)
      document.documentElement.dataset.theme = nextTheme
      document.documentElement.style.colorScheme = nextTheme

      const nextBoundary = getNextBoundary(now)
      timeoutId = window.setTimeout(applyTheme, nextBoundary.getTime() - now.getTime())
    }

    applyTheme()

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  return null
}
