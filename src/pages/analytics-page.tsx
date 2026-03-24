import { SurfaceCard } from '../components/layout/app-shell'
import { PageHeader } from '../components/ui/page-header'
import { StatCard } from '../components/ui/stat-card'
import { StatusBadge } from '../components/ui/status-badge'

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="A premium analytics layer focused on revenue movement, booking patterns, top services, and operational risks."
        eyebrow="Analytics"
        title="Performance signals"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard accent="mint" helper="Compared with last week" label="Revenue trend" value="+14%" />
        <StatCard accent="violet" helper="Core booking momentum" label="Bookings trend" value="+9%" />
        <StatCard accent="warm" helper="Requires operational attention" label="No-show rate" value="3.8%" />
        <StatCard helper="Current cancellation pressure" label="Cancellation rate" value="6.2%" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <SurfaceCard title="Revenue chart">
          <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex h-56 items-end gap-3">
              {[42, 56, 48, 61, 68, 72, 58].map((height, index) => (
                <div key={height} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-44 w-full items-end rounded-[18px] bg-white px-2 py-2">
                    <div
                      className="w-full rounded-[14px] bg-[linear-gradient(180deg,#8691ff_0%,#b7d9ff_100%)]"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Insights">
          <div className="space-y-3">
            <InsightRow label="Cancellation spike" value="Thursday mornings" />
            <InsightRow label="No-show hotspot" value="Late walk-in holds" />
            <InsightRow label="Busiest window" value="12 PM to 3 PM" />
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SurfaceCard title="Top services">
          <InsightRow label="Fine line consult" value="$8.4k" />
          <InsightRow label="Luxury blowout" value="$6.1k" />
          <InsightRow label="Fade + beard sculpt" value="$4.9k" />
        </SurfaceCard>
        <SurfaceCard title="Bookings trend cards">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="calm">Peak demand 12 PM - 3 PM</StatusBadge>
            <StatusBadge tone="violet">Fri strongest conversion</StatusBadge>
            <StatusBadge tone="success">Deposits improving</StatusBadge>
          </div>
        </SurfaceCard>
      </section>
    </div>
  )
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="font-semibold text-slate-950">{label}</p>
      <p className="text-sm text-slate-500">{value}</p>
    </div>
  )
}
