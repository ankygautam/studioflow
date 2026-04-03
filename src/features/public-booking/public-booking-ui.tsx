import type { PublicBookableServiceRecord, PublicBookableStaffRecord, PublicBookingLocationRecord } from '../../lib/api/types'
import { formatCurrency, formatDate } from '../../lib/formatters'
import type { BookingFormState, BookingStep } from './public-booking-form'

export function StepRail({ currentStep }: { currentStep: BookingStep }) {
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

export function SectionIntro({ description, title }: { description: string; title: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
    </div>
  )
}

export function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

type PublicBookingSidebarProps = {
  formState: BookingFormState
  selectedLocation: PublicBookingLocationRecord | null
  selectedService: PublicBookableServiceRecord | null
  selectedStaff: PublicBookableStaffRecord | null
}

export function PublicBookingSidebar({
  formState,
  selectedLocation,
  selectedService,
  selectedStaff,
}: PublicBookingSidebarProps) {
  return (
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
  )
}
