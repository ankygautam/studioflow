import { ModulePage } from '../../components/shared/module-page'
import type { AppRole } from '../../data/navigation'

type ConsentFormsPageProps = {
  role: AppRole
}

export function ConsentFormsPage({ role }: ConsentFormsPageProps) {
  return (
    <ModulePage
      description="Handle service-specific waivers with digital signatures, PDF export, and booking-level visibility before appointments begin."
      highlights={[
        'Digital forms mapped to services and business type',
        'Signature capture and completion status per appointment',
        'Downloadable PDF records for compliance and client follow-up',
        'Waiver visibility in customer, receptionist, and staff workflows',
      ]}
      role={role}
      title="Consent forms"
      workflow={[
        'Assign the correct waiver template during booking.',
        'Prompt the client to review and sign before arrival.',
        'Store signature metadata and generate downloadable PDF copies.',
        'Show completion state across dashboards and client records.',
      ]}
    />
  )
}
