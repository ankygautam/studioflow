import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/app-shell'
import { ProtectedRoute, PublicOnlyRoute } from '../features/auth/route-guards'
import { AnalyticsPage } from '../pages/analytics-page'
import { AppointmentsPage } from '../pages/appointments-page'
import { ForgotPasswordPage } from '../pages/auth/forgot-password-page'
import { LoginPage } from '../pages/auth/login-page'
import { RegisterPage } from '../pages/auth/register-page'
import { CalendarPage } from '../pages/calendar-page'
import { ClientsPage } from '../pages/clients-page'
import { DashboardPage } from '../pages/dashboard-page'
import { FormsPage } from '../pages/forms-page'
import { PlaceholderPage } from '../pages/placeholder-page'
import { PaymentsPage } from '../pages/payments-page'
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
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="forms" element={<FormsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
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
