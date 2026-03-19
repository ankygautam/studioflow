import { zodResolver } from '@hookform/resolvers/zod'
import { startTransition } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { AuthCard } from '../../components/shared/auth-card'
import { dashboardPathByRole } from '../../data/navigation'
import { loginSchema, type LoginFormValues } from '../../features/auth/auth-schemas'

export function LoginPage() {
  const navigate = useNavigate()
  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: 'owner@studioflow.app',
      password: 'demo1234',
      role: 'admin',
    },
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (values: LoginFormValues) => {
    startTransition(() => {
      navigate(dashboardPathByRole[values.role])
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div className="rounded-[2rem] bg-ink-950 p-8 text-stone-100 shadow-[0_40px_100px_rgba(20,17,15,0.35)]">
        <p className="font-display text-4xl text-balance">
          StudioFlow keeps complex studios feeling calm.
        </p>
        <p className="mt-4 leading-8 text-stone-200">
          Use the demo login to jump between admin, staff, receptionist, and
          customer experiences while we wire the real auth backend.
        </p>
        <div className="mt-8 space-y-3">
          {[
            'Role-based access and protected routes',
            'Booking and payment ops from one place',
            'Client notes, waivers, and references side by side',
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <AuthCard
        description="Sign in to the StudioFlow Phase 1 demo shell. Role selection changes the dashboard route so we can design each workspace in parallel."
        footerCta="Create an account"
        footerLabel="Need a workspace?"
        footerTo="/register"
        title="Login"
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

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-900">Password</span>
            <input
              className="w-full rounded-2xl border border-stone-200 bg-stone-100/80 px-4 py-3 outline-none transition focus:border-rosewood-500"
              placeholder="Minimum 8 characters"
              type="password"
              {...register('password')}
            />
            {errors.password ? (
              <span className="text-sm text-rosewood-500">
                {errors.password.message}
              </span>
            ) : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-900">Role</span>
            <select
              className="w-full rounded-2xl border border-stone-200 bg-stone-100/80 px-4 py-3 outline-none transition focus:border-rosewood-500"
              {...register('role')}
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff / Artist</option>
              <option value="receptionist">Receptionist</option>
              <option value="customer">Customer</option>
            </select>
            {errors.role ? (
              <span className="text-sm text-rosewood-500">{errors.role.message}</span>
            ) : null}
          </label>

          <div className="flex items-center justify-between gap-4">
            <Link className="text-sm font-semibold text-rosewood-500" to="/forgot-password">
              Forgot password?
            </Link>
            <button
              className="rounded-full bg-ink-950 px-6 py-3 font-semibold text-white transition hover:bg-rosewood-500 disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Opening...' : 'Enter workspace'}
            </button>
          </div>
        </form>
      </AuthCard>
    </div>
  )
}
