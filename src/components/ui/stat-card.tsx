import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function StatCard({
  accent = 'default',
  helper,
  label,
  value,
}: {
  accent?: 'default' | 'mint' | 'violet' | 'warm'
  helper: ReactNode
  label: string
  value: string
}) {
  const accentClass =
    accent === 'mint'
      ? 'bg-[linear-gradient(135deg,rgba(181,234,216,0.16),rgba(183,217,255,0.1))]'
      : accent === 'violet'
        ? 'bg-[linear-gradient(135deg,rgba(211,216,255,0.26),rgba(233,223,255,0.18))]'
        : accent === 'warm'
          ? 'bg-[linear-gradient(135deg,rgba(242,211,176,0.2),rgba(244,227,200,0.16))]'
          : 'bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(240,245,252,0.9))]'

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[28px] border border-slate-200 p-5 shadow-[0_18px_44px_rgba(15,23,42,0.04)] ${accentClass}`}
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.24 }}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-4 font-display text-4xl text-slate-950">{value}</p>
      <div className="mt-4 text-sm text-slate-500">{helper}</div>
    </motion.div>
  )
}
