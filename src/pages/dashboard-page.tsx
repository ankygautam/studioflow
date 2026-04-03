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
  const defaultStudioId = user?.studioId ?? getDefaultStudioId()
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
  const { data: auditLogs, error: auditError, isLoading: auditLoading, reload: reloadAuditLogs } = useRemoteList(loadAuditLogs)

  useEffect(() => {
    let active = true
    void getUnreadNotificationCount()
      .then((r) => { if (active) { setUnreadCount(r.unreadCount); setUnreadCountError(null) } })
      .catch((e) => { if (active) setUnreadCountError(e instanceof Error ? e.message : 'Unavailable') })
    return () => { active = false }
  }, [])

  const today = getTodayDateValue()

  const todayAppointments = useMemo(
    () => appointments.filter((a) => a.appointmentDate === today).slice(0, 5),
    [appointments, today],
  )
  const upcomingAppointments = useMemo(
    () => [...appointments]
      .filter((a) => a.appointmentDate >= today && a.status !== 'CANCELLED')
      .sort((a, b) => `${a.appointmentDate}T${a.startTime}`.localeCompare(`${b.appointmentDate}T${b.startTime}`))
      .slice(0, 4),
    [appointments, today],
  )
  const pendingConsent = useMemo(
    () => consentSubmissions.filter((s) => s.status === 'PENDING').slice(0, 3),
    [consentSubmissions],
  )
  const todayRevenue = useMemo(
    () =>
      payments
        .filter((payment) => payment.paymentStatus === 'PAID' && payment.paidAt && payment.paidAt.slice(0, 10) === today)
        .reduce((sum, payment) => sum + payment.amount, 0),
    [payments, today],
  )
  const pendingDeposits = useMemo(
    () => payments.filter((p) => p.paymentStatus !== 'PAID').reduce((s, p) => s + p.depositAmount, 0),
    [payments],
  )
  const paidRecords = useMemo(
    () =>
      payments.filter((payment) => payment.paymentStatus === 'PAID' && payment.paidAt && payment.paidAt.slice(0, 10) === today).length,
    [payments, today],
  )
  const completedToday = useMemo(
    () => todayAppointments.filter((a) => a.status === 'COMPLETED').length,
    [todayAppointments],
  )

  const greeting = getGreeting()

  return (
    <div className="space-y-5">

      {/* ── Hero banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 md:p-7"
        style={{ background: 'linear-gradient(120deg,#16123a 0%,#2d1b6e 50%,#1e3a5f 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle,#7c5af6,transparent 70%)' }} />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#4f8ef7,transparent 70%)' }} />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-violet-300">{greeting}</p>
            <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
              {user?.fullName?.split(' ')[0] ?? 'Welcome back'} 👋
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {todayAppointments.length} bookings today · {unreadCount} unread alerts
              {selectedLocationId ? ' · Selected location' : ' · All locations'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              onClick={() => navigate('/appointments')}
              type="button"
            >
              Appointments
            </button>
            <button
              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-violet-400"
              onClick={() => navigate('/calendar')}
              type="button"
            >
              Open calendar
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Metric cards ── */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          accent="#7c5af6"
          accentBg="rgba(124,90,246,0.08)"
          helper={`${completedToday} completed`}
          label="Today's bookings"
          value={String(todayAppointments.length)}
          icon="📅"
        />
        <MetricCard
          accent="#10b981"
          accentBg="rgba(16,185,129,0.08)"
          helper="Live payment data"
          label="Revenue today"
          value={formatCurrency(todayRevenue)}
          icon="💰"
        />
        <MetricCard
          accent="#f59e0b"
          accentBg="rgba(245,158,11,0.08)"
          helper="Awaiting completion"
          label="Pending deposits"
          value={formatCurrency(pendingDeposits)}
          icon="⏳"
        />
        <MetricCard
          accent="#ef4444"
          accentBg="rgba(239,68,68,0.08)"
          helper={unreadCountError ? 'Unavailable' : 'Reminders & activity'}
          label="Unread alerts"
          value={String(unreadCount)}
          icon="🔔"
        />
      </section>

      {/* ── Today's appointments + Pulse ── */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <SurfaceCard
          action={
            <button
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              onClick={() => navigate('/calendar')}
              type="button"
            >
              View calendar
            </button>
          }
          title="Today's appointments"
        >
          {appointmentsLoading && <LoadingState title="Loading today's bookings..." />}
          {!appointmentsLoading && appointmentsError && <ErrorState message={appointmentsError} />}
          {!appointmentsLoading && !appointmentsError && todayAppointments.length === 0 && (
            <EmptyState
              description="Bookings scheduled for today will appear here."
              title="No appointments today"
            />
          )}
          {!appointmentsLoading && !appointmentsError && todayAppointments.length > 0 && (
            <DataTable columns={['Time', 'Client', 'Service', 'Status']}>
              {todayAppointments.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">{formatTime(a.startTime)}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{a.customerName}</p>
                    <p className="text-xs text-slate-400">{a.locationName}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{a.serviceName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={appointmentTone(a.status)}>{humanizeEnum(a.status)}</StatusBadge>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </SurfaceCard>

        <SurfaceCard title="Operational pulse">
          <div className="space-y-3">
            <PulseRow label="Paid records" value={String(paidRecords)} color="#10b981" />
            <PulseRow label="Pending forms" value={String(pendingConsent.length)} color={pendingConsent.length > 0 ? '#f59e0b' : '#94a3b8'} />
            <PulseRow label="Unread alerts" value={String(unreadCount)} color={unreadCount > 0 ? '#7c5af6' : '#94a3b8'} />

            <div className="mt-1 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Upcoming</p>
                <button className="text-xs font-semibold text-violet-600 hover:text-violet-700" onClick={() => navigate('/appointments')} type="button">
                  See all
                </button>
              </div>

              {appointmentsLoading && <div className="mt-2"><LoadingState title="Loading..." /></div>}
              {!appointmentsLoading && !appointmentsError && upcomingAppointments.length === 0 && (
                <p className="mt-2 text-xs text-slate-400">No upcoming bookings</p>
              )}
              {!appointmentsLoading && !appointmentsError && upcomingAppointments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {upcomingAppointments.map((a) => (
                    <button
                      key={a.id}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm hover:border-violet-200 hover:bg-violet-50/40"
                      onClick={() => navigate('/appointments')}
                      type="button"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{a.customerName}</p>
                        <p className="text-xs text-slate-400">{formatDate(a.appointmentDate)} · {formatTime(a.startTime)}</p>
                      </div>
                      <StatusBadge tone={appointmentTone(a.status)}>{humanizeEnum(a.status)}</StatusBadge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SurfaceCard>
      </section>

      {/* ── Forms + Activity ── */}
      <section className="grid gap-5 xl:grid-cols-2">
        <SurfaceCard
          action={
            <button
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              onClick={() => navigate('/forms')}
              type="button"
            >
              Open forms
            </button>
          }
          title="Forms & reminders"
        >
          {consentLoading && <LoadingState title="Loading consent records..." />}
          {!consentLoading && consentError && <ErrorState message={consentError} />}
          {!consentLoading && !consentError && pendingConsent.length === 0 && (
            <EmptyState description="Pending consent requests will appear here." title="No pending forms" />
          )}
          {!consentLoading && !consentError && pendingConsent.length > 0 && (
            <div className="space-y-2">
              {pendingConsent.map((s) => (
                <div key={s.id} className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{s.customerName}</p>
                      <p className="text-xs text-slate-500">{s.templateTitle}</p>
                    </div>
                    <StatusBadge tone="attention">Pending</StatusBadge>
                  </div>
                  {s.appointmentDate && (
                    <p className="mt-1.5 text-xs text-slate-500">
                      {formatDate(s.appointmentDate)}{s.appointmentStartTime ? ` · ${formatTime(s.appointmentStartTime)}` : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Unread notifications</p>
              <button className="text-xs font-semibold text-violet-600 hover:text-violet-700" onClick={() => navigate('/appointments')} type="button">
                Open workspace
              </button>
            </div>
            {notificationsLoading && <div className="mt-2"><LoadingState title="Loading..." /></div>}
            {!notificationsLoading && notificationsError && <div className="mt-2"><ErrorState message={notificationsError} /></div>}
            {!notificationsLoading && !notificationsError && unreadNotifications.length === 0 && (
              <p className="mt-2 text-xs text-slate-400">No unread notifications</p>
            )}
            {!notificationsLoading && !notificationsError && unreadNotifications.length > 0 && (
              <div className="mt-2 space-y-2">
                {unreadNotifications.map((n) => (
                  <NotificationPreview key={n.id} notification={n} onOpen={() => navigate(n.actionUrl ?? '/appointments')} />
                ))}
              </div>
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard
          action={canViewActivity ? (
            <button
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              onClick={() => navigate('/audit-logs')}
              type="button"
            >
              View audit logs
            </button>
          ) : undefined}
          title={canViewActivity ? 'Recent team activity' : 'Activity overview'}
        >
          {canViewActivity ? (
            <ActivityFeed entries={auditLogs} error={auditError} isLoading={auditLoading} onRetry={() => void reloadAuditLogs()} />
          ) : (
            <EmptyState
              description="Activity history is available for admin accounts."
              title="Managed by your workspace admin"
            />
          )}
        </SurfaceCard>
      </section>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  accent,
  accentBg,
  helper,
  icon,
  label,
  value,
}: {
  accent: string
  accentBg: string
  helper: string
  icon: string
  label: string
  value: string
}) {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      style={{ borderLeftWidth: '3px', borderLeftColor: accent }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-base"
          style={{ background: accentBg }}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1.5 text-xs text-slate-400">{helper}</p>
    </div>
  )
}

function PulseRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        <p className="text-sm text-slate-600">{label}</p>
      </div>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  )
}

function NotificationPreview({ notification, onOpen }: { notification: NotificationRecord; onOpen: () => void }) {
  return (
    <button
      className="w-full rounded-lg border border-slate-100 bg-white px-3 py-3 text-left text-sm hover:border-violet-200 hover:bg-violet-50/40"
      onClick={onOpen}
      type="button"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-slate-900">{notification.title}</p>
        <StatusBadge tone="calm">{humanizeEnum(notification.type)}</StatusBadge>
      </div>
      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{notification.message}</p>
    </button>
  )
}

function appointmentTone(status: string) {
  switch (status) {
    case 'COMPLETED': return 'success'
    case 'CONFIRMED': return 'calm'
    case 'BOOKED': return 'neutral'
    case 'NO_SHOW': return 'danger'
    case 'CANCELLED': return 'danger'
    default: return 'neutral'
  }
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10)
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
