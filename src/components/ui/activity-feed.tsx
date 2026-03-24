import type { AuditLogRecord } from '../../lib/api/types'
import { formatRelativeTime, humanizeEnum } from '../../lib/formatters'
import { EmptyState, ErrorState, LoadingState } from './async-state'
import { StatusBadge } from './status-badge'

type ActivityFeedProps = {
  entries: AuditLogRecord[]
  error: string | null
  isLoading: boolean
  onRetry?: (() => void) | null
  emptyDescription?: string
  emptyTitle?: string
}

export function ActivityFeed({
  entries,
  error,
  isLoading,
  onRetry = null,
  emptyDescription = 'Important team actions will start appearing here as people work across bookings, payments, clients, and settings.',
  emptyTitle = 'No activity yet',
}: ActivityFeedProps) {
  if (isLoading) {
    return <LoadingState title="Loading activity..." />
  }

  if (error) {
    return (
      <ErrorState
        action={onRetry ? (
          <button
            className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600"
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        ) : null}
        message={error}
      />
    )
  }

  if (entries.length === 0) {
    return <EmptyState description={emptyDescription} title={emptyTitle} />
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{entry.title}</p>
                <StatusBadge tone="neutral">{humanizeEnum(entry.entityType)}</StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">{entry.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">{entry.actorName}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                {entry.actorRole ? humanizeEnum(entry.actorRole) : 'System'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span>{humanizeEnum(entry.actionType)}</span>
            {entry.locationName ? <span>{entry.locationName}</span> : null}
            <span>{formatRelativeTime(entry.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
