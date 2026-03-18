# DevTrack Todo List

This checklist turns the planning docs into an implementation path for the frontend.

Status key:

- `[ ]` not started
- `[~]` in progress
- `[x]` done

Assumption:

- the backend is already complete
- the frontend should wire to real APIs by default

---

## Phase 1 - Foundation

- [x] Initialize the Next.js App Router frontend workspace
- [x] Set up TypeScript, Tailwind, shadcn/ui, TanStack Query, Zustand, React Hook Form, Zod, and Axios
- [x] Create route groups for `(auth)`, `(internal)`, and `(client)`
- [x] Add shared layout shells for auth, internal workspace, and client dashboard
- [x] Create `tokens.css` with a flexible design-token system
- [x] Implement the chosen `Stone + Forest Green` palette in the token layer
- [x] Create the shared Axios instance and API folder structure
- [x] Configure the React Query provider with standard defaults
- [x] Add session bootstrap using `GET /api/auth/session`
- [x] Add shared feedback components such as `EmptyState`, `ErrorState`, `Loader`, and `Skeleton`

## Phase 2 - Auth And Session

- [x] Build sign-up with React Hook Form and Zod
- [x] Build sign-in with React Hook Form and Zod
- [x] Wire auth forms to `/api/auth/sign-up` and `/api/auth/sign-in`
- [x] Implement sign-out via `/api/auth/sign-out`
- [x] Add internal route protection
- [x] Handle no-session state cleanly
- [x] Handle no-active-org state as onboarding rather than error

## Phase 3 - Organization Setup

- [x] Build create-organization screen
- [x] Add organization form validation
- [x] Wire `POST /api/org` and `GET /api/org`
- [x] Build personal invitations view with `GET /api/org/invitations/me`
- [x] Add accept invitation flow
- [x] Add reject invitation flow
- [x] Build organization members view
- [x] Build team-leader-only invitation management
- [x] Build invite member form
- [x] Build role update and member removal actions

## Phase 4 - Internal App Shell

- [x] Build sidebar navigation for dashboard, projects, tickets, and organization
- [x] Build the top header with organization context and user menu
- [x] Add role-aware page actions
- [x] Add dark mode support through the token system
- [x] Ensure unauthorized actions are hidden in the UI

## Phase 5 - Project List

- [x] Build `/projects`
- [x] Show project name, client name, progress, and `lastSyncedAt`
- [x] Add sync freshness treatment
- [x] Add a clear empty state for zero projects
- [x] Add a team-leader-only create-project CTA
- [x] Wire project list and project creation to real APIs

## Phase 6 - Project Detail Command Center

- [x] Build `/projects/[id]`
- [x] Add project header with metadata and edit action
- [x] Add the six-step setup checklist
- [x] Add project progress summary and `lastSyncedAt`
- [x] Add contextual empty states so the page never feels blank
- [x] Adapt the page based on the next incomplete setup step

## Phase 7 - Notion Integration

- [x] Build the Notion connection panel
- [x] Add test-before-save flow with `/api/projects/:id/notion/test`
- [x] Add save-connection flow with `/api/projects/:id/notion/connect`
- [x] Build database display with `/api/projects/:id/notion/databases`
- [x] Build the status mapping editor with `/api/projects/:id/notion/mapping`
- [x] Explain completion logic clearly in the mapping UI
- [x] Restrict Notion setup actions to `TEAM_LEADER`

## Phase 8 - Sync Experience

- [x] Build the sync panel on project detail
- [x] Handle idle, queued, syncing, already queued, and completed states
- [x] Respect role access for `TEAM_LEADER` and `BUSINESS_ANALYST`
- [x] Invalidate relevant queries after successful sync activity
- [x] Surface `lastSyncedAt` prominently for trust

## Phase 9 - Feature Management

- [x] Build the project feature list
- [x] Build add-feature flow
- [x] Build rename-feature flow
- [x] Build reorder-feature flow
- [x] Build delete-feature flow
- [x] Show progress and ticket counts per feature
- [x] Add an empty state with a clear CTA when no features exist

## Phase 10 - Tickets

- [x] Build the project ticket view
- [x] Show title, mapped status, source status, feature assignment, assignee, missing state, and synced time
- [x] Add filters for feature, status, unassigned, and missing tickets
- [x] Prevent invalid `featureId + unassigned=true` combinations in the UI
- [x] Build inline assign and unassign interactions
- [x] Restrict assignment actions to `TEAM_LEADER` and `BUSINESS_ANALYST`

## Phase 11 - Progress And Sync Logs

- [x] Build project progress cards and progress bars
- [x] Show aggregate project progress
- [x] Show per-feature progress and status chips
- [x] Build the sync log list with `/api/projects/:id/sync/logs`
- [x] Show `SUCCESS`, `FAILED`, and `RATE_LIMITED` outcomes clearly
- [x] Add an empty state for projects with no sync history

## Phase 12 - Client Access

- [x] Build the client access panel inside project detail
- [x] Wire `/api/projects/:id/client-access`
- [x] Show `clientAccessLink` and `lastViewedAt`
- [x] Add copy-link interaction
- [x] Restrict visibility to `TEAM_LEADER` and `BUSINESS_ANALYST`
- [x] Never expose raw token values

## Phase 13 - Client Dashboard

- [x] Build `/client/[token]`
- [x] Add a calm standalone layout with no internal navigation
- [x] Show project name and overall progress hero
- [x] Show feature cards with progress, status, and ticket counts
- [x] Show recent activity
- [x] Show `lastSyncedAt` in a reassuring way
- [x] Build invalid-token error state
- [x] Ensure the page works well on mobile and desktop

## Phase 14 - RBAC And Safety Audit

- [x] Verify all role-limited actions are hidden or gated correctly
- [x] Verify client pages do not import internal auth or org state
- [x] Verify no client screen exposes internal IDs or sensitive data
- [x] Verify no component displays Notion tokens or raw client tokens
- [x] Verify no server data is stored in Zustand

## Phase 15 - Polish And Readiness

- [x] Review empty states for clear next-step calls to action
- [x] Review loading states so important screens never feel blank
- [x] Review error states for clarity and recovery
- [x] Review accessibility basics such as labels, focus rings, and keyboard access
- [x] Review responsive behavior for auth and client pages
- [x] Review visual consistency against your chosen color palette and design tokens
- [x] Do a final pass against `AGENTS.md`, `PROJECT-FLOW.md`, `UI-UX-STORY.md`, `CONTEXT.md`, and `SKILL.md`

## Phase 16 - Internal Route Follow-Up

- [x] Upgrade `/dashboard` from scaffold to a real internal overview page with project metrics, role-aware next steps, and project health links
- [x] Upgrade `/tickets` from scaffold to a project-first ticket mapping workspace

## Phase 17 - Shell Polish

- [x] Upgrade the internal sidebar with sticky positioning and Lucide icons
- [x] Replace the plain theme toggle label with an icon-led toggle treatment
- [x] Add a minimal custom scrollbar that follows the shared token system

## Phase 18 - Project Detail Setup Redesign

- [x] Redesign `/projects/[id]` so setup is guided linearly instead of relying on one long command-center scroll
- [x] Keep the current incomplete setup step prominent with a focused setup launcher and compact setup rail
- [x] Move first-feature creation into the guided setup path
- [x] Hand off ticket assignment from `/projects/[id]` into the dedicated `/tickets` workspace
- [x] Move progress, sync diagnostics, and client sharing into a lower-priority workspace area during setup
- [x] Stage the Notion setup flow so connection happens before status mapping
- [x] Replace the large sync trust card with a compact header-level sync signal
- [x] Verify the redesigned project page with typecheck and production build validation

## Phase 19 - Live Backend Wiring

- [x] Make the shared API layer target the live backend by default
- [x] Add a configurable `NEXT_PUBLIC_API_BASE_URL` runtime override for backend hosts
- [x] Proxy absolute backend hosts through the app's same-origin `/api` path so session cookies stay deployment-safe across Vercel and Render
- [x] Keep mock mode available only through an explicit `NEXT_PUBLIC_USE_MOCK_API=true` opt-in
- [x] Normalize Axios error messages so API feedback remains readable in the existing UI
- [x] Add `.env.example` for backend wiring discovery
- [x] Verify the live-backend cutover with typecheck and production build validation

## Phase 20 - UI Polish Alignment

- [x] Refine shared headers, cards, buttons, empty states, popovers, and modal surfaces so alignment and hierarchy feel more deliberate
- [x] Upgrade shared select treatment with clearer trigger alignment, caret affordance, hover states, and focus states
- [x] Tighten text wrapping and scanability across prioritized internal routes, especially `/tickets`, `/projects`, `/projects/[id]`, and `/organization`
- [x] Add purposeful Lucide icon support to page headers, page actions, summary surfaces, and key workspace controls
- [x] Strengthen active and selected treatments for ticket filters, workspace tabs, checklist cards, and assignment controls without changing RBAC or query logic
- [x] Replace misleading setup-completion percentages on `/projects`, `/dashboard`, and `/projects/[id]` with the correct progress or clearly scoped setup-readiness messaging
- [x] Wire feature-management progress bars to real assigned-ticket progress instead of placeholder `0%` values
- [x] Verify the polish pass with typecheck and production build validation

## Phase 21 - Ticket Scaling

- [x] Upgrade `GET /api/projects/:id/tickets` consumers to the paginated ticket contract
- [x] Add shared API support for backend-driven ticket search, assignee filtering, sorting, and page sizing
- [x] Add selection-based bulk feature assignment through `PATCH /api/tickets/feature/bulk`
- [x] Upgrade `/tickets` with summary metrics, inbox-style work-remaining messaging, and pagination controls
- [x] Keep row-level assignment for one-off edits while omitting assignment controls for read-only roles
- [x] Verify the ticket-scaling pass with typecheck and production build validation

## Phase 22 - Feature Management Redesign

- [x] Redesign feature management into a split-pane editor instead of a tall stacked CRUD list
- [x] Add compact feature browsing with search, filter, selected-state, and stronger ordering context
- [x] Move rename, ordering, and delete actions into a focused feature detail pane
- [x] Add stronger client-facing naming guidance and explicit delete-impact confirmation
- [x] Preserve read-only inspection while omitting management controls for unauthorized roles
- [x] Verify the feature-management redesign with typecheck and production build validation

## Phase 23 - Feature Drag And Drop

- [x] Explore drag-and-drop ordering for the feature list and validate it against the split-pane editor workflow
- [x] Decide to prefer explicit reorder controls plus direct position selection instead of keeping drag-and-drop
- [x] Add direct position-based feature ordering in the detail pane for larger jumps
- [x] Preserve explicit move controls as the stable ordering path for editable roles
- [x] Verify the final ordering UX decision with typecheck and production build validation

## Phase 24 - Interaction Feedback And Workflow Polish

- [x] Replace the dashboard empty-state text badge with a proper icon and align the dashboard header with the stronger internal page-header pattern
- [x] Add app-wide pointer cursor treatment for shared click targets so interactive affordances read more clearly
- [x] Make project cards on `/projects` read as obvious click targets with full-card navigation and stronger hover states
- [x] Smooth the internal sidebar expand and collapse animation by keeping labels mounted and animating width and opacity instead of snapping content in and out
- [x] Normalize pasted Notion database IDs from plain 32-character or URL-derived values into the UUID format expected by the API contract
- [x] Move manual sync access into the project header sync signal so freshness and sync actions stay in one place for authorized roles
- [x] Add a shared toast system and wire it into project creation and editing, Notion setup, manual sync, and client-link copy feedback
- [x] Lighten the feature-management workspace with stronger row hover cues, independent list sizing, a non-wrapping summary badge, and a simpler tabbed editor with compact delete affordance
- [x] Verify the interaction-polish pass with typecheck validation
