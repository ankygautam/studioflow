import { api } from './http'
import type { StaffCreatePayload, StaffRecord, StaffUpdatePayload } from './types'

export function getStaff(studioId?: string | null, locationId?: string | null) {
  const query = new URLSearchParams()

  if (studioId) {
    query.set('studioId', studioId)
  }

  if (locationId) {
    query.set('locationId', locationId)
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : ''
  return api.get<StaffRecord[]>(`/api/staff${suffix}`)
}

export function createStaff(payload: StaffCreatePayload) {
  return api.post<StaffRecord>('/api/staff', payload)
}

export function updateStaff(id: string, payload: StaffUpdatePayload) {
  return api.put<StaffRecord>(`/api/staff/${id}`, payload)
}

export function deleteStaff(id: string) {
  return api.del(`/api/staff/${id}`)
}
