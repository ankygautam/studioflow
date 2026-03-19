import { ModulePage } from '../../components/shared/module-page'

export function StaffPage() {
  return (
    <ModulePage
      description="Manage the people running the studio: artist profiles, working hours, time off, skill tags, and commission settings."
      highlights={[
        'Staff profiles with specialties, bios, and active role assignments',
        'Working hours and leave entries that affect bookable capacity',
        'Skill tags to match services with qualified artists or specialists',
        'Commission percentages by person or service category',
      ]}
      role="admin"
      title="Staff"
      workflow={[
        'Add team members and assign business roles.',
        'Set recurring working hours and leave blocks.',
        'Map skills to service categories for smarter booking.',
        'Review commissions and update compensation rules.',
      ]}
    />
  )
}
