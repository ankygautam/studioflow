import { zodResolver } from '@hookform/resolvers/zod'
import { startTransition } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { AuthCard } from '../../components/shared/auth-card'
import { targetBusinesses } from '../../data/mock-data'
import {
  registerSchema,
  type RegisterFormValues,
} from '../../features/auth/auth-schemas'

export function RegisterPage() {
  const navigate = useNavigate()
  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      businessName: '',
      businessType: 'Tattoo studios',
      email: '',
      fullName: '',
      password: '',
      role: 'admin',
    },
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = () => {
    startTransition(() => {
      navigate('/login')
    })
  }

  return (
    <AuthCard
      description="Set up the business identity, owner profile, and initial role access. This is the UI shell for the upcoming Firebase and Spring Boot integration."
      footerCta="Back to login"
      footerLabel="Already have access?"
      footerTo="/login"
      title="Create your workspace"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-900">Business name</span>
            <input
              className="w-full rounded-2xl border border-stone-200 bg-stone-100/80 px-4 py-3 outline-none transition focus:border-rosewood-500"
              placeholder="Ink and Ritual"
              {...register('businessName')}
            />
            {errors.businessName ? (
              <span className="text-sm text-rosewood-500">
                {errors.businessName.message}
              </span>
            ) : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-900">Owner name</span>
            <input
              className="w-full rounded-2xl border border-stone-200 bg-stone-100/80 px-4 py-3 outline-none transition focus:border-rosewood-500"
              placeholder="Alex Morgan"
              {...register('fullName')}
            />
            {errors.fullName ? (
              <span className="text-sm text-rosewood-500">{errors.fullName.message}</span>
            ) : null}
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-900">Business type</span>
            <select
              className="w-full rounded-2xl border border-stone-200 bg-stone-100/80 px-4 py-3 outline-none transition focus:border-rosewood-500"
              {...register('businessType')}
            >
              {targetBusinesses.map((business) => (
                <option key={business} value={business}>
                  {business}
                </option>
              ))}
            </select>
            {errors.businessType ? (
              <span className="text-sm text-rosewood-500">
                {errors.businessType.message}
              </span>
            ) : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-900">Primary role</span>
            <select
              className="w-full rounded-2xl border border-stone-200 bg-stone-100/80 px-4 py-3 outline-none transition focus:border-rosewood-500"
              {...register('role')}
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff / Artist</option>
              <option value="receptionist">Receptionist</option>
            </select>
            {errors.role ? (
              <span className="text-sm text-rosewood-500">{errors.role.message}</span>
            ) : null}
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink-900">Business email</span>
          <input
            className="w-full rounded-2xl border border-stone-200 bg-stone-100/80 px-4 py-3 outline-none transition focus:border-rosewood-500"
            placeholder="hello@studioflow.app"
            {...register('email')}
          />
          {errors.email ? (
            <span className="text-sm text-rosewood-500">{errors.email.message}</span>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink-900">Password</span>
          <input
            className="w-full rounded-2xl border border-stone-200 bg-stone-100/80 px-4 py-3 outline-none transition focus:border-rosewood-500"
            placeholder="Minimum 8 characters"
            type="password"
            {...register('password')}
          />
          {errors.password ? (
            <span className="text-sm text-rosewood-500">{errors.password.message}</span>
          ) : null}
        </label>

        <button
          className="w-full rounded-full bg-ink-950 px-6 py-3 font-semibold text-white transition hover:bg-rosewood-500 disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Creating workspace...' : 'Create workspace'}
        </button>
      </form>
    </AuthCard>
  )
}
