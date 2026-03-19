import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

type SideDrawerProps = {
  children: ReactNode
  onClose: () => void
  open: boolean
  subtitle?: string
  title: string
}

export function SideDrawer({
  children,
  onClose,
  open,
  subtitle,
  title,
}: SideDrawerProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close drawer"
            className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xl border-l border-slate-200 bg-white p-6 shadow-[-24px_0_60px_rgba(15,23,40,0.12)]"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.24 }}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl text-slate-950">{title}</h2>
                  {subtitle ? (
                    <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
                  ) : null}
                </div>
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                  onClick={onClose}
                  type="button"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <path
                      d="m6 6 12 12M18 6 6 18"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
