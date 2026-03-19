import {
  PrimaryButton,
  ProductPageHeader,
  StatusBadge,
  SummaryCard,
  Surface,
} from '../../components/shared/product-ui'
import type { AppRole } from '../../data/navigation'

type ConsentFormsPageProps = {
  role: AppRole
}

const templates = [
  { name: 'Tattoo waiver v3', type: 'Tattoo', updated: 'Updated 2 days ago' },
  { name: 'Piercing consent v2', type: 'Piercing', updated: 'Updated 5 days ago' },
  { name: 'Wellness intake', type: 'Wellness', updated: 'Updated 1 week ago' },
]

const pendingForms = [
  { client: 'Amara Singh', date: 'Mar 21', service: 'Piercing follow-up', status: 'Pending signature' },
  { client: 'Marcus Lee', date: 'Mar 22', service: 'Lettering touch-up', status: 'Pending signature' },
]

const signedForms = [
  { client: 'Maya Laurent', date: 'Mar 21', service: 'Fine line tattoo consult', status: 'Signed' },
  { client: 'Isla Romero', date: 'Mar 20', service: 'Balayage refresh', status: 'Signed' },
  { client: 'Derek Hoffman', date: 'Mar 19', service: 'Premium barber package', status: 'Signed' },
]

export function ConsentFormsPage({ role }: ConsentFormsPageProps) {
  return (
    <div className="space-y-6">
      <ProductPageHeader
        action={<PrimaryButton>New form template</PrimaryButton>}
        description={`A premium consent management surface for ${role} workflows, combining template control, signature tracking, and downloadable records.`}
        title="Consent Forms"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard caption="Pending signatures" meta="Awaiting completion" value="12" />
        <SummaryCard caption="Signed today" meta="Captured this morning" value="8" />
        <SummaryCard caption="Total forms" meta="Across active businesses" value="264" />
        <SummaryCard caption="Expiring documents" meta="Review this week" value="5" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Surface title="Form templates">
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.name}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{template.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{template.type}</p>
                  </div>
                  <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    Edit
                  </button>
                </div>
                <p className="mt-3 text-sm text-slate-500">{template.updated}</p>
              </div>
            ))}
          </div>
        </Surface>

        <Surface title="Pending forms">
          <div className="space-y-3">
            {pendingForms.map((form) => (
              <div
                key={`${form.client}-${form.date}`}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{form.client}</p>
                    <p className="mt-1 text-sm text-slate-500">{form.service}</p>
                  </div>
                  <StatusBadge tone="warning">{form.status}</StatusBadge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">{form.date}</p>
                  <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    Remind
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <Surface title="Signed forms">
          <div className="space-y-3">
            {signedForms.map((form) => (
              <div
                key={`${form.client}-${form.date}`}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{form.client}</p>
                    <p className="mt-1 text-sm text-slate-500">{form.service}</p>
                  </div>
                  <StatusBadge tone="success">{form.status}</StatusBadge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">{form.date}</p>
                  <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  )
}
