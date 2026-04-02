import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { InputField, SelectField, TextAreaField } from '../components/ui/form-controls'
import { useAuth } from '../features/auth/use-auth'
import {
  createPublicBooking,
  getPublicBookingAvailability,
  getPublicBookingServices,
  getPublicBookingStaff,
} from '../lib/api/public-booking-api'
import type {
  PublicBookableServiceRecord,
  PublicBookableStaffRecord,
  PublicBookingConfirmationRecord,
  PublicBookingLocationRecord,
  PublicBookingSlotRecord,
} from '../lib/api/types'
import { formatCurrency, formatDate, formatTime, humanizeEnum } from '../lib/formatters'

type BookingStep = 'availability' | 'confirmation' | 'details' | 'service'

type BookingFormState = {
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

type BookingFormErrors = Partial<Record<'appointmentDate' | 'email' | 'fullName' | 'locationId' | 'phone' | 'serviceId' | 'slotStartTime' | 'staffProfileId', string>>

export function PublicBookingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { studioSlug = 'studioflow-hq', locationSlug } = useParams()
  const [step, setStep] = useState<BookingStep>('service')
  const [locations, setLocations] = useState<PublicBookingLocationRecord[]>([])
  const [services, setServices] = useState<PublicBookableServiceRecord[]>([])
  const [staff, setStaff] = useState<PublicBookableStaffRecord[]>([])
  const [slots, setSlots] = useState<PublicBookingSlotRecord[]>([])
  const [studioName, setStudioName] = useState('StudioFlow')
  const [studioTimezone, setStudioTimezone] = useState('')
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [servicesError, setServicesError] = useState<string | null>(null)
  const [staffError, setStaffError] = useState<string | null>(null)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<PublicBookingConfirmationRecord | null>(null)
  const [formErrors, setFormErrors] = useState<BookingFormErrors>({})
  const [formState, setFormState] = useState<BookingFormState>({
    appointmentDate: '',
    email: user?.email ?? '',
    fullName: user?.fullName ?? '',
    locationId: '',
    notes: '',
    phone: '',
    serviceId: '',
    slotEndTime: '',
    slotLabel: '',
    slotStartTime: '',
    staffProfileId: '',
    studioId: '',
  })

  const selectedService = useMemo(
    () => services.find((item) => item.id === formState.serviceId) ?? null,
    [formState.serviceId, services],
  )
  const selectedLocation = useMemo(
    () => locations.find((item) => item.id === formState.locationId) ?? null,
    [formState.locationId, locations],
  )
  const selectedStaff = useMemo(
    () => staff.find((item) => item.id === formState.staffProfileId) ?? null,
    [formState.staffProfileId, staff],
  )

  useEffect(() => {
    if (!locationSlug || !locations.length) {
      return
    }

    const matchedLocation = locations.find((location) => location.slug === locationSlug)
    if (matchedLocation && matchedLocation.id !== formState.locationId) {
      setFormState((current) => ({
        ...current,
        appointmentDate: '',
        locationId: matchedLocation.id,
        slotEndTime: '',
        slotLabel: '',
        slotStartTime: '',
        staffProfileId: '',
      }))
    }
  }, [formState.locationId, locationSlug, locations])

  useEffect(() => {
    let active = true

    setLoadingServices(true)
    setServicesError(null)

    void getPublicBookingServices(studioSlug)
      .then((response) => {
        if (!active) return
        setLocations(response.locations)
        setServices(response.services)
        setStudioName(response.studioName)
        setStudioTimezone(response.timezone)
        setFormState((current) => ({
          ...current,
          locationId:
            current.locationId ||
            (response.locations.length === 1 ? response.locations[0]?.id ?? '' : ''),
          studioId: response.studioId,
        }))
      })
      .catch((error) => {
        if (!active) return
        setServicesError(error instanceof Error ? error.message : 'Unable to load services right now.')
      })
      .finally(() => {
        if (active) {
          setLoadingServices(false)
        }
      })

    return () => {
      active = false
    }
  }, [studioSlug])

  useEffect(() => {
    if (!formState.locationId || !formState.serviceId || !formState.studioId) {
      setStaff([])
      return
    }

    let active = true
    setLoadingStaff(true)
    setStaffError(null)

    void getPublicBookingStaff(studioSlug, formState.serviceId, formState.locationId)
      .then((response) => {
        if (!active) return
        setStaff(response.staff)
      })
      .catch((error) => {
        if (!active) return
        setStaffError(error instanceof Error ? error.message : 'Unable to load staff right now.')
      })
      .finally(() => {
        if (active) {
          setLoadingStaff(false)
        }
      })

    return () => {
      active = false
    }
  }, [formState.locationId, formState.serviceId, formState.studioId, studioSlug])

  useEffect(() => {
    if (!formState.appointmentDate || !formState.locationId || !formState.serviceId || !formState.staffProfileId || !formState.studioId) {
      setSlots([])
      return
    }

    let active = true
    setLoadingSlots(true)
    setSlotsError(null)

    void getPublicBookingAvailability({
      date: formState.appointmentDate,
      locationId: formState.locationId,
      serviceId: formState.serviceId,
      staffProfileId: formState.staffProfileId,
      studioSlug,
    })
      .then((response) => {
        if (!active) return
        setSlots(response.slots)
      })
      .catch((error) => {
        if (!active) return
        setSlotsError(error instanceof Error ? error.message : 'Unable to load availability right now.')
      })
      .finally(() => {
        if (active) {
          setLoadingSlots(false)
        }
      })

    return () => {
      active = false
    }
  }, [formState.appointmentDate, formState.locationId, formState.serviceId, formState.staffProfileId, formState.studioId, studioSlug])

  const handleServiceSelect = (service: PublicBookableServiceRecord) => {
    setFormState((current) => ({
      ...current,
      serviceId: service.id,
      staffProfileId: '',
      slotEndTime: '',
      slotLabel: '',
      slotStartTime: '',
    }))
    setFormErrors((current) => ({ ...current, serviceId: undefined }))
    setStep('availability')
  }

  const handleSlotSelect = (slot: PublicBookingSlotRecord) => {
    setFormState((current) => ({
      ...current,
      slotEndTime: slot.endTime,
      slotLabel: slot.label,
      slotStartTime: slot.startTime,
    }))
    setFormErrors((current) => ({ ...current, slotStartTime: undefined }))
    setStep('details')
  }

  const handleSubmit = async () => {
    const errors = validatePublicBookingForm(formState)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setSubmitLoading(true)
    setSubmitError(null)

    try {
      const response = await createPublicBooking(studioSlug, {
        appointmentDate: formState.appointmentDate,
        email: formState.email.trim(),
        fullName: formState.fullName.trim(),
        locationId: formState.locationId,
        notes: formState.notes.trim(),
        phone: formState.phone.trim(),
        serviceId: formState.serviceId,
        staffProfileId: formState.staffProfileId,
        startTime: formState.slotStartTime,
        studioId: formState.studioId,
      })

      setConfirmation(response)
      setStep('confirmation')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit your booking right now.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const resetBooking = () => {
    setConfirmation(null)
    setSubmitError(null)
    setFormErrors({})
    setFormState({
      appointmentDate: '',
      email: user?.email ?? '',
      fullName: user?.fullName ?? '',
      locationId: formState.locationId,
      notes: '',
      phone: '',
      serviceId: '',
      slotEndTime: '',
      slotLabel: '',
      slotStartTime: '',
      staffProfileId: '',
      studioId: formState.studioId,
    })
    setSlots([])
    setStaff([])
    setStep('service')
  }

  return (
    <div className="theme-page-shell min-h-screen bg-[linear-gradient(180deg,#f7f8fc_0%,#eef2f7_100%)] px-4 py-6 text-slate-900 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-[32px] border border-white/70 bg-white/80 px-6 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-400">Public booking</p>
              <h1 className="mt-3 font-display text-4xl text-slate-950">{studioName}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Choose a service, pick a specialist, and confirm your appointment in a calm self-service flow designed for modern studios.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Booking portal</p>
              <p className="mt-1">{studioTimezone || 'Studio time'}</p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <motion.section
            key={step}
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 12 }}
            className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-8"
          >
            <StepRail currentStep={step} />

            {step === 'service' ? (
              <section className="mt-8 space-y-5">
                <SectionIntro
                  title="Choose a service"
                  description="Start with the location if this studio books across more than one space, then choose the service you want booked."
                />
                {!loadingServices && !servicesError && locations.length > 1 ? (
                  <SelectField
                    error={formErrors.locationId}
                    label="Location"
                    onChange={(event) =>
                      {
                        const nextLocationId = event.target.value
                        const nextLocation = locations.find((location) => location.id === nextLocationId)
                        setFormState((current) => ({
                          ...current,
                          appointmentDate: '',
                          locationId: nextLocationId,
                          slotEndTime: '',
                          slotLabel: '',
                          slotStartTime: '',
                          staffProfileId: '',
                        }))
                        if (nextLocation) {
                          navigate(`/book/${studioSlug}/${nextLocation.slug}`, { replace: true })
                        }
                      }
                    }
                    value={formState.locationId}
                  >
                    <option value="">Choose a location</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </SelectField>
                ) : null}
                {!loadingServices && !servicesError && locations.length === 1 && selectedLocation ? (
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Location</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{selectedLocation.name}</p>
                  </div>
                ) : null}
                {loadingServices ? <LoadingState title="Loading services..." /> : null}
                {!loadingServices && servicesError ? (
                  <ErrorState
                    message={servicesError}
                    action={
                      <button
                        className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                        onClick={() => window.location.reload()}
                        type="button"
                      >
                        Retry
                      </button>
                    }
                  />
                ) : null}
                {!loadingServices && !servicesError && services.length === 0 ? (
                  <EmptyState
                    title="No services available yet"
                    description="This studio has not published any bookable services for the public portal yet."
                  />
                ) : null}
                {!loadingServices && !servicesError && services.length > 0 && (locations.length <= 1 || Boolean(formState.locationId)) ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {services.map((service) => {
                      const isSelected = service.id === formState.serviceId
                      return (
                        <button
                          key={service.id}
                          className={[
                            'rounded-[26px] border p-5 text-left transition',
                            isSelected
                              ? 'border-slate-900 bg-slate-950 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]'
                              : 'border-slate-200 bg-slate-50 hover:bg-white',
                          ].join(' ')}
                          onClick={() => handleServiceSelect(service)}
                          type="button"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={isSelected ? 'text-slate-300' : 'text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'}>
                                {humanizeEnum(service.category)}
                              </p>
                              <h2 className="mt-3 text-xl font-semibold">{service.name}</h2>
                            </div>
                            <div className={isSelected ? 'text-right text-slate-200' : 'text-right text-slate-600'}>
                              <p className="text-lg font-semibold">{formatCurrency(service.price)}</p>
                              <p className="mt-1 text-sm">{service.durationMinutes} min</p>
                            </div>
                          </div>
                          <p className={['mt-4 text-sm leading-7', isSelected ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
                            {service.description || 'A premium service designed to keep booking simple and clear.'}
                          </p>
                          {service.depositRequired ? (
                            <div className={['mt-4 inline-flex rounded-full px-3 py-2 text-xs font-semibold', isSelected ? 'bg-white/10 text-white' : 'bg-amber-50 text-amber-700'].join(' ')}>
                              Deposit required: {formatCurrency(service.depositAmount)}
                            </div>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </section>
            ) : null}

            {step === 'availability' ? (
              <section className="mt-8 space-y-6">
                <SectionIntro
                  title="Choose your specialist and time"
                  description="Pick who you’d like to book with, then choose a date and one available time slot."
                />

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                  <SelectField
                    error={formErrors.staffProfileId}
                    label="Staff member"
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        slotEndTime: '',
                        slotLabel: '',
                        slotStartTime: '',
                        staffProfileId: event.target.value,
                      }))
                    }
                    value={formState.staffProfileId}
                  >
                    <option value="">Choose a specialist</option>
                    {staff.map((staffMember) => (
                      <option key={staffMember.id} value={staffMember.id}>
                        {staffMember.displayName} {staffMember.jobTitle ? `• ${staffMember.jobTitle}` : ''}
                      </option>
                    ))}
                  </SelectField>
                  <InputField
                    error={formErrors.appointmentDate}
                    label="Preferred date"
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        appointmentDate: event.target.value,
                        slotEndTime: '',
                        slotLabel: '',
                        slotStartTime: '',
                      }))
                    }
                    type="date"
                    value={formState.appointmentDate}
                  />
                </div>

                {loadingStaff ? <LoadingState title="Loading available staff..." /> : null}
                {!loadingStaff && staffError ? <ErrorState message={staffError} /> : null}
                {!loadingStaff && !staffError && staff.length === 0 ? (
                  <EmptyState
                    title="No staff available yet"
                    description="This service is not available for online booking until an active staff profile is ready."
                  />
                ) : null}

                {formState.staffProfileId && formState.appointmentDate ? (
                  <div className="space-y-4">
                    {loadingSlots ? <LoadingState title="Checking available times..." /> : null}
                    {!loadingSlots && slotsError ? <ErrorState message={slotsError} /> : null}
                    {!loadingSlots && !slotsError && slots.length === 0 ? (
                      <EmptyState
                        title="No times available for this date"
                        description="Try another day or choose a different staff member to keep the booking moving."
                      />
                    ) : null}
                    {!loadingSlots && !slotsError && slots.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {slots.map((slot) => {
                          const isSelected = slot.startTime === formState.slotStartTime
                          return (
                            <button
                              key={`${slot.startTime}-${slot.endTime}`}
                              className={[
                                'rounded-[22px] border px-4 py-4 text-left text-sm font-semibold transition',
                                isSelected
                                  ? 'border-slate-900 bg-slate-950 text-white'
                                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white',
                              ].join(' ')}
                              onClick={() => handleSlotSelect(slot)}
                              type="button"
                            >
                              {slot.label}
                            </button>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex justify-between gap-3">
                  <button
                    className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600"
                    onClick={() => setStep('service')}
                    type="button"
                  >
                    Back
                  </button>
                </div>
              </section>
            ) : null}

            {step === 'details' ? (
              <section className="mt-8 space-y-6">
                <SectionIntro
                  title="Your details"
                  description="We only need a few details to lock in the booking and send the team the right context."
                />
                {submitError ? <ErrorState message={submitError} /> : null}
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    error={formErrors.fullName}
                    label="Full name"
                    onChange={(event) => setFormState((current) => ({ ...current, fullName: event.target.value }))}
                    placeholder="Maya Laurent"
                    value={formState.fullName}
                  />
                  <InputField
                    error={formErrors.email}
                    label="Email"
                    onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
                    placeholder="maya@example.com"
                    type="email"
                    value={formState.email}
                  />
                  <InputField
                    error={formErrors.phone}
                    label="Phone"
                    onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="(555) 123-4567"
                    value={formState.phone}
                  />
                  <InputField
                    disabled
                    label="Selected time"
                    value={formState.slotLabel}
                  />
                </div>
                <TextAreaField
                  label="Notes"
                  onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Anything helpful the studio should know before your appointment?"
                  value={formState.notes}
                />

                <div className="flex flex-wrap justify-between gap-3">
                  <button
                    className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600"
                    onClick={() => setStep('availability')}
                    type="button"
                  >
                    Back
                  </button>
                  <button
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={submitLoading}
                    onClick={() => void handleSubmit()}
                    type="button"
                  >
                    {submitLoading ? 'Submitting booking...' : 'Confirm booking'}
                  </button>
                </div>
              </section>
            ) : null}

            {step === 'confirmation' && confirmation ? (
              <section className="mt-8 space-y-6">
                <SectionIntro
                  title="Booking confirmed"
                  description="Your appointment request has been placed and the studio can now see it in their live booking board."
                />
                <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,rgba(183,217,255,0.14),rgba(181,234,216,0.22))] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Confirmation</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-950">{confirmation.serviceName}</h2>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <SummaryRow label="Guest" value={confirmation.customerName} />
                    <SummaryRow label="Reference" value={confirmation.bookingReference} />
                    <SummaryRow label="Location" value={confirmation.locationName} />
                    <SummaryRow label="Specialist" value={confirmation.staffName} />
                    <SummaryRow label="Date" value={formatDate(confirmation.appointmentDate)} />
                    <SummaryRow
                      label="Time"
                      value={`${formatTime(confirmation.startTime)} - ${formatTime(confirmation.endTime)}`}
                    />
                    <SummaryRow label="Status" value={humanizeEnum(confirmation.status)} />
                    <SummaryRow
                      label="Deposit"
                      value={
                        confirmation.depositRequired
                          ? formatCurrency(confirmation.depositAmount ?? 0)
                          : 'No deposit required'
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                    onClick={resetBooking}
                    type="button"
                  >
                    Book another appointment
                  </button>
                  <Link
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                    to={
                      selectedLocation
                        ? `/book/${studioSlug}/${selectedLocation.slug}/manage?reference=${encodeURIComponent(confirmation.bookingReference)}`
                        : `/book/${studioSlug}/manage?reference=${encodeURIComponent(confirmation.bookingReference)}`
                    }
                  >
                    Manage this booking
                  </Link>
                  <Link
                    className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600"
                    to={selectedLocation ? `/book/${studioSlug}/${selectedLocation.slug}` : `/book/${studioSlug}`}
                  >
                    Start another booking
                  </Link>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-600">
                  <p className="font-semibold text-slate-900">Need help? Contact studio</p>
                  <p className="mt-2">Save your booking reference and contact the studio directly if you need support beyond simple public changes.</p>
                </div>
              </section>
            ) : null}
          </motion.section>

          <aside className="space-y-4">
            <div className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Booking summary</p>
              <div className="mt-5 space-y-4">
                <SummaryRow label="Location" value={selectedLocation?.name ?? 'Choose a location'} />
                <SummaryRow label="Service" value={selectedService?.name ?? 'Choose a service'} />
                <SummaryRow label="Specialist" value={selectedStaff?.displayName ?? 'Choose a staff member'} />
                <SummaryRow label="Date" value={formState.appointmentDate ? formatDate(formState.appointmentDate) : 'Choose a date'} />
                <SummaryRow label="Time" value={formState.slotLabel || 'Choose a time slot'} />
              </div>
            </div>

            {selectedService ? (
              <div className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Selected service</p>
                <h3 className="mt-4 text-2xl font-semibold text-slate-950">{selectedService.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {selectedService.description || 'A refined service experience designed for premium studio bookings.'}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <SummaryRow label="Duration" value={`${selectedService.durationMinutes} min`} />
                  <SummaryRow label="Price" value={formatCurrency(selectedService.price)} />
                </div>
                {selectedService.depositRequired ? (
                  <div className="mt-5 rounded-[22px] border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Deposit required: {formatCurrency(selectedService.depositAmount)}
                  </div>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  )
}

function StepRail({ currentStep }: { currentStep: BookingStep }) {
  const steps: BookingStep[] = ['service', 'availability', 'details', 'confirmation']
  const labels: Record<BookingStep, string> = {
    availability: 'Time',
    confirmation: 'Done',
    details: 'Details',
    service: 'Service',
  }
  const activeIndex = steps.indexOf(currentStep)

  return (
    <div className="flex flex-wrap gap-3">
      {steps.map((step, index) => (
        <div
          key={step}
          className={[
            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
            index <= activeIndex
              ? 'border-slate-900 bg-slate-950 text-white'
              : 'border-slate-200 bg-slate-50 text-slate-500',
          ].join(' ')}
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
            {index + 1}
          </span>
          {labels[step]}
        </div>
      ))}
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

function validatePublicBookingForm(formState: BookingFormState) {
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
