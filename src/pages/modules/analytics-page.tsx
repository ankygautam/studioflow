import { useMemo, useState } from 'react'
import {
  FilterSelect,
  ProductPageHeader,
  SummaryCard,
  Surface,
} from '../../components/shared/product-ui'
import type { AppRole } from '../../data/navigation'

type AnalyticsPageProps = {
  role: AppRole
}

const revenueSeries = [18, 22, 24, 21, 27, 31, 29]
const bookingVolume = [14, 16, 18, 17, 21, 24, 20]
const serviceBreakdown = [
  { label: 'Tattoo', value: 34 },
  { label: 'Salon', value: 27 },
  { label: 'Barber', value: 16 },
  { label: 'Piercing', value: 12 },
  { label: 'Wellness', value: 7 },
  { label: 'Beauty', value: 4 },
]
const topStaff = [
  { name: 'Nina Hart', revenue: '$8.4k', score: '96%' },
  { name: 'Elena Cross', revenue: '$6.9k', score: '92%' },
  { name: 'Luis Cole', revenue: '$5.2k', score: '90%' },
]
const busiestHours = [
  { label: '10 AM', value: 48 },
  { label: '12 PM', value: 72 },
  { label: '2 PM', value: 84 },
  { label: '4 PM', value: 66 },
]
const cancellationTrend = [6.2, 5.8, 5.1, 4.7, 4.4, 4.1]

export function AnalyticsPage({ role }: AnalyticsPageProps) {
  const [dateRange, setDateRange] = useState('This month')
  const [location, setLocation] = useState('All locations')
  const [staff, setStaff] = useState('All staff')
  const [serviceCategory, setServiceCategory] = useState('All categories')

  const revenuePath = useMemo(() => makeLinePath(revenueSeries, 260, 120), [])
  const cancellationPath = useMemo(
    () => makeLinePath(cancellationTrend, 260, 120),
    [],
  )

  return (
    <div className="space-y-6">
      <ProductPageHeader
        description={`A modern SaaS analytics layer for ${role} workflows, with revenue, booking, staffing, and service insight in one clean reporting surface.`}
        title="Analytics"
      />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <FilterSelect
          label="Date range"
          onChange={setDateRange}
          options={['Today', 'This week', 'This month', 'This quarter']}
          value={dateRange}
        />
        <FilterSelect
          label="Business location"
          onChange={setLocation}
          options={['All locations', 'Downtown Studio', 'Wellness Loft']}
          value={location}
        />
        <FilterSelect
          label="Staff"
          onChange={setStaff}
          options={['All staff', 'Nina Hart', 'Elena Cross', 'Luis Cole']}
          value={staff}
        />
        <FilterSelect
          label="Service category"
          onChange={setServiceCategory}
          options={['All categories', 'Tattoo', 'Salon', 'Barber', 'Piercing', 'Wellness', 'Beauty']}
          value={serviceCategory}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard caption="Revenue" meta={`${dateRange} • ${location}`} value="$29.3k" />
        <SummaryCard caption="Bookings volume" meta={`${staff} selected`} value="130" />
        <SummaryCard caption="Cancellation trend" meta="Improving month over month" value="4.1%" />
        <SummaryCard caption="Repeat client rate" meta={`${serviceCategory} focus`} value="68%" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <Surface title="Revenue over time">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <svg className="h-[180px] w-full" viewBox="0 0 280 160">
              <path
                d={revenuePath}
                fill="none"
                stroke="#172033"
                strokeLinecap="round"
                strokeWidth="3"
              />
              {revenueSeries.map((point, index) => {
                const x = (index / (revenueSeries.length - 1)) * 260 + 10
                const max = Math.max(...revenueSeries)
                const y = 130 - (point / max) * 100
                return <circle key={x} cx={x} cy={y} fill="#8fd0c7" r="5" />
              })}
            </svg>
          </div>
        </Surface>

        <Surface title="Bookings volume">
          <div className="flex h-[220px] items-end gap-3">
            {bookingVolume.map((value, index) => (
              <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-full w-full items-end rounded-[1.25rem] bg-slate-50 px-2 pb-2">
                  <div
                    className="w-full rounded-[1rem] bg-[linear-gradient(180deg,#a9c8f3_0%,#8fd0c7_100%)]"
                    style={{ height: `${(value / Math.max(...bookingVolume)) * 100}%` }}
                  />
                </div>
                <p className="text-sm font-semibold text-slate-600">D{index + 1}</p>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Surface title="Service category breakdown">
          <div className="space-y-4">
            {serviceBreakdown.map((entry) => (
              <div key={entry.label}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-700">{entry.label}</p>
                  <p className="text-sm text-slate-500">{entry.value}%</p>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,#a9c8f3_0%,#8fd0c7_100%)]"
                    style={{ width: `${entry.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <Surface title="Top performing staff">
          <div className="space-y-3">
            {topStaff.map((member) => (
              <div
                key={member.name}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-slate-900">{member.name}</p>
                  <p className="text-sm font-semibold text-slate-700">{member.revenue}</p>
                </div>
                <p className="mt-2 text-sm text-slate-500">Performance score {member.score}</p>
              </div>
            ))}
          </div>
        </Surface>

        <Surface title="Busiest hours">
          <div className="space-y-4">
            {busiestHours.map((slot) => (
              <div key={slot.label}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-700">{slot.label}</p>
                  <p className="text-sm text-slate-500">{slot.value}% load</p>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,#8fd0c7_0%,#cdbcf1_100%)]"
                    style={{ width: `${slot.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Surface title="Cancellation trend">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <svg className="h-[180px] w-full" viewBox="0 0 280 160">
              <path
                d={cancellationPath}
                fill="none"
                stroke="#d46f83"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
          </div>
        </Surface>

        <Surface title="Repeat client rate">
          <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <div>
              <p className="font-display text-6xl text-slate-950">68%</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Repeat bookings are strongest in tattoo, salon, and barber
                categories, with elevated retention around midday slots.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Best segment</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Tattoo follow-ups</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Delta</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">+6% vs last month</p>
              </div>
            </div>
          </div>
        </Surface>
      </div>
    </div>
  )
}

function makeLinePath(points: number[], width: number, height: number) {
  const max = Math.max(...points)
  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width + 10
      const y = height - (point / max) * 100
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}
