import { appConfig } from '../app-config'
import { downloadBlob } from '../csv'
import { ApiError, getStoredAuthToken } from './http'
import type { AppointmentStatus, PaymentStatus, StaffStatus } from './types'

type AppointmentExportFilters = {
  fromDate?: string | null
  locationId?: string | null
  serviceId?: string | null
  staffId?: string | null
  status?: AppointmentStatus | null
  studioId?: string | null
  toDate?: string | null
}

type PaymentExportFilters = {
  fromDate?: string | null
  locationId?: string | null
  serviceId?: string | null
  staffId?: string | null
  status?: PaymentStatus | null
  studioId?: string | null
  toDate?: string | null
}

type ClientExportFilters = {
  active?: boolean | null
  fromDate?: string | null
  studioId?: string | null
  toDate?: string | null
}

type StaffExportFilters = {
  locationId?: string | null
  status?: StaffStatus | null
  studioId?: string | null
}

export function downloadAppointmentsExport(filters: AppointmentExportFilters) {
  return downloadReport('/api/reports/exports/appointments.csv', filters, 'appointments.csv')
}

export function downloadPaymentsExport(filters: PaymentExportFilters) {
  return downloadReport('/api/reports/exports/payments.csv', filters, 'payments.csv')
}

export function downloadClientsExport(filters: ClientExportFilters) {
  return downloadReport('/api/reports/exports/clients.csv', filters, 'clients.csv')
}

export function downloadStaffExport(filters: StaffExportFilters) {
  return downloadReport('/api/reports/exports/staff.csv', filters, 'staff.csv')
}

async function downloadReport(
  path: string,
  filters: Record<string, string | boolean | null | undefined>,
  fallbackFilename: string,
) {
  if (!appConfig.apiUrl) {
    throw new ApiError(
      'This StudioFlow deployment is missing its backend API configuration. Set VITE_API_URL for this environment and try again.',
      0,
    )
  }

  const headers = new Headers()
  const authToken = getStoredAuthToken()

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined || value === '') {
      continue
    }

    query.set(key, String(value))
  }

  const suffix = query.toString() ? `?${query.toString()}` : ''
  let response: Response

  try {
    response = await fetch(`${appConfig.apiUrl}${path}${suffix}`, {
      headers,
      method: 'GET',
    })
  } catch (error) {
    throw new ApiError(
      `Unable to reach the StudioFlow backend at ${appConfig.apiUrl}. Start the Spring Boot app and database, then try again.`,
      0,
      error,
    )
  }

  if (!response.ok) {
    const rawBody = await response.text()
    const parsedBody = rawBody ? safeJsonParse(rawBody) : null
    const message =
      typeof parsedBody === 'object' &&
      parsedBody !== null &&
      'message' in parsedBody &&
      typeof parsedBody.message === 'string'
        ? parsedBody.message
        : `Request failed with status ${response.status}`

    throw new ApiError(message, response.status, parsedBody)
  }

  const blob = await response.blob()
  downloadBlob(resolveFilename(response.headers.get('Content-Disposition'), fallbackFilename), blob)
}

function resolveFilename(contentDisposition: string | null, fallbackFilename: string) {
  if (!contentDisposition) {
    return fallbackFilename
  }

  const match = contentDisposition.match(/filename="([^"]+)"/i)
  return match?.[1] ?? fallbackFilename
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}
