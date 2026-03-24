# StudioFlow Portfolio Case Study

## Portfolio Card Summary

StudioFlow is a full-stack multi-location SaaS platform for service-led businesses, combining internal operations workflows with a customer-facing booking and self-service management experience.

## Overview

StudioFlow is a production-minded SaaS product built for appointment-based businesses such as salons, barbershops, tattoo studios, and wellness practices. The project combines an internal operations workspace with a separate customer-facing booking flow so the business can manage daily operations while customers can book and manage appointments without entering the admin product.

## Problem

Many service businesses rely on a fragmented set of tools for scheduling, client management, payments, reminders, intake, and reporting. That creates duplicated work, inconsistent customer experiences, and limited operational visibility for the team.

I wanted StudioFlow to solve that by bringing the most important workflows into one system while preserving a cleaner self-service experience for customers.

## Target Users And Businesses

Primary business types:
- salons
- barber shops
- tattoo studios
- wellness clinics
- appointment-first independent service teams

Primary user types:
- admins and studio owners
- reception/front-desk staff
- service staff
- customers using public booking and self-service flows

## Solution

StudioFlow provides:
- an internal dashboard for bookings, clients, payments, consent, reminders, analytics, and activity
- location-aware scheduling and operational filtering
- public booking by studio and location
- secure customer self-service booking lookup, reschedule, and cancel
- role-aware access control and studio-scoped backend enforcement

The product direction was to make it feel like a real operational SaaS application rather than a UI prototype with disconnected pages.

## Core Features

- multi-location dashboard and calendar
- services, staff, clients, and appointments
- payment and deposit tracking
- consent templates and submission tracking
- notifications and reminder foundations
- analytics and audit logs
- public booking and customer self-service management
- admin onboarding and environment-based deployment readiness

## Technical Architecture

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
- JWT authentication
- H2 for local and staging demo mode
- PostgreSQL-ready production configuration

Architecture decisions:
- modular frontend API layer
- route-based code splitting for larger surfaces
- service-layer authorization and audit logging
- profile-based backend configuration for local, staging, and production
- seeded demo data plus smoke tests for critical backend flows

## Design Direction

The UI direction was intentionally premium, calm, and operational. I avoided noisy admin-dashboard clutter and leaned into:
- strong hierarchy
- clean drawer workflows
- expressive but controlled typography
- soft spacing and card structure
- quiet loading, error, and empty states

The public booking flow was designed to feel lighter and more customer-friendly than the internal workspace without becoming visually disconnected from the product.

## Major Challenges Solved

### Balancing Internal And Public Flows

One of the biggest product challenges was supporting both an internal admin workspace and a customer-facing booking experience without blending them together. The solution was to create separate route flows and public-safe backend endpoints instead of trying to reuse internal screens.

### Multi-User Authorization

Another challenge was making permissions feel credible. I wanted role-based access to be enforced in the backend, not just hidden in the UI, so the project uses JWT auth plus studio-scoped and role-aware checks at the service layer.

### Multi-Location Support Without Overbuilding

I added location awareness in a practical way by making appointments location-scoped and supporting location switching in the internal app, while avoiding a heavy enterprise hierarchy that would have slowed down the product.

### Demo And Deployment Readiness

Since this is a portfolio project, I wanted it to be easy to run, demo, and evaluate. That led to:
- seeded professional demo data
- local/staging/production environment separation
- smoke-test coverage for key backend flows
- deploy pipeline and documentation cleanup

## Engineering Decisions

- Kept the architecture modular but intentionally practical.
- Avoided adding a heavy global state library.
- Used service-layer audit and notification logic instead of scattering behavior in controllers.
- Used environment-based configuration for frontend and backend deployment readiness.
- Prioritized believable end-to-end workflows over adding more shallow modules.

## Deployment And Readiness

StudioFlow includes:
- environment-based frontend API configuration
- backend profiles for local, staging, and production
- seeded demo data for local and staging walkthroughs
- GitHub workflows for verification and deploy preparation
- README and setup documentation for easier handoff

The project is set up to be understandable in an interview or portfolio context without requiring a complicated infrastructure story.

## What I Would Improve Next

- add a hosted staging backend instead of config-only staging support
- expand frontend smoke coverage beyond current backend integration tests
- add production database migrations and deployment runbooks
- deepen staff/location assignment flexibility
- continue tightening reporting and reminder delivery behavior

## Closing Summary

StudioFlow is the kind of project I wanted to build to show full-stack product thinking: not just feature breadth, but how authentication, public-facing workflows, operational data, deployment readiness, and UI polish come together in a believable SaaS product.
