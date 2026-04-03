import { api } from './http'
import type { ReminderDispatchRecord, ReminderSettingsRecord, ReminderSettingsUpdatePayload } from './types'

export function getReminderSettings(studioId?: string | null) {
  const query = studioId ? `?studioId=${encodeURIComponent(studioId)}` : ''
  return api.get<ReminderSettingsRecord>(`/api/settings/reminders${query}`)
}

export function updateReminderSettings(payload: ReminderSettingsUpdatePayload) {
  return api.put<ReminderSettingsRecord>('/api/settings/reminders', payload)
}

export function dispatchReminderSweepNow(studioId?: string | null) {
  const query = studioId ? `?studioId=${encodeURIComponent(studioId)}` : ''
  return api.post<ReminderDispatchRecord>(`/api/settings/reminders/dispatch-now${query}`, {})
}
