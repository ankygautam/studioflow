import { ValidationMessage } from './validation-message'

export function AuthSelectField({
  error,
  label,
  onBlur,
  onChange,
  options,
  value,
}: {
  error?: string
  label: string
  onBlur?: () => void
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <select
        className={[
          'h-14 w-full rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:bg-white',
          error ? 'border-rose-300 focus:border-rose-300' : 'border-slate-200 focus:border-slate-300',
        ].join(' ')}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <ValidationMessage>{error}</ValidationMessage> : null}
    </label>
  )
}
