import type {
  AppointmentRecord,
  AppointmentSource,
  AppointmentStatus,
  ClientRecord,
  ServiceRecord,
  StaffRecord,
} from './api/types'

export type AppointmentFormState = {
  appointmentDate: string
  customerProfileId: string
  endTime: string
  locationId: string
  notes: string
  serviceId: string
  source: AppointmentSource
  staffProfileId: string
  startTime: string
  status: AppointmentStatus
  studioId: string
}

export const appointmentStatuses: AppointmentStatus[] = ['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
export const appointmentSources: AppointmentSource[] = ['ADMIN_CREATED', 'STAFF_CREATED', 'ONLINE_BOOKING']

export function createAppointmentForm(studioId: string | null, appointment?: AppointmentRecord): AppointmentFormState {
  return {
    appointmentDate: appointment?.appointmentDate ?? '',
    customerProfileId: appointment?.customerProfileId ?? '',
    endTime: appointment?.endTime ?? '',
    locationId: appointment?.locationId ?? '',
    notes: appointment?.notes ?? '',
    serviceId: appointment?.serviceId ?? '',
    source: appointment?.source ?? 'ADMIN_CREATED',
    staffProfileId: appointment?.staffProfileId ?? '',
    startTime: appointment?.startTime ?? '',
    status: appointment?.status ?? 'BOOKED',
    studioId: studioId ?? '',
  }
}

export function validateAppointmentForm(formState: AppointmentFormState, studioId: string | null) {
  const errors: Partial<Record<keyof AppointmentFormState, string>> = {}

  if (!studioId && !formState.studioId.trim()) {
    errors.studioId = 'Studio ID is required to create an appointment.'
  }

  if (!formState.customerProfileId) {
    errors.customerProfileId = 'Choose a client.'
  }

  if (!formState.locationId) {
    errors.locationId = 'Choose a location.'
  }

  if (!formState.staffProfileId) {
    errors.staffProfileId = 'Choose a staff member.'
  }

  if (!formState.serviceId) {
    errors.serviceId = 'Choose a service.'
  }

  if (!formState.appointmentDate) {
    errors.appointmentDate = 'Appointment date is required.'
  }

  if (!formState.startTime) {
    errors.startTime = 'Start time is required.'
  }

  if (!formState.endTime) {
    errors.endTime = 'End time is required.'
  }

  if (formState.startTime && formState.endTime && formState.startTime >= formState.endTime) {
    errors.endTime = 'End time must be after start time.'
  }

  if (!formState.status) {
    errors.status = 'Status is required.'
  }

  if (!formState.source) {
    errors.source = 'Source is required.'
  }

  return errors
}

export function resolveAppointmentStudioId(
  formState: AppointmentFormState,
  clients: ClientRecord[],
  staffMembers: StaffRecord[],
  services: ServiceRecord[],
  fallbackStudioId: string | null,
) {
  const formStudioId = formState.studioId.trim()

  return (
    fallbackStudioId ??
    clients.find((client) => client.id === formState.customerProfileId)?.studioId ??
    staffMembers.find((staffMember) => staffMember.id === formState.staffProfileId)?.studioId ??
    services.find((service) => service.id === formState.serviceId)?.studioId ??
    (formStudioId.length > 0 ? formStudioId : null)
  )
}

export function appointmentTone(status: AppointmentStatus) {
  if (status === 'CONFIRMED') return 'calm' as const
  if (status === 'COMPLETED') return 'success' as const
  if (status === 'CANCELLED') return 'danger' as const
  if (status === 'NO_SHOW') return 'attention' as const
  return 'violet' as const
}
