import type { AuditLogRecord } from '../../lib/api/types'
import { formatDateTime, humanizeEnum } from '../../lib/formatters'
import { EmptyState, ErrorState, LoadingState } from './async-state'

type ActivityTimelineProps = {
  entries: AuditLogRecord[]
  error: string | null
  isLoading: boolean
  emptyDescription?: string
  emptyTitle?: string
}

export function ActivityTimeline({
  entries,
  error,
  isLoading,
  emptyDescription = 'Activity will appear here as this record is updated by the team.',
  emptyTitle = 'No activity yet',
}: ActivityTimelineProps) {
  if (isLoading) {
    return <LoadingState title="Loading activity..." />
  }

  if (error) {
    return <ErrorState message={toTimelineErrorMessage(error)} />
  }

  if (entries.length === 0) {
    return <EmptyState description={emptyDescription} title={emptyTitle} />
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <div key={entry.id} className="flex gap-4">
          <div className="flex w-5 flex-col items-center">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-900" />
            {index < entries.length - 1 ? <span className="mt-2 min-h-10 w-px flex-1 bg-slate-200" /> : null}
          </div>
          <div className="flex-1 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-slate-950">{entry.title}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {formatDateTime(entry.createdAt)}
              </p>
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-600">{entry.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>{entry.actorName}</span>
              {entry.actorRole ? <span>{humanizeEnum(entry.actorRole)}</span> : null}
              <span>{humanizeEnum(entry.actionType)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function toTimelineErrorMessage(error: string) {
  const normalized = error.toLowerCase()

  if (normalized.includes('permission') || normalized.includes('access') || normalized.includes('forbidden')) {
    return 'You do not have access to this section.'
  }

  return error
}
