import type { AuthRole } from './auth-types'
import { isOwnerRole } from './auth-utils'

export function canAccessRoute(role: AuthRole, slug: string) {
  switch (slug) {
    case 'dashboard':
      return isOwnerRole(role)
    case 'calendar':
    case 'appointments':
      return isOwnerRole(role)
    case 'clients':
      return isOwnerRole(role)
    case 'staff':
      return false
    case 'services':
      return isOwnerRole(role)
    case 'packages':
      return isOwnerRole(role)
    case 'inventory':
      return isOwnerRole(role)
    case 'payments':
    case 'forms':
      return isOwnerRole(role)
    case 'analytics':
    case 'audit-logs':
    case 'settings':
      return isOwnerRole(role)
    case 'customer':
      return role === 'customer'
    default:
      return false
  }
}

export function canViewDashboard(role: AuthRole) {
  return isOwnerRole(role)
}

export function canViewCalendar(role: AuthRole) {
  return isOwnerRole(role)
}

export function canViewAppointments(role: AuthRole) {
  return canViewCalendar(role)
}

export function canCreateBookings(role: AuthRole) {
  return isOwnerRole(role)
}

export function canEditAppointments(role: AuthRole) {
  return isOwnerRole(role)
}

export function canEditAppointmentDetails(role: AuthRole) {
  return isOwnerRole(role)
}

export function canUpdateAppointmentStatus(role: AuthRole) {
  return isOwnerRole(role)
}

export function canDeleteAppointments(role: AuthRole) {
  return isOwnerRole(role)
}

export function canManageClients(role: AuthRole) {
  return isOwnerRole(role)
}

export function canManageServices(role: AuthRole) {
  return isOwnerRole(role)
}

export function canManagePackages(role: AuthRole) {
  return isOwnerRole(role)
}

export function canManageInventory(role: AuthRole) {
  return isOwnerRole(role)
}

export function canManageStaff(role: AuthRole) {
  void role
  return false
}

export function canManagePayments(role: AuthRole) {
  return isOwnerRole(role)
}

export function canManageConsentForms(role: AuthRole) {
  return isOwnerRole(role)
}

export function canViewAnalytics(role: AuthRole) {
  return isOwnerRole(role)
}

export function canManageSettings(role: AuthRole) {
  return isOwnerRole(role)
}

export function canViewAuditHistory(role: AuthRole) {
  return isOwnerRole(role)
}

export function canViewAuditLogs(role: AuthRole) {
  return canViewAuditHistory(role)
}

export function canCancelAppointments(role: AuthRole) {
  return isOwnerRole(role)
}
