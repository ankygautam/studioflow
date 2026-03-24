import type { AuthRole } from './auth-types'

export function canAccessRoute(role: AuthRole, slug: string) {
  switch (slug) {
    case 'dashboard':
      return role === 'admin' || role === 'receptionist'
    case 'calendar':
    case 'appointments':
      return role === 'admin' || role === 'receptionist' || role === 'staff'
    case 'clients':
      return role === 'admin' || role === 'receptionist'
    case 'staff':
    case 'services':
      return role === 'admin' || role === 'receptionist' || role === 'staff'
    case 'payments':
    case 'forms':
      return role === 'admin' || role === 'receptionist'
    case 'analytics':
    case 'settings':
      return role === 'admin'
    case 'customer':
      return role === 'customer'
    default:
      return false
  }
}

export function canViewDashboard(role: AuthRole) {
  return role === 'admin' || role === 'receptionist'
}

export function canViewCalendar(role: AuthRole) {
  return role === 'admin' || role === 'receptionist' || role === 'staff'
}

export function canViewAppointments(role: AuthRole) {
  return canViewCalendar(role)
}

export function canCreateBookings(role: AuthRole) {
  return role === 'admin' || role === 'receptionist'
}

export function canManageClients(role: AuthRole) {
  return role === 'admin' || role === 'receptionist'
}

export function canManageServices(role: AuthRole) {
  return role === 'admin'
}

export function canManageStaff(role: AuthRole) {
  return role === 'admin'
}

export function canManagePayments(role: AuthRole) {
  return role === 'admin' || role === 'receptionist'
}

export function canManageConsentForms(role: AuthRole) {
  return role === 'admin' || role === 'receptionist'
}

export function canViewAnalytics(role: AuthRole) {
  return role === 'admin'
}

export function canManageSettings(role: AuthRole) {
  return role === 'admin'
}
