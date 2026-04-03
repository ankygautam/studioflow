import type { ServiceCategory } from '../../../lib/api/types'

export type OnboardingStep = 'location' | 'preferences' | 'services' | 'studio'

export type OnboardingErrors = Partial<Record<string, string>>

export type StarterServiceForm = {
  category: ServiceCategory
  durationMinutes: number
  name: string
  price: number
}
