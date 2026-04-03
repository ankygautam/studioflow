import { useMemo, useState } from 'react'
import type { AppointmentStatus } from '../../lib/api/types'
import { matchesCalendarView } from './calendar-utils'
import type { CalendarEvent, CalendarView } from './types'

export function useCalendarFilters({
  normalizedAppointments,
  selectedDate,
  view,
}: {
  normalizedAppointments: CalendarEvent[]
  selectedDate: string
  view: CalendarView
}) {
  const [selectedService, setSelectedService] = useState('ALL')
  const [selectedStaff, setSelectedStaff] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | AppointmentStatus>('ALL')

  const filteredAppointments = useMemo(
    () =>
      normalizedAppointments.filter((event) => {
        if (selectedStaff !== 'ALL' && event.staffProfileId !== selectedStaff) {
          return false
        }

        if (selectedService !== 'ALL' && event.serviceId !== selectedService) {
          return false
        }

        if (selectedStatus !== 'ALL' && event.status !== selectedStatus) {
          return false
        }

        return true
      }),
    [normalizedAppointments, selectedService, selectedStaff, selectedStatus],
  )

  const visibleAppointments = useMemo(
    () =>
      filteredAppointments.filter((event) => {
        if (!matchesCalendarView(event.appointmentDate, selectedDate, view)) {
          return false
        }

        return true
      }),
    [filteredAppointments, selectedDate, view],
  )

  const dayAppointments = useMemo(
    () => visibleAppointments.filter((event) => event.appointmentDate === selectedDate),
    [selectedDate, visibleAppointments],
  )

  return {
    dayAppointments,
    filteredAppointments,
    hasActiveFilters:
      selectedService !== 'ALL' || selectedStaff !== 'ALL' || selectedStatus !== 'ALL',
    resetFilters: () => {
      setSelectedService('ALL')
      setSelectedStaff('ALL')
      setSelectedStatus('ALL')
    },
    selectedService,
    selectedStaff,
    selectedStatus,
    setSelectedService,
    setSelectedStaff,
    setSelectedStatus,
    visibleAppointments,
  }
}
