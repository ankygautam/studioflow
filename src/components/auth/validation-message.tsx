import type { ReactNode } from 'react'

export function ValidationMessage({
  children,
  tone = 'error',
}: {
  children: ReactNode
  tone?: 'error' | 'success'
}) {
  return (
    <p
      className={[
        'mt-2 text-sm',
        tone === 'success' ? 'text-emerald-600' : 'text-rose-600',
      ].join(' ')}
    >
      {children}
    </p>
  )
}
