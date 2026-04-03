import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/auth-layout'
import { ErrorState } from '../components/ui/async-state'
import { InputField, SelectField, ToggleField } from '../components/ui/form-controls'
import { useAuth } from '../features/auth/use-auth'
import type { OnboardingErrors, OnboardingStep } from '../features/onboarding/types/onboarding'
import { businessTypes, createStarterService, serviceCategories, stepOrder, updateStarterService, validateStep } from '../features/onboarding/utils/onboarding-form'
import { onboardStudio } from '../lib/api/onboarding-api'
import { timezoneOptions } from '../lib/timezones'
import type { BusinessType, ServiceCategory, StudioOnboardingPayload } from '../lib/api/types'
import { humanizeEnum } from '../lib/formatters'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { refreshCurrentUser, user } = useAuth()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('studio')
  const [errors, setErrors] = useState<OnboardingErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formState, setFormState] = useState<StudioOnboardingPayload>({
    addressLine1: '',
    addressLine2: '',
    bookingLeadTimeHours: 24,
    businessType: 'SALON',
    city: '',
    country: 'Canada',
    defaultDepositAmount: 0,
    defaultDepositRequired: false,
    locationEmail: '',
    locationName: '',
    locationPhone: '',
    postalCode: '',
    provinceOrState: '',
    starterServices: [
      createStarterService(),
      createStarterService({ category: 'CONSULTATION', durationMinutes: 30, name: 'Consultation', price: 0 }),
    ],
    studioEmail: user?.email ?? '',
    studioName: '',
    studioPhone: '',
    timezone: 'America/Edmonton',
  })

  useEffect(() => {
    if (user?.studioId && user.onboardingCompleted) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, user?.onboardingCompleted, user?.studioId])

  const subtitle = useMemo(
    () =>
      user
        ? `Set up the essentials for ${user.fullName.split(' ')[0] ?? 'your'} workspace. You can refine the rest later without slowing down launch.`
        : 'Set up the essentials for your workspace.',
    [user],
  )

  const stepIndex = stepOrder.indexOf(currentStep)
  const isLastStep = stepIndex === stepOrder.length - 1

  const handleContinue = async () => {
    const nextErrors = validateStep(formState, currentStep)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    if (!isLastStep) {
      setCurrentStep(stepOrder[stepIndex + 1])
      return
    }

    setIsSaving(true)
    setSubmitError(null)

    try {
      await onboardStudio({
        ...formState,
        addressLine1: formState.addressLine1.trim(),
        addressLine2: formState.addressLine2.trim(),
        city: formState.city.trim(),
        country: formState.country.trim(),
        locationEmail: formState.locationEmail.trim(),
        locationName: formState.locationName.trim(),
        locationPhone: formState.locationPhone.trim(),
        postalCode: formState.postalCode.trim(),
        provinceOrState: formState.provinceOrState.trim(),
        starterServices: formState.starterServices
          .filter((service) => service.name.trim())
          .map((service) => ({
            ...service,
            name: service.name.trim(),
          })),
        studioEmail: formState.studioEmail.trim(),
        studioName: formState.studioName.trim(),
        studioPhone: formState.studioPhone.trim(),
      })

      await refreshCurrentUser()
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to finish onboarding right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    if (stepIndex === 0) {
      return
    }

    setCurrentStep(stepOrder[stepIndex - 1])
  }

  return (
    <AuthLayout
      eyebrow="Studio setup"
      hint="Create your workspace, your primary location, and enough booking structure to start taking appointments without configuration fatigue."
      title="Launch your studio workspace."
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Onboarding</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Set up StudioFlow in a few calm steps</h2>
        <p className="mt-4 text-base leading-8 text-slate-600">{subtitle}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          {stepOrder.map((step, index) => (
            <div
              key={step}
              className={[
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                index <= stepIndex
                  ? 'border-slate-900 bg-slate-950 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-500',
              ].join(' ')}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
                {index + 1}
              </span>
              {stepLabel(step)}
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-6">
          {submitError ? <ErrorState message={submitError} /> : null}

          {currentStep === 'studio' ? (
            <section className="space-y-4">
              <SectionIntro
                description="Name the business and choose the operating profile so StudioFlow can tailor the workspace language."
                title="Business profile"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  error={errors.studioName}
                  label="Studio name"
                  onChange={(event) => setFormState((current) => ({ ...current, studioName: event.target.value }))}
                  placeholder="Atelier North"
                  value={formState.studioName}
                />
                <SelectField
                  error={errors.businessType}
                  label="Business type"
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, businessType: event.target.value as BusinessType }))
                  }
                  value={formState.businessType}
                >
                  {businessTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectField>
                <InputField
                  error={errors.studioEmail}
                  label="Studio email"
                  onChange={(event) => setFormState((current) => ({ ...current, studioEmail: event.target.value }))}
                  placeholder="hello@ateliernorth.com"
                  type="email"
                  value={formState.studioEmail}
                />
                <InputField
                  label="Studio phone"
                  onChange={(event) => setFormState((current) => ({ ...current, studioPhone: event.target.value }))}
                  placeholder="(555) 111-2222"
                  value={formState.studioPhone}
                />
              </div>
            </section>
          ) : null}

          {currentStep === 'location' ? (
            <section className="space-y-4">
              <SectionIntro
                description="Set the primary location first. You can add more locations later from settings once the workspace is live."
                title="Primary location"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  error={errors.locationName}
                  label="Location name"
                  onChange={(event) => setFormState((current) => ({ ...current, locationName: event.target.value }))}
                  placeholder="Downtown Atelier"
                  value={formState.locationName}
                />
                <SelectField
                  error={errors.timezone}
                  label="Timezone"
                  onChange={(event) => setFormState((current) => ({ ...current, timezone: event.target.value }))}
                  value={formState.timezone}
                >
                  {timezoneOptions.map((timezone) => (
                    <option key={timezone} value={timezone}>
                      {timezone}
                    </option>
                  ))}
                </SelectField>
                <InputField
                  error={errors.locationEmail}
                  label="Location email"
                  onChange={(event) => setFormState((current) => ({ ...current, locationEmail: event.target.value }))}
                  placeholder="downtown@ateliernorth.com"
                  type="email"
                  value={formState.locationEmail}
                />
                <InputField
                  label="Location phone"
                  onChange={(event) => setFormState((current) => ({ ...current, locationPhone: event.target.value }))}
                  placeholder="(555) 333-4444"
                  value={formState.locationPhone}
                />
                <InputField
                  label="Address line 1"
                  onChange={(event) => setFormState((current) => ({ ...current, addressLine1: event.target.value }))}
                  placeholder="102 Jasper Ave"
                  value={formState.addressLine1}
                />
                <InputField
                  label="Address line 2"
                  onChange={(event) => setFormState((current) => ({ ...current, addressLine2: event.target.value }))}
                  placeholder="Suite 210"
                  value={formState.addressLine2}
                />
                <InputField
                  label="City"
                  onChange={(event) => setFormState((current) => ({ ...current, city: event.target.value }))}
                  placeholder="Edmonton"
                  value={formState.city}
                />
                <InputField
                  label="Province or state"
                  onChange={(event) => setFormState((current) => ({ ...current, provinceOrState: event.target.value }))}
                  placeholder="Alberta"
                  value={formState.provinceOrState}
                />
                <InputField
                  label="Postal code"
                  onChange={(event) => setFormState((current) => ({ ...current, postalCode: event.target.value }))}
                  placeholder="T5J 0N3"
                  value={formState.postalCode}
                />
                <InputField
                  label="Country"
                  onChange={(event) => setFormState((current) => ({ ...current, country: event.target.value }))}
                  placeholder="Canada"
                  value={formState.country}
                />
              </div>
            </section>
          ) : null}

          {currentStep === 'services' ? (
            <section className="space-y-4">
              <SectionIntro
                description="Add a couple of starter services so the calendar and public booking flow feel alive immediately."
                title="Starter services"
              />
              <div className="space-y-4">
                {formState.starterServices.map((service, index) => (
                  <div key={index} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField
                        error={errors[`starterServices.${index}.name`]}
                        label={`Service ${index + 1}`}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            starterServices: updateStarterService(current.starterServices, index, {
                              name: event.target.value,
                            }),
                          }))
                        }
                        placeholder="Fine line consultation"
                        value={service.name}
                      />
                      <SelectField
                        label="Category"
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            starterServices: updateStarterService(current.starterServices, index, {
                              category: event.target.value as ServiceCategory,
                            }),
                          }))
                        }
                        value={service.category}
                      >
                        {serviceCategories.map((category) => (
                          <option key={category} value={category}>
                            {humanizeEnum(category)}
                          </option>
                        ))}
                      </SelectField>
                      <InputField
                        label="Duration (minutes)"
                        min="15"
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            starterServices: updateStarterService(current.starterServices, index, {
                              durationMinutes: Number(event.target.value || 0),
                            }),
                          }))
                        }
                        type="number"
                        value={String(service.durationMinutes)}
                      />
                      <InputField
                        label="Price"
                        min="0"
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            starterServices: updateStarterService(current.starterServices, index, {
                              price: Number(event.target.value || 0),
                            }),
                          }))
                        }
                        step="0.01"
                        type="number"
                        value={String(service.price)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {currentStep === 'preferences' ? (
            <section className="space-y-4">
              <SectionIntro
                description="Set a few defaults so your team can start booking immediately. You can fine-tune these later in settings."
                title="Booking defaults"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  error={errors.bookingLeadTimeHours}
                  label="Minimum lead time (hours)"
                  min="0"
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      bookingLeadTimeHours: Number(event.target.value || 0),
                    }))
                  }
                  type="number"
                  value={String(formState.bookingLeadTimeHours)}
                />
                <div className="md:col-span-2">
                  <ToggleField
                    checked={formState.defaultDepositRequired}
                    label="Default deposit required"
                    onChange={(checked) =>
                      setFormState((current) => ({
                        ...current,
                        defaultDepositRequired: checked,
                      }))
                    }
                  />
                </div>
                {formState.defaultDepositRequired ? (
                  <InputField
                    error={errors.defaultDepositAmount}
                    label="Default deposit amount"
                    min="0"
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        defaultDepositAmount: Number(event.target.value || 0),
                      }))
                    }
                    step="0.01"
                    type="number"
                    value={String(formState.defaultDepositAmount)}
                  />
                ) : null}
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                This signed-in account is already the studio owner. Finish the workspace details here, then add any optional team structure later.
              </div>
            </section>
          ) : null}

          <div className="flex flex-wrap justify-between gap-3">
            <button
              className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600 disabled:opacity-50"
              disabled={stepIndex === 0 || isSaving}
              onClick={handleBack}
              type="button"
            >
              Back
            </button>
            <button
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isSaving}
              onClick={() => void handleContinue()}
              type="button"
            >
              {isSaving ? 'Creating workspace...' : isLastStep ? 'Finish setup' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

function SectionIntro({ description, title }: { description: string; title: string }) {
  return (
    <div>
      <h3 className="text-2xl font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  )
}

function stepLabel(step: OnboardingStep) {
  switch (step) {
    case 'studio':
      return 'Studio'
    case 'location':
      return 'Location'
    case 'services':
      return 'Services'
    case 'preferences':
      return 'Defaults'
    default:
      return step
  }
}
