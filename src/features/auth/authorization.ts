import type { AuthRole } from './auth-types'

export function canAccessRoute(role: AuthRole, slug: string) {
  switch (slug) {
    case 'dashboard':
      return role === 'admin'
    case 'calendar':
    case 'appointments':
      return role === 'admin'
    case 'clients':
      return role === 'admin'
    case 'staff':
      return false
    case 'services':
      return role === 'admin'
    case 'payments':
    case 'forms':
      return role === 'admin'
    case 'analytics':
    case 'audit-logs':
    case 'settings':
      return role === 'admin'
    case 'customer':
      return role === 'customer'
    default:
      return false
  }
}

export function canViewDashboard(role: AuthRole) {
  return role === 'admin'
}

export function canViewCalendar(role: AuthRole) {
  return role === 'admin'
}

export function canViewAppointments(role: AuthRole) {
  return canViewCalendar(role)
}

export function canCreateBookings(role: AuthRole) {
  return role === 'admin'
}

export function canEditAppointments(role: AuthRole) {
  return role === 'admin'
}

export function canEditAppointmentDetails(role: AuthRole) {
  return role === 'admin'
}

export function canUpdateAppointmentStatus(role: AuthRole) {
  return role === 'admin'
}

export function canDeleteAppointments(role: AuthRole) {
  return role === 'admin'
}

export function canManageClients(role: AuthRole) {
  return role === 'admin'
}

export function canManageServices(role: AuthRole) {
  return role === 'admin'
}

export function canManageStaff(_role: AuthRole) {
  return false
}

export function canManagePayments(role: AuthRole) {
  return role === 'admin'
}

export function canManageConsentForms(role: AuthRole) {
  return role === 'admin'
}

export function canViewAnalytics(role: AuthRole) {
  return role === 'admin'
}

export function canManageSettings(role: AuthRole) {
  return role === 'admin'
}

export function canViewAuditHistory(role: AuthRole) {
  return role === 'admin'
}

export function canViewAuditLogs(role: AuthRole) {
  return canViewAuditHistory(role)
}

export function canCancelAppointments(role: AuthRole) {
  return role === 'admin'
}
