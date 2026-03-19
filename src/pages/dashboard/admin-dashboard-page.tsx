import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const stats = [
  {
    change: '+8% vs yesterday',
    label: "Today's Bookings",
    to: '/admin/appointments',
    tone: 'bg-[linear-gradient(135deg,rgba(143,208,199,0.22),rgba(169,200,243,0.18))]',
    value: '28',
  },
  {
    change: '+12.4% this week',
    label: 'Revenue Today',
    to: '/admin/payments',
    tone: 'bg-[linear-gradient(135deg,rgba(169,200,243,0.22),rgba(205,188,241,0.18))]',
    value: '$4,860',
  },
  {
    change: '6 awaiting follow-up',
    label: 'Pending Deposits',
    to: '/admin/payments',
    tone: 'bg-[linear-gradient(135deg,rgba(243,181,152,0.22),rgba(240,214,166,0.16))]',
    value: '$790',
  },
  {
    change: '11 on shift now',
    label: 'Active Staff',
    to: '/admin/staff',
    tone: 'bg-[linear-gradient(135deg,rgba(212,111,131,0.18),rgba(205,188,241,0.18))]',
    value: '14',
  },
] as const

const weeklyRevenue = [
  { day: 'Mon', goal: 3800, value: 3200 },
  { day: 'Tue', goal: 4200, value: 3680 },
  { day: 'Wed', goal: 4100, value: 3920 },
  { day: 'Thu', goal: 4600, value: 4210 },
  { day: 'Fri', goal: 5200, value: 4860 },
  { day: 'Sat', goal: 5600, value: 5320 },
  { day: 'Sun', goal: 3700, value: 3110 },
]

const miniCalendarDays = [
  { bookings: 10, day: 'Mon', date: '18' },
  { bookings: 12, day: 'Tue', date: '19' },
  { bookings: 16, day: 'Wed', date: '20' },
  { bookings: 18, day: 'Thu', date: '21', selected: true },
  { bookings: 14, day: 'Fri', date: '22' },
  { bookings: 11, day: 'Sat', date: '23' },
  { bookings: 6, day: 'Sun', date: '24' },
]

const selectedOverviewDay =
  miniCalendarDays.find((day) => day.selected) ?? miniCalendarDays[0]

const weeklyBookingTotal = miniCalendarDays.reduce(
  (total, day) => total + day.bookings,
  0,
)

const upcomingAppointments = [
  {
    client: 'Maya Laurent',
    service: 'Fine line tattoo consult',
    staff: 'Nina Hart',
    time: '10:30 AM',
  },
  {
    client: 'Derek Hoffman',
    service: 'Skin fade and beard sculpt',
    staff: 'Luis Cole',
    time: '11:15 AM',
  },
  {
    client: 'Amara Singh',
    service: 'Piercing follow-up',
    staff: 'Jules Kim',
    time: '12:45 PM',
  },
  {
    client: 'Sophie Bennett',
    service: 'Balayage refresh',
    staff: 'Elena Moss',
    time: '2:00 PM',
  },
] as const

const recentClients = [
  {
    balance: '$0',
    consent: 'Signed',
    name: 'Leah Carmichael',
    visits: '18 visits',
  },
  {
    balance: '$45',
    consent: 'Pending',
    name: 'Jordan Kline',
    visits: '6 visits',
  },
  {
    balance: '$0',
    consent: 'Signed',
    name: 'Isla Romero',
    visits: '11 visits',
  },
  {
    balance: '$120',
    consent: 'Needs review',
    name: 'Marcus Lee',
    visits: '3 visits',
  },
] as const

const topServices = [
  { growth: '+14%', name: 'Fine line tattoo', revenue: '$8.4k' },
  { growth: '+9%', name: 'Balayage refresh', revenue: '$6.9k' },
  { growth: '+7%', name: 'Premium barber package', revenue: '$5.2k' },
  { growth: '+18%', name: 'Piercing bundle', revenue: '$4.1k' },
] as const

const staffPerformance = [
  { completion: '96%', name: 'Nina Hart', revenue: '$2.4k', utilization: '88%' },
  { completion: '93%', name: 'Elena Moss', revenue: '$2.1k', utilization: '84%' },
  { completion: '91%', name: 'Luis Cole', revenue: '$1.8k', utilization: '80%' },
] as const

const popularSlots = [
  { bookings: 12, label: '10:00 AM' },
  { bookings: 18, label: '12:00 PM' },
  { bookings: 22, label: '2:00 PM' },
  { bookings: 16, label: '4:00 PM' },
] as const

const activityFeed = [
  'Deposit received for Maya Laurent booking.',
  'Jules Kim updated piercing aftercare notes.',
  'Luis Cole opened a 3:30 PM walk-in slot.',
  'Two waiver reminders sent for tomorrow morning.',
] as const

const filters = {
  dateRange: ['Today', 'This Week', 'This Month'],
  service: ['All Services', 'Tattoo', 'Salon', 'Barber', 'Piercing'],
  staff: ['All Staff', 'Nina Hart', 'Elena Moss', 'Luis Cole', 'Jules Kim'],
} as const

export function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState('This Week')
  const [staff, setStaff] = useState('All Staff')
  const [service, setService] = useState('All Services')

  return (
    <div className="space-y-6">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.35 }}
        className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,40,0.06)] md:p-6"
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <p className="font-display text-xs uppercase tracking-[0.35em] text-slate-500">
              Operations home
            </p>
            <h1 className="font-display text-3xl text-ink-950 md:text-4xl">
              Studio dashboard
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              Track bookings, revenue, staff utilization, and appointment
              momentum from one premium control surface built for high-tempo
              service studios.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Live snapshot:</span>{' '}
            Thursday, March 21 • Peak demand between 12 PM and 3 PM
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <FilterSelect
            label="Date range"
            options={filters.dateRange}
            value={dateRange}
            onChange={setDateRange}
          />
          <FilterSelect
            label="Staff"
            options={filters.staff}
            value={staff}
            onChange={setStaff}
          />
          <FilterSelect
            label="Service"
            options={filters.service}
            value={service}
            onChange={setService}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <QuickActionChip label="Open calendar" to="/admin/calendar" />
          <QuickActionChip label="Review payments" to="/admin/payments" />
          <QuickActionChip label="Open client CRM" to="/admin/clients" />
        </div>
      </motion.section>

      <section className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 14 }}
            transition={{ delay: index * 0.05, duration: 0.28 }}
          >
            <Link
              className={`group block rounded-[1.75rem] border border-slate-200 p-5 shadow-[0_16px_40px_rgba(15,23,40,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,40,0.08)] ${stat.tone}`}
              to={stat.to}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-3 font-display text-4xl text-slate-950">
                    {stat.value}
                  </p>
                </div>
                <span className="rounded-full border border-slate-300/70 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
                  Open
                </span>
              </div>
              <p className="mt-5 text-sm font-semibold text-slate-700">
                {stat.change}
              </p>
            </Link>
          </motion.div>
        ))}
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[1.35fr_0.9fr_1fr]">
        <DashboardCard
          action={<Link className="text-sm font-semibold text-slate-500 hover:text-slate-900" to="/admin/analytics">View report</Link>}
          title="Weekly revenue"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-3xl text-slate-950">$29,300</p>
              <p className="mt-1 text-sm text-slate-500">
                Gross revenue for {dateRange.toLowerCase()}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              +10.8% growth
            </div>
          </div>

          <div className="flex h-56 items-end gap-3">
            {weeklyRevenue.map((point) => {
              const height = `${(point.value / 5600) * 100}%`
              const goal = `${(point.goal / 5600) * 100}%`

              return (
                <div key={point.day} className="flex flex-1 flex-col items-center gap-3">
                  <div className="relative flex h-full w-full items-end justify-center rounded-[1.25rem] bg-slate-50 px-2 pb-3">
                    <div
                      className="absolute bottom-3 w-[2px] rounded-full bg-slate-300"
                      style={{ height: goal }}
                    />
                    <div
                      className="relative z-10 w-full rounded-[1rem] bg-[linear-gradient(180deg,#a9c8f3_0%,#8fd0c7_100%)] shadow-[0_10px_30px_rgba(143,208,199,0.28)]"
                      style={{ height }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">{point.day}</p>
                    <p className="text-xs text-slate-500">${(point.value / 1000).toFixed(1)}k</p>
                  </div>
                </div>
              )
            })}
          </div>
        </DashboardCard>

        <DashboardCard
          action={<Link className="text-sm font-semibold text-slate-500 hover:text-slate-900" to="/admin/calendar">Open calendar</Link>}
          title="Booking overview"
        >
          <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  This week
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {weeklyBookingTotal} bookings across 7 days
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                Peak day: {selectedOverviewDay.day} {selectedOverviewDay.date}
              </span>
            </div>
          </div>

          <div className="mt-4 -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
            {miniCalendarDays.map((day) => (
              <Link
                key={day.day}
                className={[
                  'block min-w-[92px] snap-start rounded-[1.4rem] border px-4 py-4 text-left transition',
                  day.selected
                    ? 'min-w-[112px] border-slate-900 bg-slate-900 text-white shadow-[0_18px_36px_rgba(15,23,40,0.18)]'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white',
                ].join(' ')}
                to="/admin/calendar"
              >
                <p className="text-xs uppercase tracking-[0.22em] opacity-70">
                  {day.day}
                </p>
                <p className="mt-3 font-display text-4xl leading-none">
                  {day.date}
                </p>
                <p className="mt-4 text-sm font-semibold opacity-80">
                  {day.bookings} bookings
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(169,200,243,0.12),rgba(143,208,199,0.1))] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Thursday load forecast
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  18 bookings scheduled, 3 pending confirmations, and strongest demand
                  from 12 PM to 3 PM.
                </p>
              </div>
              <span className="rounded-full border border-blue-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                Prime window
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <OverviewMetric label="Scheduled" value="18" />
              <OverviewMetric label="Pending" value="3" />
              <OverviewMetric label="Peak hours" value="12-3 PM" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          action={<Link className="text-sm font-semibold text-slate-500 hover:text-slate-900" to="/admin/appointments">View all</Link>}
          title="Upcoming appointments"
        >
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <Link
                key={`${appointment.client}-${appointment.time}`}
                className="block rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                to="/admin/appointments"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{appointment.client}</p>
                    <p className="mt-1 text-sm text-slate-600">{appointment.service}</p>
                  </div>
                  <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {appointment.time}
                  </span>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {appointment.staff}
                </p>
              </Link>
            ))}
          </div>
        </DashboardCard>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-3">
        <DashboardCard
          action={<Link className="text-sm font-semibold text-slate-500 hover:text-slate-900" to="/admin/clients">Open CRM</Link>}
          title="Recent clients"
        >
          <div className="space-y-3">
            {recentClients.map((client) => (
              <Link
                key={client.name}
                className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                to="/admin/clients"
              >
                <div>
                  <p className="font-semibold text-slate-950">{client.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{client.visits}</p>
                </div>
                <div className="text-right">
                  <Badge
                    tone={
                      client.consent === 'Signed'
                        ? 'success'
                        : client.consent === 'Pending'
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {client.consent}
                  </Badge>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {client.balance}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          action={<Link className="text-sm font-semibold text-slate-500 hover:text-slate-900" to="/admin/services">See services</Link>}
          title="Top services"
        >
          <div className="space-y-3">
            {topServices.map((service) => (
              <Link
                key={service.name}
                className="block rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                to="/admin/services"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{service.name}</p>
                    <p className="mt-1 text-sm text-slate-500">Revenue this week</p>
                  </div>
                  <Badge tone="success">{service.growth}</Badge>
                </div>
                <p className="mt-4 font-display text-2xl text-slate-950">
                  {service.revenue}
                </p>
              </Link>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          action={<Link className="text-sm font-semibold text-slate-500 hover:text-slate-900" to="/admin/staff">Open staff</Link>}
          title="Staff performance"
        >
          <div className="space-y-3">
            {staffPerformance.map((member) => (
              <Link
                key={member.name}
                className="block rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                to="/admin/staff"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-semibold text-slate-950">{member.name}</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {member.revenue}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MetricPill label="Utilization" value={member.utilization} />
                  <MetricPill label="Completion" value={member.completion} />
                </div>
              </Link>
            ))}
          </div>
        </DashboardCard>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[0.85fr_1fr_1.15fr]">
        <DashboardCard
          action={<Link className="text-sm font-semibold text-slate-500 hover:text-slate-900" to="/admin/appointments">View reasons</Link>}
          title="Cancellation rate"
        >
          <Link
            className="block rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(212,111,131,0.14),rgba(243,181,152,0.1))] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,40,0.06)]"
            to="/admin/appointments"
          >
            <p className="font-display text-5xl text-slate-950">3.8%</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Down from 5.1% last month, with most cancellations now happening
              more than 24 hours before service time.
            </p>
          </Link>
        </DashboardCard>

        <DashboardCard
          action={<Link className="text-sm font-semibold text-slate-500 hover:text-slate-900" to="/admin/calendar">Open board</Link>}
          title="Popular time slots"
        >
          <div className="space-y-4">
            {popularSlots.map((slot) => (
              <Link
                key={slot.label}
                className="block rounded-[1.25rem] border border-transparent p-2 transition hover:border-slate-200 hover:bg-slate-50"
                to="/admin/calendar"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800">{slot.label}</span>
                  <span className="text-slate-500">{slot.bookings} bookings</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,#a9c8f3_0%,#8fd0c7_100%)]"
                    style={{ width: `${(slot.bookings / 22) * 100}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          action={<Link className="text-sm font-semibold text-slate-500 hover:text-slate-900" to="/admin/appointments">Open timeline</Link>}
          title="Recent activity feed"
        >
          <div className="space-y-3">
            {activityFeed.map((activity, index) => (
              <Link
                key={activity}
                className="flex gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                to={activity.includes('Deposit') ? '/admin/payments' : '/admin/appointments'}
              >
                <div className="mt-1 h-3 w-3 rounded-full bg-slate-900" />
                <div>
                  <p className="font-medium leading-6 text-slate-700">{activity}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {index === 0 ? 'Just now' : `${index * 18} min ago`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </DashboardCard>
      </section>
    </div>
  )
}

type DashboardCardProps = {
  action?: React.ReactNode
  children: React.ReactNode
  title: string
}

function DashboardCard({ action, children, title }: DashboardCardProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3 }}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,40,0.05)] md:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </motion.section>
  )
}

type FilterSelectProps = {
  label: string
  onChange: (value: string) => void
  options: readonly string[]
  value: string
}

function FilterSelect({ label, onChange, options, value }: FilterSelectProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <select
        className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

type BadgeProps = {
  children: React.ReactNode
  tone: 'danger' | 'success' | 'warning'
}

function Badge({ children, tone }: BadgeProps) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-rose-200 bg-rose-50 text-rose-700'

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}
    >
      {children}
    </span>
  )
}

type MetricPillProps = {
  label: string
  value: string
}

function MetricPill({ label, value }: MetricPillProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

type OverviewMetricProps = {
  label: string
  value: string
}

function OverviewMetric({ label, value }: OverviewMetricProps) {
  return (
    <div className="rounded-[1.15rem] border border-white/70 bg-white/85 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,40,0.04)]">
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  )
}

type QuickActionChipProps = {
  label: string
  to: string
}

function QuickActionChip({ label, to }: QuickActionChipProps) {
  return (
    <Link
      className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
      to={to}
    >
      {label}
    </Link>
  )
}
