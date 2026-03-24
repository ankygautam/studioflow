import { useCallback, useMemo, useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { DataTable } from '../components/ui/data-table'
import { PageHeader } from '../components/ui/page-header'
import { SelectField } from '../components/ui/form-controls'
import { useAuth } from '../features/auth/use-auth'
import { useRemoteList } from '../hooks/use-remote-list'
import { getAuditLogs } from '../lib/api/audit-api'
import type { AuditActionType, AuditEntityType } from '../lib/api/types'
import { formatDateTime, humanizeEnum } from '../lib/formatters'

const entityTypes: Array<'ALL' | AuditEntityType> = [
  'ALL',
  'APPOINTMENT',
  'PAYMENT',
  'CLIENT',
  'STAFF',
  'SERVICE',
  'CONSENT_TEMPLATE',
  'CONSENT_SUBMISSION',
  'LOCATION',
  'SETTINGS',
  'AUTH',
  'ONBOARDING',
]

const actionTypes: Array<'ALL' | AuditActionType> = [
  'ALL',
  'CREATED',
  'UPDATED',
  'DELETED',
  'DEACTIVATED',
  'RESCHEDULED',
  'CANCELLED',
  'STATUS_CHANGED',
  'ASSIGNED',
  'COMPLETED',
  'LOGIN',
]

export function AuditLogsPage() {
  const { selectedLocationId } = useAuth()
  const [entityType, setEntityType] = useState<'ALL' | AuditEntityType>('ALL')
  const [actionType, setActionType] = useState<'ALL' | AuditActionType>('ALL')

  const loadAuditLogs = useCallback(
    () =>
      getAuditLogs({
        actionType: actionType === 'ALL' ? undefined : actionType,
        entityType: entityType === 'ALL' ? undefined : entityType,
        limit: 50,
        locationId: selectedLocationId,
      }),
    [actionType, entityType, selectedLocationId],
  )
  const { data: auditLogs, error, isLoading, reload } = useRemoteList(loadAuditLogs)

  const summary = useMemo(() => {
    const appointmentActions = auditLogs.filter((entry) => entry.entityType === 'APPOINTMENT').length
    const paymentActions = auditLogs.filter((entry) => entry.entityType === 'PAYMENT').length
    const settingsActions = auditLogs.filter((entry) => entry.entityType === 'LOCATION' || entry.entityType === 'SETTINGS').length

    return { appointmentActions, paymentActions, settingsActions }
  }, [auditLogs])

  return (
    <div className="space-y-6">
      <PageHeader
        description="A clean operational history for admins to understand who changed what across the workspace."
        eyebrow="Audit"
        title="Audit logs"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Appointment actions" value={String(summary.appointmentActions)} />
        <MetricCard label="Payment actions" value={String(summary.paymentActions)} />
        <MetricCard label="Settings actions" value={String(summary.settingsActions)} />
      </section>

      <SurfaceCard title="Activity history">
        <div className="mb-5 grid gap-4 md:grid-cols-2">
          <SelectField
            label="Entity type"
            onChange={(event) => setEntityType(event.target.value as 'ALL' | AuditEntityType)}
            value={entityType}
          >
            {entityTypes.map((option) => (
              <option key={option} value={option}>
                {option === 'ALL' ? 'All entities' : humanizeEnum(option)}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Action type"
            onChange={(event) => setActionType(event.target.value as 'ALL' | AuditActionType)}
            value={actionType}
          >
            {actionTypes.map((option) => (
              <option key={option} value={option}>
                {option === 'ALL' ? 'All actions' : humanizeEnum(option)}
              </option>
            ))}
          </SelectField>
        </div>

        {isLoading ? <LoadingState title="Loading audit history..." /> : null}
        {!isLoading && error ? (
          <ErrorState
            action={
              <button
                className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600"
                onClick={() => void reload()}
                type="button"
              >
                Retry
              </button>
            }
            message={toAuditErrorMessage(error)}
          />
        ) : null}
        {!isLoading && !error && auditLogs.length === 0 ? (
          <EmptyState
            description="Audit history will appear here once the team starts creating, updating, and completing operational records."
            title="No audit records found"
          />
        ) : null}
        {!isLoading && !error && auditLogs.length > 0 ? (
          <DataTable columns={['Time', 'Actor', 'Action', 'Entity', 'Summary', 'Location']}>
            {auditLogs.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-4 text-sm text-slate-600">{formatDateTime(entry.createdAt)}</td>
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-950">{entry.actorName}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      {entry.actorRole ? humanizeEnum(entry.actorRole) : 'System'}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{humanizeEnum(entry.actionType)}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{humanizeEnum(entry.entityType)}</td>
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-950">{entry.title}</p>
                    <p className="text-sm text-slate-600">{entry.description}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{entry.locationName ?? 'Studio-wide'}</td>
              </tr>
            ))}
          </DataTable>
        ) : null}
      </SurfaceCard>
    </div>
  )
}

function toAuditErrorMessage(error: string) {
  const normalized = error.toLowerCase()

  if (normalized.includes('permission') || normalized.includes('access') || normalized.includes('forbidden')) {
    return 'You do not have access to this section.'
  }

  return error
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(240,245,252,0.85))] p-5 shadow-[0_18px_44px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-4 font-display text-4xl text-slate-950">{value}</p>
    </div>
  )
}
