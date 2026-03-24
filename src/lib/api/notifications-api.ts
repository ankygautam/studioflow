import { api } from './http'
import type { NotificationRecord, NotificationUnreadCountRecord } from './types'

export function getNotifications(input?: { limit?: number; unreadOnly?: boolean }) {
  const query = new URLSearchParams()

  if (input?.unreadOnly) {
    query.set('unreadOnly', 'true')
  }

  if (input?.limit) {
    query.set('limit', String(input.limit))
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : ''
  return api.get<NotificationRecord[]>(`/api/notifications${suffix}`)
}

export function getUnreadNotificationCount() {
  return api.get<NotificationUnreadCountRecord>('/api/notifications/unread-count')
}

export function markNotificationAsRead(id: string) {
  return api.put<NotificationRecord>(`/api/notifications/${id}/read`, {})
}

export function markAllNotificationsAsRead() {
  return api.put<void>('/api/notifications/read-all', {})
}
