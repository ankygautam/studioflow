import { useCallback, useMemo, useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { ActivityTimeline } from '../components/ui/activity-timeline'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { DetailDrawer } from '../components/ui/detail-drawer'
import { InputField, TextAreaField, ToggleField } from '../components/ui/form-controls'
import { PageHeader } from '../components/ui/page-header'
import { StatusBadge } from '../components/ui/status-badge'
import { canManageClients } from '../features/auth/authorization'
import { useAuth } from '../features/auth/use-auth'
import { useRemoteList } from '../hooks/use-remote-list'
import { getAppointments } from '../lib/api/appointments-api'
import { getAuditLogsByEntity } from '../lib/api/audit-api'
import { getConsentFormSubmissions } from '../lib/api/consent-forms-api'
import { getDefaultStudioId } from '../lib/api/http'
import { createClientPackageAssignment, getClientPackages, getPackages } from '../lib/api/packages-api'
import { getPayments } from '../lib/api/payments-api'
import { createClient, deleteClient, getClients, updateClient } from '../lib/api/clients-api'
import { formatCurrency, formatDate, formatTime, humanizeEnum } from '../lib/formatters'
import type {
  AppointmentRecord,
  AuditActionType,
  AuditLogRecord,
  ClientPackageRecord,
  ClientRecord,
  ConsentFormStatus,
  ConsentFormSubmissionRecord,
  PackageRecord,
  PaymentRecord,
} from '../lib/api/types'

type ClientFormState = {
  dateOfBirth: string
  email: string
  fullName: string
  isActive: boolean
  notes: string
  phone: string
  studioId: string
}

export function ClientsPage() {
  const { user } = useAuth()
  const canManage = user ? canManageClients(user.role) : false
  const defaultStudioId = getDefaultStudioId()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ClientFormState, string>>>({})
  const [formState, setFormState] = useState<ClientFormState>(createClientForm(defaultStudioId))
  const [selectedPackageId, setSelectedPackageId] = useState('')
  const [isAssigningPackage, setIsAssigningPackage] = useState(false)
  const [packageMutationError, setPackageMutationError] = useState<string | null>(null)

  const loadClients = useCallback(() => getClients(defaultStudioId), [defaultStudioId])
  const { data: clients, error, isLoading, reload } = useRemoteList(loadClients)
  const loadAvailablePackages = useCallback(() => {
    if (!editingClient?.studioId) {
      return Promise.resolve([] as PackageRecord[])
    }

    return getPackages(editingClient.studioId)
  }, [editingClient?.studioId])
  const {
    data: availablePackages,
    error: availablePackagesError,
    isLoading: availablePackagesLoading,
  } = useRemoteList(loadAvailablePackages)
  const loadClientPackages = useCallback(() => {
    if (!editingClient?.id) {
      return Promise.resolve([] as ClientPackageRecord[])
    }

    return getClientPackages(editingClient.id)
  }, [editingClient?.id])
  const {
    data: clientPackages,
    error: clientPackagesError,
    isLoading: clientPackagesLoading,
    reload: reloadClientPackages,
  } = useRemoteList(loadClientPackages)
  const loadClientConsent = useCallback(() => {
    if (!editingClient?.id) {
      return Promise.resolve([] as ConsentFormSubmissionRecord[])
    }

    return getConsentFormSubmissions({ customerProfileId: editingClient.id })
  }, [editingClient?.id])
  const {
    data: clientConsentSubmissions,
    error: clientConsentError,
    isLoading: clientConsentLoading,
  } = useRemoteList(loadClientConsent)
  const loadClientAppointments = useCallback(() => {
    if (!editingClient?.id) {
      return Promise.resolve([] as AppointmentRecord[])
    }

    return getAppointments(editingClient.studioId)
  }, [editingClient?.id, editingClient?.studioId])
  const {
    data: studioAppointments,
    error: clientAppointmentsError,
    isLoading: clientAppointmentsLoading,
  } = useRemoteList(loadClientAppointments)
  const loadClientPayments = useCallback(() => {
    if (!editingClient?.id) {
      return Promise.resolve([] as PaymentRecord[])
    }

    return getPayments({ studioId: editingClient.studioId })
  }, [editingClient?.id, editingClient?.studioId])
  const {
    data: studioPayments,
    error: clientPaymentsError,
    isLoading: clientPaymentsLoading,
  } = useRemoteList(loadClientPayments)
  const loadClientActivity = useCallback(() => {
    if (!editingClient?.id) {
      return Promise.resolve([])
    }

    return getAuditLogsByEntity('CLIENT', editingClient.id)
  }, [editingClient?.id])
  const {
    data: clientActivity,
    error: clientActivityError,
    isLoading: clientActivityLoading,
  } = useRemoteList(loadClientActivity)

  const openCreateDrawer = () => {
    setEditingClient(null)
    setMutationError(null)
    setPackageMutationError(null)
    setFormErrors({})
    setFormState(createClientForm(defaultStudioId))
    setSelectedPackageId('')
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (client: ClientRecord) => {
    setEditingClient(client)
    setMutationError(null)
    setPackageMutationError(null)
    setFormErrors({})
    setFormState(createClientForm(client.studioId, client))
    setSelectedPackageId('')
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setEditingClient(null)
    setMutationError(null)
    setPackageMutationError(null)
    setFormErrors({})
    setConfirmDeleteOpen(false)
    setSelectedPackageId('')
  }

  const handleSubmit = async () => {
    const errors = validateClientForm(formState, editingClient?.studioId ?? defaultStudioId)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const studioId = editingClient?.studioId ?? defaultStudioId ?? formState.studioId.trim()

    if (!studioId) {
      setMutationError('Set VITE_STUDIO_ID or provide a studio ID to save client records.')
      return
    }

    const payload = {
      dateOfBirth: formState.dateOfBirth || null,
      email: formState.email.trim(),
      fullName: formState.fullName.trim(),
      isActive: formState.isActive,
      notes: formState.notes.trim(),
      phone: formState.phone.trim(),
      studioId,
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      if (editingClient) {
        await updateClient(editingClient.id, payload)
      } else {
        await createClient(payload)
      }

      await reload()
      closeDrawer()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to save client right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingClient) {
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      await deleteClient(editingClient.id)
      await reload()
      closeDrawer()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to deactivate client right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const latestConsent = useMemo(
    () => clientConsentSubmissions[0] ?? null,
    [clientConsentSubmissions],
  )
  const activePackages = useMemo(
    () => availablePackages.filter((pkg) => pkg.isActive),
    [availablePackages],
  )
  const clientAppointments = useMemo(
    () => studioAppointments.filter((appointment) => appointment.customerProfileId === editingClient?.id),
    [editingClient?.id, studioAppointments],
  )
  const clientPayments = useMemo(() => {
    const appointmentIds = new Set(clientAppointments.map((appointment) => appointment.id))
    return studioPayments.filter((payment) => appointmentIds.has(payment.appointmentId))
  }, [clientAppointments, studioPayments])
  const clientTimelineEntries = useMemo(
    () =>
      buildClientTimelineEntries({
        activity: clientActivity,
        appointments: clientAppointments,
        client: editingClient,
        consentSubmissions: clientConsentSubmissions,
        payments: clientPayments,
      }),
    [clientActivity, clientAppointments, clientConsentSubmissions, clientPayments, editingClient],
  )
  const clientTimelineError =
    clientAppointmentsError || clientPaymentsError || clientConsentError || clientActivityError
  const clientTimelineLoading =
    clientAppointmentsLoading || clientPaymentsLoading || clientConsentLoading || clientActivityLoading

  const handleAssignPackage = async () => {
    if (!editingClient) {
      return
    }

    if (!selectedPackageId) {
      setPackageMutationError('Choose an active package to assign to this client.')
      return
    }

    setIsAssigningPackage(true)
    setPackageMutationError(null)

    try {
      await createClientPackageAssignment({
        customerProfileId: editingClient.id,
        prepaidPackageId: selectedPackageId,
        studioId: editingClient.studioId,
      })
      await reloadClientPackages()
      setSelectedPackageId('')
    } catch (error) {
      setPackageMutationError(error instanceof Error ? error.message : 'Unable to assign package right now.')
    } finally {
      setIsAssigningPackage(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={canManage ? (
          <button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
            onClick={openCreateDrawer}
            type="button"
          >
            Add client
          </button>
        ) : undefined}
        description="A clean CRM-style view for real client records, notes, active status, and backend-linked profile details."
        eyebrow="Clients"
        title="Client relationships"
      />

      <section>
        <SurfaceCard title="Client list">
          {isLoading ? <LoadingState title="Loading clients..." /> : null}
          {!isLoading && error ? (
            <ErrorState
              action={
                <button
                  className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600"
                  onClick={() => void reload()}
                  type="button"
                >
                  Retry
                </button>
              }
              message={error}
            />
          ) : null}
          {!isLoading && !error && clients.length === 0 ? (
            <EmptyState
              action={canManage ? (
                <button
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  onClick={openCreateDrawer}
                  type="button"
                >
                  Add the first client
                </button>
              ) : undefined}
              description="Real client records from the backend will appear here as soon as they are created."
              title="No clients found yet"
            />
          ) : null}
          {!isLoading && !error && clients.length > 0 ? (
            <div className="space-y-3">
              {clients.map((client) => (
                <button
                  key={client.id}
                  className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:bg-white"
                  onClick={() => openEditDrawer(client)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{client.fullName}</p>
                      <p className="mt-1 text-sm text-slate-500">{client.email || client.phone || 'No contact details yet'}</p>
                    </div>
                    <StatusBadge tone={client.isActive ? 'success' : 'neutral'}>
                      {client.isActive ? 'Active' : 'Inactive'}
                    </StatusBadge>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">
                    {client.notes?.trim() ? client.notes : 'No notes added yet.'}
                  </p>
                </button>
              ))}
            </div>
          ) : null}
        </SurfaceCard>
      </section>

      <DetailDrawer
        footer={
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              {editingClient && canManage ? (
                <button
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                  disabled={isSaving}
                  onClick={() => setConfirmDeleteOpen(true)}
                  type="button"
                >
                  Deactivate client
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600"
                disabled={isSaving}
                onClick={closeDrawer}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={isSaving || !canManage}
                onClick={() => void handleSubmit()}
                type="button"
              >
                {isSaving ? 'Saving...' : editingClient ? 'Save changes' : 'Create client'}
              </button>
            </div>
          </div>
        }
        onClose={closeDrawer}
        open={isDrawerOpen}
        variant={editingClient ? 'drawer' : 'modal'}
        subtitle="Client profile"
        title={editingClient ? editingClient.fullName : 'Add client'}
      >
        <div className="space-y-6">
          {mutationError ? <ErrorState message={mutationError} /> : null}
          {editingClient ? (
            <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,rgba(183,217,255,0.16),rgba(181,234,216,0.18))] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Profile</p>
                  <h2 className="mt-3 font-display text-3xl text-slate-950">{editingClient.fullName}</h2>
                </div>
                <StatusBadge tone={editingClient.isActive ? 'success' : 'neutral'}>
                  {editingClient.isActive ? 'Active record' : 'Inactive record'}
                </StatusBadge>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoCard label="Phone" value={editingClient.phone || 'Not added'} />
                <InfoCard label="Email" value={editingClient.email || 'Not added'} />
                <InfoCard label="Date of birth" value={editingClient.dateOfBirth || 'Not added'} />
                <InfoCard label="Created" value={formatDate(editingClient.createdAt)} />
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {!editingClient && !defaultStudioId ? (
              <InputField
                error={formErrors.studioId}
                label="Studio ID"
                onChange={(event) => setFormState((current) => ({ ...current, studioId: event.target.value }))}
                placeholder="Paste the studio UUID"
                value={formState.studioId}
              />
            ) : null}
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
              placeholder="maya@studioflow.co"
              type="email"
              value={formState.email}
            />
            <InputField
              label="Phone"
              onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))}
              placeholder="(555) 123-4567"
              value={formState.phone}
            />
            <InputField
              label="Date of birth"
              onChange={(event) => setFormState((current) => ({ ...current, dateOfBirth: event.target.value }))}
              type="date"
              value={formState.dateOfBirth}
            />
          </div>

          <TextAreaField
            label="Notes"
            onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))}
            placeholder="Preferences, booking notes, or follow-up context."
            value={formState.notes}
          />

          <ToggleField
            checked={formState.isActive}
            label="Active client"
            onChange={(checked) => setFormState((current) => ({ ...current, isActive: checked }))}
          />

          {editingClient ? (
            <section>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Packages</p>
              <div className="mt-3 space-y-3">
                {canManage ? (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Assign package
                      </label>
                      <select
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-300"
                        onChange={(event) => setSelectedPackageId(event.target.value)}
                        value={selectedPackageId}
                      >
                        <option value="">Choose a package</option>
                        {activePackages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} • {pkg.sessionCount} visits
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                      disabled={isAssigningPackage || availablePackagesLoading || activePackages.length === 0}
                      onClick={() => void handleAssignPackage()}
                      type="button"
                    >
                      {isAssigningPackage ? 'Assigning...' : 'Assign package'}
                    </button>
                  </div>
                  {packageMutationError ? <p className="mt-3 text-sm text-rose-600">{packageMutationError}</p> : null}
                  {!availablePackagesLoading && availablePackagesError ? (
                    <p className="mt-3 text-sm text-rose-600">{availablePackagesError}</p>
                  ) : null}
                  {!availablePackagesLoading && !availablePackagesError && activePackages.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">
                      Create an active package in the Packages workspace before assigning one here.
                    </p>
                  ) : null}
                </div>
                ) : null}

                {clientPackagesLoading ? <LoadingState title="Loading packages..." /> : null}
                {!clientPackagesLoading && clientPackagesError ? <ErrorState message={clientPackagesError} /> : null}
                {!clientPackagesLoading && !clientPackagesError && clientPackages.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">No packages assigned yet</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Assigned packages will appear here with remaining visits and expiry details.
                  </p>
                </div>
                ) : null}
                {!clientPackagesLoading && !clientPackagesError && clientPackages.length > 0 ? (
                <div className="grid gap-3">
                  {clientPackages.map((pkg) => (
                    <div key={pkg.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">{pkg.packageName}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {pkg.remainingSessions} of {pkg.totalSessions} visits remaining
                          </p>
                        </div>
                        <StatusBadge tone={pkg.isActive ? 'success' : 'neutral'}>
                          {pkg.isActive ? 'Active package' : 'Inactive package'}
                        </StatusBadge>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <InfoCard label="Assigned" value={formatDate(pkg.createdAt)} />
                        <InfoCard label="Expires" value={pkg.expiresAt ? formatDate(pkg.expiresAt) : 'No expiry'} />
                      </div>
                    </div>
                  ))}
                </div>
                ) : null}
              </div>
            </section>
          ) : null}

          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Consent status</p>
            <div className="mt-3 space-y-3">
              {clientConsentLoading ? <LoadingState title="Loading consent status..." /> : null}
              {!clientConsentLoading && clientConsentError ? (
                <ErrorState message={clientConsentError} />
              ) : null}
              {!clientConsentLoading && !clientConsentError && latestConsent ? (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{latestConsent.templateTitle}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Latest consent update for this client
                      </p>
                    </div>
                    <StatusBadge tone={consentTone(latestConsent.status)}>
                      {humanizeConsentStatus(latestConsent.status)}
                    </StatusBadge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoCard
                      label="Signed"
                      value={latestConsent.signedAt ? formatDate(latestConsent.signedAt) : 'Not signed'}
                    />
                    <InfoCard
                      label="Appointment"
                      value={latestConsent.appointmentDate ? formatDate(latestConsent.appointmentDate) : 'Not linked'}
                    />
                  </div>
                </div>
              ) : null}
              {!clientConsentLoading && !clientConsentError && !latestConsent ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">No consent records yet</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    This client has not been linked to a tracked consent submission yet.
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Client timeline</p>
            <div className="mt-3">
              <ActivityTimeline
                emptyDescription="Client history will appear here as appointments, payments, consent records, and profile notes build up over time."
                entries={clientTimelineEntries}
                error={clientTimelineError}
                isLoading={clientTimelineLoading}
              />
            </div>
          </section>
        </div>
      </DetailDrawer>

      <ConfirmDialog
        confirmLabel="Deactivate client"
        description={`${editingClient?.fullName ?? 'This client'} will be kept for reporting and appointment history, but the profile will be marked inactive.`}
        isConfirming={isSaving}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        open={confirmDeleteOpen}
        title="Deactivate this client?"
      />
    </div>
  )
}

function createClientForm(studioId: string | null, client?: ClientRecord): ClientFormState {
  return {
    dateOfBirth: client?.dateOfBirth ?? '',
    email: client?.email ?? '',
    fullName: client?.fullName ?? '',
    isActive: client?.isActive ?? true,
    notes: client?.notes ?? '',
    phone: client?.phone ?? '',
    studioId: studioId ?? '',
  }
}

function validateClientForm(formState: ClientFormState, studioId: string | null) {
  const errors: Partial<Record<keyof ClientFormState, string>> = {}

  if (!studioId && !formState.studioId.trim()) {
    errors.studioId = 'Studio ID is required to create a client.'
  }

  if (!formState.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  }

  if (formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
    errors.email = 'Enter a valid email address.'
  }

  return errors
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/80 bg-white px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-700">{value}</p>
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

function buildClientTimelineEntries({
  activity,
  appointments,
  client,
  consentSubmissions,
  payments,
}: {
  activity: AuditLogRecord[]
  appointments: AppointmentRecord[]
  client: ClientRecord | null
  consentSubmissions: ConsentFormSubmissionRecord[]
  payments: PaymentRecord[]
}): AuditLogRecord[] {
  const appointmentEntries = appointments.map((appointment) => ({
    actionType: appointmentTimelineActionType(appointment),
    actorName: appointment.staffName,
    actorRole: null,
    createdAt: buildAppointmentTimelineDateTime(appointment),
    description: [
      `${appointment.serviceName} at ${appointment.locationName}.`,
      `Status: ${humanizeEnum(appointment.status)}.`,
      `Scheduled for ${formatDate(appointment.appointmentDate)} at ${formatTime(appointment.startTime)}.`,
    ].join(' '),
    entityId: appointment.id,
    entityType: 'APPOINTMENT' as const,
    id: `appointment-${appointment.id}`,
    locationId: appointment.locationId,
    locationName: appointment.locationName,
    metadataJson: null,
    studioId: appointment.studioId,
    title: `Appointment ${humanizeEnum(appointment.status).toLowerCase()}`,
  }))

  const paymentEntries = payments.map((payment) => ({
    actionType: paymentTimelineActionType(payment),
    actorName: payment.locationName,
    actorRole: null,
    createdAt: payment.paidAt ?? payment.updatedAt,
    description: [
      `${payment.serviceName} payment is ${humanizeEnum(payment.paymentStatus).toLowerCase()}.`,
      `Amount: ${formatCurrency(payment.amount)}.`,
      payment.depositAmount > 0 ? `Deposit: ${formatCurrency(payment.depositAmount)}.` : null,
    ]
      .filter(Boolean)
      .join(' '),
    entityId: payment.id,
    entityType: 'PAYMENT' as const,
    id: `payment-${payment.id}`,
    locationId: payment.locationId,
    locationName: payment.locationName,
    metadataJson: null,
    studioId: payment.studioId,
    title: `Payment ${humanizeEnum(payment.paymentStatus).toLowerCase()}`,
  }))

  const consentEntries = consentSubmissions.map((submission) => ({
    actionType: consentTimelineActionType(submission),
    actorName: submission.templateTitle,
    actorRole: null,
    createdAt: submission.signedAt ?? submission.updatedAt,
    description: [
      `Consent form is ${humanizeConsentStatus(submission.status).toLowerCase()}.`,
      submission.appointmentDate
        ? `Linked appointment: ${formatDate(submission.appointmentDate)}${submission.appointmentStartTime ? ` at ${formatTime(submission.appointmentStartTime)}` : ''}.`
        : 'No appointment linked.',
    ].join(' '),
    entityId: submission.id,
    entityType: 'CONSENT_SUBMISSION' as const,
    id: `consent-${submission.id}`,
    locationId: null,
    locationName: null,
    metadataJson: null,
    studioId: submission.studioId,
    title: `Consent ${humanizeConsentStatus(submission.status).toLowerCase()}`,
  }))

  const noteEntries =
    client?.notes?.trim()
      ? [
          {
            actionType: 'UPDATED' as const,
            actorName: 'Client profile',
            actorRole: null,
            createdAt: client.updatedAt,
            description: client.notes.trim(),
            entityId: client.id,
            entityType: 'CLIENT' as const,
            id: `client-notes-${client.id}`,
            locationId: null,
            locationName: null,
            metadataJson: null,
            studioId: client.studioId,
            title: 'Client notes updated',
          },
        ]
      : []

  return [...activity, ...appointmentEntries, ...paymentEntries, ...consentEntries, ...noteEntries].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )
}

function buildAppointmentTimelineDateTime(appointment: AppointmentRecord) {
  return `${appointment.appointmentDate}T${appointment.startTime}`
}

function appointmentTimelineActionType(appointment: AppointmentRecord): AuditActionType {
  if (appointment.status === 'CANCELLED') {
    return 'CANCELLED'
  }

  if (appointment.status === 'COMPLETED') {
    return 'COMPLETED'
  }

  return 'CREATED'
}

function paymentTimelineActionType(payment: PaymentRecord): AuditActionType {
  return payment.paymentStatus === 'PAID' ? 'COMPLETED' : 'UPDATED'
}

function consentTimelineActionType(submission: ConsentFormSubmissionRecord): AuditActionType {
  return submission.status === 'SIGNED' ? 'COMPLETED' : 'UPDATED'
}
