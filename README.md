# StudioFlow

StudioFlow is a premium multi-location SaaS platform for service-led businesses such as tattoo studios, salons, barber shops, wellness practices, and appointment-first teams.

It combines an internal operations workspace with a customer-facing booking experience:
- internal dashboard, calendar, payments, consent forms, notifications, analytics, and audit history
- public self-service booking portal
- customer self-service reschedule and cancel flow
- JWT auth with studio-scoped authorization
- multi-location support and onboarding flow

## Feature Summary

Core operational modules:
- services
- staff
- clients
- appointments
- payments
- consent forms
- notifications and reminders
- analytics
- audit logs
- locations and onboarding

Customer-facing capabilities:
- public booking by studio and location
- booking reference lookup
- self-service reschedule
- self-service cancel

## Tech Stack

Frontend:
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router
- Vite

Backend:
- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT
- H2 for local/staging demo mode
- PostgreSQL-ready configuration for production

## Architecture Summary

- [src](/Users/ankygautam/Desktop/Project/StudioFlow/src): frontend app shell, pages, API layer, auth, booking flow
- [backend](/Users/ankygautam/Desktop/Project/StudioFlow/backend): Spring Boot API, auth, authorization, operational modules
- [docs/project-structure.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/project-structure.md): structure notes
- [docs/database-schema.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/database-schema.md): schema notes

StudioFlow uses:
- a frontend API layer driven by environment-based base URLs
- JWT auth for internal users
- service-layer authorization and studio scoping on the backend
- profile-based backend configuration for local, staging, and production use

Supporting docs:

Demo:
- [demo-data-strategy.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/demo-data-strategy.md)
- [launch-checklist.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/launch-checklist.md)
- [final-qa-checklist.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/final-qa-checklist.md)
- [publishing-checklist.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/publishing-checklist.md)
- [demo-flow.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/demo-flow.md)
- [demo-scripts.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/demo-scripts.md)
- [demo-recording-kit.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/demo/demo-recording-kit.md)
- [demo-shot-plan.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/demo/demo-shot-plan.md)
- [demo-short-form.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/demo/demo-short-form.md)
- [demo-long-form.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/demo/demo-long-form.md)

Portfolio and GitHub:
- [portfolio-summary.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/portfolio-summary.md)
- [portfolio-case-study.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/portfolio-case-study.md)
- [studioflow-project-page.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/portfolio/studioflow-project-page.md)
- [studioflow-project-card.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/portfolio/studioflow-project-card.md)
- [readme-packaging.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/readme-packaging.md)
- [github-publishing.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/github-publishing.md)

Career and marketing:
- [project-packaging.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/project-packaging.md)
- [resume-packaging.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/resume-packaging.md)
- [short-summaries.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/short-summaries.md)
- [linkedin-packaging.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/linkedin-packaging.md)
- [studioflow-resume-packaging.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/career/studioflow-resume-packaging.md)
- [studioflow-application-snippets.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/career/studioflow-application-snippets.md)
- [studioflow-sharing-messages.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/career/studioflow-sharing-messages.md)
- [studioflow-linkedin-posts.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/marketing/studioflow-linkedin-posts.md)
- [studioflow-post-outline.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/marketing/studioflow-post-outline.md)

Interview and assets:
- [interview-prep.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/interview-prep.md)
- [studioflow-showcase-pack.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/interview/studioflow-showcase-pack.md)
- [screenshot-plan.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/screenshot-plan.md)
- [studioflow-screenshot-plan.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/assets/studioflow-screenshot-plan.md)

Implementation and deployment:
- [render-deploy.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/render-deploy.md)

## Frontend Setup

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

Useful frontend scripts:

```bash
npm run lint
npm run build
npm run build:staging
npm run build:production
npm run preview
```

## Backend Setup

Run the backend with local seeded demo data:

```bash
cd backend
SPRING_PROFILES_ACTIVE=local mvn spring-boot:run
```

Run backend verification:

```bash
cd backend
mvn test
mvn -DskipTests compile
```

Build a backend artifact:

```bash
cd backend
mvn -DskipTests package
```

## Environment Variables

Root frontend example:
- [.env.example](/Users/ankygautam/Desktop/Project/StudioFlow/.env.example)

Frontend examples:
- [.env.staging.example](/Users/ankygautam/Desktop/Project/StudioFlow/.env.staging.example)
- [.env.production.example](/Users/ankygautam/Desktop/Project/StudioFlow/.env.production.example)

Backend examples:
- [staging.env.example](/Users/ankygautam/Desktop/Project/StudioFlow/backend/env/staging.env.example)
- [production.env.example](/Users/ankygautam/Desktop/Project/StudioFlow/backend/env/production.env.example)

Important frontend variables:

```bash
VITE_API_URL=http://localhost:8080
VITE_APP_BASE_PATH=/studioflow/
VITE_APP_ENV=development
VITE_STUDIO_ID=
VITE_LOCATION_ID=
```

Important backend variables:

```bash
STUDIOFLOW_SERVER_PORT=8080
STUDIOFLOW_DB_URL=jdbc:postgresql://localhost:5432/studioflow
STUDIOFLOW_DB_USERNAME=
STUDIOFLOW_DB_PASSWORD=
STUDIOFLOW_JWT_SECRET=change-me-before-production
STUDIOFLOW_PUBLIC_BASE_URL=http://localhost:5175/studioflow/#
STUDIOFLOW_CORS_ORIGIN_1=http://localhost:5173
STUDIOFLOW_EMAIL_ENABLED=false
STUDIOFLOW_SMS_ENABLED=false
STUDIOFLOW_REMINDERS_ENABLED=true
```

## Local Development

Recommended local flow:

1. Start the backend in local profile
2. Start the frontend dev server
3. Log in with a seeded internal account

Commands:

```bash
cd backend
SPRING_PROFILES_ACTIVE=local mvn spring-boot:run
```

```bash
cd /Users/ankygautam/Desktop/Project/StudioFlow
npm run dev
```

Default local URLs:
- frontend: [http://localhost:5175/studioflow/](http://localhost:5175/studioflow/)
- backend health: [http://localhost:8080/api/health](http://localhost:8080/api/health)

Demo login:
- `admin@studioflow.co`
- `password123`

## Profiles And Environment Strategy

StudioFlow uses a simple three-environment model:

- `local`
  - H2
  - seeded demo data
  - fastest way to run the product locally
- `staging`
  - separate Spring profile
  - safe demo/testing configuration
  - seeded data for integrated preview/testing
- `production`
  - environment-based secrets
  - PostgreSQL-ready config
  - no seeded demo assumptions

Backend profile files:
- [application.yml](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/main/resources/application.yml)
- [application-local.yml](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/main/resources/application-local.yml)
- [application-staging.yml](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/main/resources/application-staging.yml)
- [application-production.yml](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/main/resources/application-production.yml)

## Demo Data Strategy

StudioFlow uses one professional demo dataset instead of separate low-quality dev and staging seeds.

Demo data sources:
- [data-local.sql](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/main/resources/data-local.sql)
- [LocalAuthSeeder.java](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/main/java/com/studioflow/config/LocalAuthSeeder.java)
- [LocalNotificationSeeder.java](/Users/ankygautam/Desktop/Project/StudioFlow/backend/src/main/java/com/studioflow/config/LocalNotificationSeeder.java)

This seeded story is meant to keep the product screenshot-ready in:
- local demos
- staging previews
- portfolio capture sessions
- smoke-test-friendly walkthroughs

See the full strategy in [demo-data-strategy.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/demo-data-strategy.md).

## Deployment Notes

Frontend deployment readiness:
- environment-based API URL via `VITE_API_URL`
- environment-based asset base path via `VITE_APP_BASE_PATH`
- hash routing keeps static hosting simple
- production build verified

Backend deployment readiness:
- JWT, datasource, CORS, reminders, email, and SMS config are environment-based
- health endpoint is available at `/api/health`
- production logging defaults are quieter and safer

GitHub Actions workflows:
- [ci.yml](/Users/ankygautam/Desktop/Project/StudioFlow/.github/workflows/ci.yml)
- [deploy-pages.yml](/Users/ankygautam/Desktop/Project/StudioFlow/.github/workflows/deploy-pages.yml)
- [staging-bundle.yml](/Users/ankygautam/Desktop/Project/StudioFlow/.github/workflows/staging-bundle.yml)

Render deployment files:
- [Dockerfile](/Users/ankygautam/Desktop/Project/StudioFlow/Dockerfile)
- [render.yaml](/Users/ankygautam/Desktop/Project/StudioFlow/render.yaml)
- [render-deploy.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/render-deploy.md)

Pipeline summary:
- pull requests and pushes to `main` / `staging` run frontend lint/build and backend tests
- pushes upload deployable frontend and backend artifacts
- pushes to `main` deploy the frontend to GitHub Pages
- pushes to `staging` prepare a staging bundle for integrated testing

## Staging Notes

The staging profile is meant for safe integrated product testing:
- login
- dashboard
- appointments
- payments
- public booking
- self-service manage flow
- notifications
- audit logs

Use the staging examples as the baseline for a hosted staging environment, then point the frontend `VITE_API_URL` at the staging backend URL.

Recommended staging safety defaults:
- keep email disabled
- keep SMS disabled
- keep reminders disabled until intentionally testing reminder dispatch
- use the seeded demo dataset, not real customer data

## Portfolio Presentation Notes

For demos and interviews, the strongest StudioFlow walkthrough is:

1. login and onboarding context
2. dashboard overview
3. create/edit appointment flow
4. payments and consent visibility
5. notifications and audit history
6. public booking flow
7. self-service manage flow

Ready-to-paste portfolio copy:
- [portfolio-summary.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/portfolio-summary.md)
- [demo-scripts.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/demo-scripts.md)
- [project-packaging.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/project-packaging.md)

Final demo verification checklist:
- [final-qa-checklist.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/final-qa-checklist.md)
- [launch-checklist.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/launch-checklist.md)

## Live Demo

- [StudioFlow on GitHub Pages](https://ankygautam.github.io/studioflow/)

## Future Improvements

- database migrations
- real hosted staging backend
- deployment secrets in GitHub environments
- provider-backed email/SMS production credentials
- browser-level frontend smoke tests
- production database backups and rollback runbooks
