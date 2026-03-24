import { useMemo, useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { PageHeader } from '../components/ui/page-header'
import { StatCard } from '../components/ui/stat-card'
import { StatusBadge } from '../components/ui/status-badge'
import { useAnalyticsData, type AnalyticsRange } from '../hooks/use-analytics-data'
import { getDefaultStudioId } from '../lib/api/http'
import { formatCurrency, formatDate, humanizeEnum } from '../lib/formatters'

const rangeOptions: { label: string; value: AnalyticsRange }[] = [
  { label: 'Last 7 days', value: 'LAST_7_DAYS' },
  { label: 'Last 30 days', value: 'LAST_30_DAYS' },
  { label: 'This month', value: 'THIS_MONTH' },
]

export function AnalyticsPage() {
  const defaultStudioId = getDefaultStudioId()
  const [range, setRange] = useState<AnalyticsRange>('LAST_7_DAYS')
  const { data, error, isLoading, reload } = useAnalyticsData(defaultStudioId, range)

  const metrics = useMemo(() => {
    if (!data) {
      return null
    }

    const totalAppointments = data.overview.totalAppointments || 0
    const noShowRate = totalAppointments > 0 ? (data.overview.noShowAppointments / totalAppointments) * 100 : 0
    const cancellationRate =
      totalAppointments > 0 ? (data.overview.cancelledAppointments / totalAppointments) * 100 : 0

    return {
      cancellationRate,
      noShowRate,
      topService: data.services.topServices[0] ?? null,
    }
  }, [data])

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <label className="min-w-[180px]">
            <span className="sr-only">Analytics range</span>
            <select
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none"
              onChange={(event) => setRange(event.target.value as AnalyticsRange)}
              value={range}
            >
              {rangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        }
        description="A premium analytics layer focused on revenue movement, booking patterns, top services, and operational risks."
        eyebrow="Analytics"
        title="Performance signals"
      />

      {isLoading ? <LoadingState title="Loading analytics..." /> : null}
      {!isLoading && error ? (
        <ErrorState
          action={
            <button
              className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600"
              onClick={() => void reload()}
              type="button"
            >
              Retry
            </button>
          }
          message={error}
        />
      ) : null}
      {!isLoading && !error && !data ? (
        <EmptyState
          description="Analytics will appear here once appointments, services, and payments have enough live records to summarize."
          title="No analytics available yet"
        />
      ) : null}

      {!isLoading && !error && data && metrics ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              accent="mint"
              helper={`${data.revenue.paidCount} payments marked paid`}
              label="Revenue"
              value={formatCurrency(data.revenue.totalRevenue)}
            />
            <StatCard
              accent="violet"
              helper={`${data.appointments.completedTotal} completed appointments`}
              label="Bookings"
              value={String(data.appointments.bookingsTotal)}
            />
            <StatCard
              accent="warm"
              helper={`${data.overview.noShowAppointments} no-show appointments`}
              label="No-show rate"
              value={`${metrics.noShowRate.toFixed(1)}%`}
            />
            <StatCard
              helper={`${data.overview.cancelledAppointments} cancellations`}
              label="Cancellation rate"
              value={`${metrics.cancellationRate.toFixed(1)}%`}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <SurfaceCard title="Revenue chart">
              {data.revenue.trend.length === 0 ? (
                <EmptyState
                  description="Revenue bars will appear once payment records are available in the selected range."
                  title="No revenue trend yet"
                />
              ) : (
                <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex h-56 items-end gap-3">
                    {data.revenue.trend.map((point) => {
                      const maxValue = Math.max(...data.revenue.trend.map((item) => item.revenue), 1)
                      const height = Math.max((point.revenue / maxValue) * 100, point.revenue > 0 ? 10 : 4)

                      return (
                        <div key={point.date} className="flex flex-1 flex-col items-center gap-3">
                          <div className="flex h-44 w-full items-end rounded-[18px] bg-white px-2 py-2">
                            <div
                              className="w-full rounded-[14px] bg-[linear-gradient(180deg,#8691ff_0%,#b7d9ff_100%)]"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            {formatDate(point.date)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </SurfaceCard>

            <SurfaceCard title="Insights">
              <div className="space-y-3">
                <InsightRow label="Total clients" value={String(data.overview.totalClients)} />
                <InsightRow label="Active services" value={String(data.overview.activeServices)} />
                <InsightRow label="Upcoming bookings" value={String(data.appointments.upcomingTotal)} />
                <InsightRow
                  label="Deposits tracked"
                  value={formatCurrency(data.revenue.totalDeposits)}
                />
              </div>
            </SurfaceCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SurfaceCard title="Top services">
              {data.services.topServices.length === 0 ? (
                <EmptyState
                  description="Top services will appear when bookings and payments start to build up."
                  title="No service signals yet"
                />
              ) : (
                <div className="space-y-3">
                  {data.services.topServices.map((service) => (
                    <InsightRow
                      key={service.serviceId}
                      label={service.serviceName}
                      value={`${formatCurrency(service.totalRevenue)} • ${service.bookingCount} bookings`}
                    />
                  ))}
                </div>
              )}
            </SurfaceCard>
            <SurfaceCard title="Bookings trend cards">
              <div className="flex flex-wrap gap-2">
                {data.appointments.statusBreakdown.map((metric) => (
                  <StatusBadge key={metric.status} tone={statusTone(metric.status)}>
                    {humanizeEnum(metric.status)} {metric.count}
                  </StatusBadge>
                ))}
                {metrics.topService ? (
                  <StatusBadge tone="violet">
                    Top service {metrics.topService.serviceName}
                  </StatusBadge>
                ) : null}
              </div>
            </SurfaceCard>
          </section>
        </>
      ) : null}
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

function statusTone(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'danger'
    case 'CONFIRMED':
      return 'calm'
    case 'BOOKED':
      return 'violet'
    default:
      return 'neutral'
  }
}
