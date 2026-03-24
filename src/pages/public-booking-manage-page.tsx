import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { InputField } from '../components/ui/form-controls'
import { ApiError } from '../lib/api/http'
import {
  cancelPublicBooking,
  getPublicBookingAvailability,
  lookupPublicBooking,
  reschedulePublicBooking,
} from '../lib/api/public-booking-api'
import type { PublicBookingLookupRecord, PublicBookingSlotRecord } from '../lib/api/types'
import { formatDate, formatTime, humanizeEnum } from '../lib/formatters'

type LookupErrors = Partial<Record<'bookingReference' | 'identifier', string>>

export function PublicBookingManagePage() {
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
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [slots, setSlots] = useState<PublicBookingSlotRecord[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [selectedStartTime, setSelectedStartTime] = useState('')
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  const canManageBooking = useMemo(() => {
    if (!booking) return false
    return booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && booking.status !== 'NO_SHOW'
  }, [booking])

  useEffect(() => {
    if (!booking || !rescheduleDate) {
      setSlots([])
      return
    }

    let active = true
    setSlotsLoading(true)
    setSlotsError(null)

    void getPublicBookingAvailability({
      date: rescheduleDate,
      locationId: booking.locationId,
      serviceId: booking.serviceId,
      staffProfileId: booking.staffProfileId,
      studioSlug,
    })
      .then((response) => {
        if (!active) return
        setSlots(response.slots)
      })
      .catch((error) => {
        if (!active) return
        setSlotsError(error instanceof Error ? error.message : 'Unable to load times right now.')
      })
      .finally(() => {
        if (active) {
          setSlotsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [booking, rescheduleDate, studioSlug])

  const handleLookup = async () => {
    const errors: LookupErrors = {}

    if (!bookingReference.trim()) {
      errors.bookingReference = 'Enter your booking reference.'
    }

    if (!email.trim() && !phone.trim()) {
      errors.identifier = 'Enter the same email or phone used when booking.'
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.identifier = 'Enter a valid email address or clear the field and use your phone number.'
    }

    setLookupErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    setLookupLoading(true)
    setLookupError(null)
    setLookupNotFound(false)
    setActionMessage(null)
    setRescheduleError(null)

    try {
      const response = await lookupPublicBooking(studioSlug, {
        bookingReference: bookingReference.trim().toUpperCase(),
        email: email.trim(),
        phone: phone.trim(),
      })

      setBooking(response)
      setRescheduleDate(response.appointmentDate)
      setSelectedStartTime('')
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

  const handleCancel = async () => {
    if (!booking) return

    setCancelLoading(true)
    setLookupError(null)

    try {
      const response = await cancelPublicBooking(studioSlug, { manageToken: booking.manageToken })
      setBooking((current) =>
        current
          ? {
              ...current,
              appointmentDate: response.appointmentDate,
              bookingReference: response.bookingReference,
              endTime: response.endTime,
              startTime: response.startTime,
              status: response.status,
            }
          : current,
      )
      setActionMessage(response.message)
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Unable to cancel this booking right now.')
    } finally {
      setCancelLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!booking) return

    if (!rescheduleDate) {
      setRescheduleError('Choose a new date.')
      return
    }

    if (!selectedStartTime) {
      setRescheduleError('Choose an available time slot.')
      return
    }

    setRescheduleLoading(true)
    setRescheduleError(null)

    try {
      const response = await reschedulePublicBooking(studioSlug, {
        appointmentDate: rescheduleDate,
        manageToken: booking.manageToken,
        startTime: selectedStartTime,
      })

      setBooking((current) =>
        current
          ? {
              ...current,
              appointmentDate: response.appointmentDate,
              bookingReference: response.bookingReference,
              endTime: response.endTime,
              startTime: response.startTime,
              status: response.status,
            }
          : current,
      )
      setActionMessage(response.message)
      setSelectedStartTime('')
    } catch (error) {
      setRescheduleError(error instanceof Error ? error.message : 'Unable to reschedule this booking right now.')
    } finally {
      setRescheduleLoading(false)
    }
  }

  const resetLookup = () => {
    setBooking(null)
    setLookupNotFound(false)
    setLookupError(null)
    setActionMessage(null)
    setSlots([])
    setSelectedStartTime('')
    setRescheduleError(null)
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f8fc_0%,#eef2f7_100%)] px-4 py-6 text-slate-900 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-[32px] border border-white/70 bg-white/80 px-6 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-400">Booking management</p>
              <h1 className="mt-3 font-display text-4xl text-slate-950">Manage your booking</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Look up your booking with the reference and the same contact details you used when booking. From there, you can reschedule or cancel without entering the internal dashboard.
              </p>
            </div>
            <Link
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              to={locationSlug ? `/book/${studioSlug}/${locationSlug}` : `/book/${studioSlug}`}
            >
              Book a new appointment
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 12 }}
            className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-8"
          >
            {!booking ? (
              <section className="space-y-6">
                <SectionIntro
                  title="Find your booking"
                  description="Enter the booking reference from your confirmation and the same email or phone used during checkout."
                />
                {lookupError ? <ErrorState message={lookupError} /> : null}
                {lookupNotFound ? (
                  <EmptyState
                    title="Booking not found"
                    description="We couldn’t match that booking. Double-check the reference and contact details, or contact the studio for help."
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
                    {lookupLoading ? 'Looking up booking...' : 'Find booking'}
                  </button>
                </div>
              </section>
            ) : (
              <section className="space-y-6">
                <SectionIntro
                  title="Booking details"
                  description="Review the current booking, then reschedule or cancel if you still need to make a change."
                />
                {actionMessage ? (
                  <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/80 px-5 py-4 text-sm font-medium text-emerald-700">
                    {actionMessage}
                  </div>
                ) : null}
                {lookupError ? <ErrorState message={lookupError} /> : null}
                <div className="grid gap-3 md:grid-cols-2">
                  <SummaryRow label="Reference" value={booking.bookingReference} />
                  <SummaryRow label="Guest" value={booking.customerName} />
                  <SummaryRow label="Location" value={booking.locationName} />
                  <SummaryRow label="Service" value={booking.serviceName} />
                  <SummaryRow label="Specialist" value={booking.staffName} />
                  <SummaryRow label="Date" value={formatDate(booking.appointmentDate)} />
                  <SummaryRow label="Time" value={`${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`} />
                  <SummaryRow label="Status" value={humanizeEnum(booking.status)} />
                  <SummaryRow label="Contact" value={booking.customerEmail || booking.customerPhone || 'Saved on file'} />
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Reschedule</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">Choose a new time</h3>
                    </div>
                    {!canManageBooking ? (
                      <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Locked
                      </span>
                    ) : null}
                  </div>

                  {canManageBooking ? (
                    <div className="mt-5 space-y-4">
                      <InputField
                        label="New date"
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(event) => {
                          setRescheduleDate(event.target.value)
                          setSelectedStartTime('')
                          setActionMessage(null)
                        }}
                        type="date"
                        value={rescheduleDate}
                      />
                      {slotsLoading ? <LoadingState title="Checking available times..." /> : null}
                      {!slotsLoading && slotsError ? <ErrorState message={slotsError} /> : null}
                      {!slotsLoading && !slotsError && rescheduleDate && slots.length === 0 ? (
                        <EmptyState
                          title="No times available"
                          description="Try another date and we’ll show the next available options for this specialist."
                        />
                      ) : null}
                      {!slotsLoading && !slotsError && slots.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {slots.map((slot) => {
                            const isSelected = slot.startTime === selectedStartTime
                            return (
                              <button
                                key={`${slot.startTime}-${slot.endTime}`}
                                className={[
                                  'rounded-[22px] border px-4 py-4 text-left text-sm font-semibold transition',
                                  isSelected
                                    ? 'border-slate-900 bg-slate-950 text-white'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                                ].join(' ')}
                                onClick={() => setSelectedStartTime(slot.startTime)}
                                type="button"
                              >
                                {slot.label}
                              </button>
                            )
                          })}
                        </div>
                      ) : null}
                      {rescheduleError ? <p className="text-sm font-medium text-rose-500">{rescheduleError}</p> : null}
                      <div className="flex flex-wrap gap-3">
                        <button
                          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                          disabled={rescheduleLoading}
                          onClick={() => void handleReschedule()}
                          type="button"
                        >
                          {rescheduleLoading ? 'Saving new time...' : 'Save new time'}
                        </button>
                        <button
                          className="rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={cancelLoading}
                          onClick={() => void handleCancel()}
                          type="button"
                        >
                          {cancelLoading ? 'Cancelling...' : 'Cancel booking'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-slate-500">
                      This booking is already {humanizeEnum(booking.status).toLowerCase()}, so no further public changes are available.
                    </p>
                  )}
                </div>

                <div className="flex justify-between gap-3">
                  <button
                    className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600"
                    onClick={resetLookup}
                    type="button"
                  >
                    Look up another booking
                  </button>
                </div>
              </section>
            )}
          </motion.section>

          <aside className="space-y-4">
            <div className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">What you need</p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
                <p>Your booking reference from the confirmation screen.</p>
                <p>The same email or phone number used when you originally booked.</p>
                <p>Once the booking is verified, you can reschedule or cancel it safely.</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Need help?</p>
              <h3 className="mt-4 text-2xl font-semibold text-slate-950">Contact the studio</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                If your booking details have changed significantly or the reference is not available, the studio team can help directly.
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
