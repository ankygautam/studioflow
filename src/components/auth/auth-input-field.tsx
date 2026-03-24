import { ValidationMessage } from './validation-message'

export function AuthInputField({
  autoComplete,
  error,
  label,
  onBlur,
  onChange,
  placeholder,
  type = 'text',
  value,
}: {
  autoComplete?: string
  error?: string
  label: string
  onBlur?: () => void
  onChange: (value: string) => void
  placeholder: string
  type?: string
  value: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        autoComplete={autoComplete}
        className={[
          'h-14 w-full rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:bg-white',
          error ? 'border-rose-300 focus:border-rose-300' : 'border-slate-200 focus:border-slate-300',
        ].join(' ')}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {error ? <ValidationMessage>{error}</ValidationMessage> : null}
    </label>
  )
}
