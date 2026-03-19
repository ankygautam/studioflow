import { ModulePage } from '../../components/shared/module-page'
import type { AppRole } from '../../data/navigation'

type AnalyticsPageProps = {
  role: AppRole
}

export function AnalyticsPage({ role }: AnalyticsPageProps) {
  return (
    <ModulePage
      description="Analytics gives StudioFlow a premium business intelligence layer across bookings, revenue, staff performance, and service trends."
      highlights={[
        'Revenue, booking volume, and service mix reporting',
        'Cancellation trends, repeat client rate, and busiest hours',
        'Staff performance and contribution summaries',
        'Date, location, staff, and service-based filtering',
      ]}
      role={role}
      title="Analytics"
      workflow={[
        'Pick a time window and business filter set.',
        'Compare booking volume, revenue, and client retention trends.',
        'Identify top services and staffing opportunities.',
        'Use insights to adjust schedules, promotions, and pricing.',
      ]}
    />
  )
}
