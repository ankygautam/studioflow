# StudioFlow Data Model Draft

This document defines the backend-ready domain model for StudioFlow after the UI and auth milestones.

Current roadmap status:
- design UI: done
- auth UI: done
- database models: current milestone

Scope for this step:
- define entities
- define relationships
- define enums
- define practical PostgreSQL and JPA structure

Out of scope for this step:
- CRUD implementation
- booking flow rules
- payment gateway integration
- analytics logic

## Modeling Principles

- Use UUID primary keys for all core entities.
- Store enums as strings, not ordinals.
- Keep `createdAt` and `updatedAt` on all mutable business entities.
- Use `BigDecimal` for money in Java and `numeric(12,2)` in PostgreSQL.
- Keep address fields simple for MVP instead of prematurely splitting into many child tables.
- Prefer explicit, studio-scoped relationships because almost every operational record belongs to a studio.
- Keep customer records separate from login identity so walk-in and non-portal clients are easy to support.

## Recommended Domain Package Structure

```text
com.studioflow.domain
  common/
    BaseEntity.java
    AuditableEntity.java
  user/
    User.java
    UserRole.java
  studio/
    Studio.java
    BusinessType.java
  staff/
    StaffProfile.java
    StaffStatus.java
  customer/
    CustomerProfile.java
  service/
    Service.java
    ServiceCategory.java
    StaffService.java
  availability/
    Availability.java
  appointment/
    Appointment.java
    AppointmentSource.java
    AppointmentStatus.java
  payment/
    Payment.java
    PaymentMethod.java
    PaymentStatus.java
```

## Shared Base Fields

For JPA, the cleanest approach is:

- `BaseEntity`
  - `UUID id`
- `AuditableEntity extends BaseEntity`
  - `Instant createdAt`
  - `Instant updatedAt`

Typical JPA setup:

```java
@MappedSuperclass
public abstract class AuditableEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
```

## Core Enums

### UserRole

```text
ADMIN
STAFF
RECEPTIONIST
CUSTOMER
```

### BusinessType

```text
TATTOO
BARBER
SALON
PIERCING
NAIL
WELLNESS
BEAUTY
SOLO
```

### StaffStatus

```text
ACTIVE
INVITED
ON_LEAVE
INACTIVE
```

### ServiceCategory

```text
TATTOO
BARBER
HAIR
NAIL
PIERCING
MASSAGE
WELLNESS
MAKEUP
BEAUTY
CONSULTATION
OTHER
```

### AppointmentStatus

```text
BOOKED
CONFIRMED
COMPLETED
CANCELLED
NO_SHOW
```

### AppointmentSource

```text
ADMIN
STAFF
RECEPTIONIST
CUSTOMER_PORTAL
WALK_IN
PHONE
OTHER
```

### PaymentStatus

```text
UNPAID
PARTIALLY_PAID
PAID
REFUNDED
PARTIALLY_REFUNDED
```

### PaymentMethod

```text
CASH
CARD
BANK_TRANSFER
ONLINE
OTHER
```

## Core Entities

### 1. User

Purpose:
- platform login identity

Suggested table:
- `users`

Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `full_name` | `varchar(160)` | required |
| `email` | `varchar(160)` | required, unique |
| `password_hash` | `varchar(255)` | required |
| `role` | `varchar(40)` | `UserRole`, required |
| `is_active` | `boolean` | default `true` |
| `created_at` | `timestamptz` | required |
| `updated_at` | `timestamptz` | required |

Relationships:
- `User` can have one `StaffProfile` when the user is an internal studio user.
- `User` may later optionally link to a customer portal profile, but that is not required in this milestone.

Constraints:
- unique index on `email`
- index on `role`
- index on `is_active`

JPA notes:
- map `role` with `@Enumerated(EnumType.STRING)`
- never expose `passwordHash` in API DTOs

### 2. Studio

Purpose:
- business account and studio profile

Suggested table:
- `studios`

Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `name` | `varchar(160)` | required |
| `business_type` | `varchar(40)` | `BusinessType`, required |
| `email` | `varchar(160)` | optional but recommended |
| `phone` | `varchar(40)` | optional |
| `address_line_1` | `varchar(160)` | optional |
| `address_line_2` | `varchar(160)` | optional |
| `city` | `varchar(80)` | optional |
| `province_or_state` | `varchar(80)` | optional |
| `postal_code` | `varchar(20)` | optional |
| `country` | `varchar(80)` | optional |
| `timezone` | `varchar(80)` | required |
| `is_active` | `boolean` | default `true` |
| `created_at` | `timestamptz` | required |
| `updated_at` | `timestamptz` | required |

Relationships:
- `Studio` has many `StaffProfile`
- `Studio` has many `CustomerProfile`
- `Studio` has many `Service`

Constraints:
- index on `business_type`
- index on `is_active`

JPA notes:
- timezone should be stored as an IANA string like `America/Edmonton`
- address can stay flat in the table for MVP

### 3. StaffProfile

Purpose:
- staff member details connected to a user and studio

Suggested table:
- `staff_profiles`

Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `user_id` | `uuid` | required, FK to `users.id` |
| `studio_id` | `uuid` | required, FK to `studios.id` |
| `display_name` | `varchar(160)` | optional override for public-facing name |
| `job_title` | `varchar(120)` | optional |
| `phone` | `varchar(40)` | optional |
| `bio` | `text` | optional |
| `avatar_url` | `text` | optional |
| `status` | `varchar(40)` | `StaffStatus`, required |
| `created_at` | `timestamptz` | required |
| `updated_at` | `timestamptz` | required |

Relationships:
- many-to-one to `Studio`
- one-to-one or many-to-one to `User`, depending on whether one user can only belong to one studio in MVP
- many-to-many with `Service` through `service_staff_assignments`

Recommended MVP rule:
- one user belongs to one studio team role only
- enforce `unique(user_id)` in `staff_profiles`

Constraints:
- index on `studio_id`
- index on `(studio_id, status)`
- unique index on `user_id`

JPA notes:
- if you want simple MVP membership, use `@OneToOne` to `User`
- if multi-studio staff membership is expected soon, replace that with a separate membership entity later

### 4. CustomerProfile

Purpose:
- customer or client record

Suggested table:
- `customer_profiles`

Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `studio_id` | `uuid` | required, FK to `studios.id` |
| `full_name` | `varchar(160)` | required |
| `email` | `varchar(160)` | optional |
| `phone` | `varchar(40)` | optional |
| `date_of_birth` | `date` | optional |
| `notes` | `text` | optional |
| `is_active` | `boolean` | default `true` |
| `created_at` | `timestamptz` | required |
| `updated_at` | `timestamptz` | required |

Relationships:
- many-to-one to `Studio`
- future `Appointment`, `Payment`, `ConsentForm`, and `CustomerDocument` records will point here

Constraints:
- index on `studio_id`
- index on `(studio_id, full_name)`
- optional composite unique index on `(studio_id, email)` only if you want to prevent duplicate emails per studio

Practical note:
- `notes` should stay on the profile for MVP
- if audited note history is needed later, move notes into a separate `customer_notes` table

### 5. Service

Purpose:
- services offered by a studio

Suggested table:
- `services`

Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `studio_id` | `uuid` | required, FK to `studios.id` |
| `name` | `varchar(160)` | required |
| `category` | `varchar(40)` | `ServiceCategory`, required |
| `description` | `text` | optional |
| `duration_minutes` | `integer` | required |
| `price` | `numeric(12,2)` | required |
| `deposit_required` | `boolean` | default `false` |
| `deposit_amount` | `numeric(12,2)` | nullable unless required |
| `is_active` | `boolean` | default `true` |
| `created_at` | `timestamptz` | required |
| `updated_at` | `timestamptz` | required |

Relationships:
- many-to-one to `Studio`
- many-to-many with `StaffProfile` through `staff_services`

Constraints:
- check `duration_minutes > 0`
- check `price >= 0`
- check `deposit_amount >= 0`
- if `deposit_required = false`, `deposit_amount` may be null or `0`
- index on `studio_id`
- index on `(studio_id, category)`
- index on `(studio_id, is_active)`

### 6. StaffService

Purpose:
- assign staff members to services

Suggested table:
- `staff_services`

Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `staff_profile_id` | `uuid` | required, FK to `staff_profiles.id` |
| `service_id` | `uuid` | required, FK to `services.id` |

Constraints:
- unique index on `(staff_profile_id, service_id)`
- index on `staff_profile_id`
- index on `service_id`

Why explicit join table instead of plain `@ManyToMany`:
- easier to extend later with ordering, default duration override, custom pricing, or skill level metadata

### 7. Availability

Purpose:
- staff working hours and availability blocks

Suggested table:
- `availabilities`

Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `staff_profile_id` | `uuid` | required, FK to `staff_profiles.id` |
| `day_of_week` | `smallint` | recommended values `1-7` for Monday-Sunday |
| `start_time` | `time` | required |
| `end_time` | `time` | required |
| `is_available` | `boolean` | default `true` |

Relationships:
- many-to-one to `StaffProfile`

Constraints:
- check `day_of_week between 1 and 7`
- check `start_time < end_time`
- index on `staff_profile_id`
- index on `(staff_profile_id, day_of_week)`

Practical note:
- this table should represent recurring weekly availability blocks
- one-off time off and exceptions can be modeled later in a separate availability exception table

### 8. Appointment

Purpose:
- main booking record

Suggested table:
- `appointments`

Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `studio_id` | `uuid` | required, FK to `studios.id` |
| `customer_profile_id` | `uuid` | required, FK to `customer_profiles.id` |
| `staff_profile_id` | `uuid` | required, FK to `staff_profiles.id` |
| `service_id` | `uuid` | required, FK to `services.id` |
| `appointment_date` | `date` | required |
| `start_time` | `time` | required |
| `end_time` | `time` | required |
| `status` | `varchar(40)` | `AppointmentStatus`, required |
| `notes` | `text` | optional |
| `source` | `varchar(40)` | `AppointmentSource`, required |
| `created_at` | `timestamptz` | required |
| `updated_at` | `timestamptz` | required |

Relationships:
- many-to-one to `Studio`
- many-to-one to `CustomerProfile`
- many-to-one to `StaffProfile`
- many-to-one to `Service`

Constraints:
- check `start_time < end_time`
- index on `studio_id`
- index on `(studio_id, appointment_date)`
- index on `(staff_profile_id, appointment_date)`
- index on `(customer_profile_id, appointment_date)`
- index on `status`

Practical note:
- keeping `appointment_date`, `start_time`, and `end_time` separate works well for day-based booking UIs
- if cross-timezone booking logic becomes more complex later, add derived UTC timestamps in a future refactor

### 9. Payment

Purpose:
- payment and deposit tracking

Suggested table:
- `payments`

Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `appointment_id` | `uuid` | required, FK to `appointments.id` |
| `amount` | `numeric(12,2)` | total appointment amount |
| `deposit_amount` | `numeric(12,2)` | deposit expected or collected |
| `paid_amount` | `numeric(12,2)` | amount paid so far |
| `remaining_amount` | `numeric(12,2)` | balance still due |
| `payment_method` | `varchar(40)` | `PaymentMethod`, optional until paid |
| `status` | `varchar(40)` | `PaymentStatus`, required |
| `created_at` | `timestamptz` | required |
| `updated_at` | `timestamptz` | required |

Relationships:
- one-to-one or one-to-many to `Appointment`

Recommended MVP rule:
- one payment summary record per appointment is simpler for this stage
- if transaction-level records are needed later, introduce a `payment_transactions` table instead of overloading this entity now

Constraints:
- check `amount >= 0`
- check `deposit_amount >= 0`
- check `paid_amount >= 0`
- check `remaining_amount >= 0`
- index on `appointment_id`
- index on `status`

## Relationship Summary

```text
User 1 ---- 0..1 StaffProfile
Studio 1 ---- * StaffProfile
Studio 1 ---- * CustomerProfile
Studio 1 ---- * Service
StaffProfile * ---- * Service (via StaffService)
StaffProfile 1 ---- * Availability
Studio 1 ---- * Appointment
CustomerProfile 1 ---- * Appointment
StaffProfile 1 ---- * Appointment
Service 1 ---- * Appointment
Appointment 1 ---- 0..1 Payment
```

Practical interpretation for MVP:
- internal users log in through `User`
- internal users are studio-scoped through `StaffProfile`
- clients are stored in `CustomerProfile`
- services are scoped to one studio
- appointment records connect the operational scheduling layer
- payment records stay attached to appointments for clean MVP finance tracking

## Recommended PostgreSQL Table Set for This Milestone

- `users`
- `studios`
- `staff_profiles`
- `customer_profiles`
- `services`
- `staff_services`
- `availabilities`
- `appointments`
- `payments`

## JPA Relationship Recommendations

### User -> StaffProfile

Use:

```java
@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false, unique = true)
private User user;
```

### StaffProfile -> Studio

Use:

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "studio_id", nullable = false)
private Studio studio;
```

### Service -> Studio

Use:

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "studio_id", nullable = false)
private Studio studio;
```

### StaffService

Use explicit entities:

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "service_id", nullable = false)
private Service service;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "staff_profile_id", nullable = false)
private StaffProfile staffProfile;
```

### Availability -> StaffProfile

Use:

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "staff_profile_id", nullable = false)
private StaffProfile staffProfile;
```

### Appointment

Use:

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "studio_id", nullable = false)
private Studio studio;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "customer_profile_id", nullable = false)
private CustomerProfile customerProfile;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "staff_profile_id", nullable = false)
private StaffProfile staffProfile;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "service_id", nullable = false)
private Service service;
```

### Payment -> Appointment

For MVP:

```java
@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "appointment_id", nullable = false, unique = true)
private Appointment appointment;
```

## Future Entities That Will Attach Cleanly Later

Not part of this milestone, but this model is designed so these can slot in cleanly next:

- `consent_forms`
  - references `studio_id`, `customer_profile_id`, optional `appointment_id`, optional `service_id`
- `customer_documents`
  - references `studio_id`, `customer_profile_id`

## Recommended Implementation Order in Spring Boot

1. `UserRole`, `BusinessType`, `StaffStatus`, `ServiceCategory`, `AppointmentStatus`, `AppointmentSource`, `PaymentStatus`, `PaymentMethod`
2. `User`
3. `Studio`
4. `StaffProfile`
5. `CustomerProfile`
6. `Service`
7. `StaffService`
8. `Availability`
9. `Appointment`
10. `Payment`

## Final Recommendation

Keep this milestone intentionally narrow:
- lock the core scheduling entities first
- keep payment at the summary-record level
- avoid transaction ledgers, refunds, and analytics-derived aggregates until later

This gives StudioFlow a clean domain base without overengineering the backend too early.
