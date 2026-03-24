import { useCallback, useMemo, useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { DataTable } from '../components/ui/data-table'
import { DetailDrawer } from '../components/ui/detail-drawer'
import { InputField, SelectField } from '../components/ui/form-controls'
import { PageHeader } from '../components/ui/page-header'
import { StatCard } from '../components/ui/stat-card'
import { StatusBadge } from '../components/ui/status-badge'
import { useAuth } from '../features/auth/use-auth'
import { useRemoteList } from '../hooks/use-remote-list'
import { getAppointments } from '../lib/api/appointments-api'
import { getDefaultStudioId } from '../lib/api/http'
import { createPayment, deletePayment, getPayments, updatePayment } from '../lib/api/payments-api'
import type { AppointmentRecord, PaymentMethod, PaymentRecord, PaymentStatus } from '../lib/api/types'
import { formatCurrency, formatDate, formatDateTime, formatTime, humanizeEnum } from '../lib/formatters'

type PaymentFormState = {
  amount: string
  appointmentId: string
  depositAmount: string
  paidAt: string
  paymentMethod: '' | PaymentMethod
  paymentStatus: PaymentStatus
  transactionReference: string
}

const paymentStatuses: PaymentStatus[] = ['PENDING', 'PARTIAL', 'PAID', 'FAILED']
const paymentMethods: PaymentMethod[] = ['CARD', 'CASH', 'ETRANSFER', 'OTHER']

export function PaymentsPage() {
  const { selectedLocationId } = useAuth()
  const defaultStudioId = getDefaultStudioId()
  const loadPayments = useCallback(
    () => getPayments({ locationId: selectedLocationId, studioId: defaultStudioId }),
    [defaultStudioId, selectedLocationId],
  )
  const loadAppointments = useCallback(
    () => getAppointments(defaultStudioId, selectedLocationId),
    [defaultStudioId, selectedLocationId],
  )

  const { data: payments, error, isLoading, reload } = useRemoteList(loadPayments)
  const {
    data: appointments,
    error: appointmentsError,
    isLoading: appointmentsLoading,
  } = useRemoteList(loadAppointments)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PaymentFormState, string>>>({})
  const [formState, setFormState] = useState<PaymentFormState>(createPaymentForm())

  const summary = useMemo(() => {
    const totalVolume = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalDeposits = payments.reduce((sum, payment) => sum + payment.depositAmount, 0)
    const paidCount = payments.filter((payment) => payment.paymentStatus === 'PAID').length

    return {
      paidCount,
      totalDeposits,
      totalVolume,
    }
  }, [payments])

  const openCreateDrawer = () => {
    setEditingPayment(null)
    setMutationError(null)
    setFormErrors({})
    setFormState(createPaymentForm())
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (payment: PaymentRecord) => {
    setEditingPayment(payment)
    setMutationError(null)
    setFormErrors({})
    setFormState(createPaymentForm(payment))
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setEditingPayment(null)
    setMutationError(null)
    setFormErrors({})
    setIsDrawerOpen(false)
  }

  const handleSubmit = async () => {
    const errors = validatePaymentForm(formState)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const payload = {
      amount: Number(formState.amount),
      appointmentId: formState.appointmentId,
      depositAmount: Number(formState.depositAmount || '0'),
      paidAt: formState.paidAt ? new Date(formState.paidAt).toISOString() : null,
      paymentMethod: formState.paymentMethod || null,
      paymentStatus: formState.paymentStatus,
      transactionReference: formState.transactionReference.trim(),
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      if (editingPayment) {
        await updatePayment(editingPayment.id, payload)
      } else {
        await createPayment(payload)
      }

      await reload()
      closeDrawer()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to save the payment right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingPayment) {
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      await deletePayment(editingPayment.id)
      await reload()
      closeDrawer()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to delete this payment right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const appointmentOptions = appointments.map((appointment) => ({
    label: appointmentOptionLabel(appointment),
    value: appointment.id,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
            onClick={openCreateDrawer}
            type="button"
          >
            Add payment
          </button>
        }
        description="Payments stay organized around deposits, balances, and booking-linked status so the financial layer remains easy to trust."
        eyebrow="Payments"
        title="Transactions and deposits"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          accent="mint"
          helper={selectedLocationId ? 'Payment volume for the selected location' : 'Total payment volume from the connected backend ledger'}
          label="Payment volume"
          value={formatCurrency(summary.totalVolume)}
        />
        <StatCard
          accent="violet"
          helper={selectedLocationId ? 'Deposits tracked for the current location' : 'Deposits currently attached to live payment records'}
          label="Deposits tracked"
          value={formatCurrency(summary.totalDeposits)}
        />
        <StatCard
          helper={selectedLocationId ? 'Fully paid records in the current location view' : 'Bookings marked fully paid so the front desk can scan quickly'}
          label="Paid records"
          value={String(summary.paidCount)}
        />
      </section>

      <SurfaceCard title="Payment ledger">
        {isLoading ? <LoadingState title="Loading payments..." /> : null}
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
        {!isLoading && !error && payments.length === 0 ? (
          <EmptyState
            action={
              <button
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                onClick={openCreateDrawer}
                type="button"
              >
                Add the first payment
              </button>
            }
            description="Once payment records are created, deposit tracking and appointment-linked payment status will show up here."
            title="No payments recorded yet"
          />
        ) : null}
        {!isLoading && !error && payments.length > 0 ? (
          <DataTable columns={['Client', 'Location', 'Appointment', 'Amount', 'Deposit', 'Method', 'Status', 'Paid date']}>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-4 py-4">
                  <button
                    className="font-semibold text-slate-950 transition hover:text-slate-700"
                    onClick={() => openEditDrawer(payment)}
                    type="button"
                  >
                    {payment.customerName}
                  </button>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{payment.locationName}</td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  <div className="space-y-1">
                    <p>{payment.serviceName}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      {formatDate(payment.appointmentDate)} • {formatTime(payment.appointmentStartTime)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{formatCurrency(payment.amount)}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{formatCurrency(payment.depositAmount)}</td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {payment.paymentMethod ? humanizeEnum(payment.paymentMethod) : 'Not set'}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge tone={paymentTone(payment.paymentStatus)}>
                    {humanizeEnum(payment.paymentStatus)}
                  </StatusBadge>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {payment.paidAt ? formatDateTime(payment.paidAt) : 'Not paid yet'}
                </td>
              </tr>
            ))}
          </DataTable>
        ) : null}
      </SurfaceCard>

      <DetailDrawer
        footer={
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              {editingPayment ? (
                <button
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                  disabled={isSaving}
                  onClick={() => void handleDelete()}
                  type="button"
                >
                  Delete payment
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
                disabled={isSaving || appointmentsLoading || appointmentOptions.length === 0}
                onClick={() => void handleSubmit()}
                type="button"
              >
                {isSaving ? 'Saving...' : editingPayment ? 'Save changes' : 'Create payment'}
              </button>
            </div>
          </div>
        }
        onClose={closeDrawer}
        open={isDrawerOpen}
        subtitle="Payment details"
        title={editingPayment ? editingPayment.customerName : 'Add payment'}
      >
        <div className="space-y-5">
          {mutationError ? <ErrorState message={mutationError} /> : null}
          {appointmentsError ? <ErrorState message={appointmentsError} /> : null}
          {appointmentsLoading ? <LoadingState title="Loading appointments..." /> : null}
          {!appointmentsLoading && !appointmentsError && appointmentOptions.length === 0 ? (
            <EmptyState
              description="Create an appointment first so a payment record can be linked to a real booking."
              title="No appointments available"
            />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              error={formErrors.appointmentId}
              label="Appointment"
              onChange={(event) =>
                setFormState((current) => ({ ...current, appointmentId: event.target.value }))
              }
              value={formState.appointmentId}
            >
              <option value="">Select an appointment</option>
              {appointmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <InputField
              error={formErrors.amount}
              label="Amount"
              min="0"
              onChange={(event) => setFormState((current) => ({ ...current, amount: event.target.value }))}
              step="0.01"
              type="number"
              value={formState.amount}
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
            <SelectField
              error={formErrors.paymentStatus}
              label="Payment status"
              onChange={(event) =>
                setFormState((current) => ({ ...current, paymentStatus: event.target.value as PaymentStatus }))
              }
              value={formState.paymentStatus}
            >
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>
                  {humanizeEnum(status)}
                </option>
              ))}
            </SelectField>
            <SelectField
              error={formErrors.paymentMethod}
              label="Payment method"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  paymentMethod: event.target.value as '' | PaymentMethod,
                }))
              }
              value={formState.paymentMethod}
            >
              <option value="">Select a method</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {humanizeEnum(method)}
                </option>
              ))}
            </SelectField>
            <InputField
              label="Transaction reference"
              onChange={(event) =>
                setFormState((current) => ({ ...current, transactionReference: event.target.value }))
              }
              placeholder="Optional reference"
              value={formState.transactionReference}
            />
            <InputField
              label="Paid at"
              onChange={(event) => setFormState((current) => ({ ...current, paidAt: event.target.value }))}
              type="datetime-local"
              value={formState.paidAt}
            />
          </div>
        </div>
      </DetailDrawer>
    </div>
  )
}

function createPaymentForm(payment?: PaymentRecord): PaymentFormState {
  return {
    amount: payment ? String(payment.amount) : '0',
    appointmentId: payment?.appointmentId ?? '',
    depositAmount: payment ? String(payment.depositAmount) : '0',
    paidAt: payment?.paidAt ? toDateTimeLocalValue(payment.paidAt) : '',
    paymentMethod: payment?.paymentMethod ?? '',
    paymentStatus: payment?.paymentStatus ?? 'PENDING',
    transactionReference: payment?.transactionReference ?? '',
  }
}

function validatePaymentForm(formState: PaymentFormState) {
  const errors: Partial<Record<keyof PaymentFormState, string>> = {}

  if (!formState.appointmentId) {
    errors.appointmentId = 'Choose an appointment.'
  }

  if (formState.amount === '' || Number(formState.amount) < 0) {
    errors.amount = 'Amount must be zero or more.'
  }

  if (formState.depositAmount === '' || Number(formState.depositAmount) < 0) {
    errors.depositAmount = 'Deposit amount must be zero or more.'
  }

  if (!formState.paymentStatus) {
    errors.paymentStatus = 'Payment status is required.'
  }

  if (formState.paymentStatus === 'PAID' && !formState.paymentMethod) {
    errors.paymentMethod = 'Payment method is required when marked paid.'
  }

  return errors
}

function appointmentOptionLabel(appointment: AppointmentRecord) {
  return `${appointment.customerName} • ${formatDate(appointment.appointmentDate)} • ${appointment.serviceName}`
}

function paymentTone(status: PaymentStatus) {
  if (status === 'PAID') return 'success' as const
  if (status === 'PARTIAL') return 'calm' as const
  if (status === 'FAILED') return 'danger' as const
  return 'attention' as const
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}
