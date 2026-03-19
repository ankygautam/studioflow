import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function ProductPageHeader({
  action,
  description,
  eyebrow = 'Workspace module',
  title,
}: {
  action?: ReactNode
  description: string
  eyebrow?: string
  title: string
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,40,0.05)]"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.35em] text-slate-500">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl text-slate-950">{title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            {description}
          </p>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </motion.div>
  )
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
}) {
  return (
    <button
      className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

export function SummaryCard({
  caption,
  meta,
  tone,
  value,
}: {
  caption: string
  meta?: string
  tone?: string
  value: string
}) {
  return (
    <div
      className={[
        'rounded-[1.75rem] border border-slate-200 p-5 shadow-[0_16px_40px_rgba(15,23,40,0.05)]',
        tone ?? 'bg-white',
      ].join(' ')}
    >
      <p className="text-sm uppercase tracking-[0.22em] text-slate-500">{caption}</p>
      <p className="mt-3 font-display text-4xl text-slate-950">{value}</p>
      {meta ? (
        <p className="mt-4 text-sm font-semibold text-slate-600">{meta}</p>
      ) : null}
    </div>
  )
}

export function Surface({
  action,
  children,
  title,
}: {
  action?: ReactNode
  children: ReactNode
  title: string
}) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,40,0.05)] md:p-6"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.24 }}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </motion.section>
  )
}

export function StatusBadge({
  children,
  tone,
}: {
  children: ReactNode
  tone: 'danger' | 'neutral' | 'success' | 'warning'
}) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : tone === 'danger'
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-slate-200 bg-slate-100 text-slate-700'

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}
    >
      {children}
    </span>
  )
}

export function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: string[]
  value: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <select
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export function EmptyState({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_16px_40px_rgba(15,23,40,0.04)]">
      <p className="font-display text-3xl text-slate-950">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-500">
        {description}
      </p>
    </div>
  )
}
