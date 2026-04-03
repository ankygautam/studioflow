import type { BusinessType, ServiceCategory, StudioOnboardingPayload } from '../../../lib/api/types'
import type { OnboardingErrors, OnboardingStep, StarterServiceForm } from '../types/onboarding'

export const stepOrder: OnboardingStep[] = ['studio', 'location', 'services', 'preferences']

export const businessTypes: Array<{ label: string; value: BusinessType }> = [
  { label: 'Tattoo Studio', value: 'TATTOO_STUDIO' },
  { label: 'Barber Shop', value: 'BARBER_SHOP' },
  { label: 'Salon', value: 'SALON' },
  { label: 'Piercing Studio', value: 'PIERCING_STUDIO' },
  { label: 'Nail Studio', value: 'NAIL_STUDIO' },
  { label: 'Wellness Clinic', value: 'WELLNESS_CLINIC' },
  { label: 'Solo Practice', value: 'SOLO_PRACTICE' },
]

export const serviceCategories: ServiceCategory[] = [
  'TATTOO',
  'BARBER',
  'HAIR',
  'NAIL',
  'PIERCING',
  'WELLNESS',
  'CONSULTATION',
  'OTHER',
]

export function createStarterService(
  overrides?: Partial<StarterServiceForm>,
): StarterServiceForm {
  return {
    category: overrides?.category ?? 'HAIR',
    durationMinutes: overrides?.durationMinutes ?? 60,
    name: overrides?.name ?? '',
    price: overrides?.price ?? 95,
  }
}

export function updateStarterService(
  services: StarterServiceForm[],
  index: number,
  updates: Partial<StarterServiceForm>,
) {
  return services.map((service, serviceIndex) =>
    serviceIndex === index ? { ...service, ...updates } : service,
  )
}

export function validateStep(formState: StudioOnboardingPayload, step: OnboardingStep) {
  const errors: OnboardingErrors = {}

  if (step === 'studio') {
    if (!formState.studioName.trim()) {
      errors.studioName = 'Studio name is required.'
    }

    if (formState.studioEmail.trim() && !isEmail(formState.studioEmail)) {
      errors.studioEmail = 'Enter a valid studio email.'
    }
  }

  if (step === 'location') {
    if (!formState.locationName.trim()) {
      errors.locationName = 'Primary location name is required.'
    }

    if (!formState.timezone.trim()) {
      errors.timezone = 'Timezone is required.'
    }

    if (formState.locationEmail.trim() && !isEmail(formState.locationEmail)) {
      errors.locationEmail = 'Enter a valid location email.'
    }
  }

  if (step === 'services') {
    formState.starterServices.forEach((service, index) => {
      if (service.name.trim() && service.durationMinutes < 15) {
        errors[`starterServices.${index}.name`] = 'Duration should be at least 15 minutes for starter services.'
      }
    })
  }

  if (step === 'preferences') {
    if (formState.bookingLeadTimeHours < 0) {
      errors.bookingLeadTimeHours = 'Lead time cannot be negative.'
    }

    if (formState.defaultDepositRequired && formState.defaultDepositAmount < 0) {
      errors.defaultDepositAmount = 'Deposit amount must be zero or more.'
    }
  }

  return errors
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
