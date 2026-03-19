import { ModulePage } from '../../components/shared/module-page'
import type { AppRole } from '../../data/navigation'

type AppointmentsPageProps = {
  role: AppRole
}

export function AppointmentsPage({ role }: AppointmentsPageProps) {
  return (
    <ModulePage
      description="Coordinate availability, service durations, slot selection, buffer times, and appointment changes from a single booking workflow."
      highlights={[
        'Calendar view with day, week, and artist-focused scheduling modes',
        'Service-aware slot selection based on duration and assigned staff skills',
        'Reschedule and cancellation flows with business rules and notes',
        'Buffer handling before and after sessions for prep and cleanup',
      ]}
      role={role}
      title="Appointments"
      workflow={[
        'Select business date, staff member, and service combination.',
        'Lock a timeslot that respects availability, leave windows, and buffers.',
        'Capture deposits, waiver requirements, and client instructions.',
        'Update status as confirmed, checked-in, completed, cancelled, or no-show.',
      ]}
    />
  )
}
