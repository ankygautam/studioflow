import { api } from './http'
import type {
  PublicBookingAvailabilityRecord,
  PublicBookingConfirmationRecord,
  PublicBookingCreatePayload,
  PublicBookingServicesRecord,
  PublicBookingStaffRecord,
} from './types'

export function getPublicBookingServices(studioSlug: string) {
  return api.get<PublicBookingServicesRecord>(`/api/public/booking/${encodeURIComponent(studioSlug)}/services`)
}

export function getPublicBookingStaff(studioSlug: string, serviceId: string) {
  const query = new URLSearchParams({ serviceId })
  return api.get<PublicBookingStaffRecord>(`/api/public/booking/${encodeURIComponent(studioSlug)}/staff?${query.toString()}`)
}

export function getPublicBookingAvailability(input: {
  date: string
  serviceId: string
  staffProfileId: string
  studioSlug: string
}) {
  const query = new URLSearchParams({
    date: input.date,
    serviceId: input.serviceId,
    staffProfileId: input.staffProfileId,
  })

  return api.get<PublicBookingAvailabilityRecord>(`/api/public/booking/${encodeURIComponent(input.studioSlug)}/availability?${query.toString()}`)
}

export function createPublicBooking(studioSlug: string, payload: PublicBookingCreatePayload) {
  return api.post<PublicBookingConfirmationRecord>(`/api/public/booking/${encodeURIComponent(studioSlug)}/submit`, payload)
}
