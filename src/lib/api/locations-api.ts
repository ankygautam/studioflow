import { api } from './http'
import type { LocationRecord, LocationUpsertPayload } from './types'

export function getLocations(studioId?: string | null, activeOnly = false) {
  const query = new URLSearchParams()

  if (studioId) {
    query.set('studioId', studioId)
  }

  if (activeOnly) {
    query.set('activeOnly', 'true')
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : ''
  return api.get<LocationRecord[]>(`/api/locations${suffix}`)
}

export function createLocation(payload: LocationUpsertPayload) {
  return api.post<LocationRecord>('/api/locations', payload)
}

export function updateLocation(id: string, payload: LocationUpsertPayload) {
  return api.put<LocationRecord>(`/api/locations/${id}`, payload)
}

export function deleteLocation(id: string) {
  return api.del(`/api/locations/${id}`)
}
