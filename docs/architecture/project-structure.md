# StudioFlow Project Structure

StudioFlow is organized as a full-stack product repo with a React frontend, a Spring Boot backend, and a curated documentation layer for setup, demos, and portfolio packaging.

## Current repo layout

```text
StudioFlow/
  .github/
    workflows/
  backend/
    src/main/java/com/studioflow/
      config/
      controller/
      dto/
      entity/
      enums/
      exception/
      repository/
      security/
      service/
    src/main/resources/
    env/
  docs/
    architecture/
    assets/
    career/
    demo/
    marketing/
    portfolio/
    setup/
    archive/
  public/
  scripts/
  src/
    app/
      routes/
    components/
    features/
      appointments/
      auth/
      booking/
      calendar/
      onboarding/
      theme/
    hooks/
    lib/
      api/
    pages/
      auth/
  Dockerfile
  package.json
  render.yaml
  vite.config.ts
```

## Frontend structure

- `src/app/`
  - app bootstrap and route composition
- `src/app/routes/`
  - extracted route modules for high-level route groups
- `src/components/`
  - reusable layout and UI building blocks
- `src/features/appointments/`
  - appointment list filtering helpers
- `src/features/auth/`
  - auth state, route guards, and owner workspace handling
- `src/features/booking/`
  - public booking and booking-management feature helpers and feature UI
- `src/features/calendar/`
  - calendar fetch, mapping, filter, and view helpers
- `src/features/onboarding/`
  - onboarding types and form utilities
- `src/features/theme/`
  - automatic theme handling and theme controls
- `src/hooks/`
  - shared cross-feature hooks such as remote-list loading
- `src/lib/api/`
  - typed API clients for backend modules
- `src/pages/`
  - route-level screens and module entry points

## Backend structure

- `backend/src/main/java/com/studioflow/controller/`
  - REST endpoints for auth and product modules
- `backend/src/main/java/com/studioflow/service/`
  - application business logic
- `backend/src/main/java/com/studioflow/service/auth/`
  - current user, workspace resolution, JWT-backed auth flows
- `backend/src/main/java/com/studioflow/service/appointment/`
  - appointment-specific policy and mapping helpers
- `backend/src/main/java/com/studioflow/service/communication/`
  - notification, reminder, email, and SMS delivery helpers
- `backend/src/main/java/com/studioflow/entity/`
  - JPA entities for studios, locations, clients, services, appointments, payments, and more
- `backend/src/main/java/com/studioflow/repository/`
  - Spring Data repositories
- `backend/src/main/java/com/studioflow/security/`
  - JWT filters and Spring Security configuration

## Architectural direction

StudioFlow now follows a single-owner studio SaaS model:

- `User` is the authenticated identity
- `Studio.ownerUser` is the owner relationship
- `Studio.onboardingCompleted` is the onboarding state
- staff/team records remain in the model for later expansion, but owner workspace access no longer depends on `staff_profile`

## Why this structure works

- frontend concerns are separated into routes, features, pages, and API clients
- backend concerns are separated into controllers, services, repositories, and security
- auth and studio ownership are explicit instead of spread across module code
- docs are grouped by architecture, setup, demo, portfolio, and archive concerns
