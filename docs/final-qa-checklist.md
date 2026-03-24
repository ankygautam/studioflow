# Final QA Checklist

Use this checklist before recording demos, taking screenshots, or promoting a staging build.

## Build And Verification

- `npm run lint`
- `npm run build:production`
- `cd backend && mvn test`
- `git diff --check`

## Internal Product Flows

### Authentication

- Login succeeds with seeded admin credentials.
- Auth persists after refresh.
- Logout clears session and redirects correctly.
- Public routes do not expose internal screens.
- Admin-only routes reject non-admin roles.

### Onboarding And Locations

- Incomplete admin users are redirected into onboarding.
- Onboarding completes successfully.
- Location switcher updates dashboard/calendar context cleanly.
- Pages with location-aware data react to location changes without broken state.

### Core CRUD

- Services create, update, deactivate.
- Staff create, update, deactivate.
- Clients create, update, deactivate.
- Appointments create, update, reschedule, cancel.
- Payments create, update, delete where allowed.
- Consent templates create, update, deactivate.
- Consent submissions create, update status, delete where allowed.

### Operational Surfaces

- Dashboard loads real today/upcoming/revenue/activity content.
- Calendar opens appointment drawer correctly.
- Appointment drawer actions follow role permissions.
- Notifications drawer loads, marks single notifications read, and marks all read.
- Analytics loads without placeholder values.
- Audit log page loads for admin and denies non-admin access.

## Public Product Flows

### Public Booking

- Public booking page resolves from studio route.
- Location-specific booking route resolves correctly.
- Services, staff, and availability load.
- Booking submit succeeds and shows confirmation with reference.

### Manage Booking

- Booking lookup works with reference plus email/phone.
- Invalid lookup shows a clean failure state.
- Reschedule flow updates appointment successfully.
- Cancel flow updates appointment successfully.

## Cross-Cutting UX Checks

- Loading states are calm and consistent.
- Empty states are helpful but quiet.
- Error messaging is clear and non-alarming.
- Destructive actions use confirmation dialogs.
- Drawers remain usable on tablet/mobile widths.
- Tables are horizontally usable on smaller screens.
- Icon-only actions have accessible labels.

## Security Checks

- Internal APIs reject unauthenticated access.
- Studio-scoped data cannot be fetched cross-studio.
- Customers cannot access internal modules.
- Audit log access remains restricted.
- Public endpoints expose only public booking-safe data.

## Communication And Reminder Safety

- Staging/demo env keeps email and SMS disabled unless intentionally testing providers.
- Reminder jobs stay disabled in staging by default.
- Logs do not print raw secrets, raw passwords, or customer-sensitive payloads.

## Screenshot / Demo Readiness

- Login screen is clean and login-only.
- Dashboard has believable live data.
- Calendar has visually balanced appointments.
- Payments, forms, analytics, and audit views have meaningful seeded content.
- Public booking and manage-booking flows are screenshot-ready.

## Existing Backend Smoke Coverage

Current high-value backend smoke tests:
- [AuthApiIntegrationTest.java](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/test/java/com/studioflow/AuthApiIntegrationTest.java)
- [OperationalApiSmokeTest.java](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/test/java/com/studioflow/OperationalApiSmokeTest.java)
- [PublicBookingFlowIntegrationTest.java](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/test/java/com/studioflow/PublicBookingFlowIntegrationTest.java)
