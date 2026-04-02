# StudioFlow Project Structure

## Current frontend structure

```text
StudioFlow/
  docs/
    codex-prompt-chunk-1.md
    database-schema.md
    project-structure.md
  public/
  src/
    app/
      router.tsx
    components/
      layout/
      shared/
    data/
      mock-data.ts
      navigation.ts
    features/
      auth/
        auth-schemas.ts
    pages/
      auth/
      dashboard/
      modules/
    App.tsx
    index.css
    main.tsx
  package.json
  vite.config.ts
```

## Why this structure

- `app/` holds app-wide bootstrapping such as the router.
- `components/layout/` contains shells shared across groups of pages.
- `components/shared/` contains reusable UI blocks used by many features.
- `data/` stores static mock data and route metadata for the UI shell.
- `features/auth/` contains form schemas and later auth-specific hooks and services.
- `pages/` keeps route-level screens easy to scan during MVP buildout.

## Recommended next expansion

When the backend work starts, the cleanest direction is to split into two top-level apps:

```text
StudioFlow/
  studioflow-web/   -> React + TypeScript + Tailwind frontend
  studioflow-api/   -> Spring Boot backend
  docs/
```

That keeps the current frontend moving fast while giving the Java service its own build, tests, and environment config.
