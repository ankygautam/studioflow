import { useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { DetailDrawer } from '../components/ui/detail-drawer'
import { StatusBadge } from '../components/ui/status-badge'

const clients = [
  {
    consent: 'Signed',
    email: 'maya@studioflow.co',
    id: 'client-1',
    lastVisit: 'Mar 18',
    name: 'Maya Laurent',
    note: 'Prefers direct follow-up by text.',
    phone: '(555) 218-4422',
  },
  {
    consent: 'Pending',
    email: 'amara@studioflow.co',
    id: 'client-2',
    lastVisit: 'Mar 16',
    name: 'Amara Singh',
    note: 'Needs jewelry placement approval before booking.',
    phone: '(555) 392-1882',
  },
  {
    consent: 'Signed',
    email: 'drew@studioflow.co',
    id: 'client-3',
    lastVisit: 'Mar 14',
    name: 'Drew Foster',
    note: 'Usually books barber package every 3 weeks.',
    phone: '(555) 555-8184',
  },
] as const

export function ClientsPage() {
  const [selectedId, setSelectedId] = useState<string>(clients[0].id)
  const selectedClient = clients.find((client) => client.id === selectedId) ?? clients[0]

  return (
    <div className="space-y-6">
      <Hero
        eyebrow="Clients"
        title="Client relationships"
        description="A clean CRM-style view for client records, notes, consent visibility, and appointment history."
      />

      <section>
        <SurfaceCard title="Client list">
          <div className="space-y-3">
            {clients.map((client) => (
              <button
                key={client.id}
                className={[
                  'w-full rounded-[24px] border px-4 py-4 text-left transition',
                  selectedId === client.id
                    ? 'border-slate-300 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]'
                    : 'border-slate-200 bg-slate-50 hover:bg-white',
                ].join(' ')}
                onClick={() => setSelectedId(client.id)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{client.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{client.email}</p>
                  </div>
                  <StatusBadge tone={client.consent === 'Signed' ? 'success' : 'attention'}>
                    {client.consent}
                  </StatusBadge>
                </div>
                <p className="mt-4 text-sm text-slate-600">{client.note}</p>
              </button>
            ))}
          </div>
        </SurfaceCard>
      </section>

      <DetailDrawer
        footer={
          <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            Open full record
          </button>
        }
        onClose={() => setSelectedId('')}
        open={Boolean(selectedClient && selectedId)}
        subtitle="Client profile"
        title={selectedClient.name}
      >
        <div className="grid gap-6">
          <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,rgba(183,217,255,0.16),rgba(181,234,216,0.18))] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Profile</p>
                <h2 className="mt-3 font-display text-3xl text-slate-950">{selectedClient.name}</h2>
              </div>
              <StatusBadge tone={selectedClient.consent === 'Signed' ? 'success' : 'attention'}>
                {selectedClient.consent} consent
              </StatusBadge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoCard label="Phone" value={selectedClient.phone} />
              <InfoCard label="Email" value={selectedClient.email} />
              <InfoCard label="Last visit" value={selectedClient.lastVisit} />
              <InfoCard label="Preferred contact" value="Text first" />
            </div>
          </div>

          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Notes</p>
            <div className="mt-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm leading-7 text-slate-600">{selectedClient.note}</p>
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Consent status</p>
            <div className="mt-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">{selectedClient.consent}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Waiver visibility stays close to the profile so the team can spot outstanding approvals before service begins.
              </p>
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Appointment history</p>
            <div className="mt-3 space-y-3">
              {['Fine line consult • Mar 18', 'Touch-up planning • Feb 24', 'Reference review • Jan 12'].map((entry) => (
                <div key={entry} className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {entry}
                </div>
              ))}
            </div>
          </section>
        </div>
      </DetailDrawer>
    </div>
  )
}

function Hero({
  description,
  eyebrow,
  title,
}: {
  description: string
  eyebrow: string
  title: string
}) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)] md:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.38em] text-slate-400">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl text-slate-950">{title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{description}</p>
    </section>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/80 bg-white px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-700">{value}</p>
    </div>
  )
}
