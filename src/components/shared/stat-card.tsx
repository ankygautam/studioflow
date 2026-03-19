type StatCardProps = {
  caption: string
  value: string
}

export function StatCard({ caption, value }: StatCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,40,0.05)]">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{caption}</p>
      <p className="mt-3 font-display text-3xl text-ink-950">{value}</p>
    </article>
  )
}
