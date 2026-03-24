# StudioFlow Interview Prep

Use these answers as concise, technically grounded talking points for interviews.

## What Is StudioFlow?

StudioFlow is a full-stack multi-location SaaS platform for service-led businesses like salons, barbershops, tattoo studios, and wellness practices. It combines an internal operations workspace with a separate customer-facing booking and self-service flow for scheduling, payments, consent, reminders, analytics, notifications, and audit history.

## Why Did You Build It?

I wanted to build a product that felt like a real operational SaaS system instead of a set of disconnected CRUD screens. Service businesses often piece together scheduling, payments, reminders, intake, and reporting across multiple tools, so StudioFlow was my way of consolidating those workflows into one product while still preserving a clean customer booking experience.

## How Is It Architected?

The frontend is built with React, TypeScript, Tailwind CSS, Framer Motion, React Router, and Vite. The backend is built with Spring Boot, Spring Security, Spring Data JPA, and JWT auth. I kept the frontend modular around a shared API layer and route-based code splitting, and I kept backend business logic in services so authorization, notifications, audit logging, and workflow rules are enforced centrally instead of being scattered across controllers.

## How Does Auth Work?

Internal users authenticate through JWT-based login. The backend issues tokens after validating credentials, and the frontend stores the token and restores auth state on refresh by calling the current-user endpoint. Spring Security uses a bearer-token filter to validate tokens and attach the authenticated user to the security context for downstream authorization checks.

## How Does Role-Based Access Work?

There are four roles in the system: `ADMIN`, `STAFF`, `RECEPTIONIST`, and `CUSTOMER`. The frontend uses centralized permission helpers to hide actions and routes that a user should not see, but the backend is the source of truth. Sensitive actions are protected with controller guards plus service-layer checks, so even if someone bypasses the UI, they still cannot perform unauthorized operations.

## How Does Multi-Location Work?

StudioFlow models a `Studio` with multiple `Location` records. Appointments are location-scoped, and internal users can operate within the studio’s location context through a lightweight location switcher. I intentionally kept the first version practical by using location-aware appointments and staff primary-location handling, rather than building a heavy enterprise hierarchy or complex many-to-many assignment system too early.

## How Does Public Booking Work?

Customers use a separate public route structure instead of the internal dashboard. The public flow supports studio-level and location-level booking, fetches safe public data for services, staff, and availability, then creates or reuses a customer record and creates an appointment with an online-booking source. The manage-booking flow uses a booking reference plus matching contact data to safely support reschedule and cancel without exposing internal records.

## How Do Reminders And Notifications Work?

In-app notifications are stored in the backend and scoped to the current user, with unread count, mark-as-read, and mark-all-read support. Important events like appointments, payments, and consent actions create notification records through centralized service logic. On top of that, reminder scheduling uses a simple backend scheduled job foundation, and email/SMS delivery is layered through channel-specific services with provider-safe configuration and no-op fallbacks when credentials are absent.

## How Do Audit Logs And Activity History Work?

Audit logging is centralized in the service layer, so logs are created when the actual business action succeeds. Audit records capture the studio, actor, entity, action, summary text, and lightweight metadata for useful events like status changes or reschedules. Those logs power both an admin audit page and record-level timelines inside key surfaces like appointments, clients, and payments.

## What Technical Challenges Did You Solve?

The biggest challenge was making the product behave like a real SaaS system rather than just rendering a good UI. That meant handling backend-enforced authorization, studio scoping, public-safe endpoints, multi-location context, seeded demo data, communication and reminder foundations, auditability, and deployment readiness together. Another challenge was keeping the product broad without overengineering it, so I focused on practical architecture choices and high-value workflows instead of adding unnecessary complexity.

## What Would You Improve Next?

The next improvements would be a hosted staging backend, expanded frontend smoke coverage, production database migrations, and deeper production email/SMS provider wiring. I would also revisit richer staff-to-location assignment rules and more advanced reporting once the core launch/readiness story was stable.

## How Would You Scale It Further?

I’d scale it incrementally. First I’d strengthen production concerns like database migrations, backup/recovery, hosted staging, and more formal observability. Then I’d look at performance hot spots in larger datasets, add broader pagination and query tuning where needed, and deepen provider-backed delivery workflows. I would avoid jumping straight to microservices or heavy infrastructure unless the traffic and team complexity actually justified it.

## Strong Closing Summary

StudioFlow is strong as an interview project because it shows both product thinking and systems thinking. It isn’t just a frontend shell or just a backend API; it demonstrates how authentication, authorization, operations workflows, public user flows, deployment readiness, and presentation polish come together in one coherent SaaS product.
