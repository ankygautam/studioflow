import { useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { DataTable } from '../components/ui/data-table'
import { DetailDrawer } from '../components/ui/detail-drawer'
import { StatusBadge } from '../components/ui/status-badge'

const staffMembers = [
  {
    availability: 'Open after 3 PM',
    id: 'staff-1',
    name: 'Nina Hart',
    role: 'Senior Tattoo Artist',
    services: ['Consults', 'Micro realism', 'Fine line'],
  },
  {
    availability: 'Booked steady',
    id: 'staff-2',
    name: 'Elena Cross',
    role: 'Color Specialist',
    services: ['Color correction', 'Blowout', 'Gloss'],
  },
  {
    availability: 'Walk-ins enabled',
    id: 'staff-3',
    name: 'Luis Cole',
    role: 'Lead Barber',
    services: ['Fade', 'Beard sculpt', 'Hot towel'],
  },
] as const

export function StaffPage() {
  const [selectedId, setSelectedId] = useState<string>(staffMembers[0].id)
  const selectedStaff = staffMembers.find((staff) => staff.id === selectedId) ?? staffMembers[0]

  return (
    <div className="space-y-6">
      <Hero
        eyebrow="Staff"
        title="Team visibility"
        description="A simple staff table with clear roles, availability, and assigned services."
      />

      <section className="grid gap-6">
        <SurfaceCard title="Staff roster">
          <DataTable columns={['Name', 'Role', 'Availability', 'Assigned services']}>
            {staffMembers.map((staff) => (
              <tr key={staff.id}>
                <td className="px-4 py-4">
                  <button
                    className="font-semibold text-slate-950 transition hover:text-slate-700"
                    onClick={() => setSelectedId(staff.id)}
                    type="button"
                  >
                    {staff.name}
                  </button>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{staff.role}</td>
                <td className="px-4 py-4">
                  <StatusBadge tone="calm">{staff.availability}</StatusBadge>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{staff.services.join(', ')}</td>
              </tr>
            ))}
          </DataTable>
        </SurfaceCard>
      </section>

      <DetailDrawer
        footer={
          <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            Open schedule
          </button>
        }
        onClose={() => setSelectedId('')}
        open={Boolean(selectedId)}
        subtitle="Staff details"
        title={selectedStaff.name}
      >
        <div className="space-y-4">
          <InfoCard label="Role" value={selectedStaff.role} />
          <InfoCard label="Availability" value={selectedStaff.availability} />
          <InfoCard label="Assigned services" value={selectedStaff.services.join(', ')} />
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
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-7 text-slate-700">{value}</p>
    </div>
  )
}
