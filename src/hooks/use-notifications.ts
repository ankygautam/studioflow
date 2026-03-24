import { useCallback, useEffect, useState } from 'react'
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../lib/api/notifications-api'
import type { NotificationRecord } from '../lib/api/types'

export function useNotifications(enabled: boolean) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    setIsLoading((current) => current || notifications.length === 0)
    setError(null)

    try {
      const [items, unread] = await Promise.all([
        getNotifications({ limit: 8 }),
        getUnreadNotificationCount(),
      ])

      setNotifications(items)
      setUnreadCount(unread.unreadCount)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load notifications right now.')
    } finally {
      setIsLoading(false)
    }
  }, [enabled, notifications.length])

  useEffect(() => {
    void refresh()

    if (!enabled) {
      return
    }

    const timer = window.setInterval(() => {
      void refresh()
    }, 30000)

    return () => {
      window.clearInterval(timer)
    }
  }, [enabled, refresh])

  const markRead = useCallback(async (id: string) => {
    const updated = await markNotificationAsRead(id)

    setNotifications((current) =>
      current.map((notification) => (notification.id === id ? updated : notification)),
    )
    setUnreadCount((current) => Math.max(0, current - 1))
  }, [])

  const markAllRead = useCallback(async () => {
    await markAllNotificationsAsRead()
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })))
    setUnreadCount(0)
  }, [])

  return {
    error,
    isLoading,
    markAllRead,
    markRead,
    notifications,
    refresh,
    unreadCount,
  }
}
