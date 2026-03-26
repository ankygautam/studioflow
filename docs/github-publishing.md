# StudioFlow GitHub Publishing Package

## Repo Title

StudioFlow

## Repo Subtitle

Production-minded multi-location SaaS platform for service businesses with internal operations, public booking, and customer self-service management.

## Project Tagline

Run bookings, clients, payments, consent, notifications, analytics, and customer self-service from one full-stack platform.

## Short Summary Paragraph

StudioFlow is a full-stack SaaS platform for appointment-based service businesses such as salons, tattoo studios, barbershops, and wellness practices. It combines an internal operations workspace with a separate public booking and manage-booking experience, backed by JWT auth, studio-scoped authorization, multi-location support, notifications, analytics, and deployment-ready configuration.

## Feature Highlights

- Internal dashboard with real operational data
- Calendar-driven appointment workflow
- Services, staff, clients, payments, and consent forms
- Notifications, reminders, analytics, and audit history
- Multi-location support and onboarding
- Public booking and customer self-service reschedule/cancel
- Role-aware auth with backend-enforced studio scoping

## Architecture Summary

- Frontend: React, TypeScript, Tailwind CSS, Framer Motion, React Router, Vite
- Backend: Java 17, Spring Boot, Spring Security, Spring Data JPA, JWT
- Data and config: H2 for local and staging demos, PostgreSQL-ready production configuration
- Delivery: GitHub Actions, GitHub Pages for frontend, Render-ready backend deployment

## Setup Summary

- Install frontend dependencies with `npm install`
- Start the backend in local profile with `SPRING_PROFILES_ACTIVE=local mvn spring-boot:run`
- Start the frontend with `npm run dev`
- Sign in with the seeded demo admin account

## Deployment Summary

- Frontend uses environment-based `VITE_API_URL`
- Backend uses environment-based datasource, JWT, CORS, communication, and reminder settings
- Health check is exposed at `/api/health`
- Repo includes GitHub Actions workflows, Dockerfile, and Render deployment guidance

## Demo Section Placeholder

### Live Demo

- Frontend: add hosted link here
- Backend/API: add hosted API note here if useful

### Video Walkthrough

- Add short walkthrough link here
- Add full portfolio demo link here

## Screenshot Section Placeholder

- Dashboard overview
- Booking calendar
- Appointment detail drawer
- Payments and consent
- Notifications and audit logs
- Public booking flow
- Manage booking flow
- Analytics

## Project Status

StudioFlow is feature-complete for portfolio presentation and interview walkthroughs, with deployment-ready configuration, demo seed data, and documentation for local, staging, and hosted showcase use.

## Future Improvements

- Invite-based team provisioning
- richer communications management
- deeper production observability
- stronger audit diff visibility
- more advanced multi-location staffing rules

## Contribution Note

This project is currently maintained as a portfolio-quality product build rather than an open contribution project. Feedback, architecture discussion, and product critique are welcome.

## README-Ready Markdown

```md
# StudioFlow

Production-minded multi-location SaaS platform for service businesses with internal operations, public booking, and customer self-service management.

StudioFlow is a full-stack SaaS platform for appointment-based service businesses such as salons, tattoo studios, barbershops, and wellness practices. It combines an internal operations workspace with a separate public booking and manage-booking experience, backed by JWT auth, studio-scoped authorization, multi-location support, notifications, analytics, and deployment-ready configuration.

## Feature Highlights

- Internal dashboard with real operational data
- Calendar-driven appointment workflow
- Services, staff, clients, payments, and consent forms
- Notifications, reminders, analytics, and audit history
- Multi-location support and onboarding
- Public booking and customer self-service reschedule/cancel
- Role-aware auth with backend-enforced studio scoping

## Architecture

- Frontend: React, TypeScript, Tailwind CSS, Framer Motion, React Router, Vite
- Backend: Java 17, Spring Boot, Spring Security, Spring Data JPA, JWT
- Deployment: GitHub Pages frontend, Render-ready backend, GitHub Actions workflows

## Setup

- `npm install`
- `cd backend && SPRING_PROFILES_ACTIVE=local mvn spring-boot:run`
- `npm run dev`

## Demo

- Add live demo link
- Add video walkthrough link

## Screenshots

- Add dashboard screenshot
- Add calendar screenshot
- Add public booking screenshot
- Add analytics screenshot

## Project Status

StudioFlow is portfolio-ready and deployment-ready, with seeded demo data, smoke-test coverage, and a full-stack SaaS feature set.
```
