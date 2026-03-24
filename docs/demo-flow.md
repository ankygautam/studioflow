# StudioFlow Demo Flow

StudioFlow demos work best when they tell one operational story: a service business runs its internal operations in StudioFlow, while customers can book and manage appointments without entering the admin workspace.

## Hero Screens

- login
- onboarding context
- dashboard
- booking calendar
- payments
- consent forms
- notifications
- audit logs
- public booking
- manage booking
- analytics

## Demo Story Arc

1. Introduce StudioFlow as a multi-location SaaS for service-led businesses.
2. Show the internal operations workspace.
3. Walk through scheduling, payments, consent, and activity visibility.
4. Show the customer-facing booking experience.
5. Close with analytics, auditability, and architecture maturity.

## 30-Second Overview

### Goal

Give a recruiter or reviewer a clear mental model fast.

### Flow

1. Login screen
   What to show:
   StudioFlow as a polished internal SaaS product.
   What to say:
   "StudioFlow is a multi-location operations platform for service businesses like salons, barbershops, wellness teams, and tattoo studios."
2. Dashboard
   What to show:
   today’s appointments, revenue snapshot, recent activity.
   What to say:
   "It combines scheduling, payments, reminders, analytics, and audit visibility in one workspace."
3. Public booking
   What to show:
   booking flow and confirmation.
   What to say:
   "Customers can also book and manage appointments through a separate self-service flow."

## 1-Minute Recruiter Demo

### Goal

Show breadth without getting lost in details.

### Flow

1. Login
   What to click:
   Sign in with the seeded admin account.
   Talking point:
   JWT auth, role-aware routes, admin-only onboarding.
2. Dashboard
   What to show:
   today’s appointments, revenue, unread notifications, recent activity.
   Talking point:
   The dashboard is operational, not decorative.
3. Calendar and appointment drawer
   What to click:
   Open a real appointment.
   Talking point:
   Booking status, payment context, consent status, activity history.
4. Public booking
   What to show:
   studio/location-aware booking and confirmation.
   Talking point:
   Internal + customer-facing flows in one product.

## 3-Minute Portfolio Walkthrough

### Goal

Show the strongest end-to-end product value.

### Flow

1. Login and framing
   What to say:
   StudioFlow is built for appointment-first service businesses that need internal operations plus customer self-service.
2. Dashboard
   What to show:
   operational summary, notifications, recent activity, pending follow-up work.
   Why it matters:
   Sets the business context quickly.
3. Multi-location switcher
   What to click:
   Change location in the shell.
   Why it matters:
   Shows that the product supports more than a single studio.
4. Calendar
   What to show:
   appointment density, staff-aware scheduling, booking drawer.
   Why it matters:
   This is the core daily workflow.
5. Payments and consent
   What to click:
   show payment tracking and consent status on real records.
   Why it matters:
   Demonstrates operational completeness beyond just booking.
6. Notifications and audit logs
   What to show:
   unread badge, activity feed, admin audit visibility.
   Why it matters:
   Shows accountability and operational trust.
7. Public booking
   What to show:
   service selection, staff, date/time, customer details, confirmation.
8. Manage booking
   What to show:
   lookup, reschedule, or cancel flow.
9. Analytics
   What to show:
   revenue, booking, and service signals.
10. Wrap-up
   What to say:
   highlight architecture, auth, studio scoping, and deploy readiness.

## 5-Minute Interview Walkthrough

### Goal

Balance product story with technical depth.

### Flow

1. Product framing
   Problem:
   service businesses often split scheduling, payments, reminders, and intake across disconnected tools.
   Solution:
   StudioFlow centralizes those workflows while preserving a separate customer-facing booking flow.
2. Auth and onboarding
   What to show:
   login-only public auth and admin onboarding context.
   Technical talking point:
   JWT auth, role-aware routing, studio-scoped backend access control.
3. Dashboard and notifications
   Technical talking point:
   real backend-driven metrics, notification center, recent operational activity.
4. Calendar and appointment lifecycle
   What to show:
   create/edit/cancel/reschedule/status update.
   Technical talking point:
   shared drawers, modular API layer, service-layer audit logging.
5. Payments and consent
   Technical talking point:
   practical operational modules connected to the same appointment/customer model.
6. Multi-location support
   Technical talking point:
   location-aware booking and filtering without overbuilding organizational complexity.
7. Public booking and self-service management
   Technical talking point:
   public-safe endpoints, booking reference lookup, customer-safe reschedule/cancel validation.
8. Analytics and audit logs
   Technical talking point:
   operational summaries, accountability, and admin visibility.
9. Deployment and readiness
   Technical talking point:
   environment-based config, local/staging/production profiles, CI workflows, seeded demo strategy.

## Smooth Demo Order

If you only run one polished walkthrough, use this order:

1. Login
2. Dashboard
3. Location switch
4. Calendar
5. Appointment drawer
6. Payments
7. Consent forms
8. Notifications
9. Audit logs
10. Public booking
11. Manage booking
12. Analytics
13. Quick architecture wrap-up

## Demo Tips

- Avoid jumping between too many tabs.
- Keep one clear customer story in mind.
- Use seeded demo data, not ad-hoc manual setup.
- Prefer opening one strong appointment record instead of clicking through many weaker ones.
- Keep analytics and audit logs near the end so they feel like proof, not setup noise.
