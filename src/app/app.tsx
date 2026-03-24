import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/app-shell'
import { AdminOnboardingRoute, ProtectedRoute, PublicOnlyRoute, RoleRoute } from '../features/auth/route-guards'
import { AnalyticsPage } from '../pages/analytics-page'
import { AppointmentsPage } from '../pages/appointments-page'
import { ForgotPasswordPage } from '../pages/auth/forgot-password-page'
import { LoginPage } from '../pages/auth/login-page'
import { CalendarPage } from '../pages/calendar-page'
import { ClientsPage } from '../pages/clients-page'
import { DashboardPage } from '../pages/dashboard-page'
import { FormsPage } from '../pages/forms-page'
import { OnboardingPage } from '../pages/onboarding-page'
import { PlaceholderPage } from '../pages/placeholder-page'
import { PaymentsPage } from '../pages/payments-page'
import { PublicBookingPage } from '../pages/public-booking-page'
import { PublicBookingManagePage } from '../pages/public-booking-manage-page'
import { ServicesPage } from '../pages/services-page'
import { SettingsPage } from '../pages/settings-page'
import { StaffPage } from '../pages/staff-page'
import { navigationItems } from '../data/navigation'

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
        element={<Navigate replace to="/login" />}
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
        path="/onboarding"
        element={
          <AdminOnboardingRoute>
            <OnboardingPage />
          </AdminOnboardingRoute>
        }
      />
      <Route
        path="/book"
        element={<Navigate replace to="/book/studioflow-hq" />}
      />
      <Route
        path="/book/:studioSlug"
        element={<PublicBookingPage />}
      />
      <Route
        path="/book/:studioSlug/:locationSlug"
        element={<PublicBookingPage />}
      />
      <Route
        path="/book/:studioSlug/manage"
        element={<PublicBookingManagePage />}
      />
      <Route
        path="/book/:studioSlug/:locationSlug/manage"
        element={<PublicBookingManagePage />}
      />
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
              <DashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="calendar"
          element={
            <RoleRoute allowedSlugs={['calendar']}>
              <CalendarPage />
            </RoleRoute>
          }
        />
        <Route
          path="appointments"
          element={
            <RoleRoute allowedSlugs={['appointments']}>
              <AppointmentsPage />
            </RoleRoute>
          }
        />
        <Route
          path="clients"
          element={
            <RoleRoute allowedSlugs={['clients']}>
              <ClientsPage />
            </RoleRoute>
          }
        />
        <Route
          path="staff"
          element={
            <RoleRoute allowedSlugs={['staff']}>
              <StaffPage />
            </RoleRoute>
          }
        />
        <Route
          path="services"
          element={
            <RoleRoute allowedSlugs={['services']}>
              <ServicesPage />
            </RoleRoute>
          }
        />
        <Route
          path="payments"
          element={
            <RoleRoute allowedSlugs={['payments']}>
              <PaymentsPage />
            </RoleRoute>
          }
        />
        <Route
          path="forms"
          element={
            <RoleRoute allowedSlugs={['forms']}>
              <FormsPage />
            </RoleRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <RoleRoute allowedSlugs={['analytics']}>
              <AnalyticsPage />
            </RoleRoute>
          }
        />
        <Route
          path="settings"
          element={
            <RoleRoute allowedSlugs={['settings']}>
              <SettingsPage />
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
                'staff',
                'services',
                'payments',
                'forms',
                'analytics',
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
