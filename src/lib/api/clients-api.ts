import { api } from './http'
import type { ClientRecord, ClientUpsertPayload } from './types'

export function getClients(studioId?: string | null) {
  const query = studioId ? `?studioId=${encodeURIComponent(studioId)}` : ''
  return api.get<ClientRecord[]>(`/api/clients${query}`)
}

export function createClient(payload: ClientUpsertPayload) {
  return api.post<ClientRecord>('/api/clients', payload)
}

export function updateClient(id: string, payload: ClientUpsertPayload) {
  return api.put<ClientRecord>(`/api/clients/${id}`, payload)
}

export function deleteClient(id: string) {
  return api.del(`/api/clients/${id}`)
}
