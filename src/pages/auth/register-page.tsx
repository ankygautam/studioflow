import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthFooterLinkRow } from '../../components/auth/auth-footer-link-row'
import { AuthHeader } from '../../components/auth/auth-header'
import { AuthInputField } from '../../components/auth/auth-input-field'
import { AuthPasswordField } from '../../components/auth/auth-password-field'
import { AuthSelectField } from '../../components/auth/auth-select-field'
import { AuthSubmitButton } from '../../components/auth/auth-submit-button'
import { ValidationMessage } from '../../components/auth/validation-message'
import { AuthLayout } from '../../components/layout/auth-layout'
import type { AuthRole } from '../../features/auth/auth-types'
import { authRoleOptions, getRoleDestination, isValidEmail } from '../../features/auth/auth-utils'
import { useAuth } from '../../features/auth/use-auth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitError, setSubmitError] = useState('')
  const [form, setForm] = useState({
    businessName: 'Atelier North',
    confirmPassword: 'password123',
    email: 'owner@studioflow.co',
    fullName: 'Avery North',
    password: 'password123',
    role: 'admin' as AuthRole,
  })

  const errors = {
    businessName: !form.businessName.trim() ? 'Business name is required' : '',
    confirmPassword:
      !form.confirmPassword.trim()
        ? 'Please confirm your password'
        : form.password !== form.confirmPassword
          ? 'Passwords do not match'
          : '',
    email:
      !form.email.trim()
        ? 'Email is required'
        : !isValidEmail(form.email)
          ? 'Enter a valid email address'
          : '',
    fullName: !form.fullName.trim() ? 'Full name is required' : '',
    password: !form.password.trim() ? 'Password is required' : '',
    role: !form.role ? 'Role is required' : '',
  }

  const isFormValid = Object.values(errors).every((value) => !value)
  const shouldShowError = (field: keyof typeof errors) => touched[field]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched({
      businessName: true,
      confirmPassword: true,
      email: true,
      fullName: true,
      password: true,
      role: true,
    })

    if (!isFormValid) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const nextUser = await register(form)
      navigate(getRoleDestination(nextUser.role), { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to create account right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Create account"
      hint="Set up a clean StudioFlow workspace for your studio, team, and booking operations."
      title="Start with a simple, premium account setup."
    >
      <div className="mx-auto max-w-[460px]">
        <AuthHeader
          description="Keep it simple for now. You can refine studio details later."
          eyebrow="New workspace"
          title="Create account"
        />

        <motion.form
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-5"
          initial={{ opacity: 0, y: 12 }}
          onSubmit={handleSubmit}
        >
          <AuthInputField
            error={shouldShowError('fullName') ? errors.fullName : ''}
            label="Full name"
            onBlur={() => setTouched((current) => ({ ...current, fullName: true }))}
            onChange={(value) => setForm((current) => ({ ...current, fullName: value }))}
            placeholder="Avery North"
            value={form.fullName}
          />

          <AuthInputField
            error={shouldShowError('email') ? errors.email : ''}
            label="Email"
            onBlur={() => setTouched((current) => ({ ...current, email: true }))}
            onChange={(value) => setForm((current) => ({ ...current, email: value }))}
            placeholder="owner@studioflow.co"
            type="email"
            value={form.email}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <AuthPasswordField
              error={shouldShowError('password') ? errors.password : ''}
              label="Password"
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              onChange={(value) => setForm((current) => ({ ...current, password: value }))}
              placeholder="Enter password"
              showPassword={showPassword}
              toggleShowPassword={() => setShowPassword((current) => !current)}
              value={form.password}
            />

            <AuthPasswordField
              error={shouldShowError('confirmPassword') ? errors.confirmPassword : ''}
              label="Confirm password"
              onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
              onChange={(value) =>
                setForm((current) => ({ ...current, confirmPassword: value }))
              }
              placeholder="Confirm password"
              showPassword={showConfirmPassword}
              toggleShowPassword={() => setShowConfirmPassword((current) => !current)}
              value={form.confirmPassword}
            />
          </div>

          {form.password &&
          form.confirmPassword &&
          form.password === form.confirmPassword &&
          !errors.confirmPassword ? (
            <ValidationMessage tone="success">Passwords match</ValidationMessage>
          ) : null}

          <AuthInputField
            error={shouldShowError('businessName') ? errors.businessName : ''}
            label="Business name"
            onBlur={() => setTouched((current) => ({ ...current, businessName: true }))}
            onChange={(value) => setForm((current) => ({ ...current, businessName: value }))}
            placeholder="Atelier North"
            value={form.businessName}
          />

          <AuthSelectField
            error={shouldShowError('role') ? errors.role : ''}
            label="Role"
            onBlur={() => setTouched((current) => ({ ...current, role: true }))}
            onChange={(value) =>
              setForm((current) => ({ ...current, role: value as AuthRole }))
            }
            options={authRoleOptions}
            value={form.role}
          />

          <AuthSubmitButton
            disabled={isSubmitting || !isFormValid}
            idleLabel="Create account"
            isLoading={isSubmitting}
            loadingLabel="Creating account..."
          />
          {submitError ? <p className="text-sm font-medium text-rose-500">{submitError}</p> : null}
        </motion.form>

        <AuthFooterLinkRow actionLabel="Back to sign in" prompt="Already have access?" to="/login" />
      </div>
    </AuthLayout>
  )
}
