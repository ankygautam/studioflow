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

const hourSlots = Array.from({ length: 10 }, (_, index) => 9 + index)
const staffAccents = [
  'from-[#b7d9ff] to-[#d3d8ff]',
  'from-[#b5ead8] to-[#d2f0e7]',
  'from-[#f2d3b0] to-[#f4e3c8]',
  'from-[#d9d0ff] to-[#ebd9ff]',
]

export function CalendarPage() {
  const { user } = useAuth()
  const allowCreate = user ? canCreateBookings(user.role) : false
  const defaultStudioId = getDefaultStudioId()
  const loadAppointments = useCallback(() => getAppointments(defaultStudioId), [defaultStudioId])
  const loadStaff = useCallback(() => getStaff(defaultStudioId), [defaultStudioId])
  const loadServices = useCallback(() => getServices(defaultStudioId), [defaultStudioId])

  const { data: appointments, error: appointmentsError, isLoading: appointmentsLoading, reload } = useRemoteList(loadAppointments)
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

  const dependenciesLoading = appointmentsLoading || staffLoading || servicesLoading
  const dependenciesError = appointmentsError || staffError || servicesError

  const visibleAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        if (appointment.appointmentDate !== selectedDate) {
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
    [appointments, selectedDate, selectedService, selectedStaff, selectedStatus],
  )

  useEffect(() => {
    if (!allowCreate || searchParams.get('newBooking') !== '1' || isDrawerOpen) {
      return
    }

    setEditingAppointment(null)
    setDraft({
      appointmentDate: selectedDate,
      source: 'ADMIN_CREATED',
      status: 'BOOKED',
    })
    setIsDrawerOpen(true)
  }, [allowCreate, isDrawerOpen, searchParams, selectedDate])

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
                      {hourSlots.map((hour) => (
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
                        {hourSlots.map((hour) => (
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

                        {visibleAppointments
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
                              style={appointmentCardStyle(appointment)}
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
              <MiniInsight label="Bookings on day" value={String(visibleAppointments.length)} />
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
        onSaved={reload}
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

function appointmentCardStyle(appointment: AppointmentRecord) {
  const startMinutes = timeToMinutes(appointment.startTime)
  const endMinutes = timeToMinutes(appointment.endTime)
  const topOffset = ((startMinutes - 9 * 60) / 60) * 108 + 12
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
  return new Date().toISOString().slice(0, 10)
}
