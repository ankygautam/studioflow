import { api } from './http'
import type {
  ClientPackageAssignmentPayload,
  ClientPackageRecord,
  PackageRecord,
  PackageUpsertPayload,
} from './types'

export function getPackages(studioId?: string | null) {
  const query = studioId ? `?studioId=${encodeURIComponent(studioId)}` : ''
  return api.get<PackageRecord[]>(`/api/packages${query}`)
}

export function createPackage(payload: PackageUpsertPayload) {
  return api.post<PackageRecord>('/api/packages', payload)
}

export function updatePackage(id: string, payload: PackageUpsertPayload) {
  return api.put<PackageRecord>(`/api/packages/${id}`, payload)
}

export function deletePackage(id: string) {
  return api.del(`/api/packages/${id}`)
}

export function getClientPackages(customerProfileId: string) {
  return api.get<ClientPackageRecord[]>(
    `/api/client-packages?customerProfileId=${encodeURIComponent(customerProfileId)}`,
  )
}

export function createClientPackageAssignment(payload: ClientPackageAssignmentPayload) {
  return api.post<ClientPackageRecord>('/api/client-packages', payload)
}
