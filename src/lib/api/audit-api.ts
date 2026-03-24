import { api } from './http'
import type { AuditActionType, AuditEntityType, AuditLogRecord } from './types'

export function getAuditLogs(options?: {
  actionType?: AuditActionType
  actorUserId?: string
  entityType?: AuditEntityType
  from?: string
  limit?: number
  locationId?: string | null
  to?: string
}) {
  const searchParams = new URLSearchParams()

  if (options?.actionType) {
    searchParams.set('actionType', options.actionType)
  }

  if (options?.actorUserId) {
    searchParams.set('actorUserId', options.actorUserId)
  }

  if (options?.entityType) {
    searchParams.set('entityType', options.entityType)
  }

  if (options?.from) {
    searchParams.set('from', options.from)
  }

  if (options?.limit) {
    searchParams.set('limit', String(options.limit))
  }

  if (options?.locationId) {
    searchParams.set('locationId', options.locationId)
  }

  if (options?.to) {
    searchParams.set('to', options.to)
  }

  const query = searchParams.toString()
  return api.get<AuditLogRecord[]>(`/api/audit-logs${query ? `?${query}` : ''}`)
}

export function getAuditLogById(id: string) {
  return api.get<AuditLogRecord>(`/api/audit-logs/${id}`)
}

export function getAuditLogsByEntity(
  entityType: AuditEntityType,
  entityId: string,
  locationId?: string | null,
) {
  const query = locationId ? `?locationId=${encodeURIComponent(locationId)}` : ''
  return api.get<AuditLogRecord[]>(`/api/audit-logs/entity/${entityType}/${entityId}${query}`)
}
