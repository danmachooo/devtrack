# Responsive Todo List

This checklist tracks the dedicated responsive pass for the DevTrack frontend.

Status key:

- `[ ]` not started
- `[~]` in progress
- `[x]` done

Guiding intent:

- keep responsive work aligned with `PROJECT-FLOW.md`, `UI-UX-STORY.md`, `CONTEXT.md`, `SKILL.md`, and `ENDPOINTS.md`
- preserve RBAC, organization scoping, and client-safety rules at every breakpoint
- treat the internal workspace and client dashboard as related but distinct responsive surfaces
- fix shared layout and component issues before layering route-specific overrides
- keep changes incremental, maintainable, and verification-driven

---

## Phase 1 - Responsive Audit

- [x] Review the current responsive behavior of the shared internal shell across mobile, tablet, desktop, and wide desktop widths
- [x] Review `(auth)` routes for narrow-width readability, spacing stability, and form usability
- [x] Review `/organization` for onboarding and member-management responsiveness
- [x] Review `/dashboard` for summary-grid, next-step, and project-health responsiveness
- [x] Review `/projects` card layout and action hierarchy across breakpoints
- [x] Review `/projects/[id]` header, setup rail, modal flow, and lower-priority workspace responsiveness
- [x] Review `/tickets` for filter density, row readability, bulk actions, and pagination responsiveness
- [x] Review `/client/[token]` for mobile-first readability and calm presentation
- [x] Review shared dialogs, popovers, selects, toasts, cards, and progress components for overflow or clipping risks
- [x] Capture concrete route-level and component-level responsive issues before implementation starts

---

## Phase 2 - Shared Shell And Foundations

- [x] Finalize the internal mobile navigation pattern for the sidebar and top header
- [x] Tighten shared page-header behavior so titles, metadata, and actions reflow cleanly on smaller screens
- [x] Audit width constraints, container padding, and section spacing across the app shell
- [x] Improve shared typography wrapping for headings, badges, pills, and icon-plus-label controls
- [x] Fix common dialog, popover, and select sizing issues on narrow viewports
- [x] Confirm shared feedback states remain readable and centered across breakpoints

---

## Phase 3 - Auth And Organization Surfaces

- [x] Refine sign-in and sign-up layouts for smaller screens without weakening the confidence-building feel
- [x] Ensure auth validation and loading states do not produce unstable layout jumps on mobile
- [x] Rework organization onboarding sections so create-org and invitation flows remain guided on narrow screens
- [x] Reflow member-management and invitation-management controls so admin actions stay readable and deliberate

---

## Phase 4 - Internal Overview Surfaces

- [x] Rebalance `/dashboard` summary cards and overview sections for tablet and mobile
- [x] Refine `/projects` card density so progress, freshness, and metadata remain easy to scan on smaller widths
- [x] Preserve team-leader-only creation affordances without crowding page headers

---

## Phase 5 - Project Detail And Panel Responsiveness

- [x] Refine `/projects/[id]` header hierarchy for small and medium widths
- [x] Ensure the setup rail and guided-step launcher stay understandable when the page collapses to one column
- [x] Audit Notion setup dialogs, mapping forms, and sync actions for mobile-safe interaction
- [x] Refine feature-management split-pane behavior with a strong stacked fallback for smaller screens
- [x] Ensure progress, sync-log, and client-access panels reflow cleanly without losing hierarchy

---

## Phase 6 - Tickets Workspace Responsiveness

- [x] Define the stable mobile and tablet layout strategy for `/tickets`
- [x] Reflow project selector, filters, search, sort, and page-size controls without making the toolbar chaotic
- [x] Refine ticket rows or cards so assignment, status, and metadata remain readable at narrow widths
- [x] Keep bulk actions and pagination usable on mobile and tablet
- [x] Preserve efficient scanning for desktop and wide desktop without introducing breakpoint-specific regressions

---

## Phase 7 - Client Dashboard Responsiveness

- [x] Refine the client hero and summary layout for phones first
- [x] Ensure feature progress cards maintain calm spacing and readable hierarchy on small screens
- [x] Reflow recent activity and freshness messaging so the dashboard stays trustworthy without feeling dense
- [x] Verify the client surface continues to expose only documented safe fields at every breakpoint

---

## Phase 8 - Safety Pass

- [x] Verify RBAC-sensitive internal controls stay hidden for unauthorized roles across all responsive layouts
- [x] Verify responsive changes do not mix internal and client component trees
- [x] Verify no client-unsafe fields become visible due to stacked or collapsed layouts
- [x] Verify shared state ownership remains correct and no server data is moved into Zustand during the responsive pass

---

## Phase 9 - Docs Alignment

- [x] Update `TODOLIST.md` to reflect the responsive pass status
- [x] Update `CONTEXT.md` with the newly stable responsive behavior once implemented
- [x] Update `AGENTS.md` only if responsive workflow guardrails or verification rules should become permanent
- [x] Keep this file updated as the source of truth for the responsive pass

---

## Phase 10 - Verification

- [x] Verify the internal shell at mobile, tablet, desktop, and wide desktop widths
- [x] Verify `/sign-in`, `/sign-up`, `/organization`, `/dashboard`, `/projects`, `/projects/[id]`, `/tickets`, and `/client/[token]` across representative breakpoints
- [x] Verify dialogs, popovers, and selects remain usable at narrow widths
- [x] Verify typecheck passes
- [x] Verify production build passes
- [x] Run any configured linting or route-level sanity checks available in the environment
- [x] Record residual responsive risks honestly if full browser-device validation is not available

---

## Definition Of Done

This pass is done only when:

- the shared shell and component system support responsive layouts cleanly
- internal routes remain operationally clear across breakpoints
- the client dashboard remains calm, readable, and mobile-ready
- RBAC, organization scoping, and client-safety rules remain intact
- verification has been run honestly and any remaining gaps are stated clearly

---

## Verification Notes

- [x] `npm.cmd run typecheck` passed
- [x] `npm.cmd run build` passed
- [x] No dedicated lint script is currently configured in `package.json`
- [x] Responsive verification was completed through route-level code-path review plus build and typecheck; full browser-device testing remains a residual gap in the current environment
