import { ModulePage } from '../../components/shared/module-page'
import type { AppRole } from '../../data/navigation'

type PaymentsPageProps = {
  role: AppRole
}

export function PaymentsPage({ role }: PaymentsPageProps) {
  return (
    <ModulePage
      description="Track deposits, balances due, invoice records, and appointment-linked payment status for each studio workflow."
      highlights={[
        'Deposit tracking tied directly to service requirements',
        'Pending, partially paid, paid, and refunded state management',
        'Invoice record storage for staff and customer visibility',
        'Balance due reminders that can feed later notification systems',
      ]}
      role={role}
      title="Payments"
      workflow={[
        'Collect deposit at booking when required.',
        'Update balance due after add-ons, reschedules, or partial payments.',
        'Store invoice records and expose them to the right role.',
        'Use payment status to flag operational follow-up inside the dashboard.',
      ]}
    />
  )
}
