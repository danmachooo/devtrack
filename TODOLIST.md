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
- [ ] Build the top header with organization context and user menu
- [ ] Add role-aware page actions
- [ ] Add dark mode support through the token system
- [ ] Ensure unauthorized actions are hidden in the UI

## Phase 5 - Project List

- [ ] Build `/projects`
- [ ] Show project name, client name, progress, and `lastSyncedAt`
- [ ] Add sync freshness treatment
- [ ] Add a clear empty state for zero projects
- [ ] Add a team-leader-only create-project CTA
- [ ] Wire project list and project creation to real APIs

## Phase 6 - Project Detail Command Center

- [ ] Build `/projects/[id]`
- [ ] Add project header with metadata and edit action
- [ ] Add the six-step setup checklist
- [ ] Add project progress summary and `lastSyncedAt`
- [ ] Add contextual empty states so the page never feels blank
- [ ] Adapt the page based on the next incomplete setup step

## Phase 7 - Notion Integration

- [ ] Build the Notion connection panel
- [ ] Add test-before-save flow with `/api/projects/:id/notion/test`
- [ ] Add save-connection flow with `/api/projects/:id/notion/connect`
- [ ] Build database display with `/api/projects/:id/notion/databases`
- [ ] Build the status mapping editor with `/api/projects/:id/notion/mapping`
- [ ] Explain completion logic clearly in the mapping UI
- [ ] Restrict Notion setup actions to `TEAM_LEADER`

## Phase 8 - Sync Experience

- [ ] Build the sync panel on project detail
- [ ] Handle idle, queued, syncing, already queued, and completed states
- [ ] Respect role access for `TEAM_LEADER` and `BUSINESS_ANALYST`
- [ ] Invalidate relevant queries after successful sync activity
- [ ] Surface `lastSyncedAt` prominently for trust

## Phase 9 - Feature Management

- [ ] Build the project feature list
- [ ] Build add-feature flow
- [ ] Build rename-feature flow
- [ ] Build reorder-feature flow
- [ ] Build delete-feature flow
- [ ] Show progress and ticket counts per feature
- [ ] Add an empty state with a clear CTA when no features exist

## Phase 10 - Tickets

- [ ] Build the project ticket view
- [ ] Show title, mapped status, source status, feature assignment, assignee, missing state, and synced time
- [ ] Add filters for feature, status, unassigned, and missing tickets
- [ ] Prevent invalid `featureId + unassigned=true` combinations in the UI
- [ ] Build inline assign and unassign interactions
- [ ] Restrict assignment actions to `TEAM_LEADER` and `BUSINESS_ANALYST`

## Phase 11 - Progress And Sync Logs

- [ ] Build project progress cards and progress bars
- [ ] Show aggregate project progress
- [ ] Show per-feature progress and status chips
- [ ] Build the sync log list with `/api/projects/:id/sync/logs`
- [ ] Show `SUCCESS`, `FAILED`, and `RATE_LIMITED` outcomes clearly
- [ ] Add an empty state for projects with no sync history

## Phase 12 - Client Access

- [ ] Build the client access panel inside project detail
- [ ] Wire `/api/projects/:id/client-access`
- [ ] Show `clientAccessLink` and `lastViewedAt`
- [ ] Add copy-link interaction
- [ ] Restrict visibility to `TEAM_LEADER` and `BUSINESS_ANALYST`
- [ ] Never expose raw token values

## Phase 13 - Client Dashboard

- [ ] Build `/client/[token]`
- [ ] Add a calm standalone layout with no internal navigation
- [ ] Show project name and overall progress hero
- [ ] Show feature cards with progress, status, and ticket counts
- [ ] Show recent activity
- [ ] Show `lastSyncedAt` in a reassuring way
- [ ] Build invalid-token error state
- [ ] Ensure the page works well on mobile and desktop

## Phase 14 - RBAC And Safety Audit

- [ ] Verify all role-limited actions are hidden or gated correctly
- [ ] Verify client pages do not import internal auth or org state
- [ ] Verify no client screen exposes internal IDs or sensitive data
- [ ] Verify no component displays Notion tokens or raw client tokens
- [ ] Verify no server data is stored in Zustand

## Phase 15 - Polish And Readiness

- [ ] Review empty states for clear next-step calls to action
- [ ] Review loading states so important screens never feel blank
- [ ] Review error states for clarity and recovery
- [ ] Review accessibility basics such as labels, focus rings, and keyboard access
- [ ] Review responsive behavior for auth and client pages
- [ ] Review visual consistency against your chosen color palette and design tokens
- [ ] Do a final pass against `AGENTS..md`, `PROJECT-FLOW.md`, `UI-UX-STORY.md`, `CONTEXT.md`, and `SKILL.md`
