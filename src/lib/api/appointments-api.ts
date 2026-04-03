import { api } from './http'
import type { AppointmentRecord, AppointmentSuggestionsRecord, AppointmentUpsertPayload } from './types'

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

export function getAppointmentSuggestions(input: {
  appointmentDate: string
  appointmentId?: string | null
  locationId: string
  serviceId: string
  staffProfileId: string
  studioId: string
}) {
  const query = new URLSearchParams({
    date: input.appointmentDate,
    locationId: input.locationId,
    serviceId: input.serviceId,
    staffProfileId: input.staffProfileId,
    studioId: input.studioId,
  })

  if (input.appointmentId) {
    query.set('appointmentId', input.appointmentId)
  }

  return api.get<AppointmentSuggestionsRecord>(`/api/appointments/suggestions?${query.toString()}`)
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
