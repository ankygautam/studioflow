# StudioFlow Portfolio Summary

## Project Summary

StudioFlow is a multi-location SaaS platform for service-led businesses such as salons, tattoo studios, barbershops, and wellness practices. It combines an internal operations workspace with a customer-facing booking experience, giving teams one system for scheduling, clients, payments, consent, reminders, analytics, and operational accountability.

## Short Portfolio Description

StudioFlow is a full-stack appointment operations platform built for service businesses. It includes internal scheduling and client management, public self-service booking, payments, consent forms, notifications, analytics, audit history, multi-location support, and studio-scoped role-based access control.

## Resume-Style Description

Built StudioFlow, a production-minded full-stack SaaS platform for appointment-based businesses using React, TypeScript, Spring Boot, and JWT auth. Delivered internal operations tooling, public booking flows, payments, consent tracking, analytics, notifications, multi-location support, audit logs, and deployment-ready environment and CI setup.

## Feature Overview

Internal product capabilities:
- multi-location dashboard and calendar workflows
- appointments, clients, staff, services, and payments
- consent forms and submission tracking
- notifications, reminders, and communication delivery foundation
- analytics and audit history
- JWT auth with studio-scoped authorization

Customer-facing capabilities:
- public booking by studio and location
- self-service booking lookup
- reschedule and cancel flows
- booking confirmation and communication hooks

## Architecture Summary

Frontend:
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router
- Vite

Backend:
- Spring Boot
- Java 17
- Spring Security
- Spring Data JPA
- JWT authentication
- H2 for local/staging demo mode
- PostgreSQL-ready production configuration

System characteristics:
- environment-based frontend and backend configuration
- role- and studio-scoped authorization
- location-aware operational model
- audit and notification foundations
- staging-ready seed data and deploy pipeline support

## Technical Highlights

- Built a role-aware internal SaaS workspace and a separate public booking flow from the same product foundation.
- Added JWT authentication, service-layer authorization, and studio-scoped access control across operational modules.
- Implemented location-aware booking, onboarding, reminders, audit history, and communication delivery foundations.
- Added deployment-ready environment profiles, GitHub Actions verification/deploy workflows, and smoke-test coverage for critical backend flows.
- Polished the product for presentation with realistic seeded data, dashboard hierarchy, calmer UX states, and responsive drawer/table behavior.

## What Problem It Solves

Service businesses often juggle booking, clients, payments, reminders, and intake across disconnected tools. StudioFlow brings those operational workflows into one system while still giving customers a clean self-service booking experience.

## Demo Script Notes

### 60-second version

1. Log in as the studio admin.
2. Open the dashboard and call out today’s appointments, revenue, unread notifications, and recent activity.
3. Jump to the calendar and open an appointment drawer to show status, payment, consent, and timeline context.
4. Show the public booking flow and the self-service manage booking experience.

### 3-minute version

1. Start at login and explain StudioFlow as a multi-location SaaS for service businesses.
2. Show the dashboard with live operational data.
3. Switch locations and open the calendar to demonstrate location-aware scheduling.
4. Create or edit an appointment, then show payment and consent context.
5. Open analytics and audit logs to show business insight plus team accountability.
6. Switch to the public booking flow, submit a booking, then use the manage-booking flow to reschedule or cancel.

## Strongest Screenshot Screens

- login
- onboarding
- dashboard
- booking calendar
- payments
- forms
- analytics
- public booking
- manage booking
- audit logs

## Interview Talking Points

- why service businesses need both internal ops tooling and customer self-service
- the tradeoff between product polish and keeping the architecture practical
- how studio-scoped authorization was enforced in the backend
- why the product uses a clean seeded demo dataset for local and staging walkthroughs
- how the deployment/staging structure was kept understandable instead of overengineered
