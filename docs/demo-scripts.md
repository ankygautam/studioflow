# StudioFlow Demo Scripts

## Elevator Pitch

StudioFlow is a multi-location SaaS platform for service-led businesses like salons, tattoo studios, barbershops, and wellness practices. It combines internal operations tools such as scheduling, clients, payments, consent, notifications, analytics, and audit history with a separate customer-facing booking and self-service management flow.

## 30-Second Script

"StudioFlow is a full-stack SaaS platform for appointment-based service businesses. It gives internal teams a multi-location workspace for bookings, clients, payments, consent forms, reminders, analytics, and audit visibility, while also providing customers with a clean public booking and self-service reschedule or cancel flow. It’s built with React, TypeScript, Spring Boot, and JWT-based studio-scoped authorization."

## 1-Minute Script

"StudioFlow is a multi-location operations platform for service businesses such as salons, tattoo studios, barbershops, and wellness teams. Internally, it gives staff and admins a premium dashboard for appointments, clients, payments, consent forms, notifications, analytics, and audit history. Externally, it supports public booking plus customer self-service reschedule and cancel flows. The backend is built with Spring Boot, Spring Security, JWT auth, and studio-scoped authorization, and the frontend is built in React and TypeScript with a modular API layer and deployment-ready environment configuration."

## 3-Minute Script

"StudioFlow is a production-minded SaaS platform for service-led businesses that need both internal operations software and customer self-service. The core problem it solves is that many appointment-first businesses end up stitching together separate tools for scheduling, payments, reminders, intake, and customer communication. StudioFlow brings those workflows into one product.

Internally, the app includes a role-aware dashboard, booking calendar, appointments, clients, staff, services, payments, consent forms, notifications, analytics, audit logs, and multi-location support. Externally, customers can book appointments through a public flow and later manage those bookings through a secure self-service lookup, reschedule, and cancel experience.

From a technical perspective, the frontend uses React, TypeScript, Tailwind CSS, Framer Motion, and React Router. The backend uses Spring Boot, Spring Security, JWT authentication, service-layer authorization, and profile-based configuration for local, staging, and production. The project also includes seeded demo data, smoke-test coverage for key backend flows, CI workflows, and a deployment-ready config story, so it’s not just a UI build but a credible end-to-end SaaS product."

## 5-Minute Script

"StudioFlow is a full-stack SaaS platform built for multi-location service businesses like salons, barbershops, tattoo studios, and wellness practices. The product idea was to build something that feels like a real operational system rather than a collection of disconnected CRUD screens.

The internal workspace centers on the daily workflows these businesses care about: managing appointments, clients, staff, services, payments, consent forms, reminders, notifications, analytics, and audit history. The dashboard surfaces today’s schedule, revenue context, unread notifications, and recent activity, while the calendar and appointment drawer handle the highest-frequency booking workflows.

One of the key product decisions was to separate internal operations from the customer experience. Customers do not enter the internal dashboard. Instead, there’s a dedicated public booking flow that supports studio and location context, plus a secure self-service manage-booking flow for rescheduling and cancelling appointments.

Another important part of the system is authorization. The backend uses JWT authentication plus studio-scoped and role-aware access control, so the frontend isn’t the only enforcement layer. That means the app behaves more like a real SaaS product where users only see and act on the data they’re supposed to access.

From an engineering perspective, the frontend is built with React, TypeScript, Tailwind CSS, Framer Motion, and React Router. The backend is built with Spring Boot, Spring Security, Spring Data JPA, and environment-based configuration for local, staging, and production. I also added demo seed data, smoke tests for critical backend flows, audit logging, notifications, reminder scheduling foundations, and a practical deploy pipeline, which makes the project easier to run, demo, and evaluate."
