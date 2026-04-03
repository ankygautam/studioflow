export type LookupErrors = Partial<Record<'bookingReference' | 'identifier', string>>

export function validatePublicBookingLookup(input: {
  bookingReference: string
  email: string
  phone: string
}) {
  const errors: LookupErrors = {}
  const bookingReference = input.bookingReference.trim()
  const email = input.email.trim()
  const phone = input.phone.trim()

  if (!bookingReference) {
    errors.bookingReference = 'Enter your booking reference.'
  }

  if (!email && !phone) {
    errors.identifier = 'Enter the same email or phone used when booking.'
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.identifier = 'Enter a valid email address or clear the field and use your phone number.'
  }

  return errors
}
