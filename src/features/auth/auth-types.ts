export type AuthRole = 'admin' | 'customer' | 'receptionist' | 'staff'

export type AuthUser = {
  businessName?: string
  email: string
  fullName: string
  id: string
  locationId: string | null
  onboardingCompleted: boolean
  role: AuthRole
  studioId: string | null
}
