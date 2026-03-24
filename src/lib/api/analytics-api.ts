import { api } from './http'
import type {
  AnalyticsOverviewRecord,
  AppointmentAnalyticsRecord,
  RevenueAnalyticsRecord,
  ServiceAnalyticsRecord,
} from './types'

type AnalyticsQuery = {
  from?: string | null
  studioId?: string | null
  to?: string | null
}

function buildQuery(options?: AnalyticsQuery) {
  const query = new URLSearchParams()

  if (options?.studioId) {
    query.set('studioId', options.studioId)
  }

  if (options?.from) {
    query.set('from', options.from)
  }

  if (options?.to) {
    query.set('to', options.to)
  }

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return suffix
}

export function getAnalyticsOverview(options?: AnalyticsQuery) {
  return api.get<AnalyticsOverviewRecord>(`/api/analytics/overview${buildQuery(options)}`)
}

export function getRevenueAnalytics(options?: AnalyticsQuery) {
  return api.get<RevenueAnalyticsRecord>(`/api/analytics/revenue${buildQuery(options)}`)
}

export function getAppointmentAnalytics(options?: AnalyticsQuery) {
  return api.get<AppointmentAnalyticsRecord>(`/api/analytics/appointments${buildQuery(options)}`)
}

export function getServiceAnalytics(options?: AnalyticsQuery) {
  return api.get<ServiceAnalyticsRecord>(`/api/analytics/services${buildQuery(options)}`)
}
