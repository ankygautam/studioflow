import { api } from './http'
import type {
  WaitlistEntryRecord,
  WaitlistEntryUpsertPayload,
  WaitlistOfferStatus,
  WaitlistSlotOfferRecord,
} from './types'

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

export function getWaitlistMatchSuggestions(appointmentId: string) {
  return api.get<WaitlistEntryRecord[]>(`/api/waitlist/suggestions?appointmentId=${encodeURIComponent(appointmentId)}`)
}

export function getWaitlistSlotOffers(cancelledAppointmentId: string) {
  return api.get<WaitlistSlotOfferRecord[]>(
    `/api/waitlist/offers?cancelledAppointmentId=${encodeURIComponent(cancelledAppointmentId)}`,
  )
}

export function createWaitlistSlotOffer(payload: {
  cancelledAppointmentId: string
  expiresAt?: string | null
  waitlistEntryId: string
}) {
  return api.post<WaitlistSlotOfferRecord>('/api/waitlist/offers', payload)
}

export function updateWaitlistSlotOfferStatus(
  id: string,
  payload: {
    convertedAppointmentId?: string | null
    status: WaitlistOfferStatus
  },
) {
  return api.put<WaitlistSlotOfferRecord>(`/api/waitlist/offers/${id}/status`, payload)
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
