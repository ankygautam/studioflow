import { api } from './http'
import type { StaffRecord, StaffUpsertPayload } from './types'

export function getStaff(studioId?: string | null) {
  const query = studioId ? `?studioId=${encodeURIComponent(studioId)}` : ''
  return api.get<StaffRecord[]>(`/api/staff${query}`)
}

export function createStaff(payload: StaffUpsertPayload) {
  return api.post<StaffRecord>('/api/staff', payload)
}

export function updateStaff(id: string, payload: StaffUpsertPayload) {
  return api.put<StaffRecord>(`/api/staff/${id}`, payload)
}

export function deleteStaff(id: string) {
  return api.del(`/api/staff/${id}`)
}
