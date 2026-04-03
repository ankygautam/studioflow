import { useMemo, useState } from 'react'
import type { AppointmentRecord } from '../../lib/api/types'
import { humanizeEnum } from '../../lib/formatters'

export type AppointmentFilterValue = 'ALL' | 'THIS_MONTH' | 'TODAY' | 'NEXT_7_DAYS'

export function useAppointmentsFilters(appointments: AppointmentRecord[]) {
  const [filterValue, setFilterValue] = useState<AppointmentFilterValue>('ALL')
  const [query, setQuery] = useState('')

  const visibleAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => matchesAppointmentWindow(appointment, filterValue))
        .filter((appointment) => {
          if (!query.trim()) {
            return true
          }

          const searchValue = query.trim().toLowerCase()
          return [
            appointment.customerName,
            appointment.serviceName,
            appointment.staffName,
            humanizeEnum(appointment.status),
          ].some((value) => value.toLowerCase().includes(searchValue))
        }),
    [appointments, filterValue, query],
  )

  return {
    filterValue,
    query,
    setFilterValue,
    setQuery,
    visibleAppointments,
  }
}

function matchesAppointmentWindow(
  appointment: AppointmentRecord,
  filterValue: AppointmentFilterValue,
) {
  if (filterValue === 'ALL') {
    return true
  }

  const appointmentDate = new Date(`${appointment.appointmentDate}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (filterValue === 'TODAY') {
    return appointmentDate.getTime() === today.getTime()
  }

  if (filterValue === 'THIS_MONTH') {
    return (
      appointmentDate.getFullYear() === today.getFullYear() &&
      appointmentDate.getMonth() === today.getMonth()
    )
  }

  const endDate = new Date(today)
  endDate.setDate(today.getDate() + 6)

  return appointmentDate >= today && appointmentDate <= endDate
}
