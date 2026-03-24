import { api } from './http'
import type {
  ConsentFormSubmissionRecord,
  ConsentFormSubmissionUpsertPayload,
  ConsentFormTemplateRecord,
  ConsentFormTemplateUpsertPayload,
} from './types'

export function getConsentFormTemplates(studioId?: string | null) {
  const query = studioId ? `?studioId=${encodeURIComponent(studioId)}` : ''
  return api.get<ConsentFormTemplateRecord[]>(`/api/forms/templates${query}`)
}

export function createConsentFormTemplate(payload: ConsentFormTemplateUpsertPayload) {
  return api.post<ConsentFormTemplateRecord>('/api/forms/templates', payload)
}

export function updateConsentFormTemplate(id: string, payload: ConsentFormTemplateUpsertPayload) {
  return api.put<ConsentFormTemplateRecord>(`/api/forms/templates/${id}`, payload)
}

export function deleteConsentFormTemplate(id: string) {
  return api.del(`/api/forms/templates/${id}`)
}

export function getConsentFormSubmissions(options?: {
  appointmentId?: string | null
  customerProfileId?: string | null
  studioId?: string | null
}) {
  const query = new URLSearchParams()

  if (options?.appointmentId) {
    query.set('appointmentId', options.appointmentId)
  }

  if (options?.customerProfileId) {
    query.set('customerProfileId', options.customerProfileId)
  }

  if (options?.studioId) {
    query.set('studioId', options.studioId)
  }

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return api.get<ConsentFormSubmissionRecord[]>(`/api/forms/submissions${suffix}`)
}

export function createConsentFormSubmission(payload: ConsentFormSubmissionUpsertPayload) {
  return api.post<ConsentFormSubmissionRecord>('/api/forms/submissions', payload)
}

export function updateConsentFormSubmission(id: string, payload: ConsentFormSubmissionUpsertPayload) {
  return api.put<ConsentFormSubmissionRecord>(`/api/forms/submissions/${id}`, payload)
}

export function deleteConsentFormSubmission(id: string) {
  return api.del(`/api/forms/submissions/${id}`)
}
