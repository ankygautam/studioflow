import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { AppRole } from '../../data/navigation'

type ServicesPageProps = {
  role: AppRole
}

type ServiceCategory =
  | 'All'
  | 'Barber'
  | 'Beauty'
  | 'Piercing'
  | 'Salon'
  | 'Tattoo'
  | 'Wellness'

type ServiceRecord = {
  assignedStaff: string[]
  category: Exclude<ServiceCategory, 'All'>
  depositRequired: boolean
  duration: string
  name: string
  price: string
}

const categories: ServiceCategory[] = [
  'All',
  'Tattoo',
  'Salon',
  'Barber',
  'Piercing',
  'Wellness',
  'Beauty',
]

const services: ServiceRecord[] = [
  {
    assignedStaff: ['Nina Hart'],
    category: 'Tattoo',
    depositRequired: true,
    duration: '2 hrs',
    name: 'Fine line tattoo',
    price: '$240',
  },
  {
    assignedStaff: ['Elena Cross'],
    category: 'Salon',
    depositRequired: true,
    duration: '3 hrs',
    name: 'Balayage refresh',
    price: '$210',
  },
  {
    assignedStaff: ['Luis Cole'],
    category: 'Barber',
    depositRequired: false,
    duration: '1 hr',
    name: 'Premium barber package',
    price: '$75',
  },
  {
    assignedStaff: ['Jules Kim'],
    category: 'Piercing',
    depositRequired: true,
    duration: '45 min',
    name: 'Curated ear stack',
    price: '$140',
  },
  {
    assignedStaff: ['Ava Lane'],
    category: 'Wellness',
    depositRequired: true,
    duration: '90 min',
    name: 'Deep tissue reset',
    price: '$160',
  },
  {
    assignedStaff: ['Mira Tate'],
    category: 'Beauty',
    depositRequired: false,
    duration: '60 min',
    name: 'Editorial makeup session',
    price: '$120',
  },
]

export function ServicesPage({ role }: ServicesPageProps) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('All')
  const [query, setQuery] = useState('')

  const visibleServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        activeCategory === 'All' ? true : service.category === activeCategory
      const matchesQuery =
        service.name.toLowerCase().includes(query.toLowerCase()) ||
        service.category.toLowerCase().includes(query.toLowerCase())

      return matchesCategory && matchesQuery
    })
  }, [activeCategory, query])

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,40,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.35em] text-slate-500">
              Service catalog
            </p>
            <h1 className="mt-3 font-display text-4xl text-slate-950">Services</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Role-aware service management for {role} workflows, with category
              grouping, deposit rules, assigned staff, and quick actions.
            </p>
          </div>
          <button
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="button"
          >
            Add service
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={[
                  'rounded-full border px-4 py-2 text-sm font-semibold transition',
                  activeCategory === category
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900',
                ].join(' ')}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>

          <input
            className="h-12 w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search services or categories"
            value={query}
          />
        </div>
      </div>

      {visibleServices.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_16px_40px_rgba(15,23,40,0.04)]">
          <p className="font-display text-3xl text-slate-950">No services found</p>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-500">
            Try a different search or category filter to bring services back into
            view.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleServices.map((service, index) => (
            <motion.div
              key={`${service.category}-${service.name}`}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,40,0.05)]"
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: index * 0.03, duration: 0.22 }}
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_1fr] md:items-center xl:flex-1">
                  <div>
                    <p className="font-display text-2xl text-slate-950">{service.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{service.category}</p>
                  </div>
                  <InfoTile label="Duration" value={service.duration} />
                  <InfoTile label="Price" value={service.price} />
                  <InfoTile
                    label="Deposit"
                    value={service.depositRequired ? 'Required' : 'Optional'}
                  />
                  <InfoTile
                    label="Assigned staff"
                    value={service.assignedStaff.join(', ')}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Edit', 'Duplicate', 'Archive'].map((action) => (
                    <button
                      key={action}
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                      type="button"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  )
}
