# Render Deploy Guide

StudioFlow can be deployed to Render using the root Dockerfile and a PostgreSQL database.

## Recommended Render Setup

Create a new Render Web Service with these settings:

- Runtime: `Docker`
- Branch: `main`
- Dockerfile: root [`Dockerfile`](/Users/ankygautam/Desktop/Project/StudioFlow/Dockerfile)
- Health Check Path: `/api/health`

StudioFlow’s frontend is deployed separately to GitHub Pages, so Render only needs to host the Spring Boot backend.

You can also use the root [`render.yaml`](/Users/ankygautam/Desktop/Project/StudioFlow/render.yaml) as a starting point for a Render Blueprint-style setup.

## Required Environment Variables

Set these in Render:

```bash
SPRING_PROFILES_ACTIVE=production
STUDIOFLOW_DB_URL=jdbc:postgresql://<your-db-host>:5432/<db-name>
STUDIOFLOW_DB_USERNAME=<db-user>
STUDIOFLOW_DB_PASSWORD=<db-password>
STUDIOFLOW_JWT_SECRET=<long-random-secret>
STUDIOFLOW_PUBLIC_BASE_URL=https://ankygautam.github.io/studioflow/#
STUDIOFLOW_CORS_ORIGIN_1=https://ankygautam.github.io
STUDIOFLOW_EMAIL_ENABLED=false
STUDIOFLOW_SMS_ENABLED=false
STUDIOFLOW_REMINDERS_ENABLED=false
```

Recommended addition for the current auth model:

```bash
STUDIOFLOW_DB_DRIVER=org.postgresql.Driver
```

## After Backend Deploys

Copy the Render backend URL, for example:

```bash
https://studioflow-v92m.onrender.com
```

Then update the GitHub Actions variable:

- Name: `STUDIOFLOW_PRODUCTION_API_URL`
- Value: `https://studioflow-v92m.onrender.com`

After that, rerun the `Deploy Frontend` workflow or push a small commit so the GitHub Pages frontend rebuilds against the real backend.

## Health check reminder

Use the public Render URL in your browser:

```bash
https://your-service.onrender.com/api/health
```

Do not append the internal container port such as `:10000` to the public URL.

## Why This Is Needed

GitHub Pages only hosts the frontend. The Spring Boot backend must run separately on a hosted platform such as Render, and the frontend must know that backend URL through `VITE_API_URL`.
