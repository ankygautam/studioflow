import { useCallback, useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { DataTable } from '../components/ui/data-table'
import { DetailDrawer } from '../components/ui/detail-drawer'
import { InputField, SelectField, TextAreaField, ToggleField } from '../components/ui/form-controls'
import { PageHeader } from '../components/ui/page-header'
import { StatusBadge } from '../components/ui/status-badge'
import { canManageServices } from '../features/auth/authorization'
import { useAuth } from '../features/auth/use-auth'
import { useRemoteList } from '../hooks/use-remote-list'
import { formatCurrency, humanizeEnum } from '../lib/formatters'
import { getDefaultStudioId } from '../lib/api/http'
import { createService, deleteService, getServices, updateService } from '../lib/api/services-api'
import type { ServiceCategory, ServiceRecord } from '../lib/api/types'

type ServiceFormState = {
  category: ServiceCategory
  depositAmount: string
  depositRequired: boolean
  description: string
  durationMinutes: string
  isActive: boolean
  name: string
  price: string
  studioId: string
}

const serviceCategories: ServiceCategory[] = [
  'TATTOO',
  'BARBER',
  'HAIR',
  'NAIL',
  'PIERCING',
  'WELLNESS',
  'MASSAGE',
  'MAKEUP',
  'BEAUTY',
  'CONSULTATION',
  'OTHER',
]

export function ServicesPage() {
  const { user } = useAuth()
  const canManage = user ? canManageServices(user.role) : false
  const defaultStudioId = getDefaultStudioId()
  const loadServices = useCallback(() => getServices(defaultStudioId), [defaultStudioId])
  const { data: services, error, isLoading, reload } = useRemoteList(loadServices)

  const [activeCategory, setActiveCategory] = useState<'ALL' | ServiceCategory>('ALL')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ServiceFormState, string>>>({})
  const [formState, setFormState] = useState<ServiceFormState>(createServiceForm(defaultStudioId))

  const visibleServices = services.filter((service) => {
    if (activeCategory !== 'ALL' && service.category !== activeCategory) {
      return false
    }

    return true
  })

  const openCreateDrawer = () => {
    setEditingService(null)
    setMutationError(null)
    setFormErrors({})
    setFormState(createServiceForm(defaultStudioId))
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (service: ServiceRecord) => {
    setEditingService(service)
    setMutationError(null)
    setFormErrors({})
    setFormState(createServiceForm(service.studioId, service))
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setEditingService(null)
    setMutationError(null)
    setFormErrors({})
    setConfirmDeleteOpen(false)
  }

  const handleSubmit = async () => {
    const errors = validateServiceForm(formState, editingService?.studioId ?? defaultStudioId)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const studioId = editingService?.studioId ?? defaultStudioId ?? formState.studioId.trim()

    if (!studioId) {
      setMutationError('Set VITE_STUDIO_ID or provide a studio ID to save services.')
      return
    }

    const payload = {
      category: formState.category,
      depositAmount: formState.depositRequired ? Number(formState.depositAmount || '0') : 0,
      depositRequired: formState.depositRequired,
      description: formState.description.trim(),
      durationMinutes: Number(formState.durationMinutes),
      isActive: formState.isActive,
      name: formState.name.trim(),
      price: Number(formState.price),
      studioId,
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      if (editingService) {
        await updateService(editingService.id, payload)
      } else {
        await createService(payload)
      }

      await reload()
      closeDrawer()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to save service right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingService) {
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      await deleteService(editingService.id)
      await reload()
      closeDrawer()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to deactivate service right now.')
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
            Add service
          </button>
        ) : null}
        description="Service setup designed for premium operations, with pricing, duration, deposits, categories, and activation status easy to manage."
        eyebrow="Services"
        title="Service catalog"
      />

      <section className="flex flex-wrap items-end gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
        <InlineSelect
          label="Category"
          onChange={(value) => setActiveCategory(value as 'ALL' | ServiceCategory)}
          options={['ALL', ...serviceCategories]}
          value={activeCategory}
        />
      </section>

      <section>
        <SurfaceCard title="Services">
          {isLoading ? <LoadingState title="Loading services..." /> : null}
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
          {!isLoading && !error && visibleServices.length === 0 ? (
            <EmptyState
              action={canManage ? (
                <button
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  onClick={openCreateDrawer}
                  type="button"
                >
                  Add the first service
                </button>
              ) : null}
              description="Once services are created in the backend, they will show up here for pricing and appointment setup."
              title="No services found yet"
            />
          ) : null}
          {!isLoading && !error && visibleServices.length > 0 ? (
            <DataTable columns={['Service', 'Category', 'Duration', 'Price', 'Deposit', 'Status']}>
              {visibleServices.map((service) => (
                <tr key={service.id}>
                  <td className="px-4 py-4">
                    {canManage ? (
                      <button
                        className="font-semibold text-slate-950 transition hover:text-slate-700"
                        onClick={() => openEditDrawer(service)}
                        type="button"
                      >
                        {service.name}
                      </button>
                    ) : (
                      <span className="font-semibold text-slate-950">{service.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{humanizeEnum(service.category)}</td>
                  <td className="px-4 py-4">
                    <StatusBadge tone="violet">{service.durationMinutes} min</StatusBadge>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{formatCurrency(service.price)}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {service.depositRequired ? `${formatCurrency(service.depositAmount)} required` : 'Not required'}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge tone={service.isActive ? 'success' : 'neutral'}>
                      {service.isActive ? 'Active' : 'Inactive'}
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
              {editingService ? (
                <button
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                  disabled={isSaving}
                  onClick={() => setConfirmDeleteOpen(true)}
                  type="button"
                >
                  Deactivate service
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
                {isSaving ? 'Saving...' : editingService ? 'Save changes' : 'Create service'}
              </button>
            </div>
          </div>
        }
        onClose={closeDrawer}
        open={isDrawerOpen}
        variant={editingService ? 'drawer' : 'modal'}
        subtitle="Service details"
        title={editingService ? 'Edit service' : 'Add service'}
      >
        <div className="space-y-5">
          {mutationError ? <ErrorState message={mutationError} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {!editingService && !defaultStudioId ? (
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
              label="Service name"
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              placeholder="Luxury blowout"
              value={formState.name}
            />
            <SelectField
              error={formErrors.category}
              label="Category"
              onChange={(event) =>
                setFormState((current) => ({ ...current, category: event.target.value as ServiceCategory }))
              }
              value={formState.category}
            >
              {serviceCategories.map((category) => (
                <option key={category} value={category}>
                  {humanizeEnum(category)}
                </option>
              ))}
            </SelectField>
            <InputField
              error={formErrors.durationMinutes}
              label="Duration (minutes)"
              min="1"
              onChange={(event) =>
                setFormState((current) => ({ ...current, durationMinutes: event.target.value }))
              }
              type="number"
              value={formState.durationMinutes}
            />
            <InputField
              error={formErrors.price}
              label="Price"
              min="0"
              onChange={(event) => setFormState((current) => ({ ...current, price: event.target.value }))}
              step="0.01"
              type="number"
              value={formState.price}
            />
            <InputField
              error={formErrors.depositAmount}
              label="Deposit amount"
              min="0"
              onChange={(event) =>
                setFormState((current) => ({ ...current, depositAmount: event.target.value }))
              }
              step="0.01"
              type="number"
              value={formState.depositAmount}
            />
          </div>

          <TextAreaField
            label="Description"
            onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
            placeholder="Describe what is included, prep, or aftercare expectations."
            value={formState.description}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ToggleField
              checked={formState.depositRequired}
              label="Deposit required"
              onChange={(checked) =>
                setFormState((current) => ({
                  ...current,
                  depositAmount: checked ? current.depositAmount : '0',
                  depositRequired: checked,
                }))
              }
            />
            <ToggleField
              checked={formState.isActive}
              label="Active"
              onChange={(checked) => setFormState((current) => ({ ...current, isActive: checked }))}
            />
          </div>
        </div>
      </DetailDrawer>

      <ConfirmDialog
        confirmLabel="Deactivate service"
        description={`"${editingService?.name ?? 'This service'}" will be removed from active booking choices, but its history will stay intact.`}
        isConfirming={isSaving}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        open={confirmDeleteOpen}
        title="Deactivate this service?"
      />
    </div>
  )
}

function createServiceForm(studioId: string | null, service?: ServiceRecord): ServiceFormState {
  return {
    category: service?.category ?? 'OTHER',
    depositAmount: service ? String(service.depositAmount) : '0',
    depositRequired: service?.depositRequired ?? false,
    description: service?.description ?? '',
    durationMinutes: service ? String(service.durationMinutes) : '60',
    isActive: service?.isActive ?? true,
    name: service?.name ?? '',
    price: service ? String(service.price) : '0',
    studioId: studioId ?? '',
  }
}

function validateServiceForm(formState: ServiceFormState, studioId: string | null) {
  const errors: Partial<Record<keyof ServiceFormState, string>> = {}

  if (!studioId && !formState.studioId.trim()) {
    errors.studioId = 'Studio ID is required to create a service.'
  }

  if (!formState.name.trim()) {
    errors.name = 'Service name is required.'
  }

  if (!formState.category) {
    errors.category = 'Category is required.'
  }

  if (!formState.durationMinutes || Number(formState.durationMinutes) <= 0) {
    errors.durationMinutes = 'Duration must be greater than zero.'
  }

  if (formState.price === '' || Number(formState.price) < 0) {
    errors.price = 'Price must be zero or more.'
  }

  if (formState.depositAmount === '' || Number(formState.depositAmount) < 0) {
    errors.depositAmount = 'Deposit amount must be zero or more.'
  }

  return errors
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
    <label className="min-w-[170px]">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </span>
      <select
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === 'ALL' ? 'All categories' : humanizeEnum(option)}
          </option>
        ))}
      </select>
    </label>
  )
}
