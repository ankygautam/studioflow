import { motion } from 'framer-motion'
import { useMemo, useState, type ReactNode } from 'react'
import { SideDrawer } from '../../components/shared/side-drawer'
import type { AppRole } from '../../data/navigation'

type ClientsPageProps = {
  role: AppRole
}

type ConsentStatus = 'Needs review' | 'Pending' | 'Signed'

type ClientRecord = {
  appointmentHistory: { amount: string; date: string; service: string; status: string }[]
  balance: string
  consent: ConsentStatus
  email: string
  id: string
  images: string[]
  lastAppointment: string
  name: string
  notes: string[]
  paymentHistory: { amount: string; date: string; method: string; status: string }[]
  phone: string
  signedForms: string[]
  totalVisits: number
}

const clientRecords: ClientRecord[] = [
  {
    appointmentHistory: [
      { amount: '$240', date: 'Mar 18', service: 'Fine line tattoo', status: 'Completed' },
      { amount: '$95', date: 'Feb 12', service: 'Consultation', status: 'Completed' },
    ],
    balance: '$0',
    consent: 'Signed',
    email: 'leah@clientmail.com',
    id: 'client-1',
    images: ['Botanical reference', 'Placement sketch', 'Line style board'],
    lastAppointment: 'Mar 18, 2026',
    name: 'Leah Carmichael',
    notes: [
      'Prefers early afternoon sessions and minimal waiting time.',
      'Sensitive to fragrance-heavy products during prep.',
    ],
    paymentHistory: [
      { amount: '$120', date: 'Mar 18', method: 'Visa', status: 'Deposit paid' },
      { amount: '$120', date: 'Mar 18', method: 'Card on file', status: 'Final paid' },
    ],
    phone: '(780) 555-0144',
    signedForms: ['Tattoo waiver v3', 'Photo release'],
    totalVisits: 18,
  },
  {
    appointmentHistory: [
      { amount: '$45', date: 'Mar 12', service: 'Piercing follow-up', status: 'Balance due' },
      { amount: '$180', date: 'Jan 28', service: 'Curated ear stack', status: 'Completed' },
    ],
    balance: '$45',
    consent: 'Pending',
    email: 'jordan@clientmail.com',
    id: 'client-2',
    images: ['Jewelry inspiration', 'Aftercare photo'],
    lastAppointment: 'Mar 12, 2026',
    name: 'Jordan Kline',
    notes: [
      'Needs reminder before appointments because of rotating work schedule.',
    ],
    paymentHistory: [
      { amount: '$45', date: 'Mar 12', method: 'Pending', status: 'Balance due' },
    ],
    signedForms: ['Piercing consent v2'],
    phone: '(780) 555-0173',
    totalVisits: 6,
  },
  {
    appointmentHistory: [
      { amount: '$165', date: 'Mar 03', service: 'Balayage refresh', status: 'Completed' },
      { amount: '$130', date: 'Jan 11', service: 'Gloss and trim', status: 'Completed' },
    ],
    balance: '$0',
    consent: 'Signed',
    email: 'isla@clientmail.com',
    id: 'client-3',
    images: ['Color inspiration', 'Tone reference'],
    lastAppointment: 'Mar 03, 2026',
    name: 'Isla Romero',
    notes: ['Loves warmer tones and books every 7 to 8 weeks.'],
    paymentHistory: [
      { amount: '$165', date: 'Mar 03', method: 'Mastercard', status: 'Paid' },
    ],
    signedForms: ['Color treatment consent'],
    phone: '(780) 555-0106',
    totalVisits: 11,
  },
  {
    appointmentHistory: [
      { amount: '$120', date: 'Feb 26', service: 'Lettering touch-up', status: 'Balance due' },
      { amount: '$220', date: 'Jan 16', service: 'Tattoo session', status: 'Completed' },
    ],
    balance: '$120',
    consent: 'Needs review',
    email: 'marcus@clientmail.com',
    id: 'client-4',
    images: ['Old placement photo', 'Touch-up brief'],
    lastAppointment: 'Feb 26, 2026',
    name: 'Marcus Lee',
    notes: ['Requested a follow-up quote before confirming the next appointment.'],
    paymentHistory: [
      { amount: '$120', date: 'Feb 26', method: 'Pending', status: 'Balance due' },
    ],
    signedForms: ['Tattoo waiver v2'],
    phone: '(780) 555-0191',
    totalVisits: 3,
  },
]

export function ClientsPage({ role }: ClientsPageProps) {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'cards' | 'table'>('table')
  const [consentFilter, setConsentFilter] = useState<'All' | ConsentStatus>('All')
  const [balanceFilter, setBalanceFilter] = useState<'All' | 'Open balance' | 'Paid'>('All')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const filteredClients = useMemo(() => {
    return clientRecords.filter((client) => {
      const matchesQuery =
        client.name.toLowerCase().includes(query.toLowerCase()) ||
        client.email.toLowerCase().includes(query.toLowerCase()) ||
        client.phone.includes(query)
      const matchesConsent =
        consentFilter === 'All' ? true : client.consent === consentFilter
      const matchesBalance =
        balanceFilter === 'All'
          ? true
          : balanceFilter === 'Paid'
            ? client.balance === '$0'
            : client.balance !== '$0'

      return matchesQuery && matchesConsent && matchesBalance
    })
  }, [balanceFilter, consentFilter, query])

  const selectedClient =
    clientRecords.find((client) => client.id === selectedClientId) ?? null

  return (
    <div className="space-y-6">
      <SectionHeader
        actionLabel="Add client"
        description={`A premium CRM workspace for ${role} workflows with searchable records, consent visibility, and visit history.`}
        title="Clients"
      />

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,40,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="block flex-1">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Search clients
            </span>
            <input
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, or phone"
              value={query}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2 lg:w-[440px]">
            <SelectBox
              label="Consent"
              onChange={(value) => setConsentFilter(value as 'All' | ConsentStatus)}
              options={['All', 'Signed', 'Pending', 'Needs review']}
              value={consentFilter}
            />
            <SelectBox
              label="Balance"
              onChange={(value) =>
                setBalanceFilter(value as 'All' | 'Open balance' | 'Paid')
              }
              options={['All', 'Open balance', 'Paid']}
              value={balanceFilter}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {filteredClients.length} clients in view
          </p>

          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {(['table', 'cards'] as const).map((option) => (
              <button
                key={option}
                className={[
                  'rounded-xl px-4 py-2 text-sm font-semibold capitalize transition',
                  view === option
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900',
                ].join(' ')}
                onClick={() => setView(option)}
                type="button"
              >
                {option} view
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <EmptyState
          description="Try adjusting the search or filters to surface the right client records."
          title="No clients match the current view"
        />
      ) : view === 'table' ? (
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,40,0.05)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50">
                <tr className="text-sm text-slate-500">
                  {['Client', 'Last appointment', 'Visits', 'Balance', 'Consent'].map(
                    (heading) => (
                      <th key={heading} className="px-5 py-4 font-semibold">
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="cursor-pointer border-t border-slate-200 transition hover:bg-slate-50/70"
                    onClick={() => setSelectedClientId(client.id)}
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-950">{client.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{client.phone}</p>
                      <p className="text-sm text-slate-500">{client.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {client.lastAppointment}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                      {client.totalVisits}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                      {client.balance}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge tone={consentTone(client.consent)}>
                        {client.consent}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredClients.map((client, index) => (
            <motion.button
              key={client.id}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-5 text-left shadow-[0_16px_40px_rgba(15,23,40,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(15,23,40,0.08)]"
              initial={{ opacity: 0, y: 10 }}
              onClick={() => setSelectedClientId(client.id)}
              transition={{ delay: index * 0.04, duration: 0.24 }}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-2xl text-slate-950">{client.name}</p>
                  <p className="mt-2 text-sm text-slate-500">{client.phone}</p>
                  <p className="text-sm text-slate-500">{client.email}</p>
                </div>
                <StatusBadge tone={consentTone(client.consent)}>
                  {client.consent}
                </StatusBadge>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MetricTile label="Last appointment" value={client.lastAppointment} />
                <MetricTile label="Total visits" value={String(client.totalVisits)} />
                <MetricTile label="Outstanding balance" value={client.balance} />
                <MetricTile label="Forms" value={`${client.signedForms.length} signed`} />
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <SideDrawer
        onClose={() => setSelectedClientId(null)}
        open={Boolean(selectedClient)}
        subtitle="Client profile, records, forms, references, and payment history"
        title={selectedClient?.name ?? 'Client details'}
      >
        {selectedClient ? (
          <div className="space-y-6">
            <DrawerPanel title="Profile info">
              <DrawerRow label="Phone" value={selectedClient.phone} />
              <DrawerRow label="Email" value={selectedClient.email} />
              <DrawerRow label="Last appointment" value={selectedClient.lastAppointment} />
              <DrawerRow
                label="Outstanding balance"
                value={selectedClient.balance}
              />
            </DrawerPanel>

            <DrawerPanel title="Notes">
              <div className="space-y-3">
                {selectedClient.notes.map((note) => (
                  <div
                    key={note}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600"
                  >
                    {note}
                  </div>
                ))}
              </div>
            </DrawerPanel>

            <DrawerPanel title="Appointment history">
              <div className="space-y-3">
                {selectedClient.appointmentHistory.map((entry) => (
                  <div
                    key={`${entry.date}-${entry.service}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-900">{entry.service}</p>
                      <p className="text-sm font-semibold text-slate-700">{entry.amount}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {entry.date} • {entry.status}
                    </p>
                  </div>
                ))}
              </div>
            </DrawerPanel>

            <DrawerPanel title="Uploaded reference images">
              <div className="grid grid-cols-2 gap-3">
                {selectedClient.images.map((image, index) => (
                  <div
                    key={image}
                    className={[
                      'flex aspect-[4/3] items-end rounded-[1.5rem] border p-4 text-sm font-semibold text-slate-800',
                      index % 3 === 0
                        ? 'border-teal-200 bg-[#e8f6f3]'
                        : index % 3 === 1
                          ? 'border-blue-200 bg-[#edf4ff]'
                          : 'border-purple-200 bg-[#f2eefb]',
                    ].join(' ')}
                  >
                    {image}
                  </div>
                ))}
              </div>
            </DrawerPanel>

            <DrawerPanel title="Signed forms">
              <div className="space-y-3">
                {selectedClient.signedForms.map((form) => (
                  <div
                    key={form}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <p className="font-semibold text-slate-800">{form}</p>
                    <StatusBadge tone="success">Signed</StatusBadge>
                  </div>
                ))}
              </div>
            </DrawerPanel>

            <DrawerPanel title="Payment history">
              <div className="space-y-3">
                {selectedClient.paymentHistory.map((entry) => (
                  <div
                    key={`${entry.date}-${entry.amount}-${entry.status}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-800">{entry.amount}</p>
                      <p className="text-sm text-slate-500">{entry.status}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {entry.date} • {entry.method}
                    </p>
                  </div>
                ))}
              </div>
            </DrawerPanel>
          </div>
        ) : null}
      </SideDrawer>
    </div>
  )
}

function consentTone(status: ConsentStatus) {
  if (status === 'Signed') return 'success' as const
  if (status === 'Pending') return 'warning' as const
  return 'danger' as const
}

function SectionHeader({
  actionLabel,
  description,
  title,
}: {
  actionLabel: string
  description: string
  title: string
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,40,0.05)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.35em] text-slate-500">
            Workspace module
          </p>
          <h1 className="mt-3 font-display text-4xl text-slate-950">{title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            {description}
          </p>
        </div>
        <button
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          type="button"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  )
}

function SelectBox({
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
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <select
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function StatusBadge({
  children,
  tone,
}: {
  children: string
  tone: 'danger' | 'success' | 'warning'
}) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-rose-200 bg-rose-50 text-rose-700'

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}
    >
      {children}
    </span>
  )
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function EmptyState({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_16px_40px_rgba(15,23,40,0.04)]">
      <p className="font-display text-3xl text-slate-950">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-500">
        {description}
      </p>
    </div>
  )
}

function DrawerPanel({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <section>
      <h3 className="font-display text-2xl text-slate-950">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function DrawerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="max-w-[58%] text-right text-sm text-slate-600">{value}</p>
    </div>
  )
}
