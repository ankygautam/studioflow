import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AuthCard } from '../../components/shared/auth-card'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../../features/auth/auth-schemas'

export function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = (values: ForgotPasswordFormValues) => {
    setSubmittedEmail(values.email)
  }

  return (
    <AuthCard
      description="Use this screen as the UI placeholder for the Firebase password reset flow. Right now it captures the expected interaction and success state."
      footerCta="Back to login"
      footerLabel="Remembered it?"
      footerTo="/login"
      title="Reset password"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink-900">Email</span>
          <input
            className="w-full rounded-2xl border border-stone-200 bg-stone-100/80 px-4 py-3 outline-none transition focus:border-rosewood-500"
            placeholder="owner@studioflow.app"
            {...register('email')}
          />
          {errors.email ? (
            <span className="text-sm text-rosewood-500">{errors.email.message}</span>
          ) : null}
        </label>

        <button
          className="w-full rounded-full bg-ink-950 px-6 py-3 font-semibold text-white transition hover:bg-rosewood-500 disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          Send reset link
        </button>
      </form>

      {submittedEmail ? (
        <div className="mt-6 rounded-2xl border border-mint-300 bg-mint-300/30 px-4 py-4 text-sm leading-7 text-ink-900">
          Reset instructions would be sent to <strong>{submittedEmail}</strong>{' '}
          once the auth backend is connected.
        </div>
      ) : null}
    </AuthCard>
  )
}
