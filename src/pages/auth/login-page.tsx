import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthHeader } from '../../components/auth/auth-header'
import { AuthInputField } from '../../components/auth/auth-input-field'
import { AuthPasswordField } from '../../components/auth/auth-password-field'
import { AuthSubmitButton } from '../../components/auth/auth-submit-button'
import { AuthLayout } from '../../components/layout/auth-layout'
import { getRoleDestination, isValidEmail } from '../../features/auth/auth-utils'
import { useAuth } from '../../features/auth/use-auth'
import { appConfig } from '../../lib/app-config'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState({
    email: 'admin@studioflow.co',
    password: 'password123',
    remember: true,
  })
  const [submitError, setSubmitError] = useState('')

  const errors = {
    email:
      !form.email.trim()
        ? 'Email is required'
        : !isValidEmail(form.email)
          ? 'Enter a valid email address'
          : '',
    password: !form.password.trim() ? 'Password is required' : '',
  }

  const isFormValid = !errors.email && !errors.password
  const shouldShowError = (field: keyof typeof errors) => touched[field]
  const shouldShowDemoCredentials = appConfig.environment === 'development' || appConfig.environment === 'staging'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setTouched({ email: true, password: true })
    setSubmitError('')

    if (!isFormValid) {
      return
    }

    setIsSubmitting(true)

    try {
      const nextUser = await login(form)
      navigate(getRoleDestination(nextUser.role), { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to sign in right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Sign in"
      hint="Welcome back to a calmer way to run appointments, clients, staff visibility, and day-of-service operations."
      title="Access the StudioFlow workspace."
    >
      <div className="mx-auto max-w-[440px]">
        <AuthHeader
          description="Use your studio email to continue into the dashboard."
          eyebrow="Studio access"
          title="Sign in"
        />

        <motion.form
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-5"
          initial={{ opacity: 0, y: 12 }}
          onSubmit={handleSubmit}
        >
          <AuthInputField
            autoComplete="email"
            error={shouldShowError('email') ? errors.email : ''}
            label="Email"
            onBlur={() => setTouched((current) => ({ ...current, email: true }))}
            onChange={(value) => setForm((current) => ({ ...current, email: value }))}
            placeholder="name@studioflow.co"
            type="email"
            value={form.email}
          />

          <AuthPasswordField
            autoComplete="current-password"
            error={shouldShowError('password') ? errors.password : ''}
            label="Password"
            onBlur={() => setTouched((current) => ({ ...current, password: true }))}
            onChange={(value) => setForm((current) => ({ ...current, password: value }))}
            placeholder="Enter your password"
            showPassword={showPassword}
            toggleShowPassword={() => setShowPassword((current) => !current)}
            value={form.password}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-3 text-sm text-slate-600">
              <input
                checked={form.remember}
                className="h-4 w-4 rounded border-slate-300 text-slate-900"
                onChange={(event) =>
                  setForm((current) => ({ ...current, remember: event.target.checked }))
                }
                type="checkbox"
              />
              Remember me
            </label>

            <Link
              className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
              to="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>

          <AuthSubmitButton
            disabled={isSubmitting || !isFormValid}
            idleLabel="Sign in"
            isLoading={isSubmitting}
            loadingLabel="Signing in..."
          />
          {submitError ? <p className="text-sm font-medium text-rose-500">{submitError}</p> : null}
        </motion.form>

        {shouldShowDemoCredentials ? (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
            Demo tip: use <span className="font-semibold text-slate-950">admin@studioflow.co</span>{' '}
            with password <span className="font-semibold text-slate-950">password123</span>.
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
            Need access? Reach out to the developer to get your own account, or use the suggested
            credentials.
          </div>
        )}

        {appConfig.environment !== 'development' && appConfig.isApiConfigured ? (
          <div className="mt-4 rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-600">
            First sign-in may take a little longer while the hosted demo wakes up. After that, the
            app should feel much faster.
          </div>
        ) : null}

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-600">
          Accounts are provisioned by the studio owner or admin. Use your assigned login details to access the workspace.
        </div>

        {appConfig.isHostedBuildWithoutApi ? (
          <div className="mt-4 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
            This hosted frontend is live, but its backend API URL is not configured yet. Set
            <span className="mx-1 font-semibold">VITE_API_URL</span>
            in the deployment environment to enable sign-in and workspace data.
          </div>
        ) : null}
      </div>
    </AuthLayout>
  )
}
