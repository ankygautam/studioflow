import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppointmentDrawer } from '../components/appointments/appointment-drawer'
import { SurfaceCard } from '../components/layout/app-shell'
import { StatusBadge } from '../components/ui/status-badge'
import { canCreateBookings, canUpdateAppointmentStatus } from '../features/auth/authorization'
import { useAuth } from '../features/auth/use-auth'
import { CalendarGrid } from '../features/calendar/calendar-grid'
import { CalendarToolbar } from '../features/calendar/calendar-toolbar'
import { getTimelineHours, getTodayDateValue, shiftDateValue, upsertAppointment } from '../features/calendar/calendar-utils'
import type { CalendarEvent } from '../features/calendar/types'
import { useCalendarData } from '../features/calendar/use-calendar-data'
import { useCalendarFilters } from '../features/calendar/use-calendar-filters'
import { useCalendarView } from '../features/calendar/use-calendar-view'
import { WaitlistMatchSuggestionsModal } from '../features/waitlist/waitlist-match-suggestions-modal'
import { appointmentTone, type AppointmentFormState } from '../lib/appointments'
import { getAppointments, updateAppointment } from '../lib/api/appointments-api'
import { getDefaultStudioId } from '../lib/api/http'
import { dispatchNotificationsRefresh } from '../lib/notifications'
import type { AppointmentRecord, AppointmentStatus } from '../lib/api/types'
import { humanizeEnum } from '../lib/formatters'

export function CalendarPage() {
  const { selectedLocationId, setSelectedLocationId, user } = useAuth()
  const allowCreate = user ? canCreateBookings(user.role) : false
  const canQuickUpdateStatus = user ? canUpdateAppointmentStatus(user.role) : false
  const defaultStudioId = user?.studioId ?? getDefaultStudioId()

  const [searchParams, setSearchParams] = useSearchParams()
  const [draft, setDraft] = useState<Partial<AppointmentFormState> | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentRecord | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [cancelledAppointmentForSuggestions, setCancelledAppointmentForSuggestions] = useState<AppointmentRecord | null>(null)
  const [pendingSavedAppointmentId, setPendingSavedAppointmentId] = useState<string | null>(null)
  const [quickActionAppointmentId, setQuickActionAppointmentId] = useState<string | null>(null)
  const [quickActionError, setQuickActionError] = useState<string | null>(null)
  const [quickActionStatus, setQuickActionStatus] = useState<AppointmentStatus | null>(null)
  const [visibilityRescueKey, setVisibilityRescueKey] = useState<string | null>(null)

  const {
    appointmentsError,
    appointmentsLoading,
    calendarEvents,
    normalizedAppointments,
    rawAppointments,
    reloadAppointments,
    services,
    servicesError,
    servicesLoading,
    setAppointments,
    staffError,
    staffLoading,
    staffMembers,
  } = useCalendarData(defaultStudioId, selectedLocationId)

  const {
    activeRangeLabel,
    focusAppointment,
    latestAppointmentDate,
    monthDays,
    selectedDate,
    setSelectedDate,
    setView,
    view,
    weekDays,
  } = useCalendarView(normalizedAppointments)

  const {
    dayAppointments,
    filteredAppointments,
    hasActiveFilters,
    resetFilters,
    selectedService,
    selectedStaff,
    selectedStatus,
    setSelectedService,
    setSelectedStaff,
    setSelectedStatus,
    visibleAppointments,
  } = useCalendarFilters({
    normalizedAppointments: calendarEvents,
    selectedDate,
    view,
  })

  const renderedAppointments = visibleAppointments
  const latestFilteredAppointmentDate = useMemo(() => {
    const latestAppointment = [...filteredAppointments].sort((left, right) =>
      right.start.localeCompare(left.start),
    )[0]

    return latestAppointment?.appointmentDate ?? null
  }, [filteredAppointments])
  const filteredAppointmentKey = useMemo(
    () => filteredAppointments.map((appointment) => `${appointment.id}:${appointment.appointmentDate}`).join('|'),
    [filteredAppointments],
  )

  const timelineHours = getTimelineHours(dayAppointments)
  const pendingSavedAppointment = useMemo(
    () =>
      pendingSavedAppointmentId
        ? calendarEvents.find((appointment) => appointment.id === pendingSavedAppointmentId) ?? null
        : null,
    [calendarEvents, pendingSavedAppointmentId],
  )

  const dependenciesLoading = appointmentsLoading || staffLoading || servicesLoading
  const dependenciesError = appointmentsError || staffError || servicesError

  useEffect(() => {
    if (!allowCreate || searchParams.get('newBooking') !== '1' || isDrawerOpen) {
      return
    }

    setEditingAppointment(null)
    setDraft({
      appointmentDate: selectedDate,
      locationId: selectedLocationId ?? '',
      source: 'ADMIN_CREATED',
      status: 'BOOKED',
    })
    setIsDrawerOpen(true)
  }, [allowCreate, isDrawerOpen, searchParams, selectedDate, selectedLocationId])

  useEffect(() => {
    if (pendingSavedAppointmentId) {
      return
    }

    if (dependenciesLoading || dependenciesError) {
      return
    }

    if (filteredAppointments.length === 0) {
      setVisibilityRescueKey(null)
      return
    }

    if (visibleAppointments.length > 0) {
      setVisibilityRescueKey(null)
      return
    }

    if (!latestFilteredAppointmentDate || visibilityRescueKey === filteredAppointmentKey) {
      return
    }

    focusAppointment(latestFilteredAppointmentDate)
    setVisibilityRescueKey(filteredAppointmentKey)
  }, [
    dependenciesError,
    dependenciesLoading,
    filteredAppointmentKey,
    filteredAppointments.length,
    focusAppointment,
    latestFilteredAppointmentDate,
    pendingSavedAppointmentId,
    visibilityRescueKey,
    visibleAppointments.length,
  ])

  useEffect(() => {
    if (!pendingSavedAppointment) {
      return
    }

    if (selectedDate !== pendingSavedAppointment.appointmentDate) {
      setSelectedDate(pendingSavedAppointment.appointmentDate)
    }

    if (view !== 'Day') {
      setView('Day')
    }

    if (hasActiveFilters) {
      resetFilters()
    }

    if (pendingSavedAppointment.locationId && pendingSavedAppointment.locationId !== selectedLocationId) {
      setSelectedLocationId(pendingSavedAppointment.locationId)
    }

    if (visibleAppointments.some((appointment) => appointment.id === pendingSavedAppointment.id)) {
      setPendingSavedAppointmentId(null)
      setVisibilityRescueKey(null)
    }
  }, [
    hasActiveFilters,
    pendingSavedAppointmentId,
    pendingSavedAppointment,
    resetFilters,
    selectedDate,
    selectedLocationId,
    setSelectedLocationId,
    setSelectedDate,
    setView,
    view,
    visibleAppointments,
  ])

  const closeDrawer = () => {
    setDraft(null)
    setEditingAppointment(null)
    setIsDrawerOpen(false)

    if (searchParams.get('newBooking') === '1') {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('newBooking')
      setSearchParams(nextParams)
    }
  }

  const openCreateDrawer = (nextDraft?: Partial<AppointmentFormState>) => {
    setEditingAppointment(null)
    setDraft({
      appointmentDate: selectedDate,
      locationId: selectedLocationId ?? '',
      source: 'ADMIN_CREATED',
      status: 'BOOKED',
      ...nextDraft,
    })
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (appointment: AppointmentRecord | CalendarEvent) => {
    setDraft(null)
    setEditingAppointment('title' in appointment ? appointment.source : appointment)
    setIsDrawerOpen(true)
  }

  const handleQuickStatusAction = async (appointment: CalendarEvent, nextStatus: AppointmentStatus) => {
    if (quickActionAppointmentId) {
      return
    }

    setQuickActionAppointmentId(appointment.id)
    setQuickActionStatus(nextStatus)
    setQuickActionError(null)

    try {
      const updatedAppointment = await updateAppointment(appointment.id, {
        appointmentDate: appointment.source.appointmentDate,
        customerProfileId: appointment.source.customerProfileId,
        endTime: appointment.source.endTime,
        locationId: appointment.source.locationId,
        notes: appointment.source.notes ?? '',
        serviceId: appointment.source.serviceId,
        source: appointment.source.source,
        staffProfileId: appointment.source.staffProfileId,
        startTime: appointment.source.startTime,
        status: nextStatus,
        studioId: appointment.source.studioId,
      })

      setAppointments((current) => upsertAppointment(current, updatedAppointment))
      dispatchNotificationsRefresh()

      if (nextStatus === 'CANCELLED' && appointment.source.status !== 'CANCELLED') {
        setCancelledAppointmentForSuggestions(updatedAppointment)
      }

      try {
        await reloadAppointments()
      } catch {
        setAppointments((current) => upsertAppointment(current, updatedAppointment))
      }
    } catch (error) {
      setQuickActionError(error instanceof Error ? error.message : 'Unable to update this appointment right now.')
    } finally {
      setQuickActionAppointmentId(null)
      setQuickActionStatus(null)
    }
  }
  
  return (
    <div className="space-y-6">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.05)] md:p-7"
        initial={{ opacity: 0, y: 14 }}
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.38em] text-slate-400">
              Scheduling Command
            </p>
            <h1 className="mt-3 font-display text-4xl text-slate-950 md:text-5xl">
              Booking calendar
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              A premium timeline for managing day-to-day appointments across staff, services, and booking states without visual clutter.
            </p>
            <p className="mt-3 text-sm font-medium text-slate-500">
              Showing {activeRangeLabel}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              className="h-12 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600 outline-none"
              onChange={(event) => setSelectedDate(event.target.value)}
              type="date"
              value={selectedDate}
            />
            {allowCreate ? (
              <button
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
                onClick={() => openCreateDrawer()}
                type="button"
              >
                New booking
              </button>
            ) : null}
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <SurfaceCard title="Calendar board">
          <div className="flex flex-col gap-4">
            <CalendarToolbar
              hasActiveFilters={hasActiveFilters}
              onResetFilters={resetFilters}
              selectedService={selectedService}
              selectedStaff={selectedStaff}
              selectedStatus={selectedStatus}
              services={services}
              setSelectedService={setSelectedService}
              setSelectedStaff={setSelectedStaff}
              setSelectedStatus={setSelectedStatus}
              setView={setView}
              staffMembers={staffMembers}
              view={view}
            />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-sm text-slate-500">
              <span>{rawAppointments.length} loaded</span>
              <span>{filteredAppointments.length} after filters</span>
              <span>{visibleAppointments.length} in current view</span>
            </div>

            <CalendarGrid
              activeRangeLabel={activeRangeLabel}
              allowCreate={allowCreate}
              canQuickUpdateStatus={canQuickUpdateStatus}
              calendarEvents={calendarEvents}
              dayAppointments={dayAppointments}
              dependenciesError={dependenciesError}
              dependenciesLoading={dependenciesLoading}
              filteredAppointmentsCount={filteredAppointments.length}
              hasActiveFilters={hasActiveFilters}
              monthDays={monthDays}
              onChangeDay={(offset) => {
                setQuickActionError(null)
                setSelectedDate(shiftDateValue(selectedDate, offset))
              }}
              onCreate={(nextDraft) => openCreateDrawer(nextDraft)}
              onEdit={(appointment) => openEditDrawer(appointment)}
              onJumpToLatest={() => {
                const nextFocusDate = latestFilteredAppointmentDate ?? latestAppointmentDate
                if (nextFocusDate) {
                  focusAppointment(nextFocusDate)
                }
              }}
              onJumpToToday={() => {
                setQuickActionError(null)
                setSelectedDate(getTodayDateValue())
              }}
              onQuickStatusAction={(appointment, nextStatus) => {
                void handleQuickStatusAction(appointment, nextStatus)
              }}
              onResetFilters={resetFilters}
              quickActionAppointmentId={quickActionAppointmentId}
              quickActionError={quickActionError}
              quickActionStatus={quickActionStatus}
              rawAppointmentsCount={rawAppointments.length}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              staffMembers={staffMembers}
              timelineHours={timelineHours}
              visibleAppointmentsCount={renderedAppointments.length}
              view={view}
              visibleAppointments={renderedAppointments}
              weekDays={weekDays}
            />
          </div>
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard title="Booking states">
            <div className="flex flex-wrap gap-2">
              {(['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const).map((status) => (
                <StatusBadge key={status} tone={appointmentTone(status)}>
                  {humanizeEnum(status)}
                </StatusBadge>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              <MiniInsight label="Bookings in view" value={String(renderedAppointments.length)} />
              <MiniInsight label="Staff visible" value={String(staffMembers.length)} />
              <MiniInsight label="Current view" value={`${view} board`} />
            </div>
          </SurfaceCard>
        </div>
      </section>

      <AppointmentDrawer
        appointment={editingAppointment}
        allowCreate={allowCreate}
        allowDelete={allowCreate}
        draft={draft}
        onCancelled={(cancelledAppointment) => {
          setCancelledAppointmentForSuggestions(cancelledAppointment)
        }}
        onClose={closeDrawer}
        onSaved={async (savedAppointment) => {
          if (!savedAppointment) {
            setPendingSavedAppointmentId(null)
            await reloadAppointments()
            return
          }

          setPendingSavedAppointmentId(savedAppointment.id)
          focusAppointment(savedAppointment.appointmentDate)
          setSelectedDate(savedAppointment.appointmentDate)
          setView('Day')
          resetFilters()
          const nextLocationId = savedAppointment.locationId ?? selectedLocationId ?? null

          if (nextLocationId) {
            setSelectedLocationId(nextLocationId)
          }

          setAppointments((current) => upsertAppointment(current, savedAppointment))

          try {
            const nextAppointments = await getAppointments(defaultStudioId, nextLocationId)
            setAppointments(upsertAppointment(nextAppointments, savedAppointment))
          } catch {
            setAppointments((current) => upsertAppointment(current, savedAppointment))
          }
        }}
        open={isDrawerOpen}
      />

      <WaitlistMatchSuggestionsModal
        appointment={cancelledAppointmentForSuggestions}
        onClose={() => setCancelledAppointmentForSuggestions(null)}
        open={cancelledAppointmentForSuggestions !== null}
      />
    </div>
  )
}

function MiniInsight({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="text-sm text-slate-500">{value}</p>
    </div>
  )
}
