import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState } from '../components/ui/async-state'
import { InputField } from '../components/ui/form-controls'
import type { LookupErrors } from '../features/booking/public-booking-manage-form'
import { validatePublicBookingLookup } from '../features/booking/public-booking-manage-form'
import { ApiError } from '../lib/api/http'
import { lookupPublicBooking } from '../lib/api/public-booking-api'
import type { PublicBookingLookupRecord } from '../lib/api/types'
import { formatDate, formatTime, humanizeEnum } from '../lib/formatters'

export function PublicBookingPortalPage() {
  const { studioSlug = 'studioflow-hq', locationSlug } = useParams()
  const [searchParams] = useSearchParams()
  const [bookingReference, setBookingReference] = useState(searchParams.get('reference') ?? '')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [lookupErrors, setLookupErrors] = useState<LookupErrors>({})
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookupNotFound, setLookupNotFound] = useState(false)
  const [booking, setBooking] = useState<PublicBookingLookupRecord | null>(null)

  const managePath = locationSlug ? `/book/${studioSlug}/${locationSlug}/manage` : `/book/${studioSlug}/manage`
  const bookingPath = locationSlug ? `/book/${studioSlug}/${locationSlug}` : `/book/${studioSlug}`

  const handleLookup = async () => {
    const errors = validatePublicBookingLookup({
      bookingReference,
      email,
      phone,
    })
    setLookupErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    setLookupLoading(true)
    setLookupError(null)
    setLookupNotFound(false)

    try {
      const response = await lookupPublicBooking(studioSlug, {
        bookingReference: bookingReference.trim().toUpperCase(),
        email: email.trim(),
        phone: phone.trim(),
      })

      setBooking(response)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setLookupNotFound(true)
      } else {
        setLookupError(error instanceof Error ? error.message : 'Unable to look up this booking right now.')
      }
      setBooking(null)
    } finally {
      setLookupLoading(false)
    }
  }

  const resetLookup = () => {
    setBooking(null)
    setLookupNotFound(false)
    setLookupError(null)
  }

  return (
    <div className="theme-page-shell min-h-screen bg-[linear-gradient(180deg,#f7f8fc_0%,#eef2f7_100%)] px-4 py-6 text-slate-900 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-[32px] border border-white/70 bg-white/80 px-6 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-400">Customer portal</p>
              <h1 className="mt-3 font-display text-4xl text-slate-950">View your booking</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Look up your appointment using the booking reference and the same contact details used when you booked. This portal shows the current booking details without requiring staff access.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                to={bookingPath}
              >
                Book an appointment
              </Link>
              <Link
                className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600"
                to={managePath}
              >
                Manage a booking
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-8"
            initial={{ opacity: 0, y: 12 }}
          >
            {!booking ? (
              <section className="space-y-6">
                <SectionIntro
                  description="Enter the booking reference from your confirmation and the same email or phone used at checkout."
                  title="Find your booking"
                />
                {lookupError ? <ErrorState message={lookupError} /> : null}
                {lookupNotFound ? (
                  <EmptyState
                    description="We couldn’t match that booking. Double-check the reference and contact details, or contact the studio for help."
                    title="Booking not found"
                  />
                ) : null}
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    error={lookupErrors.bookingReference}
                    label="Booking reference"
                    onChange={(event) => setBookingReference(event.target.value.toUpperCase())}
                    placeholder="SF-ABC123"
                    value={bookingReference}
                  />
                  <InputField
                    error={lookupErrors.identifier}
                    label="Email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="maya@example.com"
                    type="email"
                    value={email}
                  />
                  <InputField
                    label="Phone"
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="(555) 123-4567"
                    value={phone}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={lookupLoading}
                    onClick={() => void handleLookup()}
                    type="button"
                  >
                    {lookupLoading ? 'Looking up booking...' : 'View booking'}
                  </button>
                </div>
              </section>
            ) : (
              <section className="space-y-6">
                <SectionIntro
                  description="Review the latest details for your appointment. If you need to make a change, use the booking management flow."
                  title="Booking details"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <SummaryRow label="Reference" value={booking.bookingReference} />
                  <SummaryRow label="Guest" value={booking.customerName} />
                  <SummaryRow label="Location" value={booking.locationName} />
                  <SummaryRow label="Service" value={booking.serviceName} />
                  <SummaryRow label="Specialist" value={booking.staffName} />
                  <SummaryRow label="Date" value={formatDate(booking.appointmentDate)} />
                  <SummaryRow label="Time" value={`${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`} />
                  <SummaryRow label="Status" value={humanizeEnum(booking.status)} />
                  <SummaryRow label="Email" value={booking.customerEmail || 'Saved on file'} />
                  <SummaryRow label="Phone" value={booking.customerPhone || 'Saved on file'} />
                  <SummaryRow label="Studio" value={booking.studioName} />
                  <SummaryRow label="Portal access" value="Verified with booking reference and contact details" />
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Need to make a change?</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">Open booking management</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Use the same verified lookup flow to reschedule or cancel when the booking status still allows public changes.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                      to={`${managePath}?reference=${encodeURIComponent(booking.bookingReference)}`}
                    >
                      Manage this booking
                    </Link>
                    <button
                      className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                      onClick={resetLookup}
                      type="button"
                    >
                      Look up another booking
                    </button>
                  </div>
                </div>
              </section>
            )}
          </motion.section>

          <aside className="space-y-4">
            <div className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Secure lookup</p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
                <p>Your booking reference from the confirmation screen.</p>
                <p>The same email or phone number used when the appointment was booked.</p>
                <p>The portal only reveals booking details after both details line up.</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">What’s included</p>
              <h3 className="mt-4 text-2xl font-semibold text-slate-950">Appointment snapshot</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Status, date, time, service, specialist, location, and the booking reference are all visible here so clients can confirm the latest details quickly.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function SectionIntro({ description, title }: { description: string; title: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}
