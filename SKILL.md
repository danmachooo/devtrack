# Frontend Skill - DevTrack

This document defines the recommended frontend implementation approach for DevTrack.

It is the primary build guide for agents and developers working on the frontend. Read it alongside:

- `AGENTS.md` - agent rules, guardrails, API expectations, and RBAC guidance
- `CONTEXT.md` - backend model, auth model, scoping rules, and data safety rules
- `PROJECT-FLOW.md` - end-to-end product workflows
- `UI-UX-STORY.md` - screen intent, pacing, and UX tone
- `ENDPOINTS.md` - exact request and response contracts

When these files conflict with assumptions in this document, those files win.

---

## Current Phase

The backend is assumed to be complete and verified.

The frontend should integrate against real API endpoints by default. Do not introduce mock data for new work unless the backend for that feature is explicitly unfinished.

If mock data is temporarily needed for scaffolding, it must mirror the real API contract exactly, including the standard response wrapper:

```json
{
  "statusCode": 200,
  "message": "Human-readable message",
  "data": {}
}
```

---

## Product Intent

DevTrack turns internal delivery complexity into a client-safe progress story.

It has two distinct UI domains:

1. Internal team UI
2. Client dashboard UI

These surfaces should feel related in quality and trust, but not identical in density, controls, or information exposure.

---

## Design Direction

Use a premium, modern B2B dashboard style with a strong visual point of view.

### Visual Character

- calm
- structured
- polished
- trustworthy
- quietly premium

### What To Avoid

- default shadcn/ui styling with no customization
- default Material UI visual identity
- heavy glassmorphism
- neon startup styling
- overly playful illustration-heavy treatment
- strict monochrome with no semantic meaning
- document-app styling that feels like Notion

---

## Color System

The product uses a design-token system with an official palette direction:

- foundation: `Stone`
- brand accent: `Forest Green`

The semantic token model remains stable even as the implementation expands into light and dark mode.

### Official Palette

```text
background:         #F6F4EF
surface:            #FFFCF7
surface-muted:      #EAE4D9
foreground:         #1F2930
foreground-muted:   #667074
border:             #D8D1C4

primary:            #2F6B57
primary-foreground: #F7FBF9

success:            #3F8A57
warning:            #C58A2B
danger:             #B5523B
neutral:            #7A8580
```

### Required Token Categories

Define tokens for:

- `background`
- `surface`
- `surface-muted`
- `foreground`
- `foreground-muted`
- `border`
- `primary`
- `primary-foreground`
- `success`
- `warning`
- `danger`
- `neutral`

### Color Rules

- the chosen palette implementation must preserve strong readability and contrast
- semantic colors must communicate meaning, not decoration
- the internal UI and client UI can vary in tone, but should still feel like the same product family
- dark mode must be supported through the same token system

### Semantic Intent

Keep these semantic meanings stable in implementation:

- `success` for complete, released, and successful sync states
- `warning` for in-progress, stale, or attention states
- `danger` for failures, destructive actions, and rate limiting
- `neutral` for inactive or low-emphasis states
- `primary` for the forest-green brand accent, navigation emphasis, and primary calls to action

---

## Typography

Choose a clear product typography system that feels intentional.

Recommended starting options:

- `Manrope`
- `Geist`
- `Plus Jakarta Sans`

Typography hierarchy:

- client dashboard: more spacious, more presentational, more narrative
- internal workspace: tighter, more operational, optimized for scanning

---

## Tech Stack

- Next.js App Router with TypeScript
- shadcn/ui as the component foundation
- Tailwind CSS for styling
- TanStack Query for server state
- Zustand for global UI state only
- React Hook Form and Zod for forms
- Axios for all HTTP requests through a shared instance
- npm

Do not add CSS modules, styled-components, or ad hoc fetch logic inside components.

Use current, maintained versions and patterns of the approved stack. Avoid deprecated APIs, legacy examples, and outdated library usage unless the existing codebase already depends on them and the task is specifically about staying compatible.

---

## App Architecture

Use one Next.js application with route groups that separate product surfaces.

### Route Structure

```text
app/
  (auth)/
    sign-in/
    sign-up/
  (internal)/
    dashboard/
    projects/
    projects/[id]/
      page.tsx
      notion/
      features/
      tickets/
      sync/
    organization/
    settings/
  (client)/
    client/[token]/
```

### Route Group Intent

- `(auth)` is centered, minimal, and ungated
- `(internal)` is session-gated and operational
- `(client)` is simple, presentation-first, and token-based

### Source Structure

```text
src/
  app/
  components/
    ui/
    layout/
    feedback/
  features/
    auth/
    organization/
    projects/
    notion/
    features-management/
    tickets/
    progress/
    sync-logs/
    client-dashboard/
  hooks/
  lib/
    api/
    axios.ts
    auth/
    config/
    utils/
  store/
  styles/
    globals.css
    tokens.css
  types/
```

---

## Core Rules

- all requests must match `endpoints.md`
- all protected responses use the standard wrapper
- bootstrap session with `GET /api/auth/session`
- enforce RBAC in the UI, not only through API failures
- never display Notion tokens or raw client tokens
- never expose internal-only data in the client dashboard
- use React Query for server state
- use Zustand for global UI state only
- keep validation in Zod schemas
- prefer current stable patterns for Next.js App Router, React, TanStack Query, shadcn/ui, React Hook Form, and Zod
- avoid `any` in application code; use explicit types and safe narrowing
- keep files focused and avoid long, sprawling components or helpers when they should be split
- prefer route files to stay server-first where practical, with dedicated client feature components owning interactive behavior
- when mutation responses are sufficient, update React Query caches surgically instead of defaulting to broad invalidation sweeps
- add route-group `loading.tsx` and `error.tsx` boundaries for major surfaces so loading and failure states stay local to the current route

---

## UI Domain Rules

### Internal UI

- desktop-first
- left sidebar plus top header
- information-dense where needed
- guides the user through setup and workflow

### Client UI

- no session
- no sidebar
- no internal controls
- calm and story-driven
- mobile-ready from the first release

Client dashboard may show only safe project progress fields. It must not expose internal users, raw ticket IDs, Notion IDs, org data, or sync diagnostics.

---

## Guided Workflow

The project detail screen should guide users through:

1. Connect Notion
2. Save status mapping
3. Trigger sync
4. Create client-facing features
5. Assign tickets
6. Share client link

The screen should never feel blank. Use checklist steps, empty states, and clear next-step calls to action.

---

## Visual System Details

Do not ship default shadcn styling.

Customize through `tokens.css`:

- color tokens
- radius
- shadows
- spacing rhythm

Use the official palette above and preserve stable semantic meaning:

- `success` means complete or successful
- `warning` means in progress or attention
- `danger` means failure or destructive
- `neutral` means inactive or low emphasis
- `primary` means the forest-green brand accent

---

## Final Direction

Build a premium internal operations dashboard paired with a clean, client-safe progress experience.

The architecture, data rules, and semantics are fixed, and the visual foundation should follow the Stone + Forest Green palette.

Implementation quality matters as much as appearance:

- prefer explicit types over shortcuts
- keep components and utilities easy to scan
- verify work before considering a phase complete
- favor maintainable, current best practices over quick but brittle solutions

## Definition Of Done

A frontend task or phase should be considered done only when:

- the UI behavior matches the intended workflow and UX direction
- the code follows the documented architecture and domain boundaries
- the implementation uses explicit types and avoids unnecessary `any`
- files remain reasonably focused and maintainable
- the work has been verified through the strongest checks available in the environment
- any remaining verification gap or risk is stated clearly instead of being hidden
