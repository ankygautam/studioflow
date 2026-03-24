import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function DetailDrawer({
  children,
  footer,
  onClose,
  open,
  subtitle,
  title,
}: {
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  open: boolean
  subtitle?: string
  title: string
}) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close details"
            className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 w-full max-w-[420px] border-l border-slate-200 bg-white p-5 shadow-[-24px_0_80px_rgba(15,23,42,0.18)] md:p-6"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {subtitle ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                      {subtitle}
                    </p>
                  ) : null}
                  <h2 className="mt-2 font-display text-[1.8rem] text-slate-950">
                    {title}
                  </h2>
                </div>
                <button
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-white"
                  onClick={onClose}
                  type="button"
                >
                  ×
                </button>
              </div>
              <div className="mt-6 flex-1 overflow-y-auto">{children}</div>
              {footer ? <div className="mt-6">{footer}</div> : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
