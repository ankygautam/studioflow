import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { AppRole } from '../../data/navigation'

type CalendarPageProps = {
  role: AppRole
}

type BookingStatus =
  | 'Cancelled'
  | 'Checked In'
  | 'Completed'
  | 'Confirmed'
  | 'No-show'
  | 'Pending'

type PaymentStatus = 'Balance Due' | 'Deposit Paid' | 'Paid in Full' | 'Unpaid'

type StaffMember = {
  accent: string
  avatar: string
  id: string
  name: string
  specialty: string
}

type Booking = {
  client: string
  consentStatus: 'Not required' | 'Pending signature' | 'Signed'
  dateLabel: string
  depositRequired: boolean
  duration: number
  endHour: number
  id: string
  notes: string
  paymentStatus: PaymentStatus
  service: string
  staffId: string
  startHour: number
  status: BookingStatus
}

type BookingFormState = {
  client: string
  dateLabel: string
  depositRequired: boolean
  duration: string
  notes: string
  service: string
  staffId: string
  status: BookingStatus
  time: string
}

const rowHeight = 92
const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const viewOptions = ['Day', 'Week', 'Month'] as const
const locationOptions = ['StudioFlow HQ', 'Downtown Studio', 'Wellness Loft'] as const

const staffMembers: StaffMember[] = [
  {
    accent: 'from-[#98d8d3] to-[#8fd0c7]',
    avatar: 'NH',
    id: 'nina-hart',
    name: 'Nina Hart',
    specialty: 'Fine line tattoo',
  },
  {
    accent: 'from-[#a9c8f3] to-[#cdbcf1]',
    avatar: 'EC',
    id: 'elena-cross',
    name: 'Elena Cross',
    specialty: 'Color and balayage',
  },
  {
    accent: 'from-[#f3b598] to-[#f0d6a6]',
    avatar: 'LC',
    id: 'luis-cole',
    name: 'Luis Cole',
    specialty: 'Barber and grooming',
  },
  {
    accent: 'from-[#cdbcf1] to-[#d46f83]',
    avatar: 'JK',
    id: 'jules-kim',
    name: 'Jules Kim',
    specialty: 'Piercing and aftercare',
  },
]

const dayPresets = [
  {
    bookings: [
      {
        client: 'Maya Laurent',
        consentStatus: 'Signed',
        dateLabel: 'Thursday, March 21',
        depositRequired: true,
        duration: 1,
        endHour: 10,
        id: 'bk-1',
        notes: 'Bring updated concept references before stencil prep.',
        paymentStatus: 'Deposit Paid',
        service: 'Fine line tattoo consult',
        staffId: 'nina-hart',
        startHour: 9,
        status: 'Confirmed',
      },
      {
        client: 'Amara Singh',
        consentStatus: 'Pending signature',
        dateLabel: 'Thursday, March 21',
        depositRequired: false,
        duration: 2,
        endHour: 12,
        id: 'bk-2',
        notes: 'Follow-up piercing check with jewelry sizing note.',
        paymentStatus: 'Balance Due',
        service: 'Piercing follow-up',
        staffId: 'jules-kim',
        startHour: 10,
        status: 'Pending',
      },
      {
        client: 'Derek Hoffman',
        consentStatus: 'Not required',
        dateLabel: 'Thursday, March 21',
        depositRequired: false,
        duration: 1,
        endHour: 12,
        id: 'bk-3',
        notes: 'Prefers low fade with beard line cleanup.',
        paymentStatus: 'Paid in Full',
        service: 'Skin fade and beard sculpt',
        staffId: 'luis-cole',
        startHour: 11,
        status: 'Checked In',
      },
      {
        client: 'Sophie Bennett',
        consentStatus: 'Not required',
        dateLabel: 'Thursday, March 21',
        depositRequired: true,
        duration: 2,
        endHour: 15,
        id: 'bk-4',
        notes: 'Extended session with toner and bond treatment.',
        paymentStatus: 'Deposit Paid',
        service: 'Balayage refresh',
        staffId: 'elena-cross',
        startHour: 13,
        status: 'Confirmed',
      },
      {
        client: 'Marcus Lee',
        consentStatus: 'Signed',
        dateLabel: 'Thursday, March 21',
        depositRequired: true,
        duration: 1,
        endHour: 16,
        id: 'bk-5',
        notes: 'Touch-up request, final positioning already approved.',
        paymentStatus: 'Balance Due',
        service: 'Lettering touch-up',
        staffId: 'nina-hart',
        startHour: 15,
        status: 'Completed',
      },
      {
        client: 'Rhea Collins',
        consentStatus: 'Pending signature',
        dateLabel: 'Thursday, March 21',
        depositRequired: true,
        duration: 1,
        endHour: 17,
        id: 'bk-6',
        notes: 'Confirm jewelry availability before arrival.',
        paymentStatus: 'Unpaid',
        service: 'Curated ear stack',
        staffId: 'jules-kim',
        startHour: 16,
        status: 'No-show',
      },
    ],
    label: 'Thursday, March 21',
  },
  {
    bookings: [
      {
        client: 'Noah Reed',
        consentStatus: 'Signed',
        dateLabel: 'Friday, March 22',
        depositRequired: true,
        duration: 2,
        endHour: 11,
        id: 'bk-7',
        notes: 'Sleeve planning session with shading references.',
        paymentStatus: 'Deposit Paid',
        service: 'Tattoo concept session',
        staffId: 'nina-hart',
        startHour: 9,
        status: 'Confirmed',
      },
      {
        client: 'Lena Ford',
        consentStatus: 'Not required',
        dateLabel: 'Friday, March 22',
        depositRequired: false,
        duration: 1,
        endHour: 12,
        id: 'bk-8',
        notes: 'Quick fringe trim and style reset.',
        paymentStatus: 'Paid in Full',
        service: 'Signature blowout',
        staffId: 'elena-cross',
        startHour: 11,
        status: 'Completed',
      },
      {
        client: 'Owen Diaz',
        consentStatus: 'Not required',
        dateLabel: 'Friday, March 22',
        depositRequired: false,
        duration: 1,
        endHour: 14,
        id: 'bk-9',
        notes: 'Walk-in slot held for lunch hour rush.',
        paymentStatus: 'Balance Due',
        service: 'Premium beard package',
        staffId: 'luis-cole',
        startHour: 13,
        status: 'Pending',
      },
      {
        client: 'Gia Romano',
        consentStatus: 'Signed',
        dateLabel: 'Friday, March 22',
        depositRequired: true,
        duration: 1,
        endHour: 16,
        id: 'bk-10',
        notes: 'Healing check plus jewelry swap.',
        paymentStatus: 'Deposit Paid',
        service: 'Piercing aftercare review',
        staffId: 'jules-kim',
        startHour: 15,
        status: 'Cancelled',
      },
    ],
    label: 'Friday, March 22',
  },
  {
    bookings: [
      {
        client: 'Ava Monroe',
        consentStatus: 'Signed',
        dateLabel: 'Today',
        depositRequired: true,
        duration: 1,
        endHour: 10,
        id: 'bk-11',
        notes: 'Deposit captured, final stencil pending approval.',
        paymentStatus: 'Deposit Paid',
        service: 'Flash tattoo session',
        staffId: 'nina-hart',
        startHour: 9,
        status: 'Confirmed',
      },
      {
        client: 'Leo Carter',
        consentStatus: 'Not required',
        dateLabel: 'Today',
        depositRequired: false,
        duration: 2,
        endHour: 13,
        id: 'bk-12',
        notes: 'Color correction with toner and trim.',
        paymentStatus: 'Balance Due',
        service: 'Color correction',
        staffId: 'elena-cross',
        startHour: 11,
        status: 'Checked In',
      },
      {
        client: 'Jade Bennett',
        consentStatus: 'Signed',
        dateLabel: 'Today',
        depositRequired: true,
        duration: 1,
        endHour: 15,
        id: 'bk-13',
        notes: 'Cartilage check, waiver already signed.',
        paymentStatus: 'Unpaid',
        service: 'Piercing consultation',
        staffId: 'jules-kim',
        startHour: 14,
        status: 'Pending',
      },
    ],
    label: 'Today',
  },
]

const baseFormState: BookingFormState = {
  client: '',
  dateLabel: dayPresets[2].label,
  depositRequired: false,
  duration: '1',
  notes: '',
  service: '',
  staffId: staffMembers[0].id,
  status: 'Confirmed',
  time: '09:00',
}

const cardToneByStatus: Record<BookingStatus, string> = {
  Cancelled: 'border-rose-200 bg-[#f8e9ee]',
  'Checked In': 'border-teal-200 bg-[#e6f6f3]',
  Completed: 'border-slate-200 bg-[#eef3f8]',
  Confirmed: 'border-blue-200 bg-[#ebf3ff]',
  'No-show': 'border-amber-200 bg-[#fff2df]',
  Pending: 'border-purple-200 bg-[#f1ebfb]',
}

const badgeToneByStatus: Record<BookingStatus, string> = {
  Cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
  'Checked In': 'border-teal-200 bg-teal-50 text-teal-700',
  Completed: 'border-slate-200 bg-slate-100 text-slate-700',
  Confirmed: 'border-blue-200 bg-blue-50 text-blue-700',
  'No-show': 'border-amber-200 bg-amber-50 text-amber-700',
  Pending: 'border-purple-200 bg-purple-50 text-purple-700',
}

const badgeToneByPayment: Record<PaymentStatus, string> = {
  'Balance Due': 'border-amber-200 bg-amber-50 text-amber-700',
  'Deposit Paid': 'border-blue-200 bg-blue-50 text-blue-700',
  'Paid in Full': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Unpaid: 'border-rose-200 bg-rose-50 text-rose-700',
}

export function CalendarPage({ role }: CalendarPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<(typeof viewOptions)[number]>('Day')
  const [location, setLocation] = useState<(typeof locationOptions)[number]>(
    locationOptions[0],
  )
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('All Staff')
  const [dayIndex, setDayIndex] = useState(2)
  const [scheduleByDay, setScheduleByDay] = useState<Record<string, Booking[]>>(
    () =>
      Object.fromEntries(
        dayPresets.map((day) => [day.label, day.bookings as Booking[]]),
      ) as Record<string, Booking[]>,
  )
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formState, setFormState] = useState<BookingFormState>(baseFormState)

  const activeDay = dayPresets[dayIndex]
  const bookings = scheduleByDay[activeDay.label] ?? []
  const activeDayDisplay =
    activeDay.label === 'Today' ? 'Thursday, March 19' : activeDay.label
  const visibleStaff =
    selectedStaffFilter === 'All Staff'
      ? staffMembers
      : staffMembers.filter((member) => member.id === selectedStaffFilter)

  const selectedBooking =
    bookings.find((booking) => booking.id === selectedBookingId) ?? null

  const goToPreviousDay = () => {
    const nextIndex = dayIndex === 0 ? dayPresets.length - 1 : dayIndex - 1
    setDayIndex(nextIndex)
    setSelectedBookingId(null)
  }

  const goToNextDay = () => {
    const nextIndex = dayIndex === dayPresets.length - 1 ? 0 : dayIndex + 1
    setDayIndex(nextIndex)
    setSelectedBookingId(null)
  }

  const goToToday = () => {
    setDayIndex(2)
    setSelectedBookingId(null)
  }

  const openCreateModal = (staffId?: string, time?: string) => {
    setFormState({
      ...baseFormState,
      dateLabel: activeDay.label,
      staffId: staffId ?? staffMembers[0].id,
      time: time ?? '09:00',
    })
    setIsCreateModalOpen(true)
  }

  useEffect(() => {
    if (searchParams.get('modal') !== 'create' || isCreateModalOpen) {
      return
    }

    const frame = requestAnimationFrame(() => {
      setFormState({
        ...baseFormState,
        dateLabel: activeDay.label,
        staffId: staffMembers[0].id,
        time: '09:00',
      })
      setIsCreateModalOpen(true)
    })

    return () => cancelAnimationFrame(frame)
  }, [activeDay.label, isCreateModalOpen, searchParams])

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    if (searchParams.get('modal') === 'create') {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('modal')
      setSearchParams(nextParams)
    }
  }

  const handleCreateBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const startHour = Number(formState.time.split(':')[0])
    const duration = Number(formState.duration)

    const newBooking: Booking = {
      client: formState.client || 'Walk-in client',
      consentStatus: formState.depositRequired ? 'Pending signature' : 'Not required',
      dateLabel: formState.dateLabel,
      depositRequired: formState.depositRequired,
      duration,
      endHour: startHour + duration,
      id: `booking-${Date.now()}`,
      notes: formState.notes || 'Created from calendar quick-add flow.',
      paymentStatus: formState.depositRequired ? 'Deposit Paid' : 'Balance Due',
      service: formState.service || 'Custom service',
      staffId: formState.staffId,
      startHour,
      status: formState.status,
    }

    setScheduleByDay((current) => ({
      ...current,
      [formState.dateLabel]: [...(current[formState.dateLabel] ?? []), newBooking],
    }))

    const nextDayIndex = dayPresets.findIndex((day) => day.label === formState.dateLabel)
    if (nextDayIndex >= 0) {
      setDayIndex(nextDayIndex)
    }

    setSelectedBookingId(newBooking.id)
    setIsCreateModalOpen(false)
  }

  const updateBookingStatus = (status: BookingStatus) => {
    if (!selectedBooking) return

    setScheduleByDay((current) => ({
      ...current,
      [activeDay.label]: bookings.map((booking) =>
        booking.id === selectedBooking.id
          ? {
              ...booking,
              paymentStatus:
                status === 'Completed' ? 'Paid in Full' : booking.paymentStatus,
              status,
            }
          : booking,
      ),
    }))
  }

  return (
    <div className="space-y-6">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.3 }}
        className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,40,0.06)] md:p-6"
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <p className="font-display text-xs uppercase tracking-[0.35em] text-slate-500">
              Booking command center
            </p>
            <h1 className="font-display text-4xl text-slate-950 md:text-5xl">
              Calendar
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
              A premium booking surface for {role} workflows, with fast calendar
              scanning, muted appointment states, and day-of-service actions.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Live schedule:</span>{' '}
            {activeDay.label} • {visibleStaff.length} staff visible
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.3 }}
          className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,40,0.06)]"
        >
          <div className="border-b border-slate-200 p-4 md:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="grid gap-3 md:grid-cols-2 xl:min-w-[420px] xl:flex-1">
                <SelectControl
                  label="Location"
                  value={location}
                  onChange={(value) =>
                    setLocation(value as (typeof locationOptions)[number])
                  }
                  options={[...locationOptions]}
                />

                <SelectControl
                  label="Staff"
                  value={selectedStaffFilter}
                  onChange={setSelectedStaffFilter}
                  options={['All Staff', ...staffMembers.map((member) => member.id)]}
                  optionLabel={(value) =>
                    value === 'All Staff'
                      ? value
                      : staffMembers.find((member) => member.id === value)?.name ?? value
                  }
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 xl:flex-none">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                  <ControlButton onClick={goToPreviousDay}>
                    <CalendarIcon name="chevron-left" />
                  </ControlButton>
                  <div className="min-w-[180px] rounded-xl bg-white px-4 py-2 text-center text-sm font-semibold text-slate-800">
                    {activeDayDisplay}
                  </div>
                  <ControlButton onClick={goToNextDay}>
                    <CalendarIcon name="chevron-right" />
                  </ControlButton>
                </div>

                <button
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                  onClick={goToToday}
                  type="button"
                >
                  Today
                </button>

                <button
                  className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white xl:self-start"
                  type="button"
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <CalendarIcon name="sliders" />
                  </span>
                  Filters
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                {view === 'Day' ? `Day view • ${activeDayDisplay}` : `${view} view • ${activeDayDisplay}`}
              </div>

              <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
                {viewOptions.map((option) => (
                  <button
                    key={option}
                    className={[
                      'rounded-xl px-4 py-2 text-sm font-semibold transition',
                      view === option
                        ? 'bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,40,0.18)]'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900',
                    ].join(' ')}
                    onClick={() => setView(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>

              <button
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,40,0.2)] transition hover:bg-slate-800"
                onClick={() => openCreateModal()}
                type="button"
              >
                <CalendarIcon name="plus" />
                Add New
              </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[520px]">
              <div
                className="grid border-b border-slate-200 bg-slate-50/80"
                style={{
                  gridTemplateColumns: `88px repeat(${visibleStaff.length}, minmax(180px, 1fr))`,
                }}
              >
                <div className="border-r border-slate-200 px-4 py-4 text-xs uppercase tracking-[0.24em] text-slate-400">
                  Time
                </div>
                {visibleStaff.map((member) => (
                  <div
                    key={member.id}
                    className="border-r border-slate-200 px-4 py-4 last:border-r-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${member.accent} font-display text-sm text-slate-950`}
                      >
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">{member.name}</p>
                        <p className="text-sm text-slate-500">{member.specialty}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="grid"
                style={{
                  gridTemplateColumns: `88px repeat(${visibleStaff.length}, minmax(180px, 1fr))`,
                }}
              >
                <div className="border-r border-slate-200 bg-white">
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className="flex h-[92px] items-start justify-end border-b border-slate-200 px-3 py-3 text-sm font-semibold text-slate-500 last:border-b-0"
                    >
                      {formatDisplayTime(time)}
                    </div>
                  ))}
                </div>

                {visibleStaff.map((member) => {
                  const columnBookings = bookings.filter(
                    (booking) => booking.staffId === member.id,
                  )

                  return (
                    <div
                      key={member.id}
                      className="relative border-r border-slate-200 last:border-r-0"
                      style={{ height: rowHeight * timeSlots.length }}
                    >
                      {timeSlots.map((time) => (
                        <button
                          key={`${member.id}-${time}`}
                          className="group absolute inset-x-0 border-b border-slate-200 text-left transition hover:bg-slate-50/70 focus:bg-slate-50/80 focus:outline-none"
                          onClick={() => openCreateModal(member.id, time)}
                          style={{
                            height: rowHeight,
                            top:
                              (Number(time.split(':')[0]) -
                                Number(timeSlots[0].split(':')[0])) *
                              rowHeight,
                          }}
                          type="button"
                        >
                          <span className="absolute right-4 top-3 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 opacity-0 transition group-hover:opacity-100">
                            Add
                          </span>
                        </button>
                      ))}

                      {columnBookings.length === 0 ? (
                        <div className="pointer-events-none absolute inset-x-4 top-28 rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50/80 p-4 text-center text-sm leading-6 text-slate-500">
                          No bookings yet. Tap any empty slot to create one.
                        </div>
                      ) : null}

                      {columnBookings.map((booking) => (
                        <button
                          key={booking.id}
                          className={[
                            'absolute left-2 right-2 rounded-[1.35rem] border p-4 text-left shadow-[0_12px_28px_rgba(15,23,40,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,40,0.12)] focus:outline-none',
                            cardToneByStatus[booking.status],
                          ].join(' ')}
                          onClick={() => setSelectedBookingId(booking.id)}
                          style={{
                            height: booking.duration * rowHeight - 8,
                            top:
                              (booking.startHour -
                                Number(timeSlots[0].split(':')[0])) *
                                rowHeight +
                              4,
                          }}
                          type="button"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-700">
                                {formatHourRange(booking.startHour, booking.endHour)}
                              </p>
                              <p className="mt-2 font-semibold text-slate-950">
                                {booking.client}
                              </p>
                              <p className="mt-1 text-sm text-slate-700">
                                {booking.service}
                              </p>
                            </div>
                            <div className="space-y-2 text-right">
                              <Badge tone={badgeToneByStatus[booking.status]}>
                                {booking.status}
                              </Badge>
                              <Badge tone={badgeToneByPayment[booking.paymentStatus]}>
                                {booking.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <SurfaceCard title="Schedule highlights">
            <div className="space-y-3">
              <InsightRow label="Checked in" value="4 active services" />
              <InsightRow label="Pending deposits" value="$320 awaiting capture" />
              <InsightRow label="Empty premium slots" value="3 openings after 2 PM" />
              <InsightRow label="Consent follow-up" value="2 clients need signatures" />
            </div>
          </SurfaceCard>

          <SurfaceCard title="View notes">
            <div className="grid grid-cols-3 gap-2">
              {viewOptions.map((option) => (
                <div
                  key={option}
                  className={[
                    'rounded-2xl border p-3 text-center text-sm font-semibold',
                    option === view
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-600',
                  ].join(' ')}
                >
                  {option}
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              Day view is active for the most precise booking control. Week and
              Month toggles are styled and ready for deeper scheduling views next.
            </p>
          </SurfaceCard>

          <SurfaceCard title="Today overview">
            <div className="space-y-3">
              {[
                ['Confirmed', '8'],
                ['Pending', '3'],
                ['Checked In', '2'],
                ['Completed', '4'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-slate-700">{label}</p>
                  <p className="font-display text-2xl text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </section>

      <AnimatePresence>
        {selectedBooking ? (
          <BookingDrawer
            booking={selectedBooking}
            onCancel={() => updateBookingStatus('Cancelled')}
            onClose={() => setSelectedBookingId(null)}
            onComplete={() => updateBookingStatus('Completed')}
            onReschedule={() => {
              setFormState({
                client: selectedBooking.client,
                dateLabel: selectedBooking.dateLabel,
                depositRequired: selectedBooking.depositRequired,
                duration: String(selectedBooking.duration),
                notes: selectedBooking.notes,
                service: selectedBooking.service,
                staffId: selectedBooking.staffId,
                status: selectedBooking.status,
                time: `${String(selectedBooking.startHour).padStart(2, '0')}:00`,
              })
              setSelectedBookingId(null)
              setIsCreateModalOpen(true)
            }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateModalOpen ? (
          <CreateBookingModal
            formState={formState}
            onChange={setFormState}
            onClose={closeCreateModal}
            onSubmit={handleCreateBooking}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

type SelectControlProps = {
  label: string
  onChange: (value: string) => void
  optionLabel?: (value: string) => string
  options: string[]
  value: string
}

function SelectControl({
  label,
  onChange,
  optionLabel,
  options,
  value,
}: SelectControlProps) {
  return (
    <label className="min-w-[180px]">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </span>
      <select
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabel ? optionLabel(option) : option}
          </option>
        ))}
      </select>
    </label>
  )
}

function ControlButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function SurfaceCard({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,40,0.05)]">
      <h2 className="font-display text-2xl text-slate-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="text-sm text-slate-500">{value}</p>
    </div>
  )
}

function Badge({ children, tone }: { children: ReactNode; tone: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}
    >
      {children}
    </span>
  )
}

type BookingDrawerProps = {
  booking: Booking
  onCancel: () => void
  onClose: () => void
  onComplete: () => void
  onReschedule: () => void
}

function BookingDrawer({
  booking,
  onCancel,
  onClose,
  onComplete,
  onReschedule,
}: BookingDrawerProps) {
  const staff = staffMembers.find((member) => member.id === booking.staffId)

  return (
    <>
      <motion.button
        aria-label="Close booking details"
        className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        type="button"
      />
      <motion.aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-slate-200 bg-white p-6 shadow-[-24px_0_60px_rgba(15,23,40,0.12)]"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.24 }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-3xl text-slate-950">
                {booking.client}
              </p>
              <p className="mt-2 text-sm text-slate-500">{booking.service}</p>
            </div>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              <CalendarIcon name="close" />
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone={badgeToneByStatus[booking.status]}>{booking.status}</Badge>
            <Badge tone={badgeToneByPayment[booking.paymentStatus]}>
              {booking.paymentStatus}
            </Badge>
          </div>

          <div className="mt-6 space-y-3">
            <DrawerRow label="Client info" value={`${booking.client} • returning guest`} />
            <DrawerRow label="Service" value={booking.service} />
            <DrawerRow label="Staff member" value={staff?.name ?? 'Unassigned'} />
            <DrawerRow
              label="Date and time"
              value={`${booking.dateLabel} • ${formatHourRange(
                booking.startHour,
                booking.endHour,
              )}`}
            />
            <DrawerRow label="Deposit status" value={booking.paymentStatus} />
            <DrawerRow label="Consent form" value={booking.consentStatus} />
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Notes</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">{booking.notes}</p>
          </div>

          <div className="mt-auto grid gap-3 pt-6">
            <button
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 transition hover:bg-white"
              onClick={onReschedule}
              type="button"
            >
              Reschedule
            </button>
            <button
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={onComplete}
              type="button"
            >
              Mark complete
            </button>
            <button
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              onClick={onCancel}
              type="button"
            >
              Cancel booking
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

function DrawerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="max-w-[58%] text-right text-sm text-slate-600">{value}</p>
    </div>
  )
}

type CreateBookingModalProps = {
  formState: BookingFormState
  onChange: (next: BookingFormState) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function CreateBookingModal({
  formState,
  onChange,
  onClose,
  onSubmit,
}: CreateBookingModalProps) {
  return (
    <>
      <motion.button
        aria-label="Close create booking modal"
        className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        type="button"
      />
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.22 }}
      >
        <form
          className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,40,0.16)] md:p-7"
          onSubmit={onSubmit}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-3xl text-slate-950">Create booking</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add a new appointment directly from the calendar with staff,
                timing, status, and deposit context.
              </p>
            </div>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              <CalendarIcon name="close" />
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FormField label="Client">
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                onChange={(event) =>
                  onChange({ ...formState, client: event.target.value })
                }
                placeholder="Client name"
                value={formState.client}
              />
            </FormField>

            <FormField label="Service">
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                onChange={(event) =>
                  onChange({ ...formState, service: event.target.value })
                }
                placeholder="Service name"
                value={formState.service}
              />
            </FormField>

            <FormField label="Staff">
              <select
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                onChange={(event) =>
                  onChange({ ...formState, staffId: event.target.value })
                }
                value={formState.staffId}
              >
                {staffMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Date">
              <select
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                onChange={(event) =>
                  onChange({ ...formState, dateLabel: event.target.value })
                }
                value={formState.dateLabel}
              >
                {dayPresets.map((day) => (
                  <option key={day.label} value={day.label}>
                    {day.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Time">
              <select
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                onChange={(event) =>
                  onChange({ ...formState, time: event.target.value })
                }
                value={formState.time}
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {formatDisplayTime(time)}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Duration">
              <select
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                onChange={(event) =>
                  onChange({ ...formState, duration: event.target.value })
                }
                value={formState.duration}
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
              </select>
            </FormField>

            <FormField label="Booking status">
              <select
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                onChange={(event) =>
                  onChange({
                    ...formState,
                    status: event.target.value as BookingStatus,
                  })
                }
                value={formState.status}
              >
                {Object.keys(cardToneByStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Notes">
            <textarea
              className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
              onChange={(event) =>
                onChange({ ...formState, notes: event.target.value })
              }
              placeholder="Prep notes, client preferences, consent reminders..."
              value={formState.notes}
            />
          </FormField>

          <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              checked={formState.depositRequired}
              onChange={(event) =>
                onChange({ ...formState, depositRequired: event.target.checked })
              }
              type="checkbox"
            />
            <span className="text-sm font-semibold text-slate-700">
              Deposit required
            </span>
          </label>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-semibold text-slate-700 transition hover:bg-white"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              type="submit"
            >
              Create booking
            </button>
          </div>
        </form>
      </motion.div>
    </>
  )
}

function FormField({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  )
}

type CalendarIconName =
  | 'chevron-left'
  | 'chevron-right'
  | 'close'
  | 'plus'
  | 'sliders'

function CalendarIcon({ name }: { name: CalendarIconName }) {
  const common = 'block h-4 w-4 shrink-0'

  switch (name) {
    case 'chevron-left':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="m14.5 6-6 6 6 6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'chevron-right':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="m9.5 6 6 6-6 6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'plus':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'sliders':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M4 7h16M4 17h16M4 12h16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
          <circle
            cx="9"
            cy="7"
            r="2"
            fill="white"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle
            cx="15"
            cy="12"
            r="2"
            fill="white"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle
            cx="11"
            cy="17"
            r="2"
            fill="white"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'close':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="m6 6 12 12M18 6 6 18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )
  }
}

function formatDisplayTime(time: string) {
  const [hourText] = time.split(':')
  const hour = Number(hourText)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalized = hour > 12 ? hour - 12 : hour
  return `${normalized}:00 ${suffix}`
}

function formatHourRange(startHour: number, endHour: number) {
  return `${formatDisplayTime(`${String(startHour).padStart(2, '0')}:00`)} - ${formatDisplayTime(
    `${String(endHour).padStart(2, '0')}:00`,
  )}`
}
