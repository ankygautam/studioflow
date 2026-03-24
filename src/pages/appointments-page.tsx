import { useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { DataTable } from '../components/ui/data-table'
import { DetailDrawer } from '../components/ui/detail-drawer'
import { StatusBadge } from '../components/ui/status-badge'

const appointments = [
  { client: 'Maya Laurent', date: 'Mar 23', id: 'apt-1', service: 'Fine line consult', status: 'Confirmed', time: '10:30 AM' },
  { client: 'Drew Foster', date: 'Mar 23', id: 'apt-2', service: 'Fade + beard sculpt', status: 'Completed', time: '11:45 AM' },
  { client: 'Amara Singh', date: 'Mar 24', id: 'apt-3', service: 'Jewelry styling', status: 'No-show', time: '1:15 PM' },
  { client: 'Tessa Cole', date: 'Mar 24', id: 'apt-4', service: 'Wellness reset', status: 'Cancelled', time: '3:30 PM' },
] as const

export function AppointmentsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(appointments[0].id)
  const selected = appointments.find((appointment) => appointment.id === selectedId) ?? null

  return (
    <div className="space-y-6">
      <Hero
        eyebrow="Appointments"
        title="Appointment list"
        description="A searchable appointment table built for fast operational scanning with one simple scheduling filter."
      />

      <SurfaceCard title="Appointments">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <input
            className="h-12 min-w-[240px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none"
            placeholder="Search by client, service, or booking note"
          />
          <label className="min-w-[180px]">
            <span className="sr-only">Appointment filter</span>
            <select className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none">
              <option>This week</option>
              <option>Today</option>
              <option>Next 7 days</option>
            </select>
          </label>
        </div>

        <DataTable columns={['Client', 'Date', 'Time', 'Service', 'Status']}>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td className="px-4 py-4">
                <button
                  className="font-semibold text-slate-950 transition hover:text-slate-700"
                  onClick={() => setSelectedId(appointment.id)}
                  type="button"
                >
                  {appointment.client}
                </button>
              </td>
              <td className="px-4 py-4 text-sm text-slate-600">{appointment.date}</td>
              <td className="px-4 py-4 text-sm text-slate-600">{appointment.time}</td>
              <td className="px-4 py-4 text-sm text-slate-600">{appointment.service}</td>
              <td className="px-4 py-4">
                <StatusBadge tone={appointmentTone(appointment.status)}>{appointment.status}</StatusBadge>
              </td>
            </tr>
          ))}
        </DataTable>
      </SurfaceCard>

      <DetailDrawer
        footer={
          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
              View schedule context
            </button>
          </div>
        }
        onClose={() => setSelectedId(null)}
        open={Boolean(selected)}
        subtitle="Appointment record"
        title={selected?.client ?? 'Appointment'}
      >
        {selected ? (
          <div className="space-y-4">
            <InfoCard label="Service" value={selected.service} />
            <InfoCard label="Date" value={`${selected.date} • ${selected.time}`} />
            <InfoCard label="Status" value={selected.status} />
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  )
}

function Hero({
  description,
  eyebrow,
  title,
}: {
  description: string
  eyebrow: string
  title: string
}) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)] md:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.38em] text-slate-400">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl text-slate-950">{title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{description}</p>
    </section>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-7 text-slate-700">{value}</p>
    </div>
  )
}

function appointmentTone(status: (typeof appointments)[number]['status']) {
  if (status === 'Confirmed') return 'calm' as const
  if (status === 'Completed') return 'success' as const
  if (status === 'Cancelled') return 'danger' as const
  if (status === 'No-show') return 'attention' as const
  return 'violet' as const
}
