import { useCallback, useState } from 'react'
import { AppointmentDrawer } from '../components/appointments/appointment-drawer'
import { SurfaceCard } from '../components/layout/app-shell'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { DataTable } from '../components/ui/data-table'
import { PageHeader } from '../components/ui/page-header'
import { StatusBadge } from '../components/ui/status-badge'
import { canCreateBookings, canDeleteAppointments, canEditAppointments } from '../features/auth/authorization'
import { useAuth } from '../features/auth/use-auth'
import { useRemoteList } from '../hooks/use-remote-list'
import { appointmentTone } from '../lib/appointments'
import { getAppointments } from '../lib/api/appointments-api'
import { getDefaultStudioId } from '../lib/api/http'
import type { AppointmentRecord } from '../lib/api/types'
import { formatDate, formatTime, humanizeEnum } from '../lib/formatters'

export function AppointmentsPage() {
  const { selectedLocationId, user } = useAuth()
  const allowCreate = user ? canCreateBookings(user.role) : false
  const allowDelete = user ? canDeleteAppointments(user.role) : false
  const allowEdit = user ? canEditAppointments(user.role) : false
  const defaultStudioId = user?.studioId ?? getDefaultStudioId()
  const loadAppointments = useCallback(
    () => getAppointments(defaultStudioId, selectedLocationId),
    [defaultStudioId, selectedLocationId],
  )
  const { data: appointments, error, isLoading, reload } = useRemoteList(loadAppointments)

  const [filterValue, setFilterValue] = useState<'ALL' | 'THIS_MONTH' | 'TODAY' | 'NEXT_7_DAYS'>('ALL')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [editingAppointment, setEditingAppointment] = useState<AppointmentRecord | null>(null)

  const visibleAppointments = appointments
    .filter((appointment) => matchesAppointmentWindow(appointment, filterValue))
    .filter((appointment) => {
      if (!query.trim()) {
        return true
      }

      const searchValue = query.trim().toLowerCase()
      return [
        appointment.customerName,
        appointment.serviceName,
        appointment.staffName,
        humanizeEnum(appointment.status),
      ].some((value) => value.toLowerCase().includes(searchValue))
    })

  const openCreateDrawer = () => {
    setEditingAppointment(null)
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (appointment: AppointmentRecord) => {
    setEditingAppointment(appointment)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setEditingAppointment(null)
    setIsDrawerOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={allowCreate ? (
          <button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
            onClick={openCreateDrawer}
            type="button"
          >
            New booking
          </button>
        ) : null}
        description="A searchable appointment table with real backend data, lightweight scheduling filters, and editable booking details."
        eyebrow="Appointments"
        title="Appointment list"
      />

      <SurfaceCard title="Appointments">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <input
            className="h-12 min-w-[240px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by client, service, staff, or status"
            value={query}
          />
          <label className="min-w-[180px]">
            <span className="sr-only">Appointment filter</span>
            <select
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none"
              onChange={(event) => setFilterValue(event.target.value as typeof filterValue)}
              value={filterValue}
            >
              <option value="ALL">All appointments</option>
              <option value="THIS_MONTH">This month</option>
              <option value="TODAY">Today</option>
              <option value="NEXT_7_DAYS">Next 7 days</option>
            </select>
          </label>
        </div>

        {isLoading ? <LoadingState title="Loading appointments..." /> : null}
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
        {!isLoading && !error && visibleAppointments.length === 0 ? (
          <EmptyState
            action={
              allowCreate ? (
                <button
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  onClick={openCreateDrawer}
                  type="button"
                >
                  Create appointment
                </button>
              ) : null
            }
            description="Appointments will appear here once real booking records are available from the backend."
            title="No appointments matched this view"
          />
        ) : null}
        {!isLoading && !error && visibleAppointments.length > 0 ? (
          <DataTable columns={['Client', 'Location', 'Date', 'Time', 'Service', 'Status']}>
            {visibleAppointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-4 py-4">
                  <button
                    className="font-semibold text-slate-950 transition hover:text-slate-700"
                    onClick={() => {
                      if (allowEdit) {
                        openEditDrawer(appointment)
                      }
                    }}
                    type="button"
                  >
                    {appointment.customerName}
                  </button>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{appointment.locationName}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{formatDate(appointment.appointmentDate)}</td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{appointment.serviceName}</td>
                <td className="px-4 py-4">
                  <StatusBadge tone={appointmentTone(appointment.status)}>
                    {humanizeEnum(appointment.status)}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </DataTable>
        ) : null}
      </SurfaceCard>

      <AppointmentDrawer
        appointment={editingAppointment}
        allowCreate={allowCreate}
        allowDelete={allowDelete}
        onClose={closeDrawer}
        onSaved={reload}
        open={isDrawerOpen}
      />
    </div>
  )
}

function matchesAppointmentWindow(
  appointment: AppointmentRecord,
  filterValue: 'ALL' | 'THIS_MONTH' | 'TODAY' | 'NEXT_7_DAYS',
) {
  if (filterValue === 'ALL') {
    return true
  }

  const appointmentDate = new Date(`${appointment.appointmentDate}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (filterValue === 'TODAY') {
    return appointmentDate.getTime() === today.getTime()
  }

  if (filterValue === 'THIS_MONTH') {
    return (
      appointmentDate.getFullYear() === today.getFullYear() &&
      appointmentDate.getMonth() === today.getMonth()
    )
  }

  const endDate = new Date(today)
  endDate.setDate(today.getDate() + 6)

  return appointmentDate >= today && appointmentDate <= endDate
}
