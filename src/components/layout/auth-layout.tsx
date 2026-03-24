import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { AuthCard } from '../auth/auth-card'

export function AuthLayout({
  children,
  eyebrow,
  hint,
  title,
}: {
  children: ReactNode
  eyebrow: string
  hint: string
  title: string
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f8fc_0%,#eef2f7_100%)] px-4 py-6 text-slate-900 md:px-6 md:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1320px] gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.75fr)]">
        <motion.section
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-[36px] border border-white/60 bg-[#0d1321] p-8 shadow-[0_30px_120px_rgba(6,10,20,0.45)] md:p-10 lg:p-12"
          initial={{ opacity: 0, x: -24 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,137,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(181,234,216,0.12),transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/10 text-lg font-semibold text-white">
                  SF
                </div>
                <div>
                  <p className="font-display text-[2rem] leading-none text-white">StudioFlow</p>
                  <p className="mt-1 text-sm text-slate-400">Premium studio operations</p>
                </div>
              </div>

              <p className="mt-12 text-xs font-semibold uppercase tracking-[0.38em] text-slate-400">
                {eyebrow}
              </p>
              <h1 className="mt-4 max-w-xl font-display text-4xl leading-tight text-white md:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 md:text-lg">
                {hint}
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                ['Scheduling first', 'Calendar-led workflows for service studios'],
                ['Clean operations', 'Fast scanning across bookings, clients, and staff'],
                ['Premium feel', 'Polished SaaS surfaces with simple interactions'],
              ].map(([label, copy]) => (
                <div
                  key={label}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center"
          initial={{ opacity: 0, x: 24 }}
        >
          <AuthCard>{children}</AuthCard>
        </motion.section>
      </div>
    </div>
  )
}
