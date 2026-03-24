import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function PageHeader({
  actions,
  description,
  eyebrow,
  title,
}: {
  actions?: ReactNode
  description: string
  eyebrow: string
  title: string
}) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)] md:p-7"
      initial={{ opacity: 0, y: 14 }}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-slate-400">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl text-slate-950 md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </motion.section>
  )
}
