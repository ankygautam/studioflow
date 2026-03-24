import type { ReactNode } from 'react'

export function LoadingState({ title = 'Loading data...' }: { title?: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 animate-pulse rounded-full bg-slate-300" />
        <p className="text-sm font-medium text-slate-500">{title}</p>
      </div>
    </div>
  )
}

export function ErrorState({
  action,
  message,
}: {
  action?: ReactNode
  message: string
}) {
  return (
    <div className="rounded-[28px] border border-rose-200 bg-rose-50/60 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">Connection issue</p>
      <p className="mt-3 text-sm leading-7 text-rose-700">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function EmptyState({
  action,
  description,
  title,
}: {
  action?: ReactNode
  description: string
  title: string
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Empty state</p>
      <h3 className="mt-3 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
