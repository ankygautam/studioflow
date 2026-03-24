export function AuthSubmitButton({
  disabled,
  idleLabel,
  isLoading = false,
  loadingLabel,
}: {
  disabled?: boolean
  idleLabel: string
  isLoading?: boolean
  loadingLabel: string
}) {
  return (
    <button
      className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.2)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={disabled}
      type="submit"
    >
      {isLoading ? loadingLabel : idleLabel}
    </button>
  )
}
