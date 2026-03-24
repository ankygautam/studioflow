import { ValidationMessage } from './validation-message'

export function AuthPasswordField({
  autoComplete,
  error,
  label,
  onBlur,
  onChange,
  placeholder,
  showPassword,
  toggleShowPassword,
  value,
}: {
  autoComplete?: string
  error?: string
  label: string
  onBlur?: () => void
  onChange: (value: string) => void
  placeholder: string
  showPassword: boolean
  toggleShowPassword: () => void
  value: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <div
        className={[
          'flex h-14 items-center rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white',
          error ? 'border-rose-300 focus-within:border-rose-300' : 'border-slate-200 focus-within:border-slate-300',
        ].join(' ')}
      >
        <input
          autoComplete={autoComplete}
          className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={showPassword ? 'text' : 'password'}
          value={value}
        />
        <button
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          onClick={toggleShowPassword}
          type="button"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      {error ? <ValidationMessage>{error}</ValidationMessage> : null}
    </label>
  )
}
