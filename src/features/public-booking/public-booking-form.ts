export type BookingStep = 'availability' | 'confirmation' | 'details' | 'service'

export type BookingFormState = {
  appointmentDate: string
  email: string
  fullName: string
  locationId: string
  notes: string
  phone: string
  serviceId: string
  slotEndTime: string
  slotLabel: string
  slotStartTime: string
  staffProfileId: string
  studioId: string
}

export type BookingFormErrors = Partial<
  Record<
    | 'appointmentDate'
    | 'email'
    | 'fullName'
    | 'locationId'
    | 'phone'
    | 'serviceId'
    | 'slotStartTime'
    | 'staffProfileId',
    string
  >
>

export function validatePublicBookingForm(formState: BookingFormState) {
  const errors: BookingFormErrors = {}

  if (!formState.locationId) {
    errors.locationId = 'Choose a location to continue.'
  }

  if (!formState.serviceId) {
    errors.serviceId = 'Choose a service to continue.'
  }

  if (!formState.staffProfileId) {
    errors.staffProfileId = 'Choose a staff member to continue.'
  }

  if (!formState.appointmentDate) {
    errors.appointmentDate = 'Choose a booking date.'
  }

  if (!formState.slotStartTime) {
    errors.slotStartTime = 'Choose an available time slot.'
  }

  if (!formState.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  }

  if (!formState.phone.trim()) {
    errors.phone = 'Phone is required.'
  }

  if (formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
    errors.email = 'Enter a valid email address.'
  }

  return errors
}
