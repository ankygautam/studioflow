import type { ReactNode } from 'react'

type PageIntroProps = {
  action?: ReactNode
  description: string
  eyebrow: string
  title: string
}

export function PageIntro({
  action,
  description,
  eyebrow,
  title,
}: PageIntroProps) {
  return (
    <div className="flex flex-col gap-5 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_16px_40px_rgba(15,23,40,0.06)] md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-3">
        <p className="font-display text-xs uppercase tracking-[0.35em] text-slate-500">
          {eyebrow}
        </p>
        <h1 className="font-display text-4xl text-ink-950 md:text-5xl">
          {title}
        </h1>
        <p className="text-base leading-7 text-slate-600 md:text-lg">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
