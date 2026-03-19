import { useMemo, useState } from 'react'
import { SideDrawer } from '../../components/shared/side-drawer'
import {
  EmptyState,
  FilterSelect,
  PrimaryButton,
  ProductPageHeader,
  StatusBadge,
  SummaryCard,
  Surface,
} from '../../components/shared/product-ui'
import type { AppRole } from '../../data/navigation'

type PaymentsPageProps = {
  role: AppRole
}

type PaymentStatus = 'Paid' | 'Partial' | 'Refunded' | 'Unpaid'

type PaymentRecord = {
  amount: string
  appointment: string
  client: string
  deposit: string
  id: string
  invoiceNumber: string
  method: string
  remaining: string
  service: string
  status: PaymentStatus
}

const paymentRows: PaymentRecord[] = [
  {
    amount: '$240',
    appointment: 'Mar 21, 10:30 AM',
    client: 'Maya Laurent',
    deposit: '$120',
    id: 'pay-1',
    invoiceNumber: 'INV-2408',
    method: 'Visa',
    remaining: '$0',
    service: 'Fine line tattoo consult',
    status: 'Paid',
  },
  {
    amount: '$140',
    appointment: 'Mar 21, 12:45 PM',
    client: 'Amara Singh',
    deposit: '$70',
    id: 'pay-2',
    invoiceNumber: 'INV-2410',
    method: 'Pending',
    remaining: '$70',
    service: 'Piercing follow-up',
    status: 'Partial',
  },
  {
    amount: '$75',
    appointment: 'Mar 21, 11:15 AM',
    client: 'Derek Hoffman',
    deposit: '$0',
    id: 'pay-3',
    invoiceNumber: 'INV-2411',
    method: 'Cash',
    remaining: '$0',
    service: 'Premium barber package',
    status: 'Paid',
  },
  {
    amount: '$210',
    appointment: 'Mar 22, 2:00 PM',
    client: 'Sophie Bennett',
    deposit: '$90',
    id: 'pay-4',
    invoiceNumber: 'INV-2414',
    method: 'Mastercard',
    remaining: '$120',
    service: 'Balayage refresh',
    status: 'Partial',
  },
  {
    amount: '$160',
    appointment: 'Mar 22, 4:00 PM',
    client: 'Ava Monroe',
    deposit: '$0',
    id: 'pay-5',
    invoiceNumber: 'INV-2419',
    method: 'Pending',
    remaining: '$160',
    service: 'Wellness recovery session',
    status: 'Unpaid',
  },
  {
    amount: '$95',
    appointment: 'Mar 18, 9:30 AM',
    client: 'Jordan Kline',
    deposit: '$95',
    id: 'pay-6',
    invoiceNumber: 'INV-2394',
    method: 'Refunded to Visa',
    remaining: '$0',
    service: 'Consultation',
    status: 'Refunded',
  },
]

export function PaymentsPage({ role }: PaymentsPageProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)

  const filteredRows = useMemo(() => {
    return paymentRows.filter((row) =>
      statusFilter === 'All' ? true : row.status === statusFilter,
    )
  }, [statusFilter])

  const selectedInvoice =
    paymentRows.find((row) => row.id === selectedInvoiceId) ?? null

  return (
    <div className="space-y-6">
      <ProductPageHeader
        action={<PrimaryButton>Record payment</PrimaryButton>}
        description={`A premium payment operations surface for ${role} workflows, combining deposits, balances, refunds, and invoice visibility.`}
        title="Payments"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          caption="Total revenue"
          meta="Across the active period"
          tone="bg-[linear-gradient(135deg,rgba(169,200,243,0.18),rgba(143,208,199,0.14))]"
          value="$29,300"
        />
        <SummaryCard
          caption="Deposits collected"
          meta="Captured before service"
          tone="bg-[linear-gradient(135deg,rgba(143,208,199,0.18),rgba(205,188,241,0.14))]"
          value="$8,420"
        />
        <SummaryCard
          caption="Pending balance"
          meta="Awaiting collection"
          tone="bg-[linear-gradient(135deg,rgba(243,181,152,0.18),rgba(240,214,166,0.14))]"
          value="$1,240"
        />
        <SummaryCard
          caption="Refunds"
          meta="Processed this month"
          tone="bg-[linear-gradient(135deg,rgba(212,111,131,0.15),rgba(205,188,241,0.12))]"
          value="$385"
        />
      </div>

      <Surface
        action={
          <div className="w-[220px]">
            <FilterSelect
              label="Payment status"
              onChange={(value) => setStatusFilter(value as 'All' | PaymentStatus)}
              options={['All', 'Paid', 'Unpaid', 'Partial', 'Refunded']}
              value={statusFilter}
            />
          </div>
        }
        title="Payment ledger"
      >
        {filteredRows.length === 0 ? (
          <EmptyState
            description="Adjust the filter to bring matching payments back into view."
            title="No payments match the selected state"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  {[
                    'Client',
                    'Appointment',
                    'Service',
                    'Amount',
                    'Deposit',
                    'Remaining',
                    'Method',
                    'Status',
                    'Invoice',
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-4 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-200 text-sm text-slate-700"
                  >
                    <td className="px-4 py-4 font-semibold text-slate-950">{row.client}</td>
                    <td className="px-4 py-4">{row.appointment}</td>
                    <td className="px-4 py-4">{row.service}</td>
                    <td className="px-4 py-4 font-semibold">{row.amount}</td>
                    <td className="px-4 py-4">{row.deposit}</td>
                    <td className="px-4 py-4">{row.remaining}</td>
                    <td className="px-4 py-4">{row.method}</td>
                    <td className="px-4 py-4">
                      <StatusBadge tone={paymentTone(row.status)}>{row.status}</StatusBadge>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                        onClick={() => setSelectedInvoiceId(row.id)}
                        type="button"
                      >
                        Open invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Surface>

      <SideDrawer
        onClose={() => setSelectedInvoiceId(null)}
        open={Boolean(selectedInvoice)}
        subtitle="Invoice details, payment breakdown, and collection summary"
        title={selectedInvoice ? `Invoice ${selectedInvoice.invoiceNumber}` : 'Invoice'}
      >
        {selectedInvoice ? (
          <div className="space-y-6">
            <InvoicePanel title="Client and appointment">
              <InvoiceRow label="Client" value={selectedInvoice.client} />
              <InvoiceRow label="Appointment" value={selectedInvoice.appointment} />
              <InvoiceRow label="Service" value={selectedInvoice.service} />
            </InvoicePanel>

            <InvoicePanel title="Payment breakdown">
              <InvoiceRow label="Total amount" value={selectedInvoice.amount} />
              <InvoiceRow label="Deposit" value={selectedInvoice.deposit} />
              <InvoiceRow label="Remaining" value={selectedInvoice.remaining} />
              <InvoiceRow label="Method" value={selectedInvoice.method} />
              <InvoiceRow label="Status" value={selectedInvoice.status} />
            </InvoicePanel>
          </div>
        ) : null}
      </SideDrawer>
    </div>
  )
}

function paymentTone(status: PaymentStatus) {
  if (status === 'Paid') return 'success' as const
  if (status === 'Partial') return 'warning' as const
  if (status === 'Refunded') return 'neutral' as const
  return 'danger' as const
}

function InvoicePanel({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <section>
      <h3 className="font-display text-2xl text-slate-950">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  )
}

function InvoiceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="max-w-[58%] text-right text-sm text-slate-600">{value}</p>
    </div>
  )
}
