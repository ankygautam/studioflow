export type NavigationItem = {
  description: string
  eyebrow: string
  icon:
    | 'analytics'
    | 'appointments'
    | 'audit'
    | 'calendar'
    | 'clients'
    | 'consent'
    | 'dashboard'
    | 'inventory'
    | 'packages'
    | 'payments'
    | 'services'
    | 'settings'
    | 'waitlist'
  label: string
  slug: string
}

export const navigationItems: NavigationItem[] = [
  {
    description: 'Revenue, bookings, and operational pulse in one control view.',
    eyebrow: 'Overview',
    icon: 'dashboard',
    label: 'Dashboard',
    slug: 'dashboard',
  },
  {
    description: 'Timeline booking board with staff schedules and availability.',
    eyebrow: 'Scheduling',
    icon: 'calendar',
    label: 'Calendar',
    slug: 'calendar',
  },
  {
    description: 'Daily bookings, statuses, check-ins, and changes.',
    eyebrow: 'Operations',
    icon: 'appointments',
    label: 'Appointments',
    slug: 'appointments',
  },
  {
    description: 'Client profiles, notes, history, and relationship details.',
    eyebrow: 'CRM',
    icon: 'clients',
    label: 'Clients',
    slug: 'clients',
  },
  {
    description: 'Services, categories, durations, and pricing structure.',
    eyebrow: 'Catalog',
    icon: 'services',
    label: 'Services',
    slug: 'services',
  },
  {
    description: 'Clients waiting for openings across your studio locations.',
    eyebrow: 'Retention',
    icon: 'waitlist',
    label: 'Waitlist',
    slug: 'waitlist',
  },
  {
    description: 'Prepaid visit packs and client retention bundles.',
    eyebrow: 'Retention',
    icon: 'packages',
    label: 'Packages',
    slug: 'packages',
  },
  {
    description: 'Aftercare, retail, and operational stock levels in one catalog.',
    eyebrow: 'Inventory',
    icon: 'inventory',
    label: 'Inventory',
    slug: 'inventory',
  },
  {
    description: 'Deposits, balances, invoices, and payment status views.',
    eyebrow: 'Finance',
    icon: 'payments',
    label: 'Payments',
    slug: 'payments',
  },
  {
    description: 'Digital waivers, signatures, templates, and consent status.',
    eyebrow: 'Compliance',
    icon: 'consent',
    label: 'Consent Forms',
    slug: 'forms',
  },
  {
    description: 'Performance trends, demand windows, and service insights.',
    eyebrow: 'Intelligence',
    icon: 'analytics',
    label: 'Analytics',
    slug: 'analytics',
  },
  {
    description: 'Track who changed what across bookings, clients, payments, and settings.',
    eyebrow: 'Governance',
    icon: 'audit',
    label: 'Audit Logs',
    slug: 'audit-logs',
  },
  {
    description: 'Studio settings, business profile, and workflow preferences.',
    eyebrow: 'Admin',
    icon: 'settings',
    label: 'Settings',
    slug: 'settings',
  },
]
