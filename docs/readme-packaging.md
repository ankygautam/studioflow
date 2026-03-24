# README Packaging Draft

Use this as a polished README-ready structure for GitHub presentation.

```md
# StudioFlow

> Multi-location SaaS platform for service-led businesses with internal operations workflows, public self-service booking, and production-minded full-stack architecture.

StudioFlow is a full-stack product for businesses like salons, tattoo studios, barber shops, and wellness practices. It combines an internal operations workspace with a separate customer-facing booking and self-service flow, covering scheduling, clients, payments, consent forms, reminders, analytics, notifications, audit history, and multi-location support.

## Project Status

- Product build: complete
- Deployment/staging preparation: complete
- Portfolio/demo packaging: complete
- Current focus: launch checklist, demo flow, and project presentation

## Feature Highlights

- multi-location dashboard and calendar
- services, staff, clients, and appointments
- payments and deposit tracking
- consent templates and submission tracking
- notifications, reminders, and communication foundations
- analytics and audit history
- public booking and self-service manage-booking flow
- JWT auth with role-based and studio-scoped authorization

## Tech Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router
- Vite

### Backend

- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT
- H2 for local/staging demo mode
- PostgreSQL-ready production configuration

## Architecture Overview

StudioFlow uses:
- a modular frontend API layer with environment-based configuration
- JWT authentication for internal users
- service-layer backend authorization and studio scoping
- separate internal and public product flows
- profile-based backend configuration for local, staging, and production
- seeded demo data and smoke tests for critical backend workflows

## Demo And Screenshots

Recommended hero screens:
- login
- onboarding
- dashboard
- calendar
- payments
- consent forms
- analytics
- audit logs
- public booking
- manage booking

Demo support docs:
- `docs/demo-flow.md`
- `docs/demo-scripts.md`
- `docs/final-qa-checklist.md`

## Setup Summary

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
SPRING_PROFILES_ACTIVE=local mvn spring-boot:run
```

### Verification

```bash
npm run lint
npm run build:production
cd backend && mvn test
```

## Deployment Notes

- frontend uses environment-based `VITE_API_URL`
- backend secrets and provider settings are environment-based
- local, staging, and production profiles are separated
- GitHub Actions workflows support verification and deployment preparation

## Future Improvements

- hosted staging backend
- expanded frontend smoke coverage
- production database migration workflow
- deeper production delivery/provider integrations
```

## Notes

- Use this draft as a GitHub-facing overview, not as a full case study.
- Keep screenshot links or image embeds short and high-signal.
- If you add images, lead with one hero screenshot plus 4 to 6 supporting screens.
