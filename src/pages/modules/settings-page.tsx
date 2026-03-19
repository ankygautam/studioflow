import { ModulePage } from '../../components/shared/module-page'
import type { AppRole } from '../../data/navigation'

type SettingsPageProps = {
  role: AppRole
}

export function SettingsPage({ role }: SettingsPageProps) {
  return (
    <ModulePage
      description="Centralize studio preferences, availability defaults, account details, and future integrations without scattering setup across the product."
      highlights={[
        'Business profile, hours, and default booking policies',
        'Role-aware preference panels with cleaner permission boundaries',
        'Deposit and cancellation rule configuration for future payment logic',
        'Hooks for Firebase, PostgreSQL, Stripe, and notification settings',
      ]}
      role={role}
      title="Settings"
      workflow={[
        'Configure business identity and operating hours.',
        'Set default appointment policies and cancellation windows.',
        'Adjust role-specific preferences and account details.',
        'Prepare integrations and compliance settings as the backend lands.',
      ]}
    />
  )
}
