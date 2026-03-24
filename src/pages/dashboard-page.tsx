import { motion } from 'framer-motion'
import { DrawerPreview } from '../components/ui/drawer-preview'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { DataTable } from '../components/ui/data-table'
import { StatusBadge } from '../components/ui/status-badge'
import { SurfaceCard } from '../components/layout/app-shell'
import { useCallback } from 'react'
import { useRemoteList } from '../hooks/use-remote-list'
import { getAppointments } from '../lib/api/appointments-api'
import { getClients } from '../lib/api/clients-api'
import { getDefaultStudioId } from '../lib/api/http'
import { formatDate, formatTime, humanizeEnum } from '../lib/formatters'

const stats = [
  { label: "Today's bookings", subtext: '6 check-ins completed', value: '28' },
  { label: 'Revenue today', subtext: '+12.4% vs last Tuesday', value: '$4,860' },
  { label: 'Pending deposits', subtext: '8 clients awaiting payment', value: '$790' },
  { label: 'Staff available', subtext: '11 on floor, 3 on flex hold', value: '14' },
]

const teamAvailability = [
  { load: '4 bookings', name: 'Nina Hart', role: 'Tattoo Artist', state: 'Open after 3 PM' },
  { load: '5 bookings', name: 'Elena Cross', role: 'Color Specialist', state: 'Booked steady' },
  { load: '3 bookings', name: 'Luis Cole', role: 'Barber', state: 'Walk-ins enabled' },
  { load: '2 bookings', name: 'Jules Kim', role: 'Piercing Artist', state: 'Open after 1 PM' },
]

export function DashboardPage() {
  const defaultStudioId = getDefaultStudioId()
  const loadAppointments = useCallback(() => getAppointments(defaultStudioId), [defaultStudioId])
  const loadClients = useCallback(() => getClients(defaultStudioId), [defaultStudioId])
  const {
    data: appointments,
    error: appointmentsError,
    isLoading: appointmentsLoading,
  } = useRemoteList(loadAppointments)
  const {
    data: clients,
    error: clientsError,
    isLoading: clientsLoading,
  } = useRemoteList(loadClients)

  const todayAppointments = appointments.slice(0, 4)
  const upcomingAppointments = appointments.slice(0, 3)
  const recentClients = [...clients]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 3)

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
          {appointmentsLoading ? <LoadingState title="Loading appointments..." /> : null}
          {!appointmentsLoading && appointmentsError ? <ErrorState message={appointmentsError} /> : null}
          {!appointmentsLoading && !appointmentsError && todayAppointments.length === 0 ? (
            <EmptyState
              description="Appointments from the backend will appear here when bookings are added."
              title="No appointments yet"
            />
          ) : null}
          {!appointmentsLoading && !appointmentsError && todayAppointments.length > 0 ? (
            <DataTable columns={['Time', 'Client', 'Service', 'Status']}>
              {todayAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                    {formatTime(appointment.startTime)}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950">{appointment.customerName}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{appointment.serviceName}</td>
                  <td className="px-4 py-4">
                    <StatusBadge tone={appointmentTone(appointment.status)}>
                      {humanizeEnum(appointment.status)}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : null}
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
          {clientsLoading ? <LoadingState title="Loading clients..." /> : null}
          {!clientsLoading && clientsError ? <ErrorState message={clientsError} /> : null}
          {!clientsLoading && !clientsError && recentClients.length === 0 ? (
            <EmptyState
              description="Client records from the backend will appear here once profiles are created."
              title="No recent clients yet"
            />
          ) : null}
          {!clientsLoading && !clientsError && recentClients.length > 0 ? (
            <div className="space-y-3">
              {recentClients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <p className="font-semibold text-slate-950">{client.fullName}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Updated {formatDate(client.updatedAt)}
                  </p>
                  <p className="mt-4 text-sm text-slate-600">
                    {client.notes?.trim() ? client.notes : 'No notes added yet.'}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </SurfaceCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <SurfaceCard
          action={<button className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">See all</button>}
          title="Upcoming bookings"
        >
          {appointmentsLoading ? <LoadingState title="Loading bookings..." /> : null}
          {!appointmentsLoading && appointmentsError ? <ErrorState message={appointmentsError} /> : null}
          {!appointmentsLoading && !appointmentsError && upcomingAppointments.length === 0 ? (
            <EmptyState
              description="As soon as live appointments are in place, upcoming bookings will show here."
              title="No upcoming bookings yet"
            />
          ) : null}
          {!appointmentsLoading && !appointmentsError && upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950">{appointment.customerName}</p>
                    <p className="mt-1 text-sm text-slate-500">{appointment.serviceName}</p>
                  </div>
                  <StatusBadge tone="violet">
                    {formatDate(appointment.appointmentDate)} • {formatTime(appointment.startTime)}
                  </StatusBadge>
                </div>
              ))}
            </div>
          ) : null}
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

function appointmentTone(status: string) {
  if (status === 'COMPLETED') return 'success' as const
  if (status === 'CANCELLED') return 'danger' as const
  if (status === 'NO_SHOW') return 'attention' as const
  if (status === 'CONFIRMED') return 'calm' as const
  return 'violet' as const
}
