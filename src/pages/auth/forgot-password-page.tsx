import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { AuthFooterLinkRow } from '../../components/auth/auth-footer-link-row'
import { AuthHeader } from '../../components/auth/auth-header'
import { AuthInputField } from '../../components/auth/auth-input-field'
import { AuthSubmitButton } from '../../components/auth/auth-submit-button'
import { ValidationMessage } from '../../components/auth/validation-message'
import { AuthLayout } from '../../components/layout/auth-layout'
import { isValidEmail } from '../../features/auth/auth-utils'
import { useAuth } from '../../features/auth/use-auth'

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('owner@studioflow.co')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [touched, setTouched] = useState(false)

  const error =
    !email.trim()
      ? 'Email is required'
      : !isValidEmail(email)
        ? 'Enter a valid email address'
        : ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)

    if (error) {
      return
    }

    setIsSubmitting(true)

    try {
      await forgotPassword(email)
      setIsSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Reset access"
      hint="Send a clean reset prompt to the email tied to your StudioFlow account."
      title="Recover your sign-in access."
    >
      <div className="mx-auto max-w-[420px]">
        <AuthHeader
          description="Enter your email and we’ll show the reset-link success state here."
          eyebrow="Password reset"
          title="Forgot password"
        />

        <motion.form
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-5"
          initial={{ opacity: 0, y: 12 }}
          onSubmit={handleSubmit}
        >
          <AuthInputField
            error={touched ? error : ''}
            label="Email"
            onBlur={() => setTouched(true)}
            onChange={setEmail}
            placeholder="owner@studioflow.co"
            type="email"
            value={email}
          />

          <AuthSubmitButton
            disabled={isSubmitting || Boolean(error)}
            idleLabel="Send reset link"
            isLoading={isSubmitting}
            loadingLabel="Sending reset link..."
          />
        </motion.form>

        {isSuccess ? (
          <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4">
            <ValidationMessage tone="success">
              Reset link sent to {email}. This is a frontend-only success state for now.
            </ValidationMessage>
          </div>
        ) : null}

        <AuthFooterLinkRow actionLabel="Back to sign in" prompt="Remembered it?" to="/login" />
      </div>
    </AuthLayout>
  )
}
