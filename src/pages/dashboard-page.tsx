import { motion } from 'framer-motion'
import { DrawerPreview } from '../components/ui/drawer-preview'
import { DataTable } from '../components/ui/data-table'
import { StatusBadge } from '../components/ui/status-badge'
import { SurfaceCard } from '../components/layout/app-shell'

const stats = [
  { label: "Today's bookings", subtext: '6 check-ins completed', value: '28' },
  { label: 'Revenue today', subtext: '+12.4% vs last Tuesday', value: '$4,860' },
  { label: 'Pending deposits', subtext: '8 clients awaiting payment', value: '$790' },
  { label: 'Staff available', subtext: '11 on floor, 3 on flex hold', value: '14' },
]

const appointments = [
  { client: 'Maya Laurent', service: 'Fine line tattoo consult', status: 'Checked in', time: '10:30 AM' },
  { client: 'Alina Ross', service: 'Luxury blowout + trim', status: 'Confirmed', time: '11:15 AM' },
  { client: 'Jordan Hale', service: 'Piercing styling session', status: 'Deposit pending', time: '12:40 PM' },
  { client: 'Leah Monroe', service: 'Wellness reset massage', status: 'Confirmed', time: '2:00 PM' },
]

const upcoming = [
  ['3:15 PM', 'Nora Patel', 'Micro realism consult'],
  ['4:00 PM', 'Drew Foster', 'Beard sculpt + skin fade'],
  ['5:30 PM', 'Elise Nguyen', 'Nail studio refill'],
]

const recentClients = [
  ['Amara Singh', '12 visits', 'Signed consent'],
  ['Milo Carter', '4 visits', 'Reference files added'],
  ['Tessa Cole', '19 visits', 'Balance cleared'],
]

const teamAvailability = [
  { load: '4 bookings', name: 'Nina Hart', role: 'Tattoo Artist', state: 'Open after 3 PM' },
  { load: '5 bookings', name: 'Elena Cross', role: 'Color Specialist', state: 'Booked steady' },
  { load: '3 bookings', name: 'Luis Cole', role: 'Barber', state: 'Walk-ins enabled' },
  { load: '2 bookings', name: 'Jules Kim', role: 'Piercing Artist', state: 'Open after 1 PM' },
]

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.05)] md:p-7"
        initial={{ opacity: 0, y: 14 }}
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.38em] text-slate-400">
              StudioFlow Workspace
            </p>
            <h1 className="mt-3 font-display text-4xl text-slate-950 md:text-5xl">
              Run a calmer, sharper booking day
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              A polished command center for managing appointments, keeping staff
              balanced, and giving clients a premium experience across tattoo,
              beauty, barber, salon, and wellness workflows.
            </p>
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
            Open calendar
          </button>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{ delay: index * 0.05, duration: 0.24 }}
          >
            <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(240,245,252,0.85))] p-5 shadow-[0_18px_44px_rgba(15,23,42,0.04)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                {stat.label}
              </p>
              <p className="mt-4 font-display text-4xl text-slate-950">{stat.value}</p>
              <p className="mt-4 text-sm text-slate-500">{stat.subtext}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <SurfaceCard
          action={<button className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">View full day</button>}
          title="Today's appointments"
        >
          <DataTable columns={['Time', 'Client', 'Service', 'Status']}>
            {appointments.map((appointment) => (
              <tr key={`${appointment.client}-${appointment.time}`}>
                <td className="px-4 py-4 text-sm font-semibold text-slate-800">{appointment.time}</td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-950">{appointment.client}</p>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{appointment.service}</td>
                <td className="px-4 py-4">
                  <StatusBadge
                    tone={
                      appointment.status === 'Checked in'
                        ? 'success'
                        : appointment.status === 'Deposit pending'
                          ? 'attention'
                          : 'calm'
                    }
                  >
                    {appointment.status}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </DataTable>
        </SurfaceCard>

        <SurfaceCard
          action={<button className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">This week</button>}
          title="Revenue summary"
        >
          <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Gross revenue</p>
                <p className="mt-3 font-display text-5xl text-slate-950">$29.3k</p>
              </div>
              <StatusBadge tone="success">+10.8%</StatusBadge>
            </div>
            <div className="mt-6 flex h-44 items-end gap-3">
              {[64, 72, 76, 82, 91, 96, 68].map((height, index) => (
                <div key={height} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-36 w-full items-end rounded-[20px] bg-white px-2 py-2">
                    <div
                      className={[
                        'w-full rounded-[16px]',
                        index === 4
                          ? 'bg-[linear-gradient(180deg,#8691ff_0%,#a6c5ff_100%)]'
                          : 'bg-[linear-gradient(180deg,#b7d9ff_0%,#b5ead8_100%)]',
                      ].join(' ')}
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
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <SurfaceCard
          action={<button className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">Open schedule</button>}
          title="Staff availability snapshot"
        >
          <div className="space-y-3">
            {teamAvailability.map((member) => (
              <div
                key={member.name}
                className="flex items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950">{member.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{member.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">{member.load}</p>
                  <p className="mt-1 text-sm text-slate-500">{member.state}</p>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard
          action={<button className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">View CRM</button>}
          title="Recent clients"
        >
          <div className="space-y-3">
            {recentClients.map(([name, visits, note]) => (
              <div
                key={name}
                className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <p className="font-semibold text-slate-950">{name}</p>
                <p className="mt-1 text-sm text-slate-500">{visits}</p>
                <p className="mt-4 text-sm text-slate-600">{note}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <SurfaceCard
          action={<button className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">See all</button>}
          title="Upcoming bookings"
        >
          <div className="space-y-3">
            {upcoming.map(([time, client, service]) => (
              <div
                key={client}
                className="flex items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950">{client}</p>
                  <p className="mt-1 text-sm text-slate-500">{service}</p>
                </div>
                <StatusBadge tone="violet">{time}</StatusBadge>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <div>
          <DrawerPreview title="Appointment details">
            <div className="space-y-3">
              <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Client</p>
                <p className="mt-2 font-semibold text-slate-950">Maya Laurent</p>
              </div>
              <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Service</p>
                <p className="mt-2 font-semibold text-slate-950">Fine line tattoo consult</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge tone="success">Checked in</StatusBadge>
                <StatusBadge tone="calm">Deposit paid</StatusBadge>
              </div>
            </div>
          </DrawerPreview>
        </div>
      </section>
    </div>
  )
}
