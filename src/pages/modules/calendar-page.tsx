import { ModulePage } from '../../components/shared/module-page'
import type { AppRole } from '../../data/navigation'

type CalendarPageProps = {
  role: AppRole
}

export function CalendarPage({ role }: CalendarPageProps) {
  return (
    <ModulePage
      description="The calendar is the operational core of StudioFlow: a premium scheduling surface for staff columns, booking slots, buffers, and live day-to-day flow."
      highlights={[
        'Staff-column scheduling view with scrollable hourly timeline',
        'Top control bar for location, staff, date, and view switching',
        'Muted booking cards with service, status, and payment context',
        'Fast actions for opening details, creating bookings, and rescheduling',
      ]}
      role={role}
      title="Calendar"
      workflow={[
        'Filter by location, staff, and date range from the control bar.',
        'Scan availability and appointment density across staff columns.',
        'Open booking details or create new slots directly from the grid.',
        'Use the calendar as the main dispatch surface for studio operations.',
      ]}
    />
  )
}
