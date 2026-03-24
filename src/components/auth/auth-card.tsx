import type { ReactNode } from 'react'

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-[36px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-8 lg:p-10">
      {children}
    </div>
  )
}
