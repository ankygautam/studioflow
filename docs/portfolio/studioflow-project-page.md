# StudioFlow Portfolio Project Page

## Hero Title

StudioFlow

## Hero Subtitle

A full-stack multi-location SaaS platform for service businesses, combining internal operations with customer self-service booking.

## Short Overview

StudioFlow is built for appointment-first businesses such as salons, tattoo studios, barbershops, and wellness practices. It gives internal teams a premium workspace for bookings, clients, staff, payments, consent forms, notifications, analytics, and audit history, while also giving customers a separate public booking and manage-booking experience.

## Business Problem

Many service businesses rely on a patchwork of disconnected tools for scheduling, client records, reminders, intake, payments, and reporting. That fragmentation creates more manual coordination, weaker visibility, and a worse customer experience.

## Product Solution

StudioFlow brings those workflows into one product. Internally, teams can manage daily operations from a unified workspace. Externally, customers can book appointments and later reschedule or cancel through a secure self-service flow without entering the internal dashboard.

## Key Feature Highlights

- Internal dashboard with real operational data
- Calendar-driven appointment workflow
- Services, staff, clients, and payments management
- Consent forms and submission tracking
- Notifications, reminders, and audit history
- Multi-location support with location-aware context switching
- Public booking flow by studio and location
- Customer self-service booking lookup, reschedule, and cancel

## Technical Architecture Summary

The frontend is built with React, TypeScript, Tailwind CSS, Framer Motion, React Router, and Vite. The backend is built with Java 17, Spring Boot, Spring Security, Spring Data JPA, and JWT authentication. StudioFlow uses studio-scoped backend authorization, environment-based deployment configuration, seeded demo data for local and staging workflows, and a practical CI and deployment story for portfolio-ready hosting.

## Design Direction

The product was designed to feel calm, premium, and operational. Instead of trying to overload the interface with dashboards and widgets, the visual system prioritizes clean spacing, muted hierarchy, and high-signal workflows such as the booking calendar, appointment drawer, payment states, and activity visibility.

## Challenges Solved

- Building a product that supports both internal operations and public customer workflows
- Enforcing role-based and studio-scoped authorization beyond the frontend
- Introducing multi-location support without drifting into unnecessary enterprise complexity
- Creating a believable deployment and demo setup, including seeded data and staging-ready configuration
- Making accountability visible through notifications, audit history, and activity timelines

## Engineering Decisions

- Kept roles practical and product-oriented rather than building a heavy custom RBAC system
- Used service-layer authorization and audit logging so backend enforcement remains the source of truth
- Separated public booking from the internal dashboard for cleaner customer-safe behavior
- Added environment-based local, staging, and production profiles to keep the deployment story understandable
- Chose a Docker-based Render deployment path for the backend and GitHub Pages for the frontend to keep hosting simple and interview-friendly

## Deployment And Readiness

StudioFlow includes deployment-ready frontend configuration, backend environment-based secrets, health checks, smoke-test coverage for high-value backend flows, GitHub Actions workflows, seeded demo data, and a hosted portfolio demo setup. The project is built to be easy to run locally, present in interviews, and evaluate quickly from the repository.

## What I Would Improve Next

- Add invite-based internal user provisioning
- Expand reminder delivery and communication management
- Introduce stronger production observability and more automated deployment verification
- Add richer record-level history diffs for audit visibility
- Expand team assignment depth for more granular multi-location staffing

## CTA Ideas

- View live demo
- View GitHub repository
- Read case study
- Watch walkthrough
