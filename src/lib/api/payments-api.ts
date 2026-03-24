import { api } from './http'
import type { PaymentRecord, PaymentUpsertPayload } from './types'

export function getPayments(options?: { appointmentId?: string | null; studioId?: string | null }) {
  const query = new URLSearchParams()

  if (options?.appointmentId) {
    query.set('appointmentId', options.appointmentId)
  }

  if (options?.studioId) {
    query.set('studioId', options.studioId)
  }

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return api.get<PaymentRecord[]>(`/api/payments${suffix}`)
}

export function createPayment(payload: PaymentUpsertPayload) {
  return api.post<PaymentRecord>('/api/payments', payload)
}

export function updatePayment(id: string, payload: PaymentUpsertPayload) {
  return api.put<PaymentRecord>(`/api/payments/${id}`, payload)
}

export function deletePayment(id: string) {
  return api.del(`/api/payments/${id}`)
}
