# StudioFlow Launch Checklist

Use this checklist before publishing StudioFlow in a portfolio, sharing the repo, recording a demo, or handing the project to an interviewer or reviewer.

## Product Flows

### Internal Workspace

- Login works with seeded admin credentials.
- Protected routes redirect correctly for unauthenticated users.
- Admin onboarding completes successfully.
- Location switching updates dashboard, calendar, appointments, staff, and payments cleanly.
- Dashboard loads meaningful live operational data.
- Services CRUD works.
- Staff CRUD works.
- Clients CRUD works.
- Appointment create, edit, reschedule, cancel, and status updates work.
- Payment create, update, and delete flows work where allowed.
- Consent template and submission workflows work.
- Notifications drawer loads, routes, and mark-as-read actions work.
- Analytics loads real values and charts without placeholder content.
- Audit log page loads for admin and record-level timelines appear where expected.

### Public Experience

- Public booking works from studio route.
- Public booking works from location-specific route.
- Booking confirmation shows location and booking reference.
- Manage-booking lookup works with reference plus matching email or phone.
- Reschedule works and preserves record integrity.
- Cancel works and updates status correctly.

## Technical Checks

- `npm run lint`
- `npm run build:production`
- `cd backend && mvn test`
- `git diff --check`
- frontend env examples are present and readable
- backend env examples are present and readable
- no real secrets are committed
- health endpoint responds
- public endpoints are scoped to booking-safe use only
- email and SMS remain disabled in staging/demo unless intentionally testing providers
- reminder jobs remain disabled in staging by default

## Demo Readiness

- Demo seed data is loaded and believable.
- Dashboard looks balanced for screenshots.
- Calendar has visually useful appointment density.
- Payments, forms, analytics, and audit views have meaningful records.
- Public booking and manage-booking screens are ready for capture.
- No dead-end placeholder surfaces are visible in the main demo path.
- Login-only public auth surface is intact.
- Onboarding is admin-only.
- Key mobile/tablet flows still read cleanly.

## Portfolio Readiness

- README is current and professional.
- Architecture summary is present.
- Feature summary is present.
- Demo data strategy is documented.
- QA checklist is documented.
- Resume bullets are prepared.
- Portfolio summary is prepared.
- Demo scripts are prepared.
- LinkedIn/portfolio copy is prepared.

## Final Review Prompt

Before publishing, ask:
- Would a recruiter understand what this product does in under 30 seconds?
- Would an engineer understand the stack and architecture in under 2 minutes?
- Would a reviewer see a believable SaaS product instead of a disconnected demo shell?
