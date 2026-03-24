import { api } from './http'
import type { AppointmentRecord, AppointmentUpsertPayload } from './types'

export function getAppointments(studioId?: string | null) {
  const query = studioId ? `?studioId=${encodeURIComponent(studioId)}` : ''
  return api.get<AppointmentRecord[]>(`/api/appointments${query}`)
}

export function createAppointment(payload: AppointmentUpsertPayload) {
  return api.post<AppointmentRecord>('/api/appointments', payload)
}

export function updateAppointment(id: string, payload: AppointmentUpsertPayload) {
  return api.put<AppointmentRecord>(`/api/appointments/${id}`, payload)
}

export function deleteAppointment(id: string) {
  return api.del(`/api/appointments/${id}`)
}
