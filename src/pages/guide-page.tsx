import { Link } from 'react-router-dom'
import { AuthHeader } from '../components/auth/auth-header'
import { AuthLayout } from '../components/layout/auth-layout'
import { PUBLIC_BOOKING_DEMO_ROUTE } from '../lib/demo-routes'

const guideSections = [
  {
    copy: 'Start with the dashboard and calendar to understand day-to-day scheduling, revenue visibility, and recent activity.',
    label: 'Start with the workspace',
  },
  {
    copy: 'Explore staff, clients, services, payments, consent forms, notifications, analytics, and audit logs to see the operational breadth.',
    label: 'Move through core operations',
  },
  {
    copy: 'Finish with the public booking flow and customer self-service management to see how the product handles the customer journey.',
    label: 'Finish with customer flows',
  },
] as const

export function GuidePage() {
  return (
    <AuthLayout
      eyebrow="Guide"
      hint="A quick walkthrough of what StudioFlow covers, where to start, and which flows are strongest for demos or first-time exploration."
      title="Understand the product before you explore."
    >
      <div className="mx-auto max-w-[520px]">
        <AuthHeader
          description="Use this quick guide to understand how the workspace is organized and which paths give the strongest overview first."
          eyebrow="Product guide"
          title="Explore StudioFlow with purpose"
        />

        <div className="mt-8 space-y-4">
          {guideSections.map((section, index) => (
            <div
              key={section.label}
              className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Step {index + 1}
              </p>
              <p className="mt-3 text-base font-semibold text-slate-950">{section.label}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{section.copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-2xl bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-[#16233b] hover:text-white focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            to="/dashboard"
          >
            Open dashboard
          </Link>
          <Link
            className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
            to={PUBLIC_BOOKING_DEMO_ROUTE}
          >
            Try booking flow
          </Link>
          <Link
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
            to="/login"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
