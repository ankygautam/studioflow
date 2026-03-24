import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { DetailDrawer } from '../components/ui/detail-drawer'
import { StatusBadge } from '../components/ui/status-badge'

type BookingStatus = 'Booked' | 'Cancelled' | 'Completed' | 'Confirmed' | 'No-show'

type Booking = {
  client: string
  deposit: string
  id: string
  service: string
  staff: string
  start: number
  status: BookingStatus
  summary: string
}

const staffColumns = [
  { accent: 'from-[#b7d9ff] to-[#d3d8ff]', id: 'nina', name: 'Nina Hart', role: 'Fine line tattoo' },
  { accent: 'from-[#b5ead8] to-[#d2f0e7]', id: 'elena', name: 'Elena Cross', role: 'Color specialist' },
  { accent: 'from-[#f2d3b0] to-[#f4e3c8]', id: 'luis', name: 'Luis Cole', role: 'Barbering' },
  { accent: 'from-[#d9d0ff] to-[#ebd9ff]', id: 'jules', name: 'Jules Kim', role: 'Piercing' },
] as const

const bookings: Booking[] = [
  {
    client: 'Maya Laurent',
    deposit: 'Deposit paid',
    id: 'bk-1',
    service: 'Fine line consult',
    staff: 'nina',
    start: 9,
    status: 'Confirmed',
    summary: 'Reference review and stencil direction',
  },
  {
    client: 'Elise Nguyen',
    deposit: 'Booked',
    id: 'bk-2',
    service: 'Nail refill',
    staff: 'elena',
    start: 10,
    status: 'Booked',
    summary: 'Color refresh and shaping',
  },
  {
    client: 'Drew Foster',
    deposit: 'Balance due',
    id: 'bk-3',
    service: 'Fade + beard sculpt',
    staff: 'luis',
    start: 11,
    status: 'Completed',
    summary: 'Add hot towel finish',
  },
  {
    client: 'Amara Singh',
    deposit: 'No-show risk',
    id: 'bk-4',
    service: 'Jewelry styling',
    staff: 'jules',
    start: 13,
    status: 'No-show',
    summary: 'Client asked to confirm final placement',
  },
  {
    client: 'Tessa Cole',
    deposit: 'Cancelled by client',
    id: 'bk-5',
    service: 'Wellness reset',
    staff: 'elena',
    start: 15,
    status: 'Cancelled',
    summary: 'Reschedule request pending',
  },
]

const timeLabels = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

export function CalendarPage() {
  const [view, setView] = useState<'Day' | 'Month' | 'Week'>('Day')
  const [selectedStaff, setSelectedStaff] = useState('All staff')
  const [selectedStatus, setSelectedStatus] = useState('All statuses')
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(bookings[0].id)

  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId) ?? null
  const visibleBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const staffMatch = selectedStaff === 'All staff' || booking.staff === selectedStaff
        const statusMatch =
          selectedStatus === 'All statuses' || booking.status === selectedStatus
        return staffMatch && statusMatch
      }),
    [selectedStaff, selectedStatus],
  )

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
              Scheduling Command
            </p>
            <h1 className="mt-3 font-display text-4xl text-slate-950 md:text-5xl">
              Booking calendar
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              A premium timeline for managing day-to-day appointments across
              staff, services, and booking states without visual clutter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
              Monday, March 23
            </div>
            <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
              Create booking
            </button>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <SurfaceCard title="Calendar board">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <ToolbarSelect
                label="Staff"
                options={['All staff', ...staffColumns.map((staff) => staff.id)]}
                value={selectedStaff}
                onChange={setSelectedStaff}
              />
              <ToolbarSelect
                label="Status"
                options={['All statuses', 'Booked', 'Confirmed', 'Completed', 'Cancelled', 'No-show']}
                value={selectedStatus}
                onChange={setSelectedStatus}
              />
              <div className="ml-auto flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                {(['Day', 'Week', 'Month'] as const).map((option) => (
                  <button
                    key={option}
                    className={[
                      'rounded-full px-4 py-2 text-sm font-semibold transition',
                      view === option
                        ? 'bg-slate-950 text-white'
                        : 'text-slate-500 hover:bg-white hover:text-slate-900',
                    ].join(' ')}
                    onClick={() => setView(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-slate-50/80">
              <div className="min-w-[860px]">
                <div
                  className="grid border-b border-slate-200 bg-white"
                  style={{ gridTemplateColumns: `90px repeat(${staffColumns.length}, minmax(180px, 1fr))` }}
                >
                  <div className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Time
                  </div>
                  {staffColumns.map((staff) => (
                    <div key={staff.id} className="border-l border-slate-200 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${staff.accent} text-sm font-semibold text-slate-950`}>
                          {staff.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950">{staff.name}</p>
                          <p className="text-sm text-slate-500">{staff.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="grid"
                  style={{ gridTemplateColumns: `90px repeat(${staffColumns.length}, minmax(180px, 1fr))` }}
                >
                  <div className="bg-white">
                    {timeLabels.map((label) => (
                      <div
                        key={label}
                        className="flex h-[108px] items-start justify-end border-t border-slate-200 px-4 py-4 text-sm font-semibold text-slate-500"
                      >
                        {label}
                      </div>
                    ))}
                  </div>

                  {staffColumns.map((staff) => (
                    <div key={staff.id} className="relative border-l border-slate-200 bg-white">
                      {timeLabels.map((label, index) => (
                        <div
                          key={`${staff.id}-${label}`}
                          className="h-[108px] border-t border-slate-200"
                        >
                          {index === 0 ? null : null}
                        </div>
                      ))}

                      {visibleBookings
                        .filter((booking) => booking.staff === staff.id)
                        .map((booking) => (
                          <button
                            key={booking.id}
                            className={[
                              'absolute left-3 right-3 rounded-[22px] border p-4 text-left shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5',
                              booking.status === 'Confirmed'
                                ? 'border-blue-200 bg-blue-50'
                                : booking.status === 'Booked'
                                  ? 'border-violet-200 bg-violet-50'
                                  : booking.status === 'Completed'
                                    ? 'border-emerald-200 bg-emerald-50'
                                    : booking.status === 'Cancelled'
                                      ? 'border-rose-200 bg-rose-50'
                                      : 'border-amber-200 bg-amber-50',
                            ].join(' ')}
                            onClick={() => setSelectedBookingId(booking.id)}
                            style={{ top: `${(booking.start - 9) * 108 + 12}px` }}
                            type="button"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-700">
                                  {booking.start}:00
                                </p>
                                <p className="mt-2 font-semibold text-slate-950">{booking.client}</p>
                                <p className="mt-1 text-sm text-slate-600">{booking.service}</p>
                              </div>
                              <StatusBadge tone={badgeTone(booking.status)}>{booking.status}</StatusBadge>
                            </div>
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard title="Booking states">
            <div className="flex flex-wrap gap-2">
              {(['Booked', 'Confirmed', 'Completed', 'Cancelled', 'No-show'] as const).map((status) => (
                <StatusBadge key={status} tone={badgeTone(status)}>
                  {status}
                </StatusBadge>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              <MiniInsight label="Today fill rate" value="84%" />
              <MiniInsight label="Pending confirmations" value="5 bookings" />
              <MiniInsight label="Open prime slots" value="2 after 4 PM" />
            </div>
          </SurfaceCard>
        </div>
      </section>

      <DetailDrawer
        footer={
          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
              Reschedule
            </button>
            <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
              Mark complete
            </button>
          </div>
        }
        onClose={() => setSelectedBookingId(null)}
        open={Boolean(selectedBooking)}
        subtitle="Appointment details"
        title={selectedBooking?.client ?? 'Booking'}
      >
        {selectedBooking ? (
          <div className="space-y-4">
            <InfoBlock label="Service" value={selectedBooking.service} />
            <InfoBlock
              label="Assigned staff"
              value={staffColumns.find((staff) => staff.id === selectedBooking.staff)?.name ?? ''}
            />
            <InfoBlock label="Status" value={selectedBooking.status} />
            <InfoBlock label="Payment" value={selectedBooking.deposit} />
            <InfoBlock label="Notes" value={selectedBooking.summary} />
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  )
}

function ToolbarSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: string[]
  value: string
}) {
  return (
    <label className="min-w-[170px]">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
        {label}
      </span>
      <select
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
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

function MiniInsight({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="text-sm text-slate-500">{value}</p>
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-7 text-slate-700">{value}</p>
    </div>
  )
}

function badgeTone(status: BookingStatus) {
  if (status === 'Confirmed') return 'calm' as const
  if (status === 'Completed') return 'success' as const
  if (status === 'Cancelled') return 'danger' as const
  if (status === 'No-show') return 'attention' as const
  return 'violet' as const
}
