import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SurfaceCard } from '../components/layout/app-shell'
import { ActivityFeed } from '../components/ui/activity-feed'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/async-state'
import { DataTable } from '../components/ui/data-table'
import { StatusBadge } from '../components/ui/status-badge'
import { canViewAuditHistory } from '../features/auth/authorization'
import { useAuth } from '../features/auth/use-auth'
import { useRemoteList } from '../hooks/use-remote-list'
import { getAuditLogs } from '../lib/api/audit-api'
import { getAppointments } from '../lib/api/appointments-api'
import { getConsentFormSubmissions } from '../lib/api/consent-forms-api'
import { getDefaultStudioId } from '../lib/api/http'
import { getNotifications, getUnreadNotificationCount } from '../lib/api/notifications-api'
import { getPayments } from '../lib/api/payments-api'
import type { NotificationRecord } from '../lib/api/types'
import { formatCurrency, formatDate, formatTime, humanizeEnum } from '../lib/formatters'

export function DashboardPage() {
  const navigate = useNavigate()
  const { selectedLocationId, user } = useAuth()
  const defaultStudioId = getDefaultStudioId()
  const canViewActivity = user ? canViewAuditHistory(user.role) : false
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadCountError, setUnreadCountError] = useState<string | null>(null)

  const loadAppointments = useCallback(
    () => getAppointments(defaultStudioId, selectedLocationId),
    [defaultStudioId, selectedLocationId],
  )
  const loadPayments = useCallback(
    () => getPayments({ locationId: selectedLocationId, studioId: defaultStudioId }),
    [defaultStudioId, selectedLocationId],
  )
  const loadNotifications = useCallback(
    () => getNotifications({ limit: 4, unreadOnly: true }),
    [],
  )
  const loadConsentSubmissions = useCallback(
    () => getConsentFormSubmissions({ studioId: defaultStudioId }),
    [defaultStudioId],
  )
  const loadAuditLogs = useCallback(
    () => (canViewActivity ? getAuditLogs({ limit: 5, locationId: selectedLocationId }) : Promise.resolve([])),
    [canViewActivity, selectedLocationId],
  )

  const { data: appointments, error: appointmentsError, isLoading: appointmentsLoading } = useRemoteList(loadAppointments)
  const { data: payments } = useRemoteList(loadPayments)
  const { data: unreadNotifications, error: notificationsError, isLoading: notificationsLoading } = useRemoteList(loadNotifications)
  const { data: consentSubmissions, error: consentError, isLoading: consentLoading } = useRemoteList(loadConsentSubmissions)
  const {
    data: auditLogs,
    error: auditError,
    isLoading: auditLoading,
    reload: reloadAuditLogs,
  } = useRemoteList(loadAuditLogs)

  useEffect(() => {
    let active = true

    void getUnreadNotificationCount()
      .then((response) => {
        if (active) {
          setUnreadCount(response.unreadCount)
          setUnreadCountError(null)
        }
      })
      .catch((error) => {
        if (active) {
          setUnreadCountError(error instanceof Error ? error.message : 'Unable to load unread count.')
        }
      })

    return () => {
      active = false
    }
  }, [])

  const today = getTodayDateValue()
  const todayAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.appointmentDate === today).slice(0, 5),
    [appointments, today],
  )
  const upcomingAppointments = useMemo(
    () =>
      [...appointments]
        .filter((appointment) => appointment.appointmentDate >= today && appointment.status !== 'CANCELLED')
        .sort((left, right) =>
          `${left.appointmentDate}T${left.startTime}`.localeCompare(`${right.appointmentDate}T${right.startTime}`),
        )
        .slice(0, 4),
    [appointments, today],
  )
  const pendingConsent = useMemo(
    () => consentSubmissions.filter((submission) => submission.status === 'PENDING').slice(0, 3),
    [consentSubmissions],
  )
  const todayRevenue = useMemo(
    () =>
      payments
        .filter((payment) => payment.appointmentDate === today)
        .reduce((sum, payment) => sum + payment.amount, 0),
    [payments, today],
  )
  const pendingDeposits = useMemo(
    () =>
      payments
        .filter((payment) => payment.paymentStatus !== 'PAID')
        .reduce((sum, payment) => sum + payment.depositAmount, 0),
    [payments],
  )
  const paidRecords = useMemo(
    () => payments.filter((payment) => payment.paymentStatus === 'PAID').length,
    [payments],
  )
  const completedToday = useMemo(
    () => todayAppointments.filter((appointment) => appointment.status === 'COMPLETED').length,
    [todayAppointments],
  )

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
              StudioFlow Workspace
            </p>
            <h1 className="mt-3 font-display text-4xl text-slate-950 md:text-5xl">
              Keep the day moving with less friction
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              Focus the team on today&apos;s bookings, urgent client follow-up, and the location context that matters right now.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <StatusBadge tone={selectedLocationId ? 'calm' : 'neutral'}>
                {selectedLocationId ? 'Location filtered' : 'All active locations'}
              </StatusBadge>
              <span>{todayAppointments.length} bookings today</span>
              <span>{unreadCount} unread alerts</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700"
              onClick={() => navigate('/appointments')}
              type="button"
            >
              Open appointments
            </button>
            <button
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
              onClick={() => navigate('/calendar')}
              type="button"
            >
              Open calendar
            </button>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          helper={`${completedToday} completed so far`}
          label="Today's bookings"
          value={String(todayAppointments.length)}
        />
        <MetricCard
          helper="Based on live appointment-linked payments"
          label="Revenue snapshot"
          value={formatCurrency(todayRevenue)}
        />
        <MetricCard
          helper="Deposits still awaiting payment completion"
          label="Pending deposits"
          value={formatCurrency(pendingDeposits)}
        />
        <MetricCard
          helper={unreadCountError ? 'Unread count is temporarily unavailable' : 'Unread reminders and team activity'}
          label="Unread alerts"
          value={String(unreadCount)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <SurfaceCard
          action={
            <button
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600"
              onClick={() => navigate('/calendar')}
              type="button"
            >
              View full day
            </button>
          }
          title="Today's appointments"
        >
          {appointmentsLoading ? <LoadingState title="Loading today's bookings..." /> : null}
          {!appointmentsLoading && appointmentsError ? <ErrorState message={appointmentsError} /> : null}
          {!appointmentsLoading && !appointmentsError && todayAppointments.length === 0 ? (
            <EmptyState
              description="Bookings scheduled for today will appear here as soon as the calendar fills up."
              title="No appointments today"
            />
          ) : null}
          {!appointmentsLoading && !appointmentsError && todayAppointments.length > 0 ? (
            <DataTable columns={['Time', 'Client', 'Service', 'Status']}>
              {todayAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                    {formatTime(appointment.startTime)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-950">{appointment.customerName}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{appointment.locationName}</p>
                    </div>
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

        <SurfaceCard title="Operational pulse">
          <div className="space-y-4">
            <PulseMetric
              label="Paid records"
              value={String(paidRecords)}
              tone="success"
            />
            <PulseMetric
              label="Pending forms"
              value={String(pendingConsent.length)}
              tone={pendingConsent.length > 0 ? 'attention' : 'neutral'}
            />
            <PulseMetric
              label="Unread notifications"
              value={String(unreadCount)}
              tone={unreadCount > 0 ? 'calm' : 'neutral'}
            />

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-950">Upcoming bookings</p>
                <button
                  className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                  onClick={() => navigate('/appointments')}
                  type="button"
                >
                  See all
                </button>
              </div>

              {appointmentsLoading ? <div className="mt-3"><LoadingState title="Loading upcoming bookings..." /></div> : null}
              {!appointmentsLoading && !appointmentsError && upcomingAppointments.length === 0 ? (
                <div className="mt-3">
                  <EmptyState
                    description="As new bookings come in, the next few appointments will stay surfaced here."
                    title="No upcoming bookings"
                  />
                </div>
              ) : null}
              {!appointmentsLoading && !appointmentsError && upcomingAppointments.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <button
                      key={appointment.id}
                      className="flex w-full items-center justify-between gap-4 rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300"
                      onClick={() => navigate('/appointments')}
                      type="button"
                    >
                      <div>
                        <p className="font-semibold text-slate-950">{appointment.customerName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatDate(appointment.appointmentDate)} at {formatTime(appointment.startTime)}
                        </p>
                      </div>
                      <StatusBadge tone={appointmentTone(appointment.status)}>
                        {humanizeEnum(appointment.status)}
                      </StatusBadge>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <SurfaceCard
          action={
            <button
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600"
              onClick={() => navigate('/forms')}
              type="button"
            >
              Open forms
            </button>
          }
          title="Forms and reminders"
        >
          {consentLoading ? <LoadingState title="Loading consent records..." /> : null}
          {!consentLoading && consentError ? <ErrorState message={consentError} /> : null}
          {!consentLoading && !consentError && pendingConsent.length === 0 ? (
            <EmptyState
              description="Pending consent requests will surface here when a client still needs to review or sign a form."
              title="No pending forms"
            />
          ) : null}
          {!consentLoading && !consentError && pendingConsent.length > 0 ? (
            <div className="space-y-3">
              {pendingConsent.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{submission.customerName}</p>
                      <p className="mt-1 text-sm text-slate-500">{submission.templateTitle}</p>
                    </div>
                    <StatusBadge tone="attention">Pending</StatusBadge>
                  </div>
                  {submission.appointmentDate ? (
                    <p className="mt-3 text-sm text-slate-600">
                      Linked to {formatDate(submission.appointmentDate)}
                      {submission.appointmentStartTime ? ` at ${formatTime(submission.appointmentStartTime)}` : ''}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-950">Unread notifications</p>
              <button
                className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                onClick={() => navigate('/appointments')}
                type="button"
              >
                Open workspace
              </button>
            </div>
            {notificationsLoading ? <div className="mt-3"><LoadingState title="Loading notifications..." /></div> : null}
            {!notificationsLoading && notificationsError ? <div className="mt-3"><ErrorState message={notificationsError} /></div> : null}
            {!notificationsLoading && !notificationsError && unreadNotifications.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  description="Fresh reminders, bookings, and client-facing activity will appear here when the day picks up."
                  title="No unread notifications"
                />
              </div>
            ) : null}
            {!notificationsLoading && !notificationsError && unreadNotifications.length > 0 ? (
              <div className="mt-3 space-y-3">
                {unreadNotifications.map((notification) => (
                  <NotificationPreview
                    key={notification.id}
                    notification={notification}
                    onOpen={() => navigate(notification.actionUrl ?? '/appointments')}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </SurfaceCard>

        <SurfaceCard
          action={canViewActivity ? (
            <button
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600"
              onClick={() => navigate('/audit-logs')}
              type="button"
            >
              View audit logs
            </button>
          ) : undefined}
          title={canViewActivity ? 'Recent team activity' : 'Activity overview'}
        >
          {canViewActivity ? (
            <ActivityFeed
              entries={auditLogs}
              error={auditError}
              isLoading={auditLoading}
              onRetry={() => void reloadAuditLogs()}
            />
          ) : (
            <EmptyState
              description="Operational activity history is available for admin accounts so the workspace can stay calm and accountable."
              title="Activity is managed by your workspace admin"
            />
          )}
        </SurfaceCard>
      </section>
    </div>
  )
}

function MetricCard({
  helper,
  label,
  value,
}: {
  helper: string
  label: string
  value: string
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(240,245,252,0.85))] p-5 shadow-[0_18px_44px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-4 font-display text-4xl text-slate-950">{value}</p>
      <p className="mt-4 text-sm text-slate-500">{helper}</p>
    </div>
  )
}

function PulseMetric({
  label,
  tone,
  value,
}: {
  label: string
  tone: 'attention' | 'calm' | 'neutral' | 'success'
  value: string
}) {
  return (
    <div className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      </div>
      <StatusBadge tone={tone}>{label}</StatusBadge>
    </div>
  )
}

function NotificationPreview({
  notification,
  onOpen,
}: {
  notification: NotificationRecord
  onOpen: () => void
}) {
  return (
    <button
      className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-300"
      onClick={onOpen}
      type="button"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-slate-950">{notification.title}</p>
        <StatusBadge tone="calm">{humanizeEnum(notification.type)}</StatusBadge>
      </div>
      <p className="mt-2 text-sm leading-7 text-slate-600">{notification.message}</p>
    </button>
  )
}

function appointmentTone(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'CONFIRMED':
      return 'calm'
    case 'BOOKED':
      return 'neutral'
    case 'NO_SHOW':
      return 'danger'
    case 'CANCELLED':
      return 'danger'
    default:
      return 'neutral'
  }
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10)
}
