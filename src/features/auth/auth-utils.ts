import type { BackendUserRole } from '../../lib/api/auth-api'
import { PUBLIC_BOOKING_DEMO_ROUTE } from '../../lib/demo-routes'
import type { AuthRole } from './auth-types'

export function getRoleDestination(role: AuthRole) {
  if (role === 'owner') return '/dashboard'
  if (role === 'customer') return PUBLIC_BOOKING_DEMO_ROUTE
  return '/dashboard'
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function mapBackendRole(role: BackendUserRole): AuthRole {
  if (role === 'ADMIN' || role === 'OWNER') return 'owner'
  if (role === 'RECEPTIONIST') return 'receptionist'
  if (role === 'CUSTOMER') return 'customer'
  return 'staff'
}

export function isOwnerRole(role: AuthRole) {
  return role === 'owner'
}
