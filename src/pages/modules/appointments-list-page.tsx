import { ModulePage } from '../../components/shared/module-page'
import type { AppRole } from '../../data/navigation'

type AppointmentsListPageProps = {
  role: AppRole
}

export function AppointmentsListPage({ role }: AppointmentsListPageProps) {
  return (
    <ModulePage
      description="Appointments complements the calendar with a more compact operational list for filtering, searching, and handling booking states in bulk."
      highlights={[
        'Search and filter bookings by client, staff, service, and status',
        'Quick actions for confirm, reschedule, cancel, and mark complete',
        'Deposit and consent visibility without leaving the bookings view',
        'A calmer list mode for admin and front-desk workflows',
      ]}
      role={role}
      title="Appointments"
      workflow={[
        'Search or filter the booking queue for the active period.',
        'Review client, service, status, payment, and consent signals together.',
        'Take quick operational actions without opening the full calendar.',
        'Use list mode for triage, reporting, and front-desk follow-up.',
      ]}
    />
  )
}
