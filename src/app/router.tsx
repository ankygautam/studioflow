import { createHashRouter, Navigate } from 'react-router-dom'
import { AppShell } from '../components/layout/app-shell'
import { PublicLayout } from '../components/layout/public-layout'
import { ForgotPasswordPage } from '../pages/auth/forgot-password-page'
import { LoginPage } from '../pages/auth/login-page'
import { RegisterPage } from '../pages/auth/register-page'
import { CustomerDashboardPage } from '../pages/dashboard/customer-dashboard-page'
import { AdminDashboardPage } from '../pages/dashboard/admin-dashboard-page'
import { ReceptionDashboardPage } from '../pages/dashboard/reception-dashboard-page'
import { StaffDashboardPage } from '../pages/dashboard/staff-dashboard-page'
import { LandingPage } from '../pages/landing-page'
import { NotFoundPage } from '../pages/not-found-page'
import { AnalyticsPage } from '../pages/modules/analytics-page'
import { AppointmentsListPage } from '../pages/modules/appointments-list-page'
import { CalendarPage } from '../pages/modules/calendar-page'
import { ClientsPage } from '../pages/modules/clients-page'
import { ConsentFormsPage } from '../pages/modules/consent-forms-page'
import { PaymentsPage } from '../pages/modules/payments-page'
import { ServicesPage } from '../pages/modules/services-page'
import { SettingsPage } from '../pages/modules/settings-page'
import { StaffPage } from '../pages/modules/staff-page'

export const router = createHashRouter([
  {
    element: <PublicLayout />,
    path: '/',
    children: [
      {
        element: <LandingPage />,
        index: true,
      },
      {
        element: <LoginPage />,
        path: 'login',
      },
      {
        element: <RegisterPage />,
        path: 'register',
      },
      {
        element: <ForgotPasswordPage />,
        path: 'forgot-password',
      },
    ],
  },
  {
    element: <AppShell role="admin" />,
    path: '/admin',
    children: [
      {
        element: <Navigate replace to="dashboard" />,
        index: true,
      },
      {
        element: <AdminDashboardPage />,
        path: 'dashboard',
      },
      {
        element: <CalendarPage role="admin" />,
        path: 'calendar',
      },
      {
        element: <AppointmentsListPage role="admin" />,
        path: 'appointments',
      },
      {
        element: <ClientsPage role="admin" />,
        path: 'clients',
      },
      {
        element: <StaffPage />,
        path: 'staff',
      },
      {
        element: <ServicesPage role="admin" />,
        path: 'services',
      },
      {
        element: <PaymentsPage role="admin" />,
        path: 'payments',
      },
      {
        element: <ConsentFormsPage role="admin" />,
        path: 'consent-forms',
      },
      {
        element: <AnalyticsPage role="admin" />,
        path: 'analytics',
      },
      {
        element: <SettingsPage role="admin" />,
        path: 'settings',
      },
    ],
  },
  {
    element: <AppShell role="staff" />,
    path: '/staff',
    children: [
      {
        element: <Navigate replace to="dashboard" />,
        index: true,
      },
      {
        element: <StaffDashboardPage />,
        path: 'dashboard',
      },
      {
        element: <CalendarPage role="staff" />,
        path: 'calendar',
      },
      {
        element: <AppointmentsListPage role="staff" />,
        path: 'appointments',
      },
      {
        element: <ClientsPage role="staff" />,
        path: 'clients',
      },
      {
        element: <ServicesPage role="staff" />,
        path: 'services',
      },
      {
        element: <ConsentFormsPage role="staff" />,
        path: 'consent-forms',
      },
      {
        element: <SettingsPage role="staff" />,
        path: 'settings',
      },
    ],
  },
  {
    element: <AppShell role="receptionist" />,
    path: '/reception',
    children: [
      {
        element: <Navigate replace to="dashboard" />,
        index: true,
      },
      {
        element: <ReceptionDashboardPage />,
        path: 'dashboard',
      },
      {
        element: <CalendarPage role="receptionist" />,
        path: 'calendar',
      },
      {
        element: <AppointmentsListPage role="receptionist" />,
        path: 'appointments',
      },
      {
        element: <ClientsPage role="receptionist" />,
        path: 'clients',
      },
      {
        element: <ServicesPage role="receptionist" />,
        path: 'services',
      },
      {
        element: <PaymentsPage role="receptionist" />,
        path: 'payments',
      },
      {
        element: <AnalyticsPage role="receptionist" />,
        path: 'analytics',
      },
      {
        element: <SettingsPage role="receptionist" />,
        path: 'settings',
      },
    ],
  },
  {
    element: <AppShell role="customer" />,
    path: '/customer',
    children: [
      {
        element: <Navigate replace to="dashboard" />,
        index: true,
      },
      {
        element: <CustomerDashboardPage />,
        path: 'dashboard',
      },
      {
        element: <CalendarPage role="customer" />,
        path: 'calendar',
      },
      {
        element: <AppointmentsListPage role="customer" />,
        path: 'appointments',
      },
      {
        element: <PaymentsPage role="customer" />,
        path: 'payments',
      },
      {
        element: <ConsentFormsPage role="customer" />,
        path: 'consent-forms',
      },
      {
        element: <SettingsPage role="customer" />,
        path: 'settings',
      },
    ],
  },
  {
    element: <NotFoundPage />,
    path: '*',
  },
])
