import type { AppointmentRecord, AppointmentStatus } from '../../lib/api/types'
import type { CalendarEvent, CalendarView } from './types'

export type MobileQuickStatusAction = {
  label: string
  nextStatus: AppointmentStatus
  tone: 'attention' | 'calm' | 'danger' | 'success'
}

export function getTodayDateValue() {
  return toDateValue(new Date())
}

export function shiftDateValue(dateValue: string, amount: number) {
  const date = toLocalDate(dateValue)
  date.setDate(date.getDate() + amount)
  return toDateValue(date)
}

export function formatHourLabel(hour: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalizedHour = hour > 12 ? hour - 12 : hour
  return `${normalizedHour}:00 ${suffix}`
}

export function appointmentCardStyle(appointment: CalendarEvent, timelineStartHour: number) {
  const topOffset = ((appointment.startMinutes - timelineStartHour * 60) / 60) * 108 + 12
  const height = Math.max(((appointment.endMinutes - appointment.startMinutes) / 60) * 108 - 16, 72)

  return {
    height: `${height}px`,
    top: `${topOffset}px`,
  }
}

const appointmentCardAccentMap: Record<AppointmentStatus, string> = {
  BOOKED: 'border-violet-500/45',
  CANCELLED: 'border-rose-500/45',
  COMPLETED: 'border-emerald-500/45',
  CONFIRMED: 'border-sky-500/45',
  NO_SHOW: 'border-amber-500/45',
}

export function getAppointmentCardClassName(
  status: AppointmentStatus,
  variant: 'full' | 'compact' = 'full',
) {
  const base =
    variant === 'compact'
      ? 'w-full rounded-[16px] border bg-slate-900 px-3 py-2 text-left shadow-[0_12px_28px_rgba(15,23,42,0.18)] transition hover:border-slate-700 hover:bg-slate-950'
      : 'w-full rounded-[20px] border bg-slate-950 p-4 text-left shadow-[0_16px_36px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:border-slate-700'

  return `${base} ${appointmentCardAccentMap[status]}`
}

export function getTimelineHours(events: CalendarEvent[]) {
  if (events.length === 0) {
    return Array.from({ length: 10 }, (_, index) => 9 + index)
  }

  const earliestMinutes = Math.min(...events.map((event) => event.startMinutes))
  const latestMinutes = Math.max(...events.map((event) => event.endMinutes))
  const startHour = Math.max(0, Math.min(9, Math.floor(earliestMinutes / 60)))
  const endHour = Math.min(24, Math.max(18, Math.ceil(latestMinutes / 60)))

  return Array.from({ length: Math.max(endHour - startHour, 1) }, (_, index) => startHour + index)
}

export function upsertAppointment(current: AppointmentRecord[], nextAppointment: AppointmentRecord) {
  const existingIndex = current.findIndex((appointment) => appointment.id === nextAppointment.id)

  if (existingIndex === -1) {
    return [...current, nextAppointment]
  }

  return current.map((appointment) => (appointment.id === nextAppointment.id ? nextAppointment : appointment))
}

export function getMobileQuickStatusActions(status: AppointmentStatus): MobileQuickStatusAction[] {
  if (status === 'BOOKED') {
    return [
      { label: 'Arrived', nextStatus: 'CONFIRMED', tone: 'calm' },
      { label: 'Completed', nextStatus: 'COMPLETED', tone: 'success' },
      { label: 'Cancel', nextStatus: 'CANCELLED', tone: 'danger' },
      { label: 'No-show', nextStatus: 'NO_SHOW', tone: 'attention' },
    ]
  }

  if (status === 'CONFIRMED') {
    return [
      { label: 'Completed', nextStatus: 'COMPLETED', tone: 'success' },
      { label: 'Cancel', nextStatus: 'CANCELLED', tone: 'danger' },
      { label: 'No-show', nextStatus: 'NO_SHOW', tone: 'attention' },
    ]
  }

  return []
}

export function matchesCalendarView(appointmentDate: string, selectedDate: string, view: CalendarView) {
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
  return selected.getFullYear() === appointment.getFullYear() && selected.getMonth() === appointment.getMonth()
}

export function getWeekDays(selectedDate: string) {
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

export function getMonthGridDays(selectedDate: string) {
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

export function formatMonthTitle(selectedDate: string) {
  return toLocalDate(selectedDate).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

export function formatActiveRangeLabel(selectedDate: string, view: CalendarView) {
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

export function toLocalDate(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`)
}

export function toDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
