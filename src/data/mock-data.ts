import type { AppRole } from './navigation'

export type DashboardMetric = {
  caption: string
  value: string
}

export type DashboardPanel = {
  items: string[]
  title: string
}

export const targetBusinesses = [
  'Tattoo studios',
  'Barber shops',
  'Hair salons',
  'Nail studios',
  'Piercing studios',
  'Massage and wellness clinics',
  'Makeup artists',
  'Freelancers with appointments',
]

export const mvpModules = [
  'Role-based authentication',
  'Booking calendar and slot selection',
  'Client records and studio notes',
  'Staff schedules and skill tags',
  'Services, pricing, and add-ons',
  'Deposits, balances, and invoices',
  'Consent forms and digital signatures',
  'Operational dashboards and reports',
]

export const buildPhases = [
  {
    phase: 'Phase 1',
    summary: 'Project setup, auth, layout system, and role dashboards.',
  },
  {
    phase: 'Phase 2',
    summary: 'Services, staff, and client CRUD foundations.',
  },
  {
    phase: 'Phase 3',
    summary: 'Appointment calendar, booking flow, and payment tracking.',
  },
  {
    phase: 'Phase 4',
    summary: 'Consent forms, uploads, analytics, and operational polish.',
  },
]

export const dashboardContent: Record<
  AppRole,
  {
    metrics: DashboardMetric[]
    panels: DashboardPanel[]
    summary: string
    title: string
  }
> = {
  admin: {
    metrics: [
      { caption: 'Today bookings', value: '28' },
      { caption: 'Revenue snapshot', value: '$4.8k' },
      { caption: 'Pending payments', value: '$790' },
      { caption: 'Staff on shift', value: '11 / 14' },
    ],
    panels: [
      {
        items: [
          'Tattoo consults are filling the 2:00 PM to 5:00 PM window.',
          'Two artists have leave requests waiting for approval.',
          'Deposit-required services are converting at 71% this week.',
        ],
        title: 'Operations pulse',
      },
      {
        items: [
          'Confirm buffer rules for piercing and wellness add-ons.',
          'Review overdue balances before end-of-day settlement.',
          'Finalize March service bundles and seasonal pricing.',
        ],
        title: 'Priority queue',
      },
    ],
    summary:
      'Admin views center on revenue, staffing, and studio-wide bottlenecks across appointments, services, and consent compliance.',
    title: 'Admin dashboard',
  },
  customer: {
    metrics: [
      { caption: 'Next appointment', value: 'Mar 21, 1:30 PM' },
      { caption: 'Forms remaining', value: '1' },
      { caption: 'Open balance', value: '$95' },
      { caption: 'Saved references', value: '4 files' },
    ],
    panels: [
      {
        items: [
          'Review artist notes before your next booking.',
          'Upload reference files for your touch-up session.',
          'Track deposit and remaining balance from the same portal.',
        ],
        title: 'Customer actions',
      },
      {
        items: [
          'Reschedule with self-serve slot selection.',
          'Sign service-specific waivers from any device.',
          'Download invoices after every appointment.',
        ],
        title: 'Self-service tools',
      },
    ],
    summary:
      'The customer portal keeps bookings, waivers, payments, and reference uploads in one clean timeline.',
    title: 'Customer dashboard',
  },
  receptionist: {
    metrics: [
      { caption: 'Check-ins today', value: '19' },
      { caption: 'Waitlist requests', value: '6' },
      { caption: 'Balances due', value: '$430' },
      { caption: 'Schedule gaps', value: '3 slots' },
    ],
    panels: [
      {
        items: [
          'Move walk-ins into open barber and nail slots.',
          'Collect missing deposits before confirming weekend bookings.',
          'Follow up on unsigned waivers for piercing appointments.',
        ],
        title: 'Front desk focus',
      },
      {
        items: [
          'Use notes to flag late arrivals and prep requirements.',
          'Offer service add-ons when appointments have extra buffer.',
          'Escalate no-show patterns to the admin dashboard.',
        ],
        title: 'Workflow guide',
      },
    ],
    summary:
      'Reception flows prioritize booking control, fast client lookup, payment follow-up, and fewer handoff mistakes.',
    title: 'Reception dashboard',
  },
  staff: {
    metrics: [
      { caption: 'Sessions today', value: '7' },
      { caption: 'Next client', value: '45 min' },
      { caption: 'Reference files', value: '12 new' },
      { caption: 'Availability left', value: '2.5 hrs' },
    ],
    panels: [
      {
        items: [
          'Review consent status before beginning any body-mod service.',
          'Check notes and uploaded references before consults.',
          'Block prep and cleanup time using service buffers.',
        ],
        title: 'Session readiness',
      },
      {
        items: [
          'Update skill tags as you unlock new services.',
          'Log leave early to prevent overbooking.',
          'Monitor commissions by service category and add-on sales.',
        ],
        title: 'Professional workflow',
      },
    ],
    summary:
      'Staff dashboards are optimized for a focused day view: appointments, prep, references, waivers, and personal availability.',
    title: 'Staff dashboard',
  },
}
