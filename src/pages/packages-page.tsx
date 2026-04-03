import { useCallback, useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { DataTable } from '../components/ui/data-table'
import { DetailDrawer } from '../components/ui/detail-drawer'
import { InputField, TextAreaField, ToggleField } from '../components/ui/form-controls'
import { PageHeader } from '../components/ui/page-header'
import { StatusBadge } from '../components/ui/status-badge'
import { canManagePackages } from '../features/auth/authorization'
import { useAuth } from '../features/auth/use-auth'
import { useRemoteList } from '../hooks/use-remote-list'
import { getDefaultStudioId } from '../lib/api/http'
import { createPackage, deletePackage, getPackages, updatePackage } from '../lib/api/packages-api'
import type { PackageRecord } from '../lib/api/types'
import { formatCurrency } from '../lib/formatters'

type PackageFormState = {
  description: string
  expiresAfterDays: string
  isActive: boolean
  name: string
  price: string
  sessionCount: string
  studioId: string
}

export function PackagesPage() {
  const { user } = useAuth()
  const canManage = user ? canManagePackages(user.role) : false
  const defaultStudioId = getDefaultStudioId()
  const loadPackages = useCallback(() => getPackages(defaultStudioId), [defaultStudioId])
  const { data: packages, error, isLoading, reload } = useRemoteList(loadPackages)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [editingPackage, setEditingPackage] = useState<PackageRecord | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PackageFormState, string>>>({})
  const [formState, setFormState] = useState<PackageFormState>(createPackageForm(defaultStudioId))

  const openCreateDrawer = () => {
    setEditingPackage(null)
    setMutationError(null)
    setFormErrors({})
    setFormState(createPackageForm(defaultStudioId))
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (pkg: PackageRecord) => {
    setEditingPackage(pkg)
    setMutationError(null)
    setFormErrors({})
    setFormState(createPackageForm(pkg.studioId, pkg))
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setEditingPackage(null)
    setMutationError(null)
    setFormErrors({})
    setConfirmDeleteOpen(false)
  }

  const handleSubmit = async () => {
    const errors = validatePackageForm(formState, editingPackage?.studioId ?? defaultStudioId)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const studioId = editingPackage?.studioId ?? defaultStudioId ?? formState.studioId.trim()

    if (!studioId) {
      setMutationError('Set VITE_STUDIO_ID or provide a studio ID to save packages.')
      return
    }

    const payload = {
      description: formState.description.trim(),
      expiresAfterDays: formState.expiresAfterDays ? Number(formState.expiresAfterDays) : null,
      isActive: formState.isActive,
      name: formState.name.trim(),
      price: Number(formState.price),
      sessionCount: Number(formState.sessionCount),
      studioId,
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      if (editingPackage) {
        await updatePackage(editingPackage.id, payload)
      } else {
        await createPackage(payload)
      }

      await reload()
      closeDrawer()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to save package right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingPackage) {
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      await deletePackage(editingPackage.id)
      await reload()
      closeDrawer()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to deactivate package right now.')
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
            Add package
          </button>
        ) : null}
        description="Prepaid visit packs and retention-ready bundles for repeat clients, without changing your appointment workflow yet."
        eyebrow="Retention"
        title="Packages"
      />

      <section>
        <SurfaceCard title="Package catalog">
          {isLoading ? <LoadingState title="Loading packages..." /> : null}
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
          {!isLoading && !error && packages.length === 0 ? (
            <EmptyState
              action={canManage ? (
                <button
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  onClick={openCreateDrawer}
                  type="button"
                >
                  Add the first package
                </button>
              ) : null}
              description="Create prepaid packages here, then assign them to client profiles from the clients workspace."
              title="No packages found yet"
            />
          ) : null}
          {!isLoading && !error && packages.length > 0 ? (
            <DataTable columns={['Package', 'Sessions', 'Price', 'Validity', 'Status']}>
              {packages.map((pkg) => (
                <tr key={pkg.id}>
                  <td className="px-4 py-4">
                    {canManage ? (
                      <button
                        className="font-semibold text-slate-950 transition hover:text-slate-700"
                        onClick={() => openEditDrawer(pkg)}
                        type="button"
                      >
                        {pkg.name}
                      </button>
                    ) : (
                      <span className="font-semibold text-slate-950">{pkg.name}</span>
                    )}
                    {pkg.description ? <p className="mt-1 text-sm text-slate-500">{pkg.description}</p> : null}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge tone="violet">{pkg.sessionCount} visits</StatusBadge>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{formatCurrency(pkg.price)}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{formatPackageValidity(pkg.expiresAfterDays)}</td>
                  <td className="px-4 py-4">
                    <StatusBadge tone={pkg.isActive ? 'success' : 'neutral'}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
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
              {editingPackage ? (
                <button
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                  disabled={isSaving}
                  onClick={() => setConfirmDeleteOpen(true)}
                  type="button"
                >
                  Deactivate package
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
                {isSaving ? 'Saving...' : editingPackage ? 'Save changes' : 'Create package'}
              </button>
            </div>
          </div>
        }
        onClose={closeDrawer}
        open={isDrawerOpen}
        subtitle="Package details"
        title={editingPackage ? 'Edit package' : 'Add package'}
        variant={editingPackage ? 'drawer' : 'modal'}
      >
        <div className="space-y-5">
          {mutationError ? <ErrorState message={mutationError} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {!editingPackage && !defaultStudioId ? (
              <InputField
                error={formErrors.studioId}
                label="Studio ID"
                onChange={(event) => setFormState((current) => ({ ...current, studioId: event.target.value }))}
                placeholder="Paste the studio UUID"
                value={formState.studioId}
              />
            ) : null}
            <InputField
              error={formErrors.name}
              label="Package name"
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              placeholder="Five-visit refresh pack"
              value={formState.name}
            />
            <InputField
              error={formErrors.sessionCount}
              label="Included visits"
              min="1"
              onChange={(event) => setFormState((current) => ({ ...current, sessionCount: event.target.value }))}
              type="number"
              value={formState.sessionCount}
            />
            <InputField
              error={formErrors.price}
              label="Package price"
              min="0"
              onChange={(event) => setFormState((current) => ({ ...current, price: event.target.value }))}
              step="0.01"
              type="number"
              value={formState.price}
            />
            <InputField
              error={formErrors.expiresAfterDays}
              label="Expires after (days)"
              min="1"
              onChange={(event) => setFormState((current) => ({ ...current, expiresAfterDays: event.target.value }))}
              placeholder="Optional"
              type="number"
              value={formState.expiresAfterDays}
            />
          </div>

          <TextAreaField
            label="Description"
            onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
            placeholder="What the package is for, ideal use cases, or internal team context."
            value={formState.description}
          />

          <ToggleField
            checked={formState.isActive}
            label="Active package"
            onChange={(checked) => setFormState((current) => ({ ...current, isActive: checked }))}
          />
        </div>
      </DetailDrawer>

      <ConfirmDialog
        confirmLabel="Deactivate package"
        description={`${editingPackage?.name ?? 'This package'} will remain in history but can no longer be assigned to new clients.`}
        isConfirming={isSaving}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        open={confirmDeleteOpen}
        title="Deactivate this package?"
      />
    </div>
  )
}

function createPackageForm(studioId: string | null, pkg?: PackageRecord): PackageFormState {
  return {
    description: pkg?.description ?? '',
    expiresAfterDays: pkg?.expiresAfterDays ? String(pkg.expiresAfterDays) : '',
    isActive: pkg?.isActive ?? true,
    name: pkg?.name ?? '',
    price: pkg?.price ? String(pkg.price) : '',
    sessionCount: pkg?.sessionCount ? String(pkg.sessionCount) : '',
    studioId: studioId ?? '',
  }
}

function validatePackageForm(formState: PackageFormState, studioId: string | null) {
  const errors: Partial<Record<keyof PackageFormState, string>> = {}

  if (!studioId && !formState.studioId.trim()) {
    errors.studioId = 'Studio ID is required to create a package.'
  }

  if (!formState.name.trim()) {
    errors.name = 'Package name is required.'
  }

  if (!formState.sessionCount || Number(formState.sessionCount) <= 0) {
    errors.sessionCount = 'Included visits must be greater than zero.'
  }

  if (!formState.price || Number(formState.price) < 0) {
    errors.price = 'Price must be zero or higher.'
  }

  if (formState.expiresAfterDays && Number(formState.expiresAfterDays) <= 0) {
    errors.expiresAfterDays = 'Expiry days must be greater than zero.'
  }

  return errors
}

function formatPackageValidity(expiresAfterDays: number | null) {
  if (!expiresAfterDays) {
    return 'No expiry'
  }

  return `${expiresAfterDays} days`
}
