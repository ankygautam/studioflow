import type { AuthRole, AuthUser } from './auth-types'

export const authRoleOptions: Array<{ label: string; value: AuthRole }> = [
  { label: 'Admin', value: 'admin' },
  { label: 'Staff', value: 'staff' },
  { label: 'Receptionist', value: 'receptionist' },
  { label: 'Customer', value: 'customer' },
]

export function getRoleDestination(role: AuthRole) {
  if (role === 'admin') return '/dashboard'
  if (role === 'receptionist') return '/appointments'
  return '/calendar'
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function getMockUserFromRole(role: AuthRole, email: string): AuthUser {
  const profiles: Record<AuthRole, { businessName?: string; fullName: string }> = {
    admin: { businessName: 'Atelier North', fullName: 'Avery North' },
    customer: { businessName: 'Atelier North', fullName: 'Maya Laurent' },
    receptionist: { businessName: 'Atelier North', fullName: 'Leah Carter' },
    staff: { businessName: 'Atelier North', fullName: 'Nina Hart' },
  }

  return {
    businessName: profiles[role].businessName,
    email,
    fullName: profiles[role].fullName,
    role,
  }
}
