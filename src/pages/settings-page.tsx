import { useCallback, useEffect, useMemo, useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { ActivityFeed } from '../components/ui/activity-feed'
import { DetailDrawer } from '../components/ui/detail-drawer'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { InputField, SelectField, ToggleField } from '../components/ui/form-controls'
import { PageHeader } from '../components/ui/page-header'
import { canViewAuditHistory } from '../features/auth/authorization'
import { useAuth } from '../features/auth/use-auth'
import { useRemoteList } from '../hooks/use-remote-list'
import { getAuditLogs } from '../lib/api/audit-api'
import { createLocation, deleteLocation, getLocations, updateLocation } from '../lib/api/locations-api'
import { dispatchReminderSweepNow, getReminderSettings, updateReminderSettings } from '../lib/api/settings-api'
import { timezoneOptions } from '../lib/timezones'
import type { LocationRecord, LocationUpsertPayload, ReminderSettingsRecord } from '../lib/api/types'

type LocationFormState = LocationUpsertPayload
type LocationFormErrors = Partial<Record<keyof LocationFormState, string>>
type ReminderSettingsFormState = {
  appointmentReminderEnabled: boolean
  appointmentReminderEmailEnabled: boolean
  appointmentReminderInAppEnabled: boolean
  appointmentReminderOffsetsHours: number[]
  appointmentReminderSmsEnabled: boolean
}

const REMINDER_OFFSET_PRESETS = [1, 2, 4, 12, 24, 48, 72]

export function SettingsPage() {
  const { selectedLocationId, setSelectedLocationId, user } = useAuth()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<LocationRecord | null>(null)
  const [formState, setFormState] = useState<LocationFormState>(createLocationForm(user?.studioId ?? null))
  const [formErrors, setFormErrors] = useState<LocationFormErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [confirmDeleteLocation, setConfirmDeleteLocation] = useState<LocationRecord | null>(null)
  const [isSavingReminderSettings, setIsSavingReminderSettings] = useState(false)
  const [isRunningReminderSweep, setIsRunningReminderSweep] = useState(false)
  const [reminderMutationError, setReminderMutationError] = useState<string | null>(null)
  const [reminderSuccessMessage, setReminderSuccessMessage] = useState<string | null>(null)
  const [reminderFormState, setReminderFormState] = useState<ReminderSettingsFormState>(createReminderSettingsForm())
  const [customReminderOffsetInput, setCustomReminderOffsetInput] = useState('')
  const [customReminderOffsetError, setCustomReminderOffsetError] = useState<string | null>(null)
  const [reminderSettings, setReminderSettings] = useState<ReminderSettingsRecord | null>(null)
  const [reminderSettingsError, setReminderSettingsError] = useState<string | null>(null)
  const [reminderSettingsLoading, setReminderSettingsLoading] = useState(true)

  const loadLocations = useCallback(() => getLocations(user?.studioId), [user?.studioId])
  const { data: locations, error, isLoading, reload } = useRemoteList(loadLocations)
  const canViewActivity = user ? canViewAuditHistory(user.role) : false
  const loadAuditLogs = useCallback(
    () => (canViewActivity ? getAuditLogs({ limit: 8, locationId: selectedLocationId }) : Promise.resolve([])),
    [canViewActivity, selectedLocationId],
  )
  const {
    data: auditLogs,
    error: auditError,
    isLoading: auditLoading,
    reload: reloadAuditLogs,
  } = useRemoteList(loadAuditLogs)

  const activeLocationCount = useMemo(
    () => locations.filter((location) => location.isActive).length,
    [locations],
  )

  useEffect(() => {
    if (!reminderSettings) {
      return
    }

    setReminderFormState(createReminderSettingsForm(reminderSettings))
    setCustomReminderOffsetInput('')
    setCustomReminderOffsetError(null)
  }, [reminderSettings])

  const reloadReminderSettings = useCallback(async () => {
    if (!user?.studioId) {
      setReminderSettings(null)
      setReminderSettingsError(null)
      setReminderSettingsLoading(false)
      return
    }

    setReminderSettingsLoading(true)
    setReminderSettingsError(null)

    try {
      const nextReminderSettings = await getReminderSettings(user.studioId)
      setReminderSettings(nextReminderSettings)
    } catch (nextError) {
      setReminderSettingsError(nextError instanceof Error ? nextError.message : 'Unable to load reminder settings right now.')
    } finally {
      setReminderSettingsLoading(false)
    }
  }, [user?.studioId])

  useEffect(() => {
    void reloadReminderSettings()
  }, [reloadReminderSettings])

  const openCreateDrawer = () => {
    setEditingLocation(null)
    setFormErrors({})
    setMutationError(null)
    setFormState(createLocationForm(user?.studioId ?? null))
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (location: LocationRecord) => {
    setEditingLocation(location)
    setFormErrors({})
    setMutationError(null)
    setFormState({
      addressLine1: location.addressLine1 ?? '',
      addressLine2: location.addressLine2 ?? '',
      city: location.city ?? '',
      country: location.country ?? '',
      email: location.email ?? '',
      isActive: location.isActive,
      name: location.name,
      phone: location.phone ?? '',
      postalCode: location.postalCode ?? '',
      provinceOrState: location.provinceOrState ?? '',
      slug: location.slug,
      studioId: location.studioId,
      timezone: location.timezone,
    })
    setIsDrawerOpen(true)
  }

  const handleSave = async () => {
    const nextErrors = validateLocationForm(formState)
    setFormErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, formState)
      } else {
        await createLocation(formState)
      }

      await reload()
      if (canViewActivity) {
        await reloadAuditLogs()
      }
      setIsDrawerOpen(false)
    } catch (nextError) {
      setMutationError(nextError instanceof Error ? nextError.message : 'Unable to save the location right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (location: LocationRecord) => {
    try {
      await deleteLocation(location.id)
      if (selectedLocationId === location.id) {
        setSelectedLocationId(null)
      }
      await reload()
      if (canViewActivity) {
        await reloadAuditLogs()
      }
    } catch (nextError) {
      setMutationError(nextError instanceof Error ? nextError.message : 'Unable to archive this location right now.')
    }
  }

  const handleSaveReminderSettings = async () => {
    if (!user?.studioId) {
      setReminderMutationError('Studio settings are not available for this account yet.')
      return
    }

    const reminderOffsets = normalizeReminderOffsets(reminderFormState.appointmentReminderOffsetsHours)

    if (reminderOffsets.length === 0) {
      setReminderMutationError('Select at least one reminder offset before saving.')
      return
    }

    setIsSavingReminderSettings(true)
    setReminderMutationError(null)
    setReminderSuccessMessage(null)

    try {
      await updateReminderSettings({
        appointmentReminderEnabled: reminderFormState.appointmentReminderEnabled,
        appointmentReminderEmailEnabled: reminderFormState.appointmentReminderEmailEnabled,
        appointmentReminderHoursBefore: reminderOffsets[0],
        appointmentReminderInAppEnabled: reminderFormState.appointmentReminderInAppEnabled,
        appointmentReminderOffsetsHours: reminderOffsets,
        appointmentReminderSmsEnabled: reminderFormState.appointmentReminderSmsEnabled,
        studioId: user.studioId,
      })
      await reloadReminderSettings()
      if (canViewActivity) {
        await reloadAuditLogs()
      }
      setReminderSuccessMessage(`Reminder schedule saved for ${formatReminderOffsets(reminderOffsets)}.`)
    } catch (nextError) {
      setReminderMutationError(nextError instanceof Error ? nextError.message : 'Unable to save reminder settings right now.')
    } finally {
      setIsSavingReminderSettings(false)
    }
  }

  const handleRunReminderSweep = async () => {
    if (!user?.studioId) {
      setReminderMutationError('Studio settings are not available for this account yet.')
      return
    }

    setIsRunningReminderSweep(true)
    setReminderMutationError(null)
    setReminderSuccessMessage(null)

    try {
      const result = await dispatchReminderSweepNow(user.studioId)
      setReminderSuccessMessage(
        result.dispatchedCount > 0
          ? `Reminder sweep generated ${result.dispatchedCount} reminder ${result.dispatchedCount === 1 ? 'batch' : 'batches'} for ${formatReminderOffsets(result.reminderOffsetsHours)}.`
          : 'Reminder sweep completed. No reminders were due right now.',
      )
      await reloadReminderSettings()
      if (canViewActivity) {
        await reloadAuditLogs()
      }
    } catch (nextError) {
      setReminderMutationError(nextError instanceof Error ? nextError.message : 'Unable to run the reminder sweep right now.')
    } finally {
      setIsRunningReminderSweep(false)
    }
  }

  const handleToggleReminderOffset = (offsetHours: number) => {
    setCustomReminderOffsetError(null)
    setReminderMutationError(null)
    setReminderFormState((current) => ({
      ...current,
      appointmentReminderOffsetsHours: current.appointmentReminderOffsetsHours.includes(offsetHours)
        ? current.appointmentReminderOffsetsHours.filter((offset) => offset !== offsetHours)
        : normalizeReminderOffsets([...current.appointmentReminderOffsetsHours, offsetHours]),
    }))
  }

  const handleAddCustomReminderOffset = () => {
    const value = Number(customReminderOffsetInput.trim())

    if (!Number.isInteger(value) || value < 1 || value > 168) {
      setCustomReminderOffsetError('Enter a whole number of hours between 1 and 168.')
      return
    }

    if (reminderFormState.appointmentReminderOffsetsHours.includes(value)) {
      setCustomReminderOffsetError(`${value}h is already in the reminder schedule.`)
      return
    }

    setCustomReminderOffsetError(null)
    setReminderMutationError(null)
    setReminderFormState((current) => ({
      ...current,
      appointmentReminderOffsetsHours: normalizeReminderOffsets([...current.appointmentReminderOffsetsHours, value]),
    }))
    setCustomReminderOffsetInput('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
            onClick={openCreateDrawer}
            type="button"
          >
            Add location
          </button>
        }
        description="Manage the studio workspace and its active locations without leaving the premium operations shell."
        eyebrow="Settings"
        title="Studio configuration"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <SurfaceCard title="Locations">
          {mutationError ? <ErrorState message={mutationError} /> : null}
          {isLoading ? <LoadingState title="Loading locations..." /> : null}
          {!isLoading && error ? <ErrorState message={error} /> : null}
          {!isLoading && !error && locations.length === 0 ? (
            <EmptyState
              action={
                <button
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  onClick={openCreateDrawer}
                  type="button"
                >
                  Create your first location
                </button>
              }
              description="Locations let your team switch context cleanly across multiple branches, calendars, and public booking surfaces."
              title="No locations yet"
            />
          ) : null}
          {!isLoading && !error && locations.length > 0 ? (
            <div className="space-y-4">
              {locations.map((location) => {
                const isSelected = location.id === selectedLocationId
                return (
                  <div
                    key={location.id}
                    className={[
                      'rounded-[26px] border px-5 py-5 transition',
                      isSelected
                        ? 'border-slate-900 bg-slate-950 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]'
                        : 'border-slate-200 bg-slate-50',
                    ].join(' ')}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold">{location.name}</h3>
                          <span
                            className={[
                              'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]',
                              isSelected
                                ? 'bg-white/10 text-white'
                                : location.isActive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-200 text-slate-600',
                            ].join(' ')}
                          >
                            {isSelected ? 'Current' : location.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className={['mt-2 text-sm leading-7', isSelected ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
                          {[location.addressLine1, location.city, location.provinceOrState].filter(Boolean).join(', ') || 'Address pending'}
                        </p>
                        <p className={['mt-1 text-sm', isSelected ? 'text-slate-400' : 'text-slate-500'].join(' ')}>
                          {location.email || 'No email'} · {location.phone || 'No phone'} · {location.timezone}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          className={[
                            'rounded-full border px-4 py-2 text-sm font-semibold transition',
                            isSelected
                              ? 'border-white/20 bg-white/10 text-white'
                              : 'border-slate-200 bg-white text-slate-700',
                          ].join(' ')}
                          onClick={() => setSelectedLocationId(location.id)}
                          type="button"
                        >
                          Switch here
                        </button>
                        <button
                          className={[
                            'rounded-full border px-4 py-2 text-sm font-semibold transition',
                            isSelected
                              ? 'border-white/20 bg-white/10 text-white'
                              : 'border-slate-200 bg-white text-slate-700',
                          ].join(' ')}
                          onClick={() => openEditDrawer(location)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className={[
                            'rounded-full border px-4 py-2 text-sm font-semibold transition',
                            isSelected
                              ? 'border-rose-200/20 bg-rose-500/10 text-white'
                              : 'border-rose-200 bg-rose-50 text-rose-700',
                          ].join(' ')}
                          onClick={() => setConfirmDeleteLocation(location)}
                          type="button"
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard title="Workspace summary">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Studio</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{user?.studioId ? 'Connected workspace' : 'Onboarding needed'}</p>
              <div className="mt-5 grid gap-3">
                <MetricRow label="Active locations" value={String(activeLocationCount)} />
                <MetricRow label="Current location" value={locations.find((location) => location.id === selectedLocationId)?.name ?? 'Not selected'} />
                <MetricRow label="Settings access" value="Admin" />
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard title="Appointment reminders">
            {reminderSettingsLoading ? <LoadingState title="Loading reminder settings..." /> : null}
            {!reminderSettingsLoading && reminderSettingsError ? <ErrorState message={reminderSettingsError} /> : null}
            {!reminderSettingsLoading && !reminderSettingsError ? (
              <div className="space-y-4">
                {reminderMutationError ? <ErrorState message={reminderMutationError} /> : null}
                {reminderSuccessMessage ? (
                  <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {reminderSuccessMessage}
                  </div>
                ) : null}
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm leading-7 text-slate-600">
                    Control how far in advance StudioFlow generates appointment reminder events for upcoming bookings.
                  </p>
                  <div className="mt-5 space-y-4">
                    <ToggleField
                      checked={reminderFormState.appointmentReminderEnabled}
                      label="Appointment reminders"
                      onChange={(checked) =>
                        setReminderFormState((current) => ({ ...current, appointmentReminderEnabled: checked }))
                      }
                    />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <ToggleField
                        checked={reminderFormState.appointmentReminderInAppEnabled}
                        label="In-app reminders"
                        onChange={(checked) =>
                          setReminderFormState((current) => ({ ...current, appointmentReminderInAppEnabled: checked }))
                        }
                      />
                      <ToggleField
                        checked={reminderFormState.appointmentReminderEmailEnabled}
                        label="Email reminders"
                        onChange={(checked) =>
                          setReminderFormState((current) => ({ ...current, appointmentReminderEmailEnabled: checked }))
                        }
                      />
                      <ToggleField
                        checked={reminderFormState.appointmentReminderSmsEnabled}
                        label="SMS reminders"
                        onChange={(checked) =>
                          setReminderFormState((current) => ({ ...current, appointmentReminderSmsEnabled: checked }))
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Reminder schedule</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {reminderFormState.appointmentReminderOffsetsHours.length > 0 ? (
                            reminderFormState.appointmentReminderOffsetsHours.map((offset) => (
                              <button
                                key={offset}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition"
                                onClick={() => handleToggleReminderOffset(offset)}
                                type="button"
                              >
                                {offset}h
                                <span className="text-xs text-slate-300">Remove</span>
                              </button>
                            ))
                          ) : (
                            <div className="rounded-full border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-500">
                              No reminder offsets selected yet
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Quick presets</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {REMINDER_OFFSET_PRESETS.map((offset) => {
                            const isSelected = reminderFormState.appointmentReminderOffsetsHours.includes(offset)
                            return (
                              <button
                                key={offset}
                                className={[
                                  'rounded-full border px-4 py-2 text-sm font-semibold transition',
                                  isSelected
                                    ? 'border-slate-900 bg-slate-950 text-white'
                                    : 'border-slate-200 bg-white text-slate-700',
                                ].join(' ')}
                                onClick={() => handleToggleReminderOffset(offset)}
                                type="button"
                              >
                                {offset}h
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Custom offset</p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <div className="min-w-[180px] flex-1">
                            <InputField
                              error={customReminderOffsetError}
                              label="Add hours"
                              min={1}
                              onChange={(event) => {
                                setCustomReminderOffsetInput(event.target.value)
                                if (customReminderOffsetError) {
                                  setCustomReminderOffsetError(null)
                                }
                              }}
                              placeholder="36"
                              type="number"
                              value={customReminderOffsetInput}
                            />
                          </div>
                          <button
                            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] disabled:cursor-not-allowed disabled:text-slate-400"
                            disabled={!customReminderOffsetInput.trim()}
                            onClick={handleAddCustomReminderOffset}
                            type="button"
                          >
                            Add custom offset
                          </button>
                        </div>
                        <p className="mt-2 text-xs leading-6 text-slate-500">
                          Saved reminders stay sorted from furthest to nearest. Common schedules like <span className="font-semibold text-slate-700">24h + 4h</span> can be built with the presets above.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button
                      className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] disabled:cursor-not-allowed disabled:text-slate-400"
                      disabled={isRunningReminderSweep || isSavingReminderSettings}
                      onClick={() => void handleRunReminderSweep()}
                      type="button"
                    >
                      {isRunningReminderSweep ? 'Running sweep...' : 'Run reminder sweep now'}
                    </button>
                    <button
                      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] disabled:cursor-not-allowed disabled:bg-slate-300"
                      disabled={isSavingReminderSettings || isRunningReminderSweep}
                      onClick={() => void handleSaveReminderSettings()}
                      type="button"
                    >
                      {isSavingReminderSettings ? 'Saving...' : 'Save reminder settings'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </SurfaceCard>

          <SurfaceCard title="Operational notes">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              Location selection now scopes the calendar, appointments, and public booking experience. Services remain studio-level for now to keep multi-location rollout practical and clean.
            </div>
          </SurfaceCard>

          {canViewActivity ? (
            <SurfaceCard title="Activity history">
              <ActivityFeed
                emptyDescription="Admin activity will appear here as the team changes locations, onboarding settings, and operational records."
                entries={auditLogs}
                error={auditError}
                isLoading={auditLoading}
                onRetry={() => void reloadAuditLogs()}
              />
            </SurfaceCard>
          ) : null}
        </div>
      </div>

      <DetailDrawer
        footer={
          <div className="flex justify-end gap-3">
            <button
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600"
              onClick={() => setIsDrawerOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isSaving}
              onClick={() => void handleSave()}
              type="button"
            >
              {isSaving ? 'Saving...' : editingLocation ? 'Save location' : 'Create location'}
            </button>
          </div>
        }
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        panelClassName={editingLocation ? undefined : 'max-w-[960px]'}
        subtitle="Location record"
        title={editingLocation ? editingLocation.name : 'New location'}
        variant={editingLocation ? 'drawer' : 'modal'}
      >
        <div className="space-y-4">
          <InputField
            error={formErrors.name}
            label="Location name"
            onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
            value={formState.name}
          />
          <InputField
            label="Slug"
            onChange={(event) => setFormState((current) => ({ ...current, slug: event.target.value }))}
            placeholder="downtown-atelier"
            value={formState.slug}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              error={formErrors.email}
              label="Email"
              onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
              type="email"
              value={formState.email}
            />
            <InputField
              label="Phone"
              onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))}
              value={formState.phone}
            />
            <SelectField
              error={formErrors.timezone}
              label="Timezone"
              onChange={(event) => setFormState((current) => ({ ...current, timezone: event.target.value }))}
              value={formState.timezone}
            >
              {timezoneOptions.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
              ))}
            </SelectField>
            <InputField
              label="Country"
              onChange={(event) => setFormState((current) => ({ ...current, country: event.target.value }))}
              value={formState.country}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Address line 1"
              onChange={(event) => setFormState((current) => ({ ...current, addressLine1: event.target.value }))}
              value={formState.addressLine1}
            />
            <InputField
              label="Address line 2"
              onChange={(event) => setFormState((current) => ({ ...current, addressLine2: event.target.value }))}
              value={formState.addressLine2}
            />
            <InputField
              label="City"
              onChange={(event) => setFormState((current) => ({ ...current, city: event.target.value }))}
              value={formState.city}
            />
            <InputField
              label="Province or state"
              onChange={(event) => setFormState((current) => ({ ...current, provinceOrState: event.target.value }))}
              value={formState.provinceOrState}
            />
            <InputField
              label="Postal code"
              onChange={(event) => setFormState((current) => ({ ...current, postalCode: event.target.value }))}
              value={formState.postalCode}
            />
          </div>
          <ToggleField
            checked={Boolean(formState.isActive)}
            label="Location active"
            onChange={(checked) => setFormState((current) => ({ ...current, isActive: checked }))}
          />
        </div>
      </DetailDrawer>

      <ConfirmDialog
        confirmLabel="Archive location"
        description={`${confirmDeleteLocation?.name ?? 'This location'} will be archived and removed from active switching and public booking selection.`}
        isConfirming={isSaving}
        onCancel={() => setConfirmDeleteLocation(null)}
        onConfirm={() => {
          if (confirmDeleteLocation) {
            void handleDelete(confirmDeleteLocation).finally(() => setConfirmDeleteLocation(null))
          }
        }}
        open={Boolean(confirmDeleteLocation)}
        title="Archive this location?"
      />
    </div>
  )
}

function createReminderSettingsForm(settings?: ReminderSettingsRecord | null): ReminderSettingsFormState {
  return {
    appointmentReminderEnabled: settings?.appointmentReminderEnabled ?? true,
    appointmentReminderEmailEnabled: settings?.appointmentReminderEmailEnabled ?? true,
    appointmentReminderInAppEnabled: settings?.appointmentReminderInAppEnabled ?? true,
    appointmentReminderOffsetsHours: normalizeReminderOffsets(
      settings?.appointmentReminderOffsetsHours ?? [settings?.appointmentReminderHoursBefore ?? 24],
    ),
    appointmentReminderSmsEnabled: settings?.appointmentReminderSmsEnabled ?? true,
  }
}

function normalizeReminderOffsets(offsets: number[]) {
  return Array.from(
    new Set(
      offsets.filter((hours) => Number.isInteger(hours) && hours >= 1 && hours <= 168),
    ),
  ).sort((left, right) => right - left)
}

function formatReminderOffsets(offsets: number[]) {
  if (offsets.length === 0) {
    return 'the current schedule'
  }

  return offsets.map((offset) => `${offset}h`).join(', ')
}

function createLocationForm(studioId: string | null): LocationFormState {
  return {
    addressLine1: '',
    addressLine2: '',
    city: '',
    country: 'Canada',
    email: '',
    isActive: true,
    name: '',
    phone: '',
    postalCode: '',
    provinceOrState: '',
    slug: '',
    studioId: studioId ?? '',
    timezone: 'America/Edmonton',
  }
}

function validateLocationForm(formState: LocationFormState) {
  const errors: LocationFormErrors = {}

  if (!formState.studioId) {
    errors.studioId = 'Studio ID is required.'
  }

  if (!formState.name.trim()) {
    errors.name = 'Location name is required.'
  }

  if (!formState.timezone.trim()) {
    errors.timezone = 'Timezone is required.'
  }

  if (formState.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  return errors
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/80 bg-white px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}
