import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../features/auth/use-auth'
import { getClients } from '../../lib/api/clients-api'
import { getConsentFormSubmissions } from '../../lib/api/consent-forms-api'
import { getDefaultStudioId } from '../../lib/api/http'
import { getLocations } from '../../lib/api/locations-api'
import { getServices } from '../../lib/api/services-api'
import { getStaff } from '../../lib/api/staff-api'
import { useRemoteList } from '../../hooks/use-remote-list'
import { createAppointment, deleteAppointment, updateAppointment } from '../../lib/api/appointments-api'
import type { AppointmentRecord, ConsentFormStatus, ConsentFormSubmissionRecord } from '../../lib/api/types'
import {
  appointmentSources,
  appointmentStatuses,
  createAppointmentForm,
  type AppointmentFormState,
  resolveAppointmentStudioId,
  validateAppointmentForm,
} from '../../lib/appointments'
import { formatDate, formatRelativeTime, humanizeEnum } from '../../lib/formatters'
import { DetailDrawer } from '../ui/detail-drawer'
import { ErrorState, LoadingState } from '../ui/async-state'
import { InputField, SelectField, TextAreaField } from '../ui/form-controls'
import { StatusBadge } from '../ui/status-badge'

type AppointmentDrawerProps = {
  appointment: AppointmentRecord | null
  allowCreate?: boolean
  allowDelete?: boolean
  draft?: Partial<AppointmentFormState> | null
  onClose: () => void
  onSaved: () => Promise<void> | void
  open: boolean
}

export function AppointmentDrawer({
  appointment,
  allowCreate = true,
  allowDelete = true,
  draft = null,
  onClose,
  onSaved,
  open,
}: AppointmentDrawerProps) {
  const { selectedLocationId } = useAuth()
  const defaultStudioId = getDefaultStudioId()
  const studioId = appointment?.studioId ?? defaultStudioId
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AppointmentFormState, string>>>({})
  const [formState, setFormState] = useState<AppointmentFormState>(
    mergeAppointmentDraft(
      createAppointmentForm(studioId, appointment ?? undefined),
      {
        locationId: appointment?.locationId ?? selectedLocationId ?? '',
        ...draft,
      },
    ),
  )
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadClients = useCallback(() => getClients(studioId), [studioId])
  const loadLocations = useCallback(() => getLocations(studioId, true), [studioId])
  const loadStaff = useCallback(
    () => getStaff(studioId, formState.locationId || selectedLocationId),
    [formState.locationId, selectedLocationId, studioId],
  )
  const loadServices = useCallback(() => getServices(studioId), [studioId])
  const loadConsentSubmissions = useCallback(() => {
    if (!appointment?.id) {
      return Promise.resolve([] as ConsentFormSubmissionRecord[])
    }

    return getConsentFormSubmissions({ appointmentId: appointment.id })
  }, [appointment?.id])

  const { data: clients, error: clientsError, isLoading: clientsLoading } = useRemoteList(loadClients)
  const { data: locations, error: locationsError, isLoading: locationsLoading } = useRemoteList(loadLocations)
  const { data: staffMembers, error: staffError, isLoading: staffLoading } = useRemoteList(loadStaff)
  const { data: services, error: servicesError, isLoading: servicesLoading } = useRemoteList(loadServices)
  const {
    data: consentSubmissions,
    error: consentError,
    isLoading: consentLoading,
  } = useRemoteList(loadConsentSubmissions)

  useEffect(() => {
    if (!open) {
      return
    }

    setFormErrors({})
    setMutationError(null)
    setFormState(
      mergeAppointmentDraft(
        createAppointmentForm(studioId, appointment ?? undefined),
        {
          locationId: appointment?.locationId ?? selectedLocationId ?? '',
          ...draft,
        },
      ),
    )
  }, [appointment, draft, open, selectedLocationId, studioId])

  const dependenciesError = clientsError || locationsError || staffError || servicesError
  const dependenciesLoading = clientsLoading || locationsLoading || staffLoading || servicesLoading
  const hasClients = clients.length > 0
  const hasLocations = locations.length > 0
  const hasStaff = staffMembers.length > 0
  const hasServices = services.length > 0
  const hasAllDependencies = hasClients && hasLocations && hasStaff && hasServices

  const handleSubmit = async () => {
    const resolvedStudioId = resolveAppointmentStudioId(
      formState,
      clients,
      staffMembers,
      services,
      appointment?.studioId ?? defaultStudioId,
    )

    const errors = validateAppointmentForm(formState, resolvedStudioId)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    if (!resolvedStudioId) {
      setMutationError('Set VITE_STUDIO_ID or select records from the same studio before saving.')
      return
    }

    const payload = {
      appointmentDate: formState.appointmentDate,
      customerProfileId: formState.customerProfileId,
      endTime: formState.endTime,
      locationId: formState.locationId,
      notes: formState.notes.trim(),
      serviceId: formState.serviceId,
      source: formState.source,
      staffProfileId: formState.staffProfileId,
      startTime: formState.startTime,
      status: formState.status,
      studioId: resolvedStudioId,
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      if (appointment) {
        await updateAppointment(appointment.id, payload)
      } else {
        await createAppointment(payload)
      }

      await onSaved()
      onClose()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to save the appointment right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!appointment) {
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      await deleteAppointment(appointment.id)
      await onSaved()
      onClose()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to delete this appointment right now.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DetailDrawer
      footer={
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            {appointment && allowDelete ? (
              <button
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                disabled={isSaving}
                onClick={() => void handleDelete()}
                type="button"
              >
                Delete appointment
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600"
              disabled={isSaving}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isSaving || dependenciesLoading || !hasAllDependencies || (!appointment && !allowCreate)}
              onClick={() => void handleSubmit()}
              type="button"
            >
              {isSaving ? 'Saving...' : appointment ? 'Save changes' : 'Create appointment'}
            </button>
          </div>
        </div>
      }
      onClose={onClose}
      open={open}
      subtitle="Appointment record"
      title={appointment ? appointment.customerName : 'New booking'}
    >
      <div className="space-y-5">
        {mutationError ? <ErrorState message={mutationError} /> : null}
        {dependenciesError ? <ErrorState message={dependenciesError} /> : null}
        {dependenciesLoading ? <LoadingState title="Loading staff, clients, and services..." /> : null}
        {!dependenciesLoading && !dependenciesError && !hasAllDependencies ? (
          <div className="grid gap-3">
            {!hasClients ? (
              <DependencyNotice
                description="Create a client record first so a booking can be assigned to a real customer."
                title="No clients yet"
              />
            ) : null}
            {!hasLocations ? (
              <DependencyNotice
                description="Create at least one location so StudioFlow can scope appointments and public booking correctly."
                title="No locations available"
              />
            ) : null}
            {!hasStaff ? (
              <DependencyNotice
                description="Add or activate a staff profile before creating a new appointment on the calendar."
                title="No staff available"
              />
            ) : null}
            {!hasServices ? (
              <DependencyNotice
                description="Create at least one service in the catalog so bookings can reference a real offering."
                title="No services created"
              />
            ) : null}
          </div>
        ) : null}

        {!appointment && !defaultStudioId && !resolveAppointmentStudioId(formState, clients, staffMembers, services, null) ? (
          <InputField
            error={formErrors.studioId}
            label="Studio ID"
            onChange={(event) => setFormState((current) => ({ ...current, studioId: event.target.value }))}
            placeholder="Paste the studio UUID"
            value={formState.studioId}
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            error={formErrors.locationId}
            label="Location"
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                locationId: event.target.value,
                staffProfileId: '',
              }))
            }
            value={formState.locationId}
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            error={formErrors.customerProfileId}
            label="Client"
            onChange={(event) =>
              setFormState((current) => ({ ...current, customerProfileId: event.target.value }))
            }
            value={formState.customerProfileId}
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.fullName}
              </option>
            ))}
          </SelectField>
          <SelectField
            error={formErrors.staffProfileId}
            label="Staff"
            onChange={(event) =>
              setFormState((current) => ({ ...current, staffProfileId: event.target.value }))
            }
            value={formState.staffProfileId}
          >
            <option value="">Select a staff member</option>
            {staffMembers.map((staffMember) => (
              <option key={staffMember.id} value={staffMember.id}>
                {staffMember.displayName}
              </option>
            ))}
          </SelectField>
          <SelectField
            error={formErrors.serviceId}
            label="Service"
            onChange={(event) => setFormState((current) => ({ ...current, serviceId: event.target.value }))}
            value={formState.serviceId}
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </SelectField>
          <InputField
            error={formErrors.appointmentDate}
            label="Appointment date"
            onChange={(event) =>
              setFormState((current) => ({ ...current, appointmentDate: event.target.value }))
            }
            type="date"
            value={formState.appointmentDate}
          />
          <InputField
            error={formErrors.startTime}
            label="Start time"
            onChange={(event) => setFormState((current) => ({ ...current, startTime: event.target.value }))}
            type="time"
            value={formState.startTime}
          />
          <InputField
            error={formErrors.endTime}
            label="End time"
            onChange={(event) => setFormState((current) => ({ ...current, endTime: event.target.value }))}
            type="time"
            value={formState.endTime}
          />
          <SelectField
            error={formErrors.status}
            label="Status"
            onChange={(event) =>
              setFormState((current) => ({ ...current, status: event.target.value as AppointmentFormState['status'] }))
            }
            value={formState.status}
          >
            {appointmentStatuses.map((status) => (
              <option key={status} value={status}>
                {humanizeEnum(status)}
              </option>
            ))}
          </SelectField>
          <SelectField
            error={formErrors.source}
            label="Source"
            onChange={(event) =>
              setFormState((current) => ({ ...current, source: event.target.value as AppointmentFormState['source'] }))
            }
            value={formState.source}
          >
            {appointmentSources.map((source) => (
              <option key={source} value={source}>
                {humanizeEnum(source)}
              </option>
            ))}
          </SelectField>
        </div>

        <TextAreaField
          label="Notes"
          onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))}
          placeholder="Add prep details, reminders, or scheduling context."
          value={formState.notes}
        />

        {appointment ? (
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Consent status</p>
            <div className="mt-3 space-y-3">
              {consentLoading ? <LoadingState title="Loading consent records..." /> : null}
              {!consentLoading && consentError ? <ErrorState message={consentError} /> : null}
              {!consentLoading && !consentError && consentSubmissions.length > 0 ? (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  {consentSubmissions.slice(0, 2).map((submission) => (
                    <div
                      key={submission.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold text-slate-950">{submission.templateTitle}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {submission.signedAt ? `Signed ${formatDate(submission.signedAt)}` : 'Awaiting signature'}
                        </p>
                      </div>
                      <StatusBadge tone={consentTone(submission.status)}>
                        {humanizeConsentStatus(submission.status)}
                      </StatusBadge>
                    </div>
                  ))}
                </div>
              ) : null}
              {!consentLoading && !consentError && consentSubmissions.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">No consent linked</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    This appointment does not have a tracked consent submission yet.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {appointment ? (
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Communications</p>
            <div className="mt-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <div>
                  <p className="font-semibold text-slate-950">Booking confirmation</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {appointment.bookingConfirmationSentAt
                      ? `Last sent ${formatRelativeTime(appointment.bookingConfirmationSentAt)}`
                      : 'Not sent yet'}
                  </p>
                </div>
                <StatusBadge tone={appointment.bookingConfirmationSentAt ? 'success' : 'neutral'}>
                  {appointment.bookingConfirmationSentAt ? 'Sent' : 'Pending'}
                </StatusBadge>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
                <div>
                  <p className="font-semibold text-slate-950">Appointment reminder</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {appointment.reminderSentAt
                      ? `Last sent ${formatRelativeTime(appointment.reminderSentAt)}`
                      : 'No reminder sent yet'}
                  </p>
                </div>
                <StatusBadge tone={appointment.reminderSentAt ? 'success' : 'neutral'}>
                  {appointment.reminderSentAt ? 'Sent' : 'Waiting'}
                </StatusBadge>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </DetailDrawer>
  )
}

function mergeAppointmentDraft(
  baseFormState: AppointmentFormState,
  draft: Partial<AppointmentFormState> | null,
) {
  return draft ? { ...baseFormState, ...draft } : baseFormState
}

function DependencyNotice({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Missing setup</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  )
}

function consentTone(status: ConsentFormStatus) {
  switch (status) {
    case 'SIGNED':
      return 'success'
    case 'PENDING':
      return 'attention'
    case 'EXPIRED':
      return 'danger'
    default:
      return 'neutral'
  }
}

function humanizeConsentStatus(status: ConsentFormStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}
