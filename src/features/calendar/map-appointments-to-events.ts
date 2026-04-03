import type { AppointmentRecord } from '../../lib/api/types'
import type { CalendarEvent } from './types'

export function mapAppointmentsToEvents(appointments: AppointmentRecord[]): CalendarEvent[] {
  return appointments.map((appointment) => ({
    appointmentDate: appointment.appointmentDate,
    customerName: appointment.customerName,
    end: buildDateTimeValue(appointment.appointmentDate, appointment.endTime),
    endMinutes: timeToMinutes(appointment.endTime),
    endTime: appointment.endTime,
    id: appointment.id,
    locationId: appointment.locationId,
    serviceId: appointment.serviceId,
    serviceName: appointment.serviceName,
    source: appointment,
    start: buildDateTimeValue(appointment.appointmentDate, appointment.startTime),
    staffName: appointment.staffName,
    staffProfileId: appointment.staffProfileId,
    startMinutes: timeToMinutes(appointment.startTime),
    startTime: appointment.startTime,
    status: appointment.status,
    studioId: appointment.studioId,
    title: buildTitle(appointment),
  }))
}

function timeToMinutes(value: string) {
  const [hours, minutes] = normalizeTimeValue(value).split(':').map(Number)
  return hours * 60 + minutes
}

function buildDateTimeValue(date: string, time: string) {
  return `${date}T${normalizeTimeValue(time)}`
}

function normalizeTimeValue(value: string) {
  const [hours = '00', minutes = '00', seconds = '00'] = value.split(':')
  return [hours.padStart(2, '0'), minutes.padStart(2, '0'), seconds.padStart(2, '0')].join(':')
}

function buildTitle(appointment: AppointmentRecord) {
  const nameParts = [appointment.customerName, appointment.serviceName].filter(Boolean)
  if (nameParts.length > 0) {
    return nameParts.join(' • ')
  }

  return appointment.locationName || 'Appointment'
}
