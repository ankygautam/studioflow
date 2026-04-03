import { useCallback, useMemo } from 'react'
import { useRemoteList } from '../../hooks/use-remote-list'
import { getAppointments } from '../../lib/api/appointments-api'
import { getServices } from '../../lib/api/services-api'
import { getStaff } from '../../lib/api/staff-api'
import { mapAppointmentsToEvents } from './map-appointments-to-events'

export function useCalendarData(studioId: string | null, locationId: string | null) {
  const loadAppointments = useCallback(() => getAppointments(studioId, locationId), [locationId, studioId])
  const loadStaff = useCallback(() => getStaff(studioId, locationId), [locationId, studioId])
  const loadServices = useCallback(() => getServices(studioId), [studioId])

  const appointmentsState = useRemoteList(loadAppointments)
  const staffState = useRemoteList(loadStaff)
  const servicesState = useRemoteList(loadServices)

  const normalizedAppointments = useMemo(
    () => mapAppointmentsToEvents(appointmentsState.data),
    [appointmentsState.data],
  )

  return {
    appointmentsError: appointmentsState.error,
    appointmentsLoading: appointmentsState.isLoading,
    calendarEvents: normalizedAppointments,
    normalizedAppointments,
    rawAppointments: appointmentsState.data,
    reloadAppointments: appointmentsState.reload,
    services: servicesState.data,
    servicesError: servicesState.error,
    servicesLoading: servicesState.isLoading,
    setAppointments: appointmentsState.setData,
    staffError: staffState.error,
    staffLoading: staffState.isLoading,
    staffMembers: staffState.data,
  }
}
