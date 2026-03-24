import { SurfaceCard } from '../components/layout/app-shell'
import { DataTable } from '../components/ui/data-table'
import { PageHeader } from '../components/ui/page-header'
import { StatCard } from '../components/ui/stat-card'
import { StatusBadge } from '../components/ui/status-badge'

const payments = [
  { amount: '$180', client: 'Maya Laurent', deposit: '$100', id: 'pay-1', service: 'Fine line consult', status: 'Confirmed' },
  { amount: '$72', client: 'Drew Foster', deposit: '$0', id: 'pay-2', service: 'Fade + beard sculpt', status: 'Paid' },
  { amount: '$95', client: 'Elise Nguyen', deposit: '$35', id: 'pay-3', service: 'Luxury blowout', status: 'Deposit pending' },
] as const

export function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Payments are organized around deposits, balances, and status clarity so the financial layer stays easy to trust."
        eyebrow="Payments"
        title="Transactions and deposits"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard accent="mint" helper="Collected across all locations today" label="Transactions" value="$7.8k" />
        <StatCard accent="violet" helper="Outstanding deposit follow-up" label="Deposits pending" value="$640" />
        <StatCard helper="Healthy payment completion rate" label="Paid bookings" value="87%" />
      </section>

      <SurfaceCard title="Payment ledger">
        <DataTable columns={['Client', 'Service', 'Amount', 'Deposit', 'Status']}>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-4 py-4 font-semibold text-slate-950">{payment.client}</td>
              <td className="px-4 py-4 text-sm text-slate-600">{payment.service}</td>
              <td className="px-4 py-4 text-sm text-slate-600">{payment.amount}</td>
              <td className="px-4 py-4 text-sm text-slate-600">{payment.deposit}</td>
              <td className="px-4 py-4">
                <StatusBadge
                  tone={
                    payment.status === 'Paid'
                      ? 'success'
                      : payment.status === 'Deposit pending'
                        ? 'attention'
                        : 'calm'
                  }
                >
                  {payment.status}
                </StatusBadge>
              </td>
            </tr>
          ))}
        </DataTable>
      </SurfaceCard>
    </div>
  )
}
