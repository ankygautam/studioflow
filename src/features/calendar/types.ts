import type { AppointmentRecord, AppointmentStatus } from '../../lib/api/types'

export type CalendarView = 'Day' | 'Month' | 'Week'

export type CalendarEvent = {
  appointmentDate: string
  customerName: string
  end: string
  endMinutes: number
  endTime: string
  id: string
  locationId: string
  serviceId: string
  serviceName: string
  source: AppointmentRecord
  start: string
  staffName: string
  staffProfileId: string
  startMinutes: number
  startTime: string
  status: AppointmentStatus
  studioId: string
  title: string
}
