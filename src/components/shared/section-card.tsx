import type { ReactNode } from 'react'

type SectionCardProps = {
  children: ReactNode
  title: string
}

export function SectionCard({ children, title }: SectionCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,40,0.05)]">
      <h2 className="font-display text-2xl text-ink-950">{title}</h2>
      <div className="mt-4 text-slate-600">{children}</div>
    </section>
  )
}
