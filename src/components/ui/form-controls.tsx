import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

function fieldClassName(hasError?: boolean) {
  return [
    'w-full rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700 outline-none transition',
    hasError
      ? 'border-rose-300 focus:border-rose-400'
      : 'border-slate-200 focus:border-slate-300 focus:bg-white',
  ].join(' ')
}

export function Field({
  children,
  error,
  label,
}: {
  children: ReactNode
  error?: string | null
  label: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </span>
      {children}
      {error ? <p className="mt-2 text-xs font-medium text-rose-500">{error}</p> : null}
    </label>
  )
}

export function InputField({
  error,
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  error?: string | null
  label: string
}) {
  return (
    <Field error={error} label={label}>
      <input {...props} className={`${fieldClassName(Boolean(error))} h-12`} />
    </Field>
  )
}

export function SelectField({
  children,
  error,
  label,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode
  error?: string | null
  label: string
}) {
  return (
    <Field error={error} label={label}>
      <select {...props} className={`${fieldClassName(Boolean(error))} h-12`}>
        {children}
      </select>
    </Field>
  )
}

export function TextAreaField({
  error,
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string | null
  label: string
}) {
  return (
    <Field error={error} label={label}>
      <textarea {...props} className={`${fieldClassName(Boolean(error))} min-h-[120px] py-3`} />
    </Field>
  )
}

export function ToggleField({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      className={[
        'flex w-full items-center justify-between rounded-[22px] border px-4 py-3 text-left transition',
        checked ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-50',
      ].join(' ')}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          {label}
        </span>
        <span className="mt-2 block text-sm font-semibold text-slate-700">
          {checked ? 'Enabled' : 'Disabled'}
        </span>
      </span>
      <span
        className={[
          'inline-flex h-7 w-12 rounded-full border p-1 transition',
          checked ? 'border-slate-900 bg-slate-900' : 'border-slate-300 bg-slate-200',
        ].join(' ')}
      >
        <span
          className={[
            'h-5 w-5 rounded-full bg-white transition',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </span>
    </button>
  )
}
