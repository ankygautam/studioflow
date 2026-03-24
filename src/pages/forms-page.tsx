import { SurfaceCard } from '../components/layout/app-shell'
import { PageHeader } from '../components/ui/page-header'
import { StatusBadge } from '../components/ui/status-badge'

const templates = [
  ['Tattoo consent', 'Waiver + aftercare'],
  ['Piercing release', 'Jewelry + placement approval'],
  ['Wellness intake', 'Health notes + service signoff'],
]

const forms = [
  { appointment: 'Mar 24 • 10:30 AM', client: 'Maya Laurent', state: 'Signed' },
  { appointment: 'Mar 24 • 1:15 PM', client: 'Amara Singh', state: 'Pending' },
  { appointment: 'Mar 25 • 11:00 AM', client: 'Leah Monroe', state: 'Pending' },
]

export function FormsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Consent workflows are organized around reusable templates and signed state visibility for teams that need clean waiver tracking."
        eyebrow="Consent Forms"
        title="Templates and signing status"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SurfaceCard title="Form templates">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            {templates.map(([title, subtitle]) => (
              <div key={title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="font-semibold text-slate-950">{title}</p>
                <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
                <button className="mt-5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
                  Edit template
                </button>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Forms list">
          <div className="space-y-3">
            {forms.map((form) => (
              <div key={`${form.client}-${form.appointment}`} className="flex items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p className="font-semibold text-slate-950">{form.client}</p>
                  <p className="mt-1 text-sm text-slate-500">{form.appointment}</p>
                </div>
                <StatusBadge tone={form.state === 'Signed' ? 'success' : 'attention'}>
                  {form.state}
                </StatusBadge>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  )
}
