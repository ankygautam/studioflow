export type AppRole = 'admin' | 'staff' | 'receptionist' | 'customer'

export type NavItem = {
  description: string
  exact?: boolean
  icon:
    | 'analytics'
    | 'appointments'
    | 'calendar'
    | 'clients'
    | 'consent'
    | 'dashboard'
    | 'payments'
    | 'services'
    | 'settings'
    | 'staff'
  label: string
  to: string
}

export const appRoleMeta: Record<
  AppRole,
  { badge: string; label: string; summary: string }
> = {
  admin: {
    badge: 'Control center',
    label: 'Admin',
    summary: 'Own operations, revenue, staff, services, and studio-wide settings.',
  },
  staff: {
    badge: 'Artist workflow',
    label: 'Staff / Artist',
    summary: 'Manage appointments, clients, services, and day-to-day availability.',
  },
  receptionist: {
    badge: 'Front desk',
    label: 'Receptionist',
    summary: 'Handle bookings, client coordination, deposits, and schedule changes.',
  },
  customer: {
    badge: 'Client portal',
    label: 'Customer',
    summary: 'Review bookings, payments, consent forms, and appointment details.',
  },
}

export const dashboardPathByRole: Record<AppRole, string> = {
  admin: '/admin/dashboard',
  customer: '/customer/dashboard',
  receptionist: '/reception/dashboard',
  staff: '/staff/dashboard',
}

export const roleNavigation: Record<AppRole, NavItem[]> = {
  admin: [
    {
      description: 'Revenue, bookings, and studio health.',
      exact: true,
      icon: 'dashboard',
      label: 'Dashboard',
      to: '/admin/dashboard',
    },
    {
      description: 'Timeline booking board and staff schedules.',
      icon: 'calendar',
      label: 'Calendar',
      to: '/admin/calendar',
    },
    {
      description: 'All bookings, statuses, and operational actions.',
      icon: 'appointments',
      label: 'Appointments',
      to: '/admin/appointments',
    },
    {
      description: 'Profiles, notes, waivers, and history.',
      icon: 'clients',
      label: 'Clients',
      to: '/admin/clients',
    },
    {
      description: 'Roles, schedules, leaves, and commissions.',
      icon: 'staff',
      label: 'Staff',
      to: '/admin/staff',
    },
    {
      description: 'Categories, pricing, durations, and add-ons.',
      icon: 'services',
      label: 'Services',
      to: '/admin/services',
    },
    {
      description: 'Deposits, balances due, and invoice tracking.',
      icon: 'payments',
      label: 'Payments',
      to: '/admin/payments',
    },
    {
      description: 'Digital signatures, PDFs, and waiver status.',
      icon: 'consent',
      label: 'Consent Forms',
      to: '/admin/consent-forms',
    },
    {
      description: 'Revenue, trends, and performance reporting.',
      icon: 'analytics',
      label: 'Analytics',
      to: '/admin/analytics',
    },
    {
      description: 'Business setup, policies, and preferences.',
      icon: 'settings',
      label: 'Settings',
      to: '/admin/settings',
    },
  ],
  customer: [
    {
      description: 'Upcoming sessions, waivers, and next actions.',
      exact: true,
      icon: 'dashboard',
      label: 'Dashboard',
      to: '/customer/dashboard',
    },
    {
      description: 'Calendar view for your upcoming sessions.',
      icon: 'calendar',
      label: 'Calendar',
      to: '/customer/calendar',
    },
    {
      description: 'View, reschedule, or cancel bookings.',
      icon: 'appointments',
      label: 'Appointments',
      to: '/customer/appointments',
    },
    {
      description: 'Track deposits, balances, and invoices.',
      icon: 'payments',
      label: 'Payments',
      to: '/customer/payments',
    },
    {
      description: 'Review and sign service-specific forms.',
      icon: 'consent',
      label: 'Consent Forms',
      to: '/customer/consent-forms',
    },
    {
      description: 'Profile preferences and notifications.',
      icon: 'settings',
      label: 'Settings',
      to: '/customer/settings',
    },
  ],
  receptionist: [
    {
      description: 'Front-desk bookings, payments, and alerts.',
      exact: true,
      icon: 'dashboard',
      label: 'Dashboard',
      to: '/reception/dashboard',
    },
    {
      description: 'Manage the live calendar and staff columns.',
      icon: 'calendar',
      label: 'Calendar',
      to: '/reception/calendar',
    },
    {
      description: 'Manage daily scheduling and waitlists.',
      icon: 'appointments',
      label: 'Appointments',
      to: '/reception/appointments',
    },
    {
      description: 'Client records, notes, and visit history.',
      icon: 'clients',
      label: 'Clients',
      to: '/reception/clients',
    },
    {
      description: 'Offerings, durations, and deposit rules.',
      icon: 'services',
      label: 'Services',
      to: '/reception/services',
    },
    {
      description: 'Pending balances and invoice records.',
      icon: 'payments',
      label: 'Payments',
      to: '/reception/payments',
    },
    {
      description: 'Daily trends and business insights.',
      icon: 'analytics',
      label: 'Analytics',
      to: '/reception/analytics',
    },
    {
      description: 'Studio hours, reminders, and settings.',
      icon: 'settings',
      label: 'Settings',
      to: '/reception/settings',
    },
  ],
  staff: [
    {
      description: 'Your day, availability, and task queue.',
      exact: true,
      icon: 'dashboard',
      label: 'Dashboard',
      to: '/staff/dashboard',
    },
    {
      description: 'See the live calendar and session timing.',
      icon: 'calendar',
      label: 'Calendar',
      to: '/staff/calendar',
    },
    {
      description: 'See bookings, buffers, and session prep.',
      icon: 'appointments',
      label: 'Appointments',
      to: '/staff/appointments',
    },
    {
      description: 'Client notes, references, and visit history.',
      icon: 'clients',
      label: 'Clients',
      to: '/staff/clients',
    },
    {
      description: 'Assigned services, timings, and add-ons.',
      icon: 'services',
      label: 'Services',
      to: '/staff/services',
    },
    {
      description: 'View waivers and signature status.',
      icon: 'consent',
      label: 'Consent Forms',
      to: '/staff/consent-forms',
    },
    {
      description: 'Working hours and account preferences.',
      icon: 'settings',
      label: 'Settings',
      to: '/staff/settings',
    },
  ],
}
