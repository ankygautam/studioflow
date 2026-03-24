export function AuthHeader({
  description,
  eyebrow,
  title,
}: {
  description: string
  eyebrow: string
  title: string
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-4xl text-slate-950">{title}</h2>
      <p className="mt-4 text-base leading-8 text-slate-600">{description}</p>
    </div>
  )
}
