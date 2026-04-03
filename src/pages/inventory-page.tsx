import { useCallback, useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { DataTable } from '../components/ui/data-table'
import { DetailDrawer } from '../components/ui/detail-drawer'
import { InputField, SelectField, TextAreaField, ToggleField } from '../components/ui/form-controls'
import { PageHeader } from '../components/ui/page-header'
import { StatusBadge } from '../components/ui/status-badge'
import { canManageInventory } from '../features/auth/authorization'
import { useAuth } from '../features/auth/use-auth'
import { useRemoteList } from '../hooks/use-remote-list'
import { getDefaultStudioId } from '../lib/api/http'
import {
  createInventoryProduct,
  deleteInventoryProduct,
  getInventoryProducts,
  updateInventoryProduct,
} from '../lib/api/inventory-api'
import type { InventoryProductCategory, InventoryProductRecord } from '../lib/api/types'
import { formatCurrency, humanizeEnum } from '../lib/formatters'

type InventoryProductFormState = {
  category: InventoryProductCategory
  description: string
  isActive: boolean
  name: string
  quantityInStock: string
  reorderThreshold: string
  sku: string
  studioId: string
  unitPrice: string
}

const inventoryProductCategories: InventoryProductCategory[] = [
  'AFTERCARE',
  'RETAIL',
  'SUPPLIES',
  'EQUIPMENT',
  'MERCH',
  'OTHER',
]

export function InventoryPage() {
  const { user } = useAuth()
  const canManage = user ? canManageInventory(user.role) : false
  const defaultStudioId = getDefaultStudioId()
  const loadInventoryProducts = useCallback(() => getInventoryProducts(defaultStudioId), [defaultStudioId])
  const { data: inventoryProducts, error, isLoading, reload } = useRemoteList(loadInventoryProducts)

  const [activeCategory, setActiveCategory] = useState<'ALL' | InventoryProductCategory>('ALL')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<InventoryProductRecord | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof InventoryProductFormState, string>>>({})
  const [formState, setFormState] = useState<InventoryProductFormState>(createInventoryProductForm(defaultStudioId))

  const visibleProducts = inventoryProducts.filter((product) => {
    if (activeCategory !== 'ALL' && product.category !== activeCategory) {
      return false
    }

    return true
  })

  const openCreateDrawer = () => {
    setEditingProduct(null)
    setMutationError(null)
    setFormErrors({})
    setFormState(createInventoryProductForm(defaultStudioId))
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (product: InventoryProductRecord) => {
    setEditingProduct(product)
    setMutationError(null)
    setFormErrors({})
    setFormState(createInventoryProductForm(product.studioId, product))
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setEditingProduct(null)
    setMutationError(null)
    setFormErrors({})
    setConfirmDeleteOpen(false)
  }

  const handleSubmit = async () => {
    const errors = validateInventoryProductForm(formState, editingProduct?.studioId ?? defaultStudioId)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const studioId = editingProduct?.studioId ?? defaultStudioId ?? formState.studioId.trim()

    if (!studioId) {
      setMutationError('Set VITE_STUDIO_ID or provide a studio ID to save inventory products.')
      return
    }

    const payload = {
      category: formState.category,
      description: formState.description.trim(),
      isActive: formState.isActive,
      name: formState.name.trim(),
      quantityInStock: Number(formState.quantityInStock),
      reorderThreshold: Number(formState.reorderThreshold),
      sku: formState.sku.trim(),
      studioId,
      unitPrice: Number(formState.unitPrice),
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      if (editingProduct) {
        await updateInventoryProduct(editingProduct.id, payload)
      } else {
        await createInventoryProduct(payload)
      }

      await reload()
      closeDrawer()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to save inventory product right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingProduct) {
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      await deleteInventoryProduct(editingProduct.id)
      await reload()
      closeDrawer()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to deactivate inventory product right now.')
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
            Add product
          </button>
        ) : null}
        description="A practical catalog for aftercare and retail products, with SKU, pricing, and stock visibility in one place."
        eyebrow="Inventory"
        title="Product catalog"
      />

      <section className="flex flex-wrap items-end gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
        <InlineSelect
          label="Category"
          onChange={(value) => setActiveCategory(value as 'ALL' | InventoryProductCategory)}
          options={['ALL', ...inventoryProductCategories]}
          value={activeCategory}
        />
      </section>

      <section>
        <SurfaceCard title="Inventory products">
          {isLoading ? <LoadingState title="Loading inventory products..." /> : null}
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
          {!isLoading && !error && visibleProducts.length === 0 ? (
            <EmptyState
              action={canManage ? (
                <button
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  onClick={openCreateDrawer}
                  type="button"
                >
                  Add the first product
                </button>
              ) : null}
              description="Once products are created in the backend, they will appear here for stock and aftercare tracking."
              title="No inventory products found yet"
            />
          ) : null}
          {!isLoading && !error && visibleProducts.length > 0 ? (
            <DataTable columns={['Product', 'Category', 'SKU', 'Price', 'Stock', 'Status']}>
              {visibleProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-4">
                    {canManage ? (
                      <button
                        className="font-semibold text-slate-950 transition hover:text-slate-700"
                        onClick={() => openEditDrawer(product)}
                        type="button"
                      >
                        {product.name}
                      </button>
                    ) : (
                      <span className="font-semibold text-slate-950">{product.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{humanizeEnum(product.category)}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{product.sku || 'Not set'}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{formatCurrency(product.unitPrice)}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {product.quantityInStock} on hand
                    {product.reorderThreshold > 0 ? ` • reorder at ${product.reorderThreshold}` : ''}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge tone={inventoryStatusTone(product)}>
                      {inventoryStatusLabel(product)}
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
              {editingProduct ? (
                <button
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                  disabled={isSaving}
                  onClick={() => setConfirmDeleteOpen(true)}
                  type="button"
                >
                  Deactivate product
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
                {isSaving ? 'Saving...' : editingProduct ? 'Save changes' : 'Create product'}
              </button>
            </div>
          </div>
        }
        onClose={closeDrawer}
        open={isDrawerOpen}
        variant={editingProduct ? 'drawer' : 'modal'}
        subtitle="Inventory details"
        title={editingProduct ? 'Edit product' : 'Add product'}
      >
        <div className="space-y-5">
          {mutationError ? <ErrorState message={mutationError} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {!editingProduct && !defaultStudioId ? (
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
              label="Product name"
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              placeholder="Healing balm"
              value={formState.name}
            />
            <SelectField
              error={formErrors.category}
              label="Category"
              onChange={(event) =>
                setFormState((current) => ({ ...current, category: event.target.value as InventoryProductCategory }))
              }
              value={formState.category}
            >
              {inventoryProductCategories.map((category) => (
                <option key={category} value={category}>
                  {humanizeEnum(category)}
                </option>
              ))}
            </SelectField>
            <InputField
              label="SKU"
              onChange={(event) => setFormState((current) => ({ ...current, sku: event.target.value }))}
              placeholder="AFTER-001"
              value={formState.sku}
            />
            <InputField
              error={formErrors.unitPrice}
              label="Unit price"
              min="0"
              onChange={(event) => setFormState((current) => ({ ...current, unitPrice: event.target.value }))}
              step="0.01"
              type="number"
              value={formState.unitPrice}
            />
            <InputField
              error={formErrors.quantityInStock}
              label="Quantity in stock"
              min="0"
              onChange={(event) =>
                setFormState((current) => ({ ...current, quantityInStock: event.target.value }))
              }
              type="number"
              value={formState.quantityInStock}
            />
            <InputField
              error={formErrors.reorderThreshold}
              label="Reorder threshold"
              min="0"
              onChange={(event) =>
                setFormState((current) => ({ ...current, reorderThreshold: event.target.value }))
              }
              type="number"
              value={formState.reorderThreshold}
            />
          </div>

          <TextAreaField
            label="Description"
            onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
            placeholder="Add product details, usage notes, or aftercare guidance."
            value={formState.description}
          />

          <ToggleField
            checked={formState.isActive}
            label="Active"
            onChange={(checked) => setFormState((current) => ({ ...current, isActive: checked }))}
          />
        </div>
      </DetailDrawer>

      <ConfirmDialog
        confirmLabel="Deactivate product"
        description={`"${editingProduct?.name ?? 'This product'}" will be removed from the active catalog, but its history will stay intact.`}
        isConfirming={isSaving}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        open={confirmDeleteOpen}
        title="Deactivate this product?"
      />
    </div>
  )
}

function createInventoryProductForm(studioId: string | null, product?: InventoryProductRecord): InventoryProductFormState {
  return {
    category: product?.category ?? 'OTHER',
    description: product?.description ?? '',
    isActive: product?.isActive ?? true,
    name: product?.name ?? '',
    quantityInStock: product ? String(product.quantityInStock) : '0',
    reorderThreshold: product ? String(product.reorderThreshold) : '0',
    sku: product?.sku ?? '',
    studioId: studioId ?? '',
    unitPrice: product ? String(product.unitPrice) : '0',
  }
}

function validateInventoryProductForm(formState: InventoryProductFormState, studioId: string | null) {
  const errors: Partial<Record<keyof InventoryProductFormState, string>> = {}

  if (!studioId && !formState.studioId.trim()) {
    errors.studioId = 'Studio ID is required to create a product.'
  }

  if (!formState.name.trim()) {
    errors.name = 'Product name is required.'
  }

  if (!formState.category) {
    errors.category = 'Category is required.'
  }

  if (formState.unitPrice === '' || Number(formState.unitPrice) < 0) {
    errors.unitPrice = 'Unit price must be zero or more.'
  }

  if (formState.quantityInStock === '' || Number(formState.quantityInStock) < 0) {
    errors.quantityInStock = 'Quantity in stock must be zero or more.'
  }

  if (formState.reorderThreshold === '' || Number(formState.reorderThreshold) < 0) {
    errors.reorderThreshold = 'Reorder threshold must be zero or more.'
  }

  return errors
}

function inventoryStatusTone(product: InventoryProductRecord) {
  if (!product.isActive) {
    return 'neutral' as const
  }

  if (product.quantityInStock <= 0) {
    return 'danger' as const
  }

  if (product.reorderThreshold > 0 && product.quantityInStock <= product.reorderThreshold) {
    return 'attention' as const
  }

  return 'success' as const
}

function inventoryStatusLabel(product: InventoryProductRecord) {
  if (!product.isActive) {
    return 'Inactive'
  }

  if (product.quantityInStock <= 0) {
    return 'Out of stock'
  }

  if (product.reorderThreshold > 0 && product.quantityInStock <= product.reorderThreshold) {
    return 'Low stock'
  }

  return 'In stock'
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
