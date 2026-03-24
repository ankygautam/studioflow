import { api } from './http'
import type { AppointmentRecord, AppointmentUpsertPayload } from './types'

export function getAppointments(studioId?: string | null, locationId?: string | null) {
  const query = new URLSearchParams()

  if (studioId) {
    query.set('studioId', studioId)
  }

  if (locationId) {
    query.set('locationId', locationId)
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : ''
  return api.get<AppointmentRecord[]>(`/api/appointments${suffix}`)
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
