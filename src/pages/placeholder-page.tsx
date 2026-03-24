import { motion } from 'framer-motion'
import { SurfaceCard } from '../components/layout/app-shell'

export function PlaceholderPage({
  description,
  eyebrow,
  title,
}: {
  description: string
  eyebrow: string
  title: string
}) {
  return (
    <div className="space-y-6">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)] md:p-8"
        initial={{ opacity: 0, y: 12 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.38em] text-slate-400">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl text-slate-950">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          {description} This surface is prepared as part of the premium StudioFlow
          shell and ready for deeper page-specific UI next.
        </p>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-2">
        <SurfaceCard title="Prepared layout">
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm leading-7 text-slate-500">
            Reusable page shell, spacing, visual language, and responsive card
            system are already in place for this module.
          </div>
        </SurfaceCard>
        <SurfaceCard title="Next UI block">
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm leading-7 text-slate-500">
            This page can now be expanded into a full workflow without changing the
            app shell or design system foundations.
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}
