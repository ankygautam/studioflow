import { useCallback, useMemo, useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { DataTable } from '../components/ui/data-table'
import { DetailDrawer } from '../components/ui/detail-drawer'
import { InputField, SelectField, TextAreaField, ToggleField } from '../components/ui/form-controls'
import { PageHeader } from '../components/ui/page-header'
import { StatusBadge } from '../components/ui/status-badge'
import { canManageWaitlist } from '../features/auth/authorization'
import { useAuth } from '../features/auth/use-auth'
import { useRemoteList } from '../hooks/use-remote-list'
import { getClients } from '../lib/api/clients-api'
import { getDefaultStudioId } from '../lib/api/http'
import { getLocations } from '../lib/api/locations-api'
import { getServices } from '../lib/api/services-api'
import { getStaff } from '../lib/api/staff-api'
import {
  createWaitlistEntry,
  deleteWaitlistEntry,
  getWaitlistEntries,
  updateWaitlistEntry,
} from '../lib/api/waitlist-api'
import type { WaitlistEntryRecord } from '../lib/api/types'
import { formatDate, formatTime } from '../lib/formatters'

type WaitlistFormState = {
  customerProfileId: string
  isActive: boolean
  locationId: string
  notes: string
  preferredDate: string
  preferredEndTime: string
  preferredStaffProfileId: string
  preferredStartTime: string
  serviceId: string
  studioId: string
}

export function WaitlistPage() {
  const { selectedLocationId, user } = useAuth()
  const canManage = user ? canManageWaitlist(user.role) : false
  const defaultStudioId = user?.studioId ?? getDefaultStudioId()
  const loadWaitlistEntries = useCallback(
    () => getWaitlistEntries(defaultStudioId, selectedLocationId),
    [defaultStudioId, selectedLocationId],
  )
  const { data: waitlistEntries, error, isLoading, reload } = useRemoteList(loadWaitlistEntries)

  const loadClients = useCallback(() => getClients(defaultStudioId), [defaultStudioId])
  const { data: clients } = useRemoteList(loadClients)
  const loadLocations = useCallback(() => getLocations(defaultStudioId, true), [defaultStudioId])
  const { data: locations } = useRemoteList(loadLocations)
  const loadServices = useCallback(() => getServices(defaultStudioId), [defaultStudioId])
  const { data: services } = useRemoteList(loadServices)
  const loadStaff = useCallback(() => getStaff(defaultStudioId), [defaultStudioId])
  const { data: staffMembers } = useRemoteList(loadStaff)

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<WaitlistEntryRecord | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof WaitlistFormState, string>>>({})
  const [formState, setFormState] = useState<WaitlistFormState>(
    createWaitlistForm(defaultStudioId, selectedLocationId),
  )

  const visibleEntries = useMemo(
    () =>
      waitlistEntries.filter((entry) => {
        if (statusFilter === 'ACTIVE') {
          return entry.isActive
        }

        if (statusFilter === 'INACTIVE') {
          return !entry.isActive
        }

        return true
      }),
    [statusFilter, waitlistEntries],
  )

  const availableServices = useMemo(() => services.filter((service) => service.isActive), [services])
  const availableStaff = useMemo(
    () =>
      staffMembers.filter((staffMember) => {
        if (staffMember.status !== 'ACTIVE') {
          return false
        }

        if (!formState.locationId) {
          return true
        }

        return !staffMember.primaryLocationId || staffMember.primaryLocationId === formState.locationId
      }),
    [formState.locationId, staffMembers],
  )

  const openCreateDrawer = () => {
    setEditingEntry(null)
    setMutationError(null)
    setFormErrors({})
    setFormState(createWaitlistForm(defaultStudioId, selectedLocationId))
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (entry: WaitlistEntryRecord) => {
    setEditingEntry(entry)
    setMutationError(null)
    setFormErrors({})
    setFormState(createWaitlistForm(entry.studioId, entry.locationId, entry))
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setEditingEntry(null)
    setMutationError(null)
    setFormErrors({})
    setConfirmDeleteOpen(false)
  }

  const handleSubmit = async () => {
    const errors = validateWaitlistForm(formState, editingEntry?.studioId ?? defaultStudioId)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const studioId = editingEntry?.studioId ?? defaultStudioId ?? formState.studioId.trim()

    if (!studioId) {
      setMutationError('Set VITE_STUDIO_ID or provide a studio ID to save waitlist entries.')
      return
    }

    const payload = {
      customerProfileId: formState.customerProfileId,
      isActive: formState.isActive,
      locationId: formState.locationId,
      notes: formState.notes.trim(),
      preferredDate: formState.preferredDate || null,
      preferredEndTime: formState.preferredEndTime || null,
      preferredStaffProfileId: formState.preferredStaffProfileId || null,
      preferredStartTime: formState.preferredStartTime || null,
      serviceId: formState.serviceId,
      studioId,
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      if (editingEntry) {
        await updateWaitlistEntry(editingEntry.id, payload)
      } else {
        await createWaitlistEntry(payload)
      }

      await reload()
      closeDrawer()
    } catch (nextError) {
      setMutationError(nextError instanceof Error ? nextError.message : 'Unable to save waitlist entry right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingEntry) {
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      await deleteWaitlistEntry(editingEntry.id)
      await reload()
      closeDrawer()
    } catch (nextError) {
      setMutationError(nextError instanceof Error ? nextError.message : 'Unable to deactivate waitlist entry right now.')
    } finally {
      setIsSaving(false)
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
            Add to waitlist
          </button>
        ) : null}
        description="Track clients who want an earlier opening, preferred staff member, or a specific location when your schedule changes."
        eyebrow="Waitlist"
        title="Cancellation waitlist"
      />

      <section className="flex flex-wrap items-end gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
        <InlineSelect
          label="Status"
          onChange={(value) => setStatusFilter(value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
          options={['ACTIVE', 'INACTIVE', 'ALL']}
          value={statusFilter}
        />
      </section>

      <section>
        <SurfaceCard title="Waitlist entries">
          {isLoading ? <LoadingState title="Loading waitlist..." /> : null}
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
          {!isLoading && !error && visibleEntries.length === 0 ? (
            <EmptyState
              action={canManage ? (
                <button
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  onClick={openCreateDrawer}
                  type="button"
                >
                  Add the first entry
                </button>
              ) : null}
              description="Active waitlist requests will appear here so the front desk can spot open-slot opportunities quickly."
              title="No waitlist entries matched this view"
            />
          ) : null}
          {!isLoading && !error && visibleEntries.length > 0 ? (
            <DataTable columns={['Client', 'Location', 'Service', 'Preferred date', 'Preferred staff', 'Status']}>
              {visibleEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-4">
                    {canManage ? (
                      <button
                        className="font-semibold text-slate-950 transition hover:text-slate-700"
                        onClick={() => openEditDrawer(entry)}
                        type="button"
                      >
                        {entry.customerName}
                      </button>
                    ) : (
                      <span className="font-semibold text-slate-950">{entry.customerName}</span>
                    )}
                    {entry.notes ? <p className="mt-1 text-sm text-slate-500">{entry.notes}</p> : null}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{entry.locationName}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{entry.serviceName}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {entry.preferredDate ? formatDate(entry.preferredDate) : 'Flexible'}
                    {entry.preferredStartTime || entry.preferredEndTime ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {formatPreferredWindow(entry.preferredStartTime, entry.preferredEndTime)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{entry.preferredStaffName || 'Any staff'}</td>
                  <td className="px-4 py-4">
                    <StatusBadge tone={entry.isActive ? 'attention' : 'neutral'}>
                      {entry.isActive ? 'Waiting' : 'Inactive'}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : null}
        </SurfaceCard>
      </section>

      <DetailDrawer
        footer={
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              {editingEntry ? (
                <button
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                  disabled={isSaving}
                  onClick={() => setConfirmDeleteOpen(true)}
                  type="button"
                >
                  Deactivate entry
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
                disabled={isSaving}
                onClick={() => void handleSubmit()}
                type="button"
              >
                {isSaving ? 'Saving...' : editingEntry ? 'Save changes' : 'Create entry'}
              </button>
            </div>
          </div>
        }
        onClose={closeDrawer}
        open={isDrawerOpen}
        subtitle="Waitlist details"
        title={editingEntry ? 'Edit waitlist entry' : 'Add to waitlist'}
        variant={editingEntry ? 'drawer' : 'modal'}
      >
        <div className="space-y-5">
          {mutationError ? <ErrorState message={mutationError} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {!editingEntry && !defaultStudioId ? (
              <InputField
                error={formErrors.studioId}
                label="Studio ID"
                onChange={(event) => setFormState((current) => ({ ...current, studioId: event.target.value }))}
                placeholder="Paste the studio UUID"
                value={formState.studioId}
              />
            ) : null}
            <SelectField
              error={formErrors.customerProfileId}
              label="Client"
              onChange={(event) => setFormState((current) => ({ ...current, customerProfileId: event.target.value }))}
              value={formState.customerProfileId}
            >
              <option value="">Choose a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName}
                </option>
              ))}
            </SelectField>
            <SelectField
              error={formErrors.locationId}
              label="Location"
              onChange={(event) => setFormState((current) => ({ ...current, locationId: event.target.value }))}
              value={formState.locationId}
            >
              <option value="">Choose a location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              error={formErrors.serviceId}
              label="Service"
              onChange={(event) => setFormState((current) => ({ ...current, serviceId: event.target.value }))}
              value={formState.serviceId}
            >
              <option value="">Choose a service</option>
              {availableServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Preferred staff"
              onChange={(event) =>
                setFormState((current) => ({ ...current, preferredStaffProfileId: event.target.value }))
              }
              value={formState.preferredStaffProfileId}
            >
              <option value="">Any staff member</option>
              {availableStaff.map((staffMember) => (
                <option key={staffMember.id} value={staffMember.id}>
                  {staffMember.displayName}
                </option>
              ))}
            </SelectField>
            <InputField
              error={formErrors.preferredDate}
              label="Preferred date"
              min={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setFormState((current) => ({ ...current, preferredDate: event.target.value }))}
              type="date"
              value={formState.preferredDate}
            />
            <InputField
              error={formErrors.preferredStartTime}
              label="Preferred start time"
              onChange={(event) =>
                setFormState((current) => ({ ...current, preferredStartTime: event.target.value }))
              }
              type="time"
              value={formState.preferredStartTime}
            />
            <InputField
              error={formErrors.preferredEndTime}
              label="Preferred end time"
              onChange={(event) =>
                setFormState((current) => ({ ...current, preferredEndTime: event.target.value }))
              }
              type="time"
              value={formState.preferredEndTime}
            />
          </div>

          <TextAreaField
            label="Notes"
            onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))}
            placeholder="Preferred times, cancellation notice requests, or flexibility notes."
            value={formState.notes}
          />

          <ToggleField
            checked={formState.isActive}
            label="Active waitlist entry"
            onChange={(checked) => setFormState((current) => ({ ...current, isActive: checked }))}
          />
        </div>
      </DetailDrawer>

      <ConfirmDialog
        confirmLabel="Deactivate entry"
        description={`${editingEntry?.customerName ?? 'This client'} will stay in waitlist history, but the entry will no longer appear as active.`}
        isConfirming={isSaving}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        open={confirmDeleteOpen}
        title="Deactivate this waitlist entry?"
      />
    </div>
  )
}

function createWaitlistForm(
  studioId: string | null,
  locationId: string | null,
  entry?: WaitlistEntryRecord,
): WaitlistFormState {
  return {
    customerProfileId: entry?.customerProfileId ?? '',
    isActive: entry?.isActive ?? true,
    locationId: entry?.locationId ?? locationId ?? '',
    notes: entry?.notes ?? '',
    preferredDate: entry?.preferredDate ?? '',
    preferredEndTime: entry?.preferredEndTime ?? '',
    preferredStaffProfileId: entry?.preferredStaffProfileId ?? '',
    preferredStartTime: entry?.preferredStartTime ?? '',
    serviceId: entry?.serviceId ?? '',
    studioId: studioId ?? '',
  }
}

function validateWaitlistForm(formState: WaitlistFormState, studioId: string | null) {
  const errors: Partial<Record<keyof WaitlistFormState, string>> = {}

  if (!studioId && !formState.studioId.trim()) {
    errors.studioId = 'Studio ID is required to create a waitlist entry.'
  }

  if (!formState.customerProfileId) {
    errors.customerProfileId = 'Client is required.'
  }

  if (!formState.locationId) {
    errors.locationId = 'Location is required.'
  }

  if (!formState.serviceId) {
    errors.serviceId = 'Service is required.'
  }

  if (
    formState.preferredStartTime
    && formState.preferredEndTime
    && formState.preferredEndTime <= formState.preferredStartTime
  ) {
    errors.preferredEndTime = 'Preferred end time must be after the preferred start time.'
  }

  return errors
}

function formatPreferredWindow(startTime: string | null, endTime: string | null) {
  if (startTime && endTime) {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`
  }

  if (startTime) {
    return `After ${formatTime(startTime)}`
  }

  if (endTime) {
    return `Before ${formatTime(endTime)}`
  }

  return 'Flexible time'
}

function InlineSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: string[]
  value: string
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <select
        className="h-12 min-w-[180px] rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === 'ALL' ? 'All entries' : option === 'ACTIVE' ? 'Active entries' : 'Inactive entries'}
          </option>
        ))}
      </select>
    </label>
  )
}
