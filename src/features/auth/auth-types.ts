export type AuthRole = 'admin' | 'customer' | 'receptionist' | 'staff'

export type AuthUser = {
  businessName?: string
  email: string
  fullName: string
  id: string
  role: AuthRole
  studioId: string | null
}
