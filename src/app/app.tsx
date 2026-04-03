import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { renderPublicBookingRoutes } from './routes/public-booking-routes'
import { AppShell } from '../components/layout/app-shell'
import { LoadingState } from '../components/ui/async-state'
import { AdminOnboardingRoute, ProtectedRoute, PublicOnlyRoute, RoleRoute } from '../features/auth/route-guards'
import { ExplorePage } from '../pages/explore-page'
import { ForgotPasswordPage } from '../pages/auth/forgot-password-page'
import { LoginPage } from '../pages/auth/login-page'
import { RegisterPage } from '../pages/auth/register-page'
import { FlowPage } from '../pages/flow-page'
import { GuidancePage } from '../pages/guidance-page'
import { PlaceholderPage } from '../pages/placeholder-page'
import { UpdatesPage } from '../pages/updates-page'
import { navigationItems } from '../data/navigation'

const AnalyticsPage = lazyNamed(() => import('../pages/analytics-page'), 'AnalyticsPage')
const AuditLogsPage = lazyNamed(() => import('../pages/audit-logs-page'), 'AuditLogsPage')
const AppointmentsPage = lazyNamed(() => import('../pages/appointments-page'), 'AppointmentsPage')
const CalendarPage = lazyNamed(() => import('../pages/calendar-page'), 'CalendarPage')
const ClientsPage = lazyNamed(() => import('../pages/clients-page'), 'ClientsPage')
const DashboardPage = lazyNamed(() => import('../pages/dashboard-page'), 'DashboardPage')
const FormsPage = lazyNamed(() => import('../pages/forms-page'), 'FormsPage')
const OnboardingPage = lazyNamed(() => import('../pages/onboarding-page'), 'OnboardingPage')
const PaymentsPage = lazyNamed(() => import('../pages/payments-page'), 'PaymentsPage')
const ServicesPage = lazyNamed(() => import('../pages/services-page'), 'ServicesPage')
const SettingsPage = lazyNamed(() => import('../pages/settings-page'), 'SettingsPage')

export function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/explore"
        element={<ExplorePage />}
      />
      <Route
        path="/flow"
        element={<FlowPage />}
      />
      <Route
        path="/guidance"
        element={<GuidancePage />}
      />
      <Route
        path="/updates"
        element={<UpdatesPage />}
      />
      <Route
        path="/guide"
        element={<Navigate replace to="/guidance" />}
      />
      <Route
        path="/onboarding"
        element={
          <AdminOnboardingRoute>
            <RouteLoader>
              <OnboardingPage />
            </RouteLoader>
          </AdminOnboardingRoute>
        }
      />
      {renderPublicBookingRoutes()}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route
          path="dashboard"
          element={
            <RoleRoute allowedSlugs={['dashboard']}>
              <RouteLoader>
                <DashboardPage />
              </RouteLoader>
            </RoleRoute>
          }
        />
        <Route
          path="calendar"
          element={
            <RoleRoute allowedSlugs={['calendar']}>
              <RouteLoader>
                <CalendarPage />
              </RouteLoader>
            </RoleRoute>
          }
        />
        <Route
          path="appointments"
          element={
            <RoleRoute allowedSlugs={['appointments']}>
              <RouteLoader>
                <AppointmentsPage />
              </RouteLoader>
            </RoleRoute>
          }
        />
        <Route
          path="clients"
          element={
            <RoleRoute allowedSlugs={['clients']}>
              <RouteLoader>
                <ClientsPage />
              </RouteLoader>
            </RoleRoute>
          }
        />
        <Route
          path="services"
          element={
            <RoleRoute allowedSlugs={['services']}>
              <RouteLoader>
                <ServicesPage />
              </RouteLoader>
            </RoleRoute>
          }
        />
        <Route
          path="payments"
          element={
            <RoleRoute allowedSlugs={['payments']}>
              <RouteLoader>
                <PaymentsPage />
              </RouteLoader>
            </RoleRoute>
          }
        />
        <Route
          path="forms"
          element={
            <RoleRoute allowedSlugs={['forms']}>
              <RouteLoader>
                <FormsPage />
              </RouteLoader>
            </RoleRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <RoleRoute allowedSlugs={['analytics']}>
              <RouteLoader>
                <AnalyticsPage />
              </RouteLoader>
            </RoleRoute>
          }
        />
        <Route
          path="audit-logs"
          element={
            <RoleRoute allowedSlugs={['audit-logs']}>
              <RouteLoader>
                <AuditLogsPage />
              </RouteLoader>
            </RoleRoute>
          }
        />
        <Route
          path="settings"
          element={
            <RoleRoute allowedSlugs={['settings']}>
              <RouteLoader>
                <SettingsPage />
              </RouteLoader>
            </RoleRoute>
          }
        />
        <Route
          path="customer"
          element={
            <RoleRoute allowedSlugs={['customer']}>
              <PlaceholderPage
                eyebrow="Customer"
                title="Customer portal"
                description="Your self-service booking space is being prepared. For now, this account is intentionally limited to protect studio operations."
              />
            </RoleRoute>
          }
        />
        {navigationItems
          .filter(
            (item) =>
              ![
                'dashboard',
                'calendar',
                'appointments',
                'clients',
                'services',
                'payments',
                'forms',
                'analytics',
                'audit-logs',
                'settings',
              ].includes(
                item.slug,
              ),
          )
          .map((item) => (
            <Route
              key={item.slug}
              path={item.slug}
              element={
                <PlaceholderPage
                  eyebrow={item.eyebrow}
                  title={item.label}
                  description={item.description}
                />
              }
            />
          ))}
      </Route>
      <Route path="*" element={<Navigate replace to="/dashboard" />} />
    </Routes>
  )
}

function RouteLoader({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="p-4 md:p-6"><LoadingState title="Loading workspace..." /></div>}>
      {children}
    </Suspense>
  )
}

function lazyNamed<T extends Record<string, ComponentType<unknown>>>(
  loader: () => Promise<T>,
  exportName: keyof T,
) {
  return lazy(async () => {
    const module = await loader()
    return { default: module[exportName] }
  })
}
