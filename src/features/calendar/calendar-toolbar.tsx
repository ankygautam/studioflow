import type { AppointmentStatus } from '../../lib/api/types'
import type { CalendarView } from './types'

export function CalendarToolbar({
  hasActiveFilters,
  onResetFilters,
  selectedService,
  selectedStaff,
  selectedStatus,
  services,
  setSelectedService,
  setSelectedStaff,
  setSelectedStatus,
  setView,
  staffMembers,
  view,
}: {
  hasActiveFilters: boolean
  onResetFilters: () => void
  selectedService: string
  selectedStaff: string
  selectedStatus: 'ALL' | AppointmentStatus
  services: { id: string; name: string }[]
  setSelectedService: (value: string) => void
  setSelectedStaff: (value: string) => void
  setSelectedStatus: (value: 'ALL' | AppointmentStatus) => void
  setView: (value: CalendarView) => void
  staffMembers: { displayName: string; id: string }[]
  view: CalendarView
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ToolbarSelect
        label="Staff"
        onChange={setSelectedStaff}
        options={[
          { label: 'All staff', value: 'ALL' },
          ...staffMembers.map((staffMember) => ({
            label: staffMember.displayName,
            value: staffMember.id,
          })),
        ]}
        value={selectedStaff}
      />
      <ToolbarSelect
        label="Service"
        onChange={setSelectedService}
        options={[
          { label: 'All services', value: 'ALL' },
          ...services.map((service) => ({ label: service.name, value: service.id })),
        ]}
        value={selectedService}
      />
      <ToolbarSelect
        label="Status"
        onChange={(value) => setSelectedStatus(value as 'ALL' | AppointmentStatus)}
        options={[
          { label: 'All statuses', value: 'ALL' },
          ...(['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const).map((status) => ({
            label: humanizeEnum(status),
            value: status,
          })),
        ]}
        value={selectedStatus}
      />
      {hasActiveFilters ? (
        <div className="flex items-end">
          <button
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
            onClick={onResetFilters}
            type="button"
          >
            Reset filters
          </button>
        </div>
      ) : null}
      <div className="ml-auto flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
        {(['Day', 'Week', 'Month'] as const).map((option) => (
          <button
            key={option}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              view === option ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-white hover:text-slate-900',
            ].join(' ')}
            onClick={() => setView(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function ToolbarSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  value: string
}) {
  return (
    <label className="min-w-[170px]">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
        {label}
      </span>
      <select
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function humanizeEnum(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}
