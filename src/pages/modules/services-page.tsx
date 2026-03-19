import { ModulePage } from '../../components/shared/module-page'
import type { AppRole } from '../../data/navigation'

type ServicesPageProps = {
  role: AppRole
}

export function ServicesPage({ role }: ServicesPageProps) {
  return (
    <ModulePage
      description="Define what the studio sells, how long it takes, who can perform it, and whether deposits or add-ons apply."
      highlights={[
        'Service categories for tattoo, salon, barber, piercing, beauty, and wellness flows',
        'Duration, pricing, and deposit-required rules',
        'Add-ons that expand appointments without breaking the schedule',
        'Role-aware visibility so staff only see relevant offerings',
      ]}
      role={role}
      title="Services"
      workflow={[
        'Create categories and service records with default durations.',
        'Set price, deposit amount, and optional add-ons.',
        'Attach staff skill tags and service requirements.',
        'Use these rules to drive booking availability and revenue reporting.',
      ]}
    />
  )
}
