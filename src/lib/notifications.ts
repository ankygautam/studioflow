const NOTIFICATIONS_REFRESH_EVENT = 'studioflow-notifications-refresh'

export function dispatchNotificationsRefresh() {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_REFRESH_EVENT))
}

export function getNotificationsRefreshEventName() {
  return NOTIFICATIONS_REFRESH_EVENT
}
