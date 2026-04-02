import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppointmentDrawer } from '../components/appointments/appointment-drawer'
import { SurfaceCard } from '../components/layout/app-shell'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { StatusBadge } from '../components/ui/status-badge'
import { canCreateBookings } from '../features/auth/authorization'
import { useAuth } from '../features/auth/use-auth'
import { useRemoteList } from '../hooks/use-remote-list'
import { appointmentTone, type AppointmentFormState } from '../lib/appointments'
import { getAppointments } from '../lib/api/appointments-api'
import { getDefaultStudioId } from '../lib/api/http'
import { getServices } from '../lib/api/services-api'
import { getStaff } from '../lib/api/staff-api'
import type { AppointmentRecord, AppointmentStatus } from '../lib/api/types'
import { formatTime, humanizeEnum } from '../lib/formatters'

const staffAccents = [
  'from-[#b7d9ff] to-[#d3d8ff]',
  'from-[#b5ead8] to-[#d2f0e7]',
  'from-[#f2d3b0] to-[#f4e3c8]',
  'from-[#d9d0ff] to-[#ebd9ff]',
]

export function CalendarPage() {
  const { selectedLocationId, setSelectedLocationId, user } = useAuth()
  const allowCreate = user ? canCreateBookings(user.role) : false
  const defaultStudioId = user?.studioId ?? getDefaultStudioId()
  const loadAppointments = useCallback(
    () => getAppointments(defaultStudioId, selectedLocationId),
    [defaultStudioId, selectedLocationId],
  )
  const loadStaff = useCallback(
    () => getStaff(defaultStudioId, selectedLocationId),
    [defaultStudioId, selectedLocationId],
  )
  const loadServices = useCallback(() => getServices(defaultStudioId), [defaultStudioId])

  const {
    data: appointments,
    error: appointmentsError,
    isLoading: appointmentsLoading,
    reload,
    setData: setAppointments,
  } = useRemoteList(loadAppointments)
  const { data: staffMembers, error: staffError, isLoading: staffLoading } = useRemoteList(loadStaff)
  const { data: services, error: servicesError, isLoading: servicesLoading } = useRemoteList(loadServices)

  const [searchParams, setSearchParams] = useSearchParams()
  const [draft, setDraft] = useState<Partial<AppointmentFormState> | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentRecord | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(getTodayDateValue())
  const [selectedService, setSelectedService] = useState('ALL')
  const [selectedStaff, setSelectedStaff] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | AppointmentStatus>('ALL')
  const [view, setView] = useState<'Day' | 'Month' | 'Week'>('Day')
  const [hasAutoFocusedDate, setHasAutoFocusedDate] = useState(false)

  const dependenciesLoading = appointmentsLoading || staffLoading || servicesLoading
  const dependenciesError = appointmentsError || staffError || servicesError

  const visibleAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        if (!matchesCalendarView(appointment.appointmentDate, selectedDate, view)) {
          return false
        }

        if (selectedStaff !== 'ALL' && appointment.staffProfileId !== selectedStaff) {
          return false
        }

        if (selectedService !== 'ALL' && appointment.serviceId !== selectedService) {
          return false
        }

        if (selectedStatus !== 'ALL' && appointment.status !== selectedStatus) {
          return false
        }

        return true
      }),
    [appointments, selectedDate, selectedService, selectedStaff, selectedStatus, view],
  )

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate])
  const monthDays = useMemo(() => getMonthGridDays(selectedDate), [selectedDate])
  const dayAppointments = useMemo(
    () => visibleAppointments.filter((appointment) => appointment.appointmentDate === selectedDate),
    [selectedDate, visibleAppointments],
  )
  const timelineHours = useMemo(() => getTimelineHours(dayAppointments), [dayAppointments])

  useEffect(() => {
    if (hasAutoFocusedDate || appointmentsLoading || appointments.length === 0) {
      return
    }

    const hasAppointmentsOnSelectedDate = appointments.some(
      (appointment) => appointment.appointmentDate === selectedDate,
    )

    if (hasAppointmentsOnSelectedDate) {
      setHasAutoFocusedDate(true)
      return
    }

    const latestAppointment = [...appointments].sort((left, right) =>
      `${right.appointmentDate}T${right.startTime}`.localeCompare(`${left.appointmentDate}T${left.startTime}`),
    )[0]

    if (latestAppointment) {
      setSelectedDate(latestAppointment.appointmentDate)
    }

    setHasAutoFocusedDate(true)
  }, [appointments, appointmentsLoading, hasAutoFocusedDate, selectedDate])

  useEffect(() => {
    if (!allowCreate || searchParams.get('newBooking') !== '1' || isDrawerOpen) {
      return
    }

    setEditingAppointment(null)
    setDraft({
      appointmentDate: selectedDate,
      locationId: selectedLocationId ?? '',
      source: 'ADMIN_CREATED',
      status: 'BOOKED',
    })
    setIsDrawerOpen(true)
  }, [allowCreate, isDrawerOpen, searchParams, selectedDate, selectedLocationId])

  const closeDrawer = () => {
    setDraft(null)
    setEditingAppointment(null)
    setIsDrawerOpen(false)

    if (searchParams.get('newBooking') === '1') {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('newBooking')
      setSearchParams(nextParams)
    }
  }

  const openCreateDrawer = (nextDraft?: Partial<AppointmentFormState>) => {
    setEditingAppointment(null)
    setDraft({
      appointmentDate: selectedDate,
      locationId: selectedLocationId ?? '',
      source: 'ADMIN_CREATED',
      status: 'BOOKED',
      ...nextDraft,
    })
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (appointment: AppointmentRecord) => {
    setDraft(null)
    setEditingAppointment(appointment)
    setIsDrawerOpen(true)
  }

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
              A premium timeline for managing day-to-day appointments across staff, services, and booking states without visual clutter.
            </p>
            <p className="mt-3 text-sm font-medium text-slate-500">
              Showing {formatActiveRangeLabel(selectedDate, view)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              className="h-12 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600 outline-none"
              onChange={(event) => setSelectedDate(event.target.value)}
              type="date"
              value={selectedDate}
            />
            {allowCreate ? (
              <button
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
                onClick={() => openCreateDrawer()}
                type="button"
              >
                New booking
              </button>
            ) : null}
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <SurfaceCard title="Calendar board">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <ToolbarSelect
                label="Staff"
                onChange={setSelectedStaff}
                options={[
                  { label: 'All staff', value: 'ALL' },
                  ...staffMembers.map((staffMember) => ({
                    label: staffMember.displayName,
                    value: staffMember.id,
                  })),
                ]}
                value={selectedStaff}
              />
              <ToolbarSelect
                label="Service"
                onChange={setSelectedService}
                options={[
                  { label: 'All services', value: 'ALL' },
                  ...services.map((service) => ({ label: service.name, value: service.id })),
                ]}
                value={selectedService}
              />
              <ToolbarSelect
                label="Status"
                onChange={(value) => setSelectedStatus(value as 'ALL' | AppointmentStatus)}
                options={[
                  { label: 'All statuses', value: 'ALL' },
                  ...(['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const).map((status) => ({
                    label: humanizeEnum(status),
                    value: status,
                  })),
                ]}
                value={selectedStatus}
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

            {dependenciesLoading ? <LoadingState title="Loading calendar data..." /> : null}
            {!dependenciesLoading && dependenciesError ? <ErrorState message={dependenciesError} /> : null}
            {!dependenciesLoading && !dependenciesError && staffMembers.length === 0 ? (
              <EmptyState
                action={
                  allowCreate ? (
                    <button
                      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                      onClick={() => openCreateDrawer()}
                      type="button"
                    >
                      New booking
                    </button>
                  ) : null
                }
                description="Add real staff profiles in the backend so the booking board can render team columns."
                title="No staff available for the calendar"
              />
            ) : null}
            {!dependenciesLoading && !dependenciesError && staffMembers.length > 0 ? (
              view === 'Day' ? (
                <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-slate-50/80">
                  <div className="min-w-[860px]">
                    <div
                      className="grid border-b border-slate-200 bg-white"
                      style={{ gridTemplateColumns: `90px repeat(${staffMembers.length}, minmax(180px, 1fr))` }}
                    >
                      <div className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                        Time
                      </div>
                      {staffMembers.map((staffMember, index) => (
                        <div key={staffMember.id} className="border-l border-slate-200 px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${staffAccents[index % staffAccents.length]} text-sm font-semibold text-slate-950`}
                            >
                              {staffMember.displayName
                                .split(' ')
                                .slice(0, 2)
                                .map((segment) => segment[0]?.toUpperCase())
                                .join('')}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-950">{staffMember.displayName}</p>
                              <p className="text-sm text-slate-500">{staffMember.jobTitle || 'Studio staff'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      className="grid"
                      style={{ gridTemplateColumns: `90px repeat(${staffMembers.length}, minmax(180px, 1fr))` }}
                    >
                      <div className="bg-white">
                        {timelineHours.map((hour) => (
                          <div
                            key={hour}
                            className="flex h-[108px] items-start justify-end border-t border-slate-200 px-4 py-4 text-sm font-semibold text-slate-500"
                          >
                            {formatHourLabel(hour)}
                          </div>
                        ))}
                      </div>

                      {staffMembers.map((staffMember) => (
                        <div key={staffMember.id} className="relative border-l border-slate-200 bg-white">
                          {timelineHours.map((hour) => (
                            <button
                              key={`${staffMember.id}-${hour}`}
                              className={[
                                'block h-[108px] w-full border-t border-slate-200 transition',
                                allowCreate ? 'hover:bg-slate-50/80' : 'cursor-default',
                              ].join(' ')}
                              disabled={!allowCreate}
                              onClick={() => {
                                if (!allowCreate) {
                                  return
                                }

                                openCreateDrawer({
                                  appointmentDate: selectedDate,
                                  endTime: `${String(hour + 1).padStart(2, '0')}:00`,
                                  staffProfileId: staffMember.id,
                                  startTime: `${String(hour).padStart(2, '0')}:00`,
                                })
                              }}
                              type="button"
                            />
                          ))}

                          {dayAppointments
                            .filter((appointment) => appointment.staffProfileId === staffMember.id)
                            .map((appointment) => (
                              <button
                                key={appointment.id}
                                className={[
                                  'absolute left-3 right-3 z-10 rounded-[22px] border p-4 text-left shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5',
                                  appointment.status === 'CONFIRMED'
                                    ? 'border-blue-200 bg-blue-50'
                                    : appointment.status === 'BOOKED'
                                      ? 'border-violet-200 bg-violet-50'
                                      : appointment.status === 'COMPLETED'
                                        ? 'border-emerald-200 bg-emerald-50'
                                        : appointment.status === 'CANCELLED'
                                          ? 'border-rose-200 bg-rose-50'
                                          : 'border-amber-200 bg-amber-50',
                                ].join(' ')}
                                onClick={() => openEditDrawer(appointment)}
                                style={appointmentCardStyle(appointment, timelineHours[0] ?? 9)}
                                type="button"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-700">
                                      {formatTime(appointment.startTime)}
                                    </p>
                                    <p className="mt-2 font-semibold text-slate-950">{appointment.customerName}</p>
                                    <p className="mt-1 text-sm text-slate-600">{appointment.serviceName}</p>
                                  </div>
                                  <StatusBadge tone={appointmentTone(appointment.status)}>
                                    {humanizeEnum(appointment.status)}
                                  </StatusBadge>
                                </div>
                              </button>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : view === 'Week' ? (
                <div className="grid gap-4 lg:grid-cols-7">
                  {weekDays.map((day) => {
                    const appointmentsForDay = visibleAppointments.filter((appointment) => appointment.appointmentDate === day.value)

                    return (
                      <div key={day.value} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                        <div className="border-b border-slate-200 pb-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            {day.label}
                          </p>
                          <p className="mt-2 text-lg font-semibold text-slate-950">{day.displayDate}</p>
                        </div>
                        <div className="mt-4 space-y-3">
                          {appointmentsForDay.length === 0 ? (
                            <div className="rounded-[20px] border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                              No bookings scheduled.
                            </div>
                          ) : (
                            appointmentsForDay.map((appointment) => (
                              <button
                                key={appointment.id}
                                className="w-full rounded-[20px] border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300"
                                onClick={() => openEditDrawer(appointment)}
                                type="button"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-700">{formatTime(appointment.startTime)}</p>
                                    <p className="mt-2 font-semibold text-slate-950">{appointment.customerName}</p>
                                    <p className="mt-1 text-sm text-slate-600">{appointment.serviceName}</p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                                      {appointment.staffName}
                                    </p>
                                  </div>
                                  <StatusBadge tone={appointmentTone(appointment.status)}>
                                    {humanizeEnum(appointment.status)}
                                  </StatusBadge>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Month view</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">{formatMonthTitle(selectedDate)}</p>
                    </div>
                    <p className="text-sm text-slate-500">{visibleAppointments.length} bookings in view</p>
                  </div>
                  <div className="grid grid-cols-7 gap-3">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
                      <div key={label} className="px-2 py-1 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                        {label}
                      </div>
                    ))}
                    {monthDays.map((day) => {
                      const appointmentsForDay = visibleAppointments.filter((appointment) => appointment.appointmentDate === day.value)

                      return (
                        <div
                          key={day.value}
                          className={[
                            'min-h-[138px] rounded-[22px] border p-3',
                            day.isCurrentMonth ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50/70',
                            day.value === selectedDate ? 'ring-2 ring-slate-950/10' : '',
                          ].join(' ')}
                        >
                          <div className="flex items-center justify-between">
                            <button
                              className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
                              onClick={() => setSelectedDate(day.value)}
                              type="button"
                            >
                              {day.dayOfMonth}
                            </button>
                            {appointmentsForDay.length > 0 ? (
                              <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white">
                                {appointmentsForDay.length}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-3 space-y-2">
                            {appointmentsForDay.slice(0, 3).map((appointment) => (
                              <button
                                key={appointment.id}
                                className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-slate-300 hover:bg-white"
                                onClick={() => openEditDrawer(appointment)}
                                type="button"
                              >
                                <p className="text-xs font-semibold text-slate-500">{formatTime(appointment.startTime)}</p>
                                <p className="mt-1 truncate text-sm font-semibold text-slate-900">{appointment.customerName}</p>
                              </button>
                            ))}
                            {appointmentsForDay.length > 3 ? (
                              <p className="px-1 text-xs font-medium text-slate-500">
                                +{appointmentsForDay.length - 3} more
                              </p>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            ) : null}
          </div>
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard title="Booking states">
            <div className="flex flex-wrap gap-2">
              {(['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const).map((status) => (
                <StatusBadge key={status} tone={appointmentTone(status)}>
                  {humanizeEnum(status)}
                </StatusBadge>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              <MiniInsight label="Bookings in view" value={String(visibleAppointments.length)} />
              <MiniInsight label="Staff visible" value={String(staffMembers.length)} />
              <MiniInsight label="Current view" value={`${view} board`} />
            </div>
          </SurfaceCard>
        </div>
      </section>

      <AppointmentDrawer
        appointment={editingAppointment}
        allowCreate={allowCreate}
        allowDelete={allowCreate}
        draft={draft}
        onClose={closeDrawer}
        onSaved={async (savedAppointment) => {
          if (!savedAppointment) {
            await reload()
            return
          }

          setSelectedDate(savedAppointment.appointmentDate)
          setView('Day')
          setSelectedStaff('ALL')
          setSelectedService('ALL')
          setSelectedStatus('ALL')
          const nextLocationId = savedAppointment.locationId ?? selectedLocationId ?? null

          if (nextLocationId) {
            setSelectedLocationId(nextLocationId)
          }

          setAppointments((current) => upsertAppointment(current, savedAppointment))

          try {
            const nextAppointments = await getAppointments(defaultStudioId, nextLocationId)
            setAppointments(upsertAppointment(nextAppointments, savedAppointment))
          } catch {
            setAppointments((current) => upsertAppointment(current, savedAppointment))
          }
        }}
        open={isDrawerOpen}
      />
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
  options: { label: string; value: string }[]
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
          <option key={option.value} value={option.value}>
            {option.label}
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

function formatHourLabel(hour: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalizedHour = hour > 12 ? hour - 12 : hour
  return `${normalizedHour}:00 ${suffix}`
}

function appointmentCardStyle(appointment: AppointmentRecord, timelineStartHour: number) {
  const startMinutes = timeToMinutes(appointment.startTime)
  const endMinutes = timeToMinutes(appointment.endTime)
  const topOffset = ((startMinutes - timelineStartHour * 60) / 60) * 108 + 12
  const height = Math.max(((endMinutes - startMinutes) / 60) * 108 - 16, 72)

  return {
    height: `${height}px`,
    top: `${topOffset}px`,
  }
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function getTodayDateValue() {
  return toDateValue(new Date())
}

function getTimelineHours(appointments: AppointmentRecord[]) {
  if (appointments.length === 0) {
    return Array.from({ length: 10 }, (_, index) => 9 + index)
  }

  const earliestMinutes = Math.min(...appointments.map((appointment) => timeToMinutes(appointment.startTime)))
  const latestMinutes = Math.max(...appointments.map((appointment) => timeToMinutes(appointment.endTime)))
  const startHour = Math.max(0, Math.min(9, Math.floor(earliestMinutes / 60)))
  const endHour = Math.min(24, Math.max(18, Math.ceil(latestMinutes / 60)))

  return Array.from({ length: Math.max(endHour - startHour, 1) }, (_, index) => startHour + index)
}

function upsertAppointment(current: AppointmentRecord[], nextAppointment: AppointmentRecord) {
  const existingIndex = current.findIndex((appointment) => appointment.id === nextAppointment.id)

  if (existingIndex === -1) {
    return [...current, nextAppointment]
  }

  return current.map((appointment) => (appointment.id === nextAppointment.id ? nextAppointment : appointment))
}

function matchesCalendarView(appointmentDate: string, selectedDate: string, view: 'Day' | 'Week' | 'Month') {
  if (view === 'Day') {
    return appointmentDate === selectedDate
  }

  if (view === 'Week') {
    const start = startOfWeek(selectedDate)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return isDateWithinRange(appointmentDate, start, end)
  }

  const selected = toLocalDate(selectedDate)
  const appointment = toLocalDate(appointmentDate)
  return (
    selected.getFullYear() === appointment.getFullYear() &&
    selected.getMonth() === appointment.getMonth()
  )
}

function getWeekDays(selectedDate: string) {
  const start = startOfWeek(selectedDate)

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)

    return {
      displayDate: day.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      label: day.toLocaleDateString(undefined, { weekday: 'short' }),
      value: toDateValue(day),
    }
  })
}

function getMonthGridDays(selectedDate: string) {
  const selected = toLocalDate(selectedDate)
  const firstDayOfMonth = new Date(selected.getFullYear(), selected.getMonth(), 1)
  const lastDayOfMonth = new Date(selected.getFullYear(), selected.getMonth() + 1, 0)
  const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7
  const gridStart = new Date(firstDayOfMonth)
  gridStart.setDate(firstDayOfMonth.getDate() - firstWeekday)
  const totalCells = Math.ceil((firstWeekday + lastDayOfMonth.getDate()) / 7) * 7

  return Array.from({ length: totalCells }, (_, index) => {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + index)

    return {
      dayOfMonth: day.getDate(),
      isCurrentMonth: day.getMonth() === selected.getMonth(),
      value: toDateValue(day),
    }
  })
}

function formatMonthTitle(selectedDate: string) {
  return toLocalDate(selectedDate).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

function formatActiveRangeLabel(selectedDate: string, view: 'Day' | 'Week' | 'Month') {
  if (view === 'Day') {
    return toLocalDate(selectedDate).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (view === 'Week') {
    const start = startOfWeek(selectedDate)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)

    return `${start.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
    })} - ${end.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`
  }

  return formatMonthTitle(selectedDate)
}

function startOfWeek(dateValue: string) {
  const date = toLocalDate(dateValue)
  const day = (date.getDay() + 6) % 7
  const start = new Date(date)
  start.setDate(date.getDate() - day)
  return start
}

function isDateWithinRange(dateValue: string, start: Date, end: Date) {
  const date = toLocalDate(dateValue)
  return date >= start && date <= end
}

function toLocalDate(dateValue: string) {
  const [year, month, day] = dateValue.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
