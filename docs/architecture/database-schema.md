# StudioFlow Data Model

StudioFlow uses a studio-scoped data model with direct owner ownership.

## Core ownership model

For the current single-owner SaaS direction:

- `User` is the authenticated identity
- `Studio.ownerUser` is the studio owner relationship
- `Studio.onboardingCompleted` tracks workspace setup completion
- `Location`, `Client`, `Service`, `Appointment`, `Payment`, `ConsentFormTemplate`, `Notification`, and `AuditLog` all remain studio-scoped

This keeps one owner isolated to one workspace and makes backend authorization easier to reason about.

## Core entities

### User

Key fields:
- `id`
- `fullName`
- `email`
- `passwordHash`
- `role`
- `isActive`
- `createdAt`
- `updatedAt`

Roles currently supported:
- `OWNER`
- `ADMIN`
- `STAFF`
- `RECEPTIONIST`
- `CUSTOMER`

For the owner-first flow, `OWNER` is the primary workspace role.

### Studio

Key fields:
- `id`
- `name`
- `slug`
- `ownerUser`
- `businessType`
- `onboardingCompleted`
- `isActive`
- `timezone`
- `bookingLeadTimeHours`
- `defaultDepositRequired`
- `defaultDepositAmount`
- `createdAt`
- `updatedAt`

### Location

Key fields:
- `id`
- `studio`
- `name`
- `slug`
- `timezone`
- `isActive`

Multi-location support remains available even though the product direction is single-owner first.

### CustomerProfile

Customer records remain separate from login identity so the system can support:
- walk-ins
- non-portal customers
- customer self-service lookup by booking reference

### StaffProfile

`staff_profile` remains in the schema for later team expansion, but it is no longer required for:
- owner auth context
- studio ownership
- owner onboarding

### Appointment

Appointments are studio-scoped and location-aware.

Key relationships:
- belongs to one `Studio`
- belongs to one `Location`
- belongs to one `CustomerProfile`
- belongs to one `StaffProfile`
- belongs to one `Service`

### Payment

Payments remain linked to appointments and studios, with status and deposit tracking handled server-side.

## Studio isolation rules

Backend studio isolation is the source of truth:

- owner workspace context is resolved from the authenticated owner’s studio
- frontend `studioId` values are treated as optional hints only
- backend services must reject cross-studio access
- staff/team features can layer on top later, but ownership and staffing are separate concepts

## Related docs

- [project-structure.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/architecture/project-structure.md)
- [owner-studio-migration.md](/Users/ankygautam/Desktop/Project/StudioFlow/docs/architecture/owner-studio-migration.md)
