# StudioFlow Demo Recording Kit

## Purpose

Use this kit to record StudioFlow in a way that feels smooth, believable, and product-focused. The goal is not to show every feature. The goal is to show that StudioFlow behaves like a real SaaS product with both internal operations and customer self-service.

## Master Recording Checklist

### Product flow readiness

- Confirm login works with the intended demo account.
- Complete onboarding ahead of time unless onboarding is part of the recording.
- Prepare one strong dashboard state with real appointments, revenue, notifications, and recent activity.
- Prepare one strong appointment record with payment, consent, and activity history visible.
- Prepare realistic clients, staff, services, and payments.
- Prepare at least one clear multi-location switch moment.
- Prepare a public booking scenario that ends with a clean confirmation screen.
- Prepare a manage-booking scenario with an existing booking reference.
- Confirm analytics has meaningful data, not sparse empty charts.

### Technical readiness

- Confirm backend is awake before recording.
- Open `/api/health` once if using the hosted Render backend.
- Confirm the browser is logged into the correct account and not carrying stale sessions.
- Confirm the screen resolution matches the intended export format.
- Close unrelated tabs, notifications, and desktop clutter.
- Use the same browser zoom level across all recordings.

### Presentation readiness

- Use the seeded professional demo dataset only.
- Keep the story anchored to one believable business context.
- Use clean names and records already present in the dataset.
- Avoid random filtering or exploratory clicks during the recording.
- Decide in advance whether the recording starts on login or after login.

## Pre-Recording Setup Checklist

### Browser and screen

- Use a fresh browser window.
- Turn off noisy extensions if possible.
- Pin the app tab if the browser chrome feels busy.
- Use a calm desktop background and hide unrelated app badges.
- Keep the app at 100% zoom.

### Data to prepare before pressing record

- Admin account ready for internal demo.
- One client profile with payment history.
- One upcoming appointment to open in the drawer.
- One cancelled or rescheduled appointment for activity history.
- One location switch example.
- One public booking flow ready to walk through from service selection to confirmation.
- One manage-booking flow ready with a real booking reference.

### Hosted demo precautions

- Wake the backend before recording.
- If the free Render backend idles, wait for login once before starting the real take.
- Avoid recording the first cold-start delay unless you are intentionally explaining hosted-demo constraints.

## Recommended Recording Sequence

1. Login
2. Dashboard
3. Location switch
4. Calendar and appointment drawer
5. Clients, staff, and services
6. Payments
7. Consent forms
8. Notifications
9. Audit logs
10. Public booking
11. Customer manage-booking flow
12. Analytics
13. Wrap-up on architecture or repo

## Where To Pause And Add Value

- Login: explain that this is the internal workspace, not the public booking page.
- Dashboard: point out that it is driven by real operational data, not placeholder cards.
- Calendar: highlight that appointment workflows are the product center of gravity.
- Payment and consent: show that the product goes beyond scheduling.
- Notifications and audit logs: highlight trust, accountability, and operational visibility.
- Public booking: show the customer-facing side as a separate product surface.
- Manage booking: highlight secure self-service reschedule and cancel behavior.
- Analytics: close with business visibility rather than opening with charts.

## What To Avoid During Recording

- Do not start with analytics.
- Do not show weak empty states unless the recording is specifically about product polish.
- Do not hop between unrelated browser tabs.
- Do not click through every sidebar item.
- Do not type slowly on camera unless typing is the point of the shot.
- Do not record the live hosted cold start unless you are explaining it.
- Do not rely on `staff@studioflow.co` for the hosted demo if only the admin account exists there.

## Smooth Demo Rules

- Stay inside one product story.
- Prefer one strong appointment over three weak examples.
- Use transitions with purpose: dashboard to calendar, calendar to payment, internal to public flow.
- Keep the public flow near the end so it feels like the second half of the product story.
- End on an intentional wrap-up screen such as analytics, GitHub, or the project overview.

## Final Recording Pass

- Run one dry run without speaking.
- Run one spoken version with timing.
- Trim only dead air or obvious hesitation.
- Export in 1080p.
- Keep one landscape version for GitHub and portfolio.
- Keep one shorter cut for LinkedIn.
