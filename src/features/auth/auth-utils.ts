import type { BackendUserRole } from '../../lib/api/auth-api'
import type { AuthRole } from './auth-types'

export const authRoleOptions: Array<{ label: string; value: AuthRole }> = [
  { label: 'Admin', value: 'admin' },
  { label: 'Staff', value: 'staff' },
  { label: 'Receptionist', value: 'receptionist' },
  { label: 'Customer', value: 'customer' },
]

export function getRoleDestination(role: AuthRole) {
  if (role === 'admin') return '/dashboard'
  if (role === 'customer') return '/book/studioflow-hq'
  if (role === 'receptionist') return '/appointments'
  return '/calendar'
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function mapBackendRole(role: BackendUserRole): AuthRole {
  if (role === 'ADMIN') return 'admin'
  if (role === 'RECEPTIONIST') return 'receptionist'
  if (role === 'CUSTOMER') return 'customer'
  return 'staff'
}

export function mapAuthRoleToBackend(role: AuthRole): BackendUserRole {
  if (role === 'admin') return 'ADMIN'
  if (role === 'receptionist') return 'RECEPTIONIST'
  if (role === 'customer') return 'CUSTOMER'
  return 'STAFF'
}
