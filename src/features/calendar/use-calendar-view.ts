import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  formatActiveRangeLabel,
  getMonthGridDays,
  getTodayDateValue,
  getWeekDays,
} from './calendar-utils'
import type { CalendarEvent, CalendarView } from './types'

export function useCalendarView(events: CalendarEvent[]) {
  const [selectedDateState, setSelectedDateState] = useState(getTodayDateValue())
  const [view, setView] = useState<CalendarView>('Day')
  const [hasResolvedInitialFocus, setHasResolvedInitialFocus] = useState(false)

  const initialDate = useMemo(() => getTodayDateValue(), [])
  const selectedDate = selectedDateState
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate])
  const monthDays = useMemo(() => getMonthGridDays(selectedDate), [selectedDate])
  const activeRangeLabel = useMemo(() => formatActiveRangeLabel(selectedDate, view), [selectedDate, view])
  const latestAppointmentDate = useMemo(() => {
    const latestAppointment = [...events].sort((left, right) =>
      right.start.localeCompare(left.start),
    )[0]

    return latestAppointment?.appointmentDate ?? null
  }, [events])
  useEffect(() => {
    if (events.length === 0) {
      setHasResolvedInitialFocus(false)
      return
    }

    const hasAppointmentsOnSelectedDate = events.some((event) => event.appointmentDate === selectedDate)

    if (hasAppointmentsOnSelectedDate) {
      setHasResolvedInitialFocus(true)
      return
    }

    if (hasResolvedInitialFocus) {
      return
    }

    if (selectedDate !== initialDate) {
      setHasResolvedInitialFocus(true)
      return
    }

    if (latestAppointmentDate) {
      setSelectedDateState(latestAppointmentDate)
    }

    setHasResolvedInitialFocus(true)
  }, [events, hasResolvedInitialFocus, initialDate, latestAppointmentDate, selectedDate])

  const setSelectedDate = useCallback((nextDate: string) => {
    setSelectedDateState(nextDate)
    setHasResolvedInitialFocus(true)
  }, [])

  const focusAppointment = useCallback((appointmentDate: string) => {
    setSelectedDateState(appointmentDate)
    setView('Day')
    setHasResolvedInitialFocus(true)
  }, [])

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
