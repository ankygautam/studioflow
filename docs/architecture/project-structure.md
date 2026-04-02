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
      auth/
      calendar/
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
  - route groups for public, auth, protected, booking, and onboarding flows
- `src/components/`
  - reusable layout and UI building blocks
- `src/features/auth/`
  - auth state, route guards, and owner workspace handling
- `src/features/calendar/`
  - calendar fetch, mapping, filter, and view helpers
- `src/lib/api/`
  - typed API clients for backend modules
- `src/pages/`
  - route-level screens and module entry points

## Backend structure

- `backend/src/main/java/com/studioflow/controller/`
  - REST endpoints grouped by auth, onboarding, and product modules
- `backend/src/main/java/com/studioflow/service/`
  - application business logic
- `backend/src/main/java/com/studioflow/service/auth/`
  - current user, workspace resolution, JWT-backed auth flows
- `backend/src/main/java/com/studioflow/service/onboarding/`
  - studio setup and onboarding completion
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
