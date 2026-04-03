import { api } from './http'
import type { WaitlistEntryRecord, WaitlistEntryUpsertPayload } from './types'

export function getWaitlistEntries(studioId?: string | null, locationId?: string | null) {
  const query = new URLSearchParams()

  if (studioId) {
    query.set('studioId', studioId)
  }

  if (locationId) {
    query.set('locationId', locationId)
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : ''
  return api.get<WaitlistEntryRecord[]>(`/api/waitlist${suffix}`)
}

export function createWaitlistEntry(payload: WaitlistEntryUpsertPayload) {
  return api.post<WaitlistEntryRecord>('/api/waitlist', payload)
}

export function updateWaitlistEntry(id: string, payload: WaitlistEntryUpsertPayload) {
  return api.put<WaitlistEntryRecord>(`/api/waitlist/${id}`, payload)
}

export function deleteWaitlistEntry(id: string) {
  return api.del(`/api/waitlist/${id}`)
}
