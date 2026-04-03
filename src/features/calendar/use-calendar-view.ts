import { useEffect, useMemo, useState } from 'react'
import {
  formatActiveRangeLabel,
  getMonthGridDays,
  getTodayDateValue,
  getWeekDays,
} from './calendar-utils'
import type { CalendarEvent, CalendarView } from './types'

export function useCalendarView(events: CalendarEvent[]) {
  const [selectedDate, setSelectedDate] = useState(getTodayDateValue())
  const [view, setView] = useState<CalendarView>('Day')
  const [autoFocusedEventSet, setAutoFocusedEventSet] = useState<string | null>(null)

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate])
  const monthDays = useMemo(() => getMonthGridDays(selectedDate), [selectedDate])
  const activeRangeLabel = useMemo(() => formatActiveRangeLabel(selectedDate, view), [selectedDate, view])
  const latestAppointmentDate = useMemo(() => {
    const latestAppointment = [...events].sort((left, right) =>
      right.start.localeCompare(left.start),
    )[0]

    return latestAppointment?.appointmentDate ?? null
  }, [events])
  const eventSetKey = useMemo(
    () => events.map((event) => `${event.id}:${event.appointmentDate}:${event.startTime}:${event.endTime}`).join('|'),
    [events],
  )

  useEffect(() => {
    if (events.length === 0) {
      setAutoFocusedEventSet(null)
      return
    }

    const hasAppointmentsOnSelectedDate = events.some((event) => event.appointmentDate === selectedDate)

    if (hasAppointmentsOnSelectedDate) {
      return
    }

    if (autoFocusedEventSet === eventSetKey) {
      return
    }

    if (latestAppointmentDate) {
      setSelectedDate(latestAppointmentDate)
      setAutoFocusedEventSet(eventSetKey)
    }
  }, [autoFocusedEventSet, eventSetKey, events, latestAppointmentDate, selectedDate])

  const focusAppointment = (appointmentDate: string) => {
    setSelectedDate(appointmentDate)
    setView('Day')
  }

  return {
    activeRangeLabel,
    focusAppointment,
    latestAppointmentDate,
    monthDays,
    selectedDate,
    setSelectedDate,
    setView,
    view,
    weekDays,
  }
}
