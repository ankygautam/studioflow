import { useState } from 'react'
import { SurfaceCard } from '../components/layout/app-shell'
import { DataTable } from '../components/ui/data-table'
import { DetailDrawer } from '../components/ui/detail-drawer'
import { PageHeader } from '../components/ui/page-header'
import { StatusBadge } from '../components/ui/status-badge'

type Service = {
  category: string
  deposit: string
  duration: string
  id: string
  name: string
  price: string
  staff: string[]
}

const services: Service[] = [
  {
    category: 'Tattoo',
    deposit: '$100 required',
    duration: '90 min',
    id: 'svc-1',
    name: 'Fine line consultation',
    price: '$180',
    staff: ['Nina Hart'],
  },
  {
    category: 'Barber',
    deposit: 'Optional',
    duration: '60 min',
    id: 'svc-2',
    name: 'Skin fade + beard sculpt',
    price: '$72',
    staff: ['Luis Cole'],
  },
  {
    category: 'Beauty',
    deposit: '$35 required',
    duration: '75 min',
    id: 'svc-3',
    name: 'Luxury blowout',
    price: '$95',
    staff: ['Elena Cross', 'Ava Reed'],
  },
] as const

export function ServicesPage() {
  const [activeServiceId, setActiveServiceId] = useState<string | null>(services[0].id)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const activeService = services.find((service) => service.id === activeServiceId) ?? services[0]

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
            onClick={() => {
              setActiveServiceId(null)
              setIsModalOpen(true)
            }}
          >
            Add service
          </button>
        }
        description="Service setup designed for premium operations, with pricing, duration, deposits, categories, and staff assignment always easy to scan."
        eyebrow="Services"
        title="Service catalog"
      />

      <section className="flex flex-wrap items-end gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
        <InlineSelect label="Category" options={['All categories', 'Tattoo', 'Barber', 'Beauty', 'Wellness']} value="All categories" />
        <InlineSelect label="Staff" options={['All staff', 'Nina Hart', 'Luis Cole', 'Elena Cross']} value="All staff" />
        <div className="ml-auto flex flex-wrap gap-3">
          <button className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white">
            Deposits only
          </button>
          <button className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white">
            High value
          </button>
        </div>
      </section>

      <section>
        <SurfaceCard title="Services">
          <DataTable columns={['Service', 'Category', 'Duration', 'Price', 'Deposit', 'Assigned staff']}>
            {services.map((service) => (
              <tr key={service.id}>
                <td className="px-4 py-4">
                  <button
                    className="font-semibold text-slate-950 transition hover:text-slate-700"
                    onClick={() => {
                      setActiveServiceId(service.id)
                      setIsModalOpen(true)
                    }}
                    type="button"
                  >
                    {service.name}
                  </button>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{service.category}</td>
                <td className="px-4 py-4">
                  <StatusBadge tone="violet">{service.duration}</StatusBadge>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{service.price}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{service.deposit}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{service.staff.join(', ')}</td>
              </tr>
            ))}
          </DataTable>
        </SurfaceCard>
      </section>

      <DetailDrawer
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <button
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
              Save service
            </button>
          </div>
        }
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        subtitle="Service details"
        title={activeServiceId ? 'Edit service' : 'Add service'}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {['Service name', 'Category', 'Duration', 'Price', 'Deposit', 'Assigned staff'].map((field) => (
            <div
              key={field}
              className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-400"
            >
              {field}
            </div>
          ))}
        </div>
        {activeServiceId ? (
          <div className="mt-6 space-y-4">
            <InfoCard label="Selected service" value={activeService.name} />
            <InfoCard label="Category" value={activeService.category} />
            <InfoCard label="Duration" value={activeService.duration} />
            <InfoCard label="Price" value={activeService.price} />
            <InfoCard label="Deposit" value={activeService.deposit} />
          </div>
        ) : null}
      </DetailDrawer>
    </div>
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

function InlineSelect({
  label,
  options,
  value,
}: {
  label: string
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
