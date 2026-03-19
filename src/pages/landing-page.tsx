import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { buildPhases, mvpModules, targetBusinesses } from '../data/mock-data'

const itemMotion = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
}

export function LandingPage() {
  return (
    <div className="space-y-8">
      <motion.section
        animate="show"
        className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        initial="hidden"
        transition={{ staggerChildren: 0.08 }}
      >
        <motion.div
          className="rounded-[2.2rem] bg-ink-950 p-8 text-stone-100 shadow-[0_40px_100px_rgba(20,17,15,0.35)] md:p-10"
          variants={itemMotion}
        >
          <p className="font-display text-xs uppercase tracking-[0.35em] text-gold-300">
            StudioFlow
          </p>
          <h1 className="mt-4 max-w-xl font-display text-5xl leading-none text-balance md:text-7xl">
            Run bookings, clients, consent, and payments from one studio OS.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-200">
            Built for tattoo, salon, barber, piercing, beauty, and wellness
            businesses that need cleaner operations without generic spa software.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-stone-100 px-6 py-3 font-semibold text-ink-950 transition hover:bg-gold-300"
              to="/register"
            >
              Create workspace
            </Link>
            <Link
              className="rounded-full border border-stone-100/15 px-6 py-3 font-semibold text-stone-100 transition hover:border-stone-100/35 hover:bg-white/10"
              to="/login"
            >
              Explore dashboards
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="grid gap-4"
          variants={itemMotion}
        >
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_60px_rgba(32,26,23,0.08)]">
            <p className="text-sm uppercase tracking-[0.25em] text-ink-700">
              Core users
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {['Admin', 'Staff / Artist', 'Receptionist', 'Customer'].map(
                (role) => (
                  <div
                    key={role}
                    className="rounded-2xl border border-stone-200 bg-stone-100/70 px-4 py-4"
                  >
                    <p className="font-display text-xl text-ink-950">{role}</p>
                    <p className="mt-2 text-sm leading-6 text-ink-700">
                      Tailored workflows, permissions, and visibility.
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-rosewood-500/15 bg-[linear-gradient(145deg,rgba(222,125,100,0.12),rgba(228,186,117,0.18))] p-6 shadow-[0_24px_60px_rgba(32,26,23,0.08)]">
            <p className="text-sm uppercase tracking-[0.25em] text-ink-700">
              MVP focus
            </p>
            <p className="mt-4 font-display text-3xl text-ink-950">
              Start with auth, dashboards, scheduling, clients, payments, and
              consent.
            </p>
            <p className="mt-3 leading-7 text-ink-800">
              Then expand into notifications, loyalty, inventory, analytics, and
              multi-location operations.
            </p>
          </div>
        </motion.div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Today bookings', '28'],
          ['Pending deposits', '$790'],
          ['Signed waivers', '94%'],
          ['Active team members', '14'],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_60px_rgba(32,26,23,0.08)]"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-ink-700">
              {label}
            </p>
            <p className="mt-3 font-display text-3xl text-ink-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_rgba(32,26,23,0.08)]">
          <p className="font-display text-3xl text-ink-950">Target businesses</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {targetBusinesses.map((business) => (
              <span
                key={business}
                className="rounded-full border border-stone-200 bg-stone-100/80 px-4 py-2 text-sm font-semibold text-ink-900"
              >
                {business}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_rgba(32,26,23,0.08)]">
          <p className="font-display text-3xl text-ink-950">MVP modules</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {mvpModules.map((module) => (
              <div
                key={module}
                className="rounded-2xl border border-stone-200 bg-stone-100/70 px-4 py-4 leading-7"
              >
                {module}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_rgba(32,26,23,0.08)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-3xl text-ink-950">Build order</p>
            <p className="mt-2 max-w-2xl leading-7 text-ink-700">
              The current repo is now set up for Phase 1. The next iterations can
              fill in CRUD flows, booking logic, and backend integration.
            </p>
          </div>
          <Link
            className="rounded-full bg-ink-950 px-5 py-3 font-semibold text-white transition hover:bg-rosewood-500"
            to="/admin/dashboard"
          >
            Open admin shell
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {buildPhases.map((phase) => (
            <div
              key={phase.phase}
              className="rounded-[1.75rem] border border-stone-200 bg-stone-100/70 p-5"
            >
              <p className="font-display text-2xl text-ink-950">{phase.phase}</p>
              <p className="mt-3 leading-7 text-ink-700">{phase.summary}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
