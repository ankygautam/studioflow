import type { ReactNode } from 'react'

const toneMap = {
  attention: 'border-amber-200 bg-amber-50 text-amber-700',
  calm: 'border-blue-200 bg-blue-50 text-blue-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
  neutral: 'border-slate-200 bg-slate-100 text-slate-600',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  violet: 'border-violet-200 bg-violet-50 text-violet-700',
} as const

export function StatusBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: keyof typeof toneMap
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[tone]}`}
    >
      {children}
    </span>
  )
}
