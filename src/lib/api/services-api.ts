import { api } from './http'
import type { ServiceRecord, ServiceUpsertPayload } from './types'

export function getServices(studioId?: string | null) {
  const query = studioId ? `?studioId=${encodeURIComponent(studioId)}` : ''
  return api.get<ServiceRecord[]>(`/api/services${query}`)
}

export function createService(payload: ServiceUpsertPayload) {
  return api.post<ServiceRecord>('/api/services', payload)
}

export function updateService(id: string, payload: ServiceUpsertPayload) {
  return api.put<ServiceRecord>(`/api/services/${id}`, payload)
}

export function deleteService(id: string) {
  return api.del(`/api/services/${id}`)
}
