import { motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { SideDrawer } from '../../components/shared/side-drawer'

type StaffMember = {
  assignedServices: string[]
  bookingsToday: number
  commission: string
  id: string
  leaveDays: string[]
  name: string
  performance: { label: string; value: string }[]
  role: string
  schedule: string[]
  specialties: string[]
  workingDays: string
}

const staffMembers: StaffMember[] = [
  {
    assignedServices: ['Fine line tattoo', 'Lettering touch-ups', 'Consultations'],
    bookingsToday: 5,
    commission: '42%',
    id: 'staff-1',
    leaveDays: ['Apr 12', 'Apr 13'],
    name: 'Nina Hart',
    performance: [
      { label: 'Revenue this week', value: '$2.4k' },
      { label: 'Utilization', value: '88%' },
      { label: 'Completion rate', value: '96%' },
    ],
    role: 'Senior Artist',
    schedule: ['Mon 10 AM - 6 PM', 'Tue 10 AM - 6 PM', 'Thu 11 AM - 7 PM'],
    specialties: ['Fine line', 'Blackwork', 'Consultation'],
    workingDays: 'Mon, Tue, Thu, Fri',
  },
  {
    assignedServices: ['Balayage refresh', 'Gloss and trim', 'Color correction'],
    bookingsToday: 4,
    commission: '36%',
    id: 'staff-2',
    leaveDays: ['Apr 29'],
    name: 'Elena Cross',
    performance: [
      { label: 'Revenue this week', value: '$2.1k' },
      { label: 'Utilization', value: '84%' },
      { label: 'Rebook rate', value: '72%' },
    ],
    role: 'Color Specialist',
    schedule: ['Wed 9 AM - 5 PM', 'Thu 9 AM - 5 PM', 'Sat 10 AM - 4 PM'],
    specialties: ['Color', 'Balayage', 'Finish styling'],
    workingDays: 'Wed, Thu, Fri, Sat',
  },
  {
    assignedServices: ['Skin fade', 'Beard sculpt', 'Premium grooming'],
    bookingsToday: 6,
    commission: '30%',
    id: 'staff-3',
    leaveDays: ['None scheduled'],
    name: 'Luis Cole',
    performance: [
      { label: 'Revenue this week', value: '$1.8k' },
      { label: 'Utilization', value: '80%' },
      { label: 'Upsell rate', value: '41%' },
    ],
    role: 'Lead Barber',
    schedule: ['Tue 11 AM - 7 PM', 'Thu 11 AM - 7 PM', 'Sat 9 AM - 5 PM'],
    specialties: ['Fade work', 'Beard styling', 'Hot towel service'],
    workingDays: 'Tue, Thu, Fri, Sat',
  },
]

export function StaffPage() {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const selectedStaff =
    staffMembers.find((member) => member.id === selectedStaffId) ?? null

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,40,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.35em] text-slate-500">
              Team management
            </p>
            <h1 className="mt-3 font-display text-4xl text-slate-950">Staff</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Manage specialists, schedules, commissions, and service coverage with
              a clean staff operations view.
            </p>
          </div>
          <button
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="button"
          >
            Add staff
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {staffMembers.map((member, index) => (
          <motion.button
            key={member.id}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 text-left shadow-[0_16px_40px_rgba(15,23,40,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(15,23,40,0.08)]"
            initial={{ opacity: 0, y: 10 }}
            onClick={() => setSelectedStaffId(member.id)}
            transition={{ delay: index * 0.04, duration: 0.24 }}
            type="button"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#9ed7d2,#a8c6f1)] font-display text-lg text-slate-950">
                  {member.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
                </div>
                <div>
                  <p className="font-display text-2xl text-slate-950">{member.name}</p>
                  <p className="text-sm text-slate-500">{member.role}</p>
                </div>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                {member.commission}
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              <InfoLine label="Specialties" value={member.specialties.join(', ')} />
              <InfoLine label="Working days" value={member.workingDays} />
              <div className="grid grid-cols-2 gap-3">
                <MetricPill label="Bookings today" value={String(member.bookingsToday)} />
                <MetricPill label="Commission" value={member.commission} />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <SideDrawer
        onClose={() => setSelectedStaffId(null)}
        open={Boolean(selectedStaff)}
        subtitle="Schedule, leave, services, and performance details"
        title={selectedStaff?.name ?? 'Staff profile'}
      >
        {selectedStaff ? (
          <div className="space-y-6">
            <DrawerBlock title="Profile">
              <InfoLine label="Role" value={selectedStaff.role} />
              <InfoLine label="Working days" value={selectedStaff.workingDays} />
              <InfoLine
                label="Specialties"
                value={selectedStaff.specialties.join(', ')}
              />
            </DrawerBlock>

            <DrawerBlock title="Schedule">
              <div className="space-y-3">
                {selectedStaff.schedule.map((entry) => (
                  <div
                    key={entry}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </DrawerBlock>

            <DrawerBlock title="Leave days">
              <div className="space-y-3">
                {selectedStaff.leaveDays.map((entry) => (
                  <div
                    key={entry}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </DrawerBlock>

            <DrawerBlock title="Assigned services">
              <div className="flex flex-wrap gap-2">
                {selectedStaff.assignedServices.map((service) => (
                  <span
                    key={service}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </DrawerBlock>

            <DrawerBlock title="Performance metrics">
              <div className="grid gap-3">
                {selectedStaff.performance.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-slate-700">{metric.label}</p>
                    <p className="text-sm font-semibold text-slate-900">{metric.value}</p>
                  </div>
                ))}
              </div>
            </DrawerBlock>
          </div>
        ) : null}
      </SideDrawer>
    </div>
  )
}

function DrawerBlock({
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

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
