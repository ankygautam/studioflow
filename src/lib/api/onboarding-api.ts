import { api } from './http'
import type { StudioOnboardingPayload, StudioOnboardingRecord } from './types'

export function onboardStudio(payload: StudioOnboardingPayload) {
  return api.post<StudioOnboardingRecord>('/api/onboarding/studio', payload)
}
