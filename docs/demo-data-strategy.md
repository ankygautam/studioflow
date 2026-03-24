# Demo Data Strategy

StudioFlow uses one professional, screenshot-ready seed story for both local demos and staging previews instead of maintaining multiple fake datasets.

## Core Principle

The same believable operational dataset should power:
- local product walkthroughs
- staging validation
- screenshots and portfolio captures
- smoke tests that need stable expectations

This keeps the product story consistent and avoids drifting between "dev data" and "demo data."

## Canonical Demo Dataset

The primary seed dataset lives in:
- [data-local.sql](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/main/resources/data-local.sql)

It is intentionally written as a polished product narrative, not junk filler data.

Current studio story:
- Studio: `StudioFlow HQ`
- Business type: salon-style service business
- Primary market: Edmonton, Alberta
- Locations:
  - `Downtown Atelier`
  - `West End Annex`

Seeded operational records include:
- studio profile and booking defaults
- multi-location setup
- internal team members and staff profiles
- client records with believable notes
- realistic services with pricing, duration, and deposit rules
- appointments across different statuses and time windows
- payments and deposit tracking
- consent templates and submissions
- public-booking-capable studio/location structure

Additional seeded/local demo support comes from:
- [application-local.yml](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/main/resources/application-local.yml)
- [LocalAuthSeeder.java](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/main/java/com/studioflow/config/LocalAuthSeeder.java)
- [LocalNotificationSeeder.java](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/main/java/com/studioflow/config/LocalNotificationSeeder.java)

Those helpers add:
- login-ready internal users
- activity/notification context for dashboard and shell screenshots

## Environment Strategy

### Local

Use the `local` profile when you want the fastest end-to-end demo loop.

Characteristics:
- H2 database
- clean seeded StudioFlow story
- seeded auth accounts
- notification/demo context ready for screenshots

### Staging

Use the `staging` profile for integrated preview testing outside localhost.

Characteristics:
- isolated staging configuration
- H2 file-backed demo environment by default
- same professional demo dataset as local
- safe for demos and QA without polluting production

Staging config:
- [application-staging.yml](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/main/resources/application-staging.yml)
- [staging.env.example](/Users/ankygautam/Desktop/Project/StudioFlow/backend/env/staging.env.example)

## Demo Data Rules

To keep screenshots and walkthroughs believable:
- prefer one coherent studio narrative instead of random fake names
- keep appointment, payment, and consent relationships internally consistent
- seed multi-location context when the product supports multi-location flows
- keep staff roles and job titles realistic
- keep client notes professional and non-sensitive
- avoid meme data, lorem ipsum, or obviously fake filler
- keep outbound email/SMS disabled in staging unless intentionally testing delivery

## Screenshot-Ready Flows

The current dataset is meant to support these hero flows cleanly:
- login and admin onboarding context
- dashboard with today/upcoming/revenue/activity signal
- booking calendar with live appointments across staff
- payment tracking with deposits and statuses
- consent forms with pending and signed states
- analytics with believable trends
- public booking at studio and location level
- public manage booking / reschedule / cancel
- audit history and team activity

## Resetting To A Clean Demo State

For a clean local reset:

```bash
cd /Users/ankygautam/Desktop/Project/StudioFlow/backend
SPRING_PROFILES_ACTIVE=local mvn spring-boot:run
```

For staging-style local verification:

```bash
cd /Users/ankygautam/Desktop/Project/StudioFlow/backend
SPRING_PROFILES_ACTIVE=staging mvn spring-boot:run
```

If you need a fresh H2 file-backed staging reset, delete the generated local H2 data files before restarting.

## Recommended Demo Accounts

Primary internal demo login:
- `admin@studioflow.co`
- `password123`

Use the admin account for:
- dashboard walkthrough
- location switching
- payments and forms
- analytics
- audit history

## Staging Safety Notes

For staging and portfolio environments:
- keep `STUDIOFLOW_EMAIL_ENABLED=false` unless testing email intentionally
- keep `STUDIOFLOW_SMS_ENABLED=false` unless testing SMS intentionally
- keep `STUDIOFLOW_REMINDERS_ENABLED=false` by default for public staging/demo environments
- use environment variables for all provider credentials
- do not seed real customer data
