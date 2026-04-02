export type AuthRole = 'customer' | 'owner' | 'receptionist' | 'staff'

export type AuthUser = {
  email: string
  fullName: string
  id: string
  locationId: string | null
  onboardingCompleted: boolean
  role: AuthRole
  studioId: string | null
  studioName: string | null
}
