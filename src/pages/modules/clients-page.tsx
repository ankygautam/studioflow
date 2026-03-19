import { ModulePage } from '../../components/shared/module-page'
import type { AppRole } from '../../data/navigation'

type ClientsPageProps = {
  role: AppRole
}

export function ClientsPage({ role }: ClientsPageProps) {
  return (
    <ModulePage
      description="Keep every client profile connected to notes, visit history, documents, and consent state so the studio can work from shared context."
      highlights={[
        'Client profiles with contact info, preferences, and assigned business',
        'Studio notes for allergies, style preferences, and appointment prep',
        'Visit history for repeat business, service habits, and follow-ups',
        'Reference file uploads and waiver visibility in one timeline',
      ]}
      role={role}
      title="Clients"
      workflow={[
        'Create or search for a client profile before booking.',
        'Attach notes, uploaded references, and previous service history.',
        'Review consent status and outstanding documents before the appointment.',
        'Surface return-visit patterns for retention and personalized service.',
      ]}
    />
  )
}
