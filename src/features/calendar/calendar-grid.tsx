import type { AppointmentSource, AppointmentStatus } from '../../lib/api/types'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/async-state'
import { StatusBadge } from '../../components/ui/status-badge'
import { appointmentTone } from '../../lib/appointments'
import { formatTime, humanizeEnum } from '../../lib/formatters'
import { appointmentCardStyle, formatHourLabel, formatMonthTitle } from './calendar-utils'
import type { CalendarEvent, CalendarView } from './types'

const staffAccents = [
  'from-[#b7d9ff] to-[#d3d8ff]',
  'from-[#b5ead8] to-[#d2f0e7]',
  'from-[#f2d3b0] to-[#f4e3c8]',
  'from-[#d9d0ff] to-[#ebd9ff]',
]

type DraftShape = {
  appointmentDate?: string
  endTime?: string
  locationId?: string
  source?: AppointmentSource
  staffProfileId?: string
  startTime?: string
  status?: AppointmentStatus
}

export function CalendarGrid({
  activeRangeLabel,
  allowCreate,
  calendarEvents,
  dayAppointments,
  dependenciesError,
  dependenciesLoading,
  filteredAppointmentsCount,
  hasActiveFilters,
  monthDays,
  onCreate,
  onEdit,
  onJumpToLatest,
  onResetFilters,
  rawAppointmentsCount,
  selectedDate,
  setSelectedDate,
  staffMembers,
  timelineHours,
  visibleAppointmentsCount,
  view,
  visibleAppointments,
  weekDays,
}: {
  activeRangeLabel: string
  allowCreate: boolean
  calendarEvents: CalendarEvent[]
  dayAppointments: CalendarEvent[]
  dependenciesError: string | null
  dependenciesLoading: boolean
  filteredAppointmentsCount: number
  hasActiveFilters: boolean
  monthDays: { dayOfMonth: number; isCurrentMonth: boolean; value: string }[]
  onCreate: (draft?: DraftShape) => void
  onEdit: (appointment: CalendarEvent) => void
  onJumpToLatest: () => void
  onResetFilters: () => void
  rawAppointmentsCount: number
  selectedDate: string
  setSelectedDate: (value: string) => void
  staffMembers: { displayName: string; id: string; jobTitle?: string | null }[]
  timelineHours: number[]
  visibleAppointmentsCount: number
  view: CalendarView
  visibleAppointments: CalendarEvent[]
  weekDays: { displayDate: string; label: string; value: string }[]
}) {
  if (dependenciesLoading) {
    return <LoadingState title="Loading calendar data..." />
  }

  if (dependenciesError) {
    return <ErrorState message={dependenciesError} />
  }

  if (staffMembers.length === 0) {
    return (
      <EmptyState
        action={
          allowCreate ? (
            <button
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              onClick={() => onCreate()}
              type="button"
            >
              New booking
            </button>
          ) : null
        }
        description="Add real staff profiles in the backend so the booking board can render team columns."
        title="No staff available for the calendar"
      />
    )
  }

  if (rawAppointmentsCount === 0) {
    return (
      <EmptyState
        action={
          allowCreate ? (
            <button
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              onClick={() => onCreate()}
              type="button"
            >
              New booking
            </button>
          ) : null
        }
        description="No backend appointments have been loaded for this location yet."
        title="No appointments loaded"
      />
    )
  }

  if (filteredAppointmentsCount === 0) {
    return (
      <EmptyState
        action={
          hasActiveFilters ? (
            <button
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              onClick={onResetFilters}
              type="button"
            >
              Reset filters
            </button>
          ) : null
        }
        description={`${rawAppointmentsCount} appointments are loaded, but the current staff, service, or status filters hide all of them.`}
        title="Filters are hiding all appointments"
      />
    )
  }

  const visibilityHint =
    visibleAppointmentsCount === 0 ? (
      <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">No appointments in this date range</p>
        <p className="mt-1">
          {filteredAppointmentsCount} appointments are loaded after filters, but 0 are visible for {activeRangeLabel}.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {hasActiveFilters ? (
            <button
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              onClick={onResetFilters}
              type="button"
            >
              Reset filters
            </button>
          ) : null}
          {calendarEvents.length > 0 ? (
            <button
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              onClick={onJumpToLatest}
              type="button"
            >
              Jump to latest appointment
            </button>
          ) : null}
        </div>
      </div>
    ) : null

  if (view === 'Day') {
    return (
      <div className="space-y-4">
        {visibilityHint}
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

                      onCreate({
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
                      onClick={() => onEdit(appointment)}
                      style={appointmentCardStyle(appointment, timelineHours[0] ?? 9)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{formatTime(appointment.startTime)}</p>
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
      </div>
    )
  }

  if (view === 'Week') {
    return (
      <div className="space-y-4">
        {visibilityHint}
        <div className="grid gap-4 lg:grid-cols-7">
          {weekDays.map((day) => {
          const appointmentsForDay = visibleAppointments.filter((appointment) => appointment.appointmentDate === day.value)

          return (
            <div key={day.value} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="border-b border-slate-200 pb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{day.label}</p>
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
                      onClick={() => onEdit(appointment)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{formatTime(appointment.startTime)}</p>
                          <p className="mt-2 font-semibold text-slate-950">{appointment.customerName}</p>
                          <p className="mt-1 text-sm text-slate-600">{appointment.serviceName}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{appointment.staffName}</p>
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
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {visibilityHint}
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
                    onClick={() => onEdit(appointment)}
                    type="button"
                  >
                    <p className="text-xs font-semibold text-slate-500">{formatTime(appointment.startTime)}</p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-900">{appointment.customerName}</p>
                  </button>
                ))}
                {appointmentsForDay.length > 3 ? (
                  <p className="px-1 text-xs font-medium text-slate-500">+{appointmentsForDay.length - 3} more</p>
                ) : null}
              </div>
            </div>
          )
          })}
        </div>
      </div>
    </div>
  )
}
