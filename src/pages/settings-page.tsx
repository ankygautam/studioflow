import { SurfaceCard } from '../components/layout/app-shell'
import { PageHeader } from '../components/ui/page-header'

const settingGroups = [
  ['Studio profile', 'Business name, contact details, and profile summary'],
  ['Business hours', 'Working schedule and location availability'],
  ['Notifications', 'Email, text, and reminder preferences'],
  ['Booking preferences', 'Deposits, lead time, buffers, and confirmations'],
] as const

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="A clean settings workspace for the business profile, operating hours, notifications, and booking behavior."
        eyebrow="Settings"
        title="Studio configuration"
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {settingGroups.map(([title, description]) => (
          <SurfaceCard key={title} title={title}>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm leading-7 text-slate-600">{description}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <FieldPlaceholder label="Primary field" />
                <FieldPlaceholder label="Secondary field" />
                <FieldPlaceholder label="Optional field" />
                <FieldPlaceholder label="Control" />
              </div>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </div>
  )
}

function FieldPlaceholder({ label }: { label: string }) {
  return (
    <div className="rounded-[18px] border border-white/80 bg-white px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <div className="mt-3 h-3 rounded-full bg-slate-100" />
    </div>
  )
}
