import type { ReactNode } from 'react'

export function DrawerPreview({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        Drawer Pattern
      </div>
      <div className="ml-auto max-w-[290px] rounded-[24px] border border-white/80 bg-white p-5 shadow-[-16px_16px_48px_rgba(15,23,42,0.12)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">Right-side contextual panel</p>
          </div>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
            ×
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
