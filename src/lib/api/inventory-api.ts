import { api } from './http'
import type { InventoryProductRecord, InventoryProductUpsertPayload } from './types'

export function getInventoryProducts(studioId?: string | null) {
  const query = studioId ? `?studioId=${encodeURIComponent(studioId)}` : ''
  return api.get<InventoryProductRecord[]>(`/api/inventory/products${query}`)
}

export function createInventoryProduct(payload: InventoryProductUpsertPayload) {
  return api.post<InventoryProductRecord>('/api/inventory/products', payload)
}

export function updateInventoryProduct(id: string, payload: InventoryProductUpsertPayload) {
  return api.put<InventoryProductRecord>(`/api/inventory/products/${id}`, payload)
}

export function deleteInventoryProduct(id: string) {
  return api.del(`/api/inventory/products/${id}`)
}
