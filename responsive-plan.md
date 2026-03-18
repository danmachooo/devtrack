# DevTrack Responsive Plan

This document defines the next responsive-design pass for the DevTrack frontend.

The goal is not to make screens merely shrink. The goal is to preserve the product model, RBAC behavior, and client-safety rules while making the internal workspace and client dashboard feel deliberate and reliable across mobile, tablet, laptop, and wide desktop layouts.

This plan should be read alongside:

- `AGENTS.md`
- `CONTEXT.md`
- `PROJECT-FLOW.md`
- `UI-UX-STORY.md`
- `SKILL.md`
- `ENDPOINTS.md`

If responsive decisions conflict with product safety, RBAC, or API-contract rules, those rules win.

---

## Purpose

DevTrack has two distinct responsive surfaces:

1. Internal authenticated workspace
2. Public client dashboard

These surfaces should not respond the same way.

The internal workspace can stay operational and dense, but must remain readable, navigable, and action-safe on smaller screens.

The client dashboard should remain calm, presentational, and mobile-ready from the first interaction.

---

## Responsive Principles

- keep the internal and client surfaces visually related but behaviorally distinct
- preserve workflow clarity before chasing layout symmetry
- avoid horizontal overflow for primary page content
- keep critical actions reachable without making destructive actions easier to trigger accidentally
- preserve RBAC by hiding unauthorized controls on every breakpoint, not only on desktop
- keep client-safe fields client-safe at every viewport size
- prefer layout adaptation, content reprioritization, and component reflow over shrinking text excessively
- preserve dark mode quality and semantic color meaning across breakpoints

---

## Breakpoint Intent

These ranges define the planning target, even if implementation uses the project Tailwind defaults.

### Mobile

- primary range: under `768px`
- prioritize stacked layouts, concise metadata, and single-column reading
- sidebar patterns should become compact or overlay-based rather than permanently consuming width
- dense table-like surfaces should become card, list, or segmented presentations when readability would otherwise break

### Tablet

- primary range: `768px` to `1023px`
- support two-column layouts where they materially improve scanning
- preserve clear workspace hierarchy without forcing full desktop chrome
- allow split-pane patterns only when both panes still remain usable

### Desktop

- primary range: `1024px` and up
- keep the current operational density and stronger multi-column layouts
- preserve command-center hierarchy and information grouping

### Wide Desktop

- primary range: `1440px` and up
- prevent important content from feeling stretched or disconnected
- use width limits, balanced grids, and stronger content anchoring where needed

---

## Surface Priorities

### 1. Shared Shell And Navigation

The internal shell is the highest-leverage responsive area because every authenticated route depends on it.

Responsive goals:

- audit sidebar collapse and expansion behavior below desktop widths
- decide the stable mobile navigation pattern for the internal shell
- keep the top header readable when organization context, page titles, and actions compete for space
- preserve account menu, theme toggle, and contextual actions without crowding
- prevent page headers from wrapping awkwardly or pushing primary actions below the fold unnecessarily

### 2. Auth Routes

Responsive goals:

- keep sign-in and sign-up simple, centered, and confidence-building on smaller screens
- ensure form width, spacing, and helper text stay readable on narrow devices
- keep validation, loading, and error feedback stable without layout jumps

### 3. Organization Route

Responsive goals:

- keep onboarding and active-organization management understandable on tablet and mobile
- preserve role-management clarity without making member actions cramped
- ensure invitation cards, member rows, and admin controls reflow safely

### 4. Dashboard Route

Responsive goals:

- maintain the overview-first hierarchy on all breakpoints
- let summary metrics wrap into clean grids rather than compressed strips
- keep role-aware next steps and project health items easy to scan on tablet and mobile

### 5. Projects List Route

Responsive goals:

- preserve clear project-card clickability and metadata hierarchy on smaller screens
- keep progress, freshness, and action affordances readable without card clutter
- ensure zero-project and role-aware empty states remain composed

### 6. Project Detail Route

Responsive goals:

- keep the guided setup flow clear on mobile and tablet
- audit modal-driven setup steps for viewport height, scroll trapping, and action placement
- ensure the setup rail, overview area, sync signal, and lower-priority workspaces reflow without confusion
- keep status, readiness, and share-state cues obvious without relying on desktop-only placement

### 7. Notion, Sync, Feature Management, Progress, And Client Access Panels

Responsive goals:

- confirm panel-level controls do not wrap into unstable or inaccessible layouts
- review form rows, select triggers, dialog content, and action groups for narrow widths
- preserve role-aware omission of management controls at every breakpoint

### 8. Tickets Workspace

This is the most likely internal surface to degrade on smaller screens.

Responsive goals:

- define a stable mobile and tablet presentation for ticket review
- keep project selection, filters, search, bulk actions, pagination, and row-level assignment usable without overwhelming the viewport
- decide which metadata stays inline versus collapses into secondary rows or stacked sections
- preserve analytical clarity without pretending the page is a simple mobile feed

### 9. Client Dashboard

Responsive goals:

- keep the client page calm and trustworthy on phones first
- preserve hero hierarchy, feature progress storytelling, and recent activity readability
- ensure safe activity, freshness messaging, and progress bars scale well from mobile to wide desktop

### 10. Shared Components

Responsive goals:

- audit dialogs, popovers, selects, cards, badges, progress bars, tables, and toasts
- confirm shared spacing and typography tokens hold up at small and large widths
- prevent clipping, overflow, and awkward icon-plus-label wrapping

---

## Implementation Strategy

The responsive pass should be incremental and verification-driven.

### Step 1. Audit

- inventory route-level and shared-component responsive issues
- capture concrete breakpoint failures instead of vague polish notes
- group findings into shell, route, and shared-component buckets

### Step 2. Shared Foundations

- fix shell, header, spacing, and reusable component constraints first
- avoid per-page hacks when a shared layout primitive should own the fix

### Step 3. High-Risk Internal Surfaces

- prioritize `/projects/[id]`, `/tickets`, `/organization`, `/projects`, and `/dashboard`
- handle the screens where operational density and RBAC-sensitive controls create the most mobile risk

### Step 4. Client Surface

- review `/client/[token]` as its own responsive story
- keep it lighter and more presentation-focused than the internal workspace

### Step 5. Safety And Regression Pass

- confirm responsive changes do not expose hidden controls, client-unsafe data, or broken route boundaries
- confirm no server-state logic leaks into Zustand during UI reshaping

---

## Responsive Rules By Concern

### Layout

- prefer stacked sections before extreme content compression
- keep section spacing consistent as grids collapse
- avoid full-width text lines that reduce scanability on wide screens

### Typography

- prevent important titles and labels from breaking into awkward multi-line fragments
- keep small-screen typography readable without making dense internal pages feel oversized

### Actions

- primary actions should remain visible and easy to find
- destructive actions should stay deliberate, never easier to tap accidentally on mobile
- read-only roles must continue to see no unauthorized action controls in the DOM

### Forms

- inputs, selects, and buttons should fit narrow widths cleanly
- multi-field rows should stack when side-by-side layout harms readability
- validation and helper copy should not cause severe layout jumps

### Data-Dense Views

- treat ticket-heavy and admin-heavy screens as responsive redesign work, not only spacing work
- shift from row-density to grouped scanning where needed while preserving efficiency

### Feedback States

- loading, empty, and error states should remain centered, readable, and not oversized on mobile
- keep route-level recovery actions visible without scrolling friction

---

## Verification Expectations

Before the responsive pass is called complete:

- run typecheck
- run production build verification
- audit internal shell behavior across mobile, tablet, desktop, and wide desktop
- audit `/sign-in`, `/sign-up`, `/organization`, `/dashboard`, `/projects`, `/projects/[id]`, `/tickets`, and `/client/[token]`
- verify modal, popover, select, and dialog behavior on narrow widths
- verify RBAC-sensitive controls remain hidden at all breakpoints for unauthorized roles
- verify client pages still expose only safe client fields
- state any remaining responsive gaps honestly if full browser-device validation is not available

---

## Definition Of Done

This responsive plan is complete only when:

- internal routes remain operationally clear from mobile through wide desktop
- the client dashboard feels calm, mobile-ready, and client-safe across breakpoints
- shared shell and component behavior no longer create recurring responsive regressions
- RBAC, organization scoping, API-contract alignment, and client-safety rules remain intact
- verification has been run and documented honestly
