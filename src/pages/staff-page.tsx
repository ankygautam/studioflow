import { useCallback, useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { DataTable } from '../components/ui/data-table'
import { DetailDrawer } from '../components/ui/detail-drawer'
import { InputField, SelectField, TextAreaField } from '../components/ui/form-controls'
import { PageHeader } from '../components/ui/page-header'
import { StatusBadge } from '../components/ui/status-badge'
import { canManageStaff } from '../features/auth/authorization'
import { isValidEmail } from '../features/auth/auth-utils'
import { useAuth } from '../features/auth/use-auth'
import { useRemoteList } from '../hooks/use-remote-list'
import { getDefaultStudioId } from '../lib/api/http'
import { createStaff, deleteStaff, getStaff, updateStaff } from '../lib/api/staff-api'
import type { StaffRecord, StaffStatus, UserRole } from '../lib/api/types'
import { humanizeEnum } from '../lib/formatters'

type StaffFormState = {
  accountPassword: string
  accountRole: Extract<UserRole, 'STAFF' | 'RECEPTIONIST'>
  userEmail: string
  avatarUrl: string
  bio: string
  displayName: string
  jobTitle: string
  phone: string
  status: StaffStatus
  studioId: string
  userId: string
}

const staffStatuses: StaffStatus[] = ['ACTIVE', 'ON_LEAVE', 'INACTIVE']
const staffAccountRoles: Array<Extract<UserRole, 'STAFF' | 'RECEPTIONIST'>> = ['STAFF', 'RECEPTIONIST']

export function StaffPage() {
  const { selectedLocationId, user } = useAuth()
  const canManage = user ? canManageStaff(user.role) : false
  const defaultStudioId = user?.studioId ?? getDefaultStudioId()
  const loadStaff = useCallback(
    () => getStaff(defaultStudioId, selectedLocationId),
    [defaultStudioId, selectedLocationId],
  )
  const { data: staffMembers, error, isLoading, reload } = useRemoteList(loadStaff)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof StaffFormState, string>>>({})
  const [formState, setFormState] = useState<StaffFormState>(createStaffForm(defaultStudioId))

  const openCreateDrawer = () => {
    setEditingStaff(null)
    setMutationError(null)
    setFormErrors({})
    setFormState(createStaffForm(defaultStudioId))
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (staffMember: StaffRecord) => {
    setEditingStaff(staffMember)
    setMutationError(null)
    setFormErrors({})
    setFormState(createStaffForm(staffMember.studioId, staffMember))
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setEditingStaff(null)
    setMutationError(null)
    setFormErrors({})
    setConfirmDeleteOpen(false)
  }

  const handleSubmit = async () => {
    const errors = validateStaffForm(formState, editingStaff?.studioId ?? defaultStudioId)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const studioId = editingStaff?.studioId ?? defaultStudioId ?? formState.studioId.trim()

    if (!studioId) {
      setMutationError('Set VITE_STUDIO_ID or provide a studio ID to save staff profiles.')
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, {
          avatarUrl: formState.avatarUrl.trim(),
          bio: formState.bio.trim(),
          displayName: formState.displayName.trim(),
          jobTitle: formState.jobTitle.trim(),
          phone: formState.phone.trim(),
          status: formState.status,
          studioId,
          userId: formState.userId.trim(),
        })
      } else {
        await createStaff({
          avatarUrl: formState.avatarUrl.trim(),
          bio: formState.bio.trim(),
          displayName: formState.displayName.trim(),
          jobTitle: formState.jobTitle.trim(),
          phone: formState.phone.trim(),
          status: formState.status,
          studioId,
          temporaryPassword: formState.accountPassword.trim(),
          userEmail: formState.userEmail.trim(),
          userRole: formState.accountRole,
        })
      }

      await reload()
      closeDrawer()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to save staff right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingStaff) {
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      await deleteStaff(editingStaff.id)
      await reload()
      closeDrawer()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to update staff status right now.')
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
            Add staff
          </button>
        ) : null}
        description="A simple staff table with clean profile editing, linked user records, and active status visibility."
        eyebrow="Staff"
        title="Team visibility"
      />

      <section className="grid gap-6">
        <SurfaceCard title="Staff roster">
          {isLoading ? <LoadingState title="Loading staff..." /> : null}
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
          {!isLoading && !error && staffMembers.length === 0 ? (
            <EmptyState
              action={canManage ? (
                <button
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  onClick={openCreateDrawer}
                  type="button"
                >
                  Add the first staff profile
                </button>
              ) : null}
              description="Staff profiles will appear here once linked to real backend user accounts."
              title="No staff profiles yet"
            />
          ) : null}
          {!isLoading && !error && staffMembers.length > 0 ? (
            <DataTable columns={['Staff member', 'Location', 'Job title', 'Status', 'Linked account']}>
              {staffMembers.map((staffMember) => (
                <tr key={staffMember.id}>
                  <td className="px-4 py-4">
                    {canManage ? (
                      <button
                        className="font-semibold text-slate-950 transition hover:text-slate-700"
                        onClick={() => openEditDrawer(staffMember)}
                        type="button"
                      >
                        {staffMember.displayName}
                      </button>
                    ) : (
                      <span className="font-semibold text-slate-950">{staffMember.displayName}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{staffMember.primaryLocationName || 'Studio-wide'}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{staffMember.jobTitle || 'Not set'}</td>
                  <td className="px-4 py-4">
                    <StatusBadge tone={staffTone(staffMember.status)}>{humanizeEnum(staffMember.status)}</StatusBadge>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {staffMember.userEmail || staffMember.userFullName || 'Linked user pending'}
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
              {editingStaff ? (
                <button
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                  disabled={isSaving}
                  onClick={() => setConfirmDeleteOpen(true)}
                  type="button"
                >
                  Mark inactive
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
                {isSaving ? 'Saving...' : editingStaff ? 'Save changes' : 'Create profile'}
              </button>
            </div>
          </div>
        }
        onClose={closeDrawer}
        open={isDrawerOpen}
        variant={editingStaff ? 'drawer' : 'modal'}
        subtitle="Staff details"
        title={editingStaff ? editingStaff.displayName : 'Add staff'}
      >
        <div className="space-y-5">
          {mutationError ? <ErrorState message={mutationError} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {!editingStaff && !defaultStudioId ? (
              <InputField
                error={formErrors.studioId}
                label="Studio ID"
                onChange={(event) => setFormState((current) => ({ ...current, studioId: event.target.value }))}
                placeholder="Paste the studio UUID"
                value={formState.studioId}
              />
            ) : null}
            {editingStaff ? (
              <InputField
                disabled
                label="Linked account"
                value={editingStaff.userEmail || editingStaff.userFullName || 'Linked account'}
              />
            ) : (
              <InputField
                autoComplete="email"
                error={formErrors.userEmail}
                label="Account email"
                onChange={(event) => setFormState((current) => ({ ...current, userEmail: event.target.value }))}
                placeholder="name@studioflow.co"
                type="email"
                value={formState.userEmail}
              />
            )}
            <InputField
              error={formErrors.displayName}
              label="Display name"
              onChange={(event) => setFormState((current) => ({ ...current, displayName: event.target.value }))}
              placeholder="Nina Hart"
              value={formState.displayName}
            />
            <InputField
              label="Job title"
              onChange={(event) => setFormState((current) => ({ ...current, jobTitle: event.target.value }))}
              placeholder="Senior tattoo artist"
              value={formState.jobTitle}
            />
            {editingStaff ? (
              <InputField
                disabled
                label="Account role"
                value={editingStaff.userRole ? humanizeEnum(editingStaff.userRole) : 'Internal user'}
              />
            ) : (
              <SelectField
                error={formErrors.accountRole}
                label="Account role"
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    accountRole: event.target.value as Extract<UserRole, 'STAFF' | 'RECEPTIONIST'>,
                  }))
                }
                value={formState.accountRole}
              >
                {staffAccountRoles.map((role) => (
                  <option key={role} value={role}>
                    {humanizeEnum(role)}
                  </option>
                ))}
              </SelectField>
            )}
            <InputField
              label="Phone"
              onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))}
              placeholder="(555) 123-4567"
              value={formState.phone}
            />
            {!editingStaff ? (
              <InputField
                autoComplete="new-password"
                error={formErrors.accountPassword}
                label="Temporary password"
                onChange={(event) =>
                  setFormState((current) => ({ ...current, accountPassword: event.target.value }))
                }
                placeholder="At least 8 characters"
                type="password"
                value={formState.accountPassword}
              />
            ) : null}
            <InputField
              label="Avatar URL"
              onChange={(event) => setFormState((current) => ({ ...current, avatarUrl: event.target.value }))}
              placeholder="https://..."
              value={formState.avatarUrl}
            />
            <SelectField
              error={formErrors.status}
              label="Status"
              onChange={(event) =>
                setFormState((current) => ({ ...current, status: event.target.value as StaffStatus }))
              }
              value={formState.status}
            >
              {staffStatuses.map((status) => (
                <option key={status} value={status}>
                  {humanizeEnum(status)}
                </option>
              ))}
            </SelectField>
          </div>
          <TextAreaField
            label="Bio"
            onChange={(event) => setFormState((current) => ({ ...current, bio: event.target.value }))}
            placeholder="Add specialties, availability context, or operational notes."
            value={formState.bio}
          />
        </div>
      </DetailDrawer>

      <ConfirmDialog
        confirmLabel="Mark inactive"
        description={`${editingStaff?.displayName ?? 'This staff profile'} will be kept for history, but will no longer appear as active in day-to-day scheduling.`}
        isConfirming={isSaving}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        open={confirmDeleteOpen}
        title="Mark this staff profile inactive?"
      />
    </div>
  )
}

function createStaffForm(studioId: string | null, staffMember?: StaffRecord): StaffFormState {
  return {
    accountPassword: '',
    accountRole:
      staffMember?.userRole && (staffMember.userRole === 'STAFF' || staffMember.userRole === 'RECEPTIONIST')
        ? staffMember.userRole
        : 'STAFF',
    userEmail: staffMember?.userEmail ?? '',
    avatarUrl: staffMember?.avatarUrl ?? '',
    bio: staffMember?.bio ?? '',
    displayName: staffMember?.displayName ?? '',
    jobTitle: staffMember?.jobTitle ?? '',
    phone: staffMember?.phone ?? '',
    status: staffMember?.status ?? 'ACTIVE',
    studioId: studioId ?? '',
    userId: staffMember?.userId ?? '',
  }
}

function validateStaffForm(formState: StaffFormState, studioId: string | null) {
  const errors: Partial<Record<keyof StaffFormState, string>> = {}
  const isEditing = Boolean(formState.userId)

  if (!studioId && !formState.studioId.trim()) {
    errors.studioId = 'Studio ID is required to create a staff profile.'
  }

  if (!isEditing) {
    if (!formState.userEmail.trim()) {
      errors.userEmail = 'Account email is required.'
    } else if (!isValidEmail(formState.userEmail)) {
      errors.userEmail = 'Enter a valid email address.'
    }

    if (!formState.accountPassword.trim()) {
      errors.accountPassword = 'Temporary password is required.'
    } else if (formState.accountPassword.trim().length < 8) {
      errors.accountPassword = 'Temporary password must be at least 8 characters.'
    }
  }

  if (!formState.displayName.trim()) {
    errors.displayName = 'Display name is required.'
  }

  if (!formState.status) {
    errors.status = 'Status is required.'
  }

  return errors
}

function staffTone(status: StaffStatus) {
  if (status === 'ACTIVE') return 'success' as const
  if (status === 'ON_LEAVE') return 'attention' as const
  return 'neutral' as const
}
