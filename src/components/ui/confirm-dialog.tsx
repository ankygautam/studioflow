import { AnimatePresence, motion } from 'framer-motion'

type ConfirmDialogProps = {
  confirmLabel?: string
  description: string
  isConfirming?: boolean
  onCancel: () => void
  onConfirm: () => void
  open: boolean
  title: string
  tone?: 'danger' | 'neutral'
}

export function ConfirmDialog({
  confirmLabel = 'Confirm',
  description,
  isConfirming = false,
  onCancel,
  onConfirm,
  open,
  title,
  tone = 'danger',
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close confirmation"
            className="fixed inset-0 z-[70] bg-slate-950/18"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            type="button"
          />
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
          >
            <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.18)] md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Please confirm</p>
              <h3 className="mt-3 font-display text-3xl text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600"
                  disabled={isConfirming}
                  onClick={onCancel}
                  type="button"
                >
                  Keep it
                </button>
                <button
                  className={[
                    'rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300',
                    tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-950 hover:bg-slate-800',
                  ].join(' ')}
                  disabled={isConfirming}
                  onClick={onConfirm}
                  type="button"
                >
                  {isConfirming ? 'Working...' : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
