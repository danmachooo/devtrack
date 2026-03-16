# DevTrack Todo List v2

This plan defines the next focused pass for the internal `Dashboard` and `Tickets` routes so they stop feeling like scaffolds and become working product surfaces.

Status key:

- `[ ]` not started
- `[~]` in progress
- `[x]` done

Guiding decisions:

- `/dashboard` becomes the internal overview and prioritization surface
- `/tickets` becomes the dedicated project-first ticket-to-feature mapping workspace
- `/projects/[id]` remains the full command center for one project
- existing feature hooks, shared API modules, RBAC helpers, and client-safety rules must be reused

---

## Phase A - Discovery And Reuse Pass

- [x] Review the current `/dashboard` and `/tickets` route implementations
- [x] Inventory the existing reusable pieces for session, organization, projects, progress, and ticket review
- [x] Confirm which current hooks can power the new screens without widening API contracts
- [x] Confirm RBAC expectations for dashboard actions and ticket assignment visibility
- [x] Confirm the new routes still align with `PROJECT-FLOW.md`, `UI-UX-STORY.md`, `CONTEXT.md`, `SKILL.md`, and `ENDPOINTS.md`

---

## Phase B - Dashboard Route Upgrade

- [x] Replace the placeholder dashboard screen at `/dashboard`
- [x] Build a top-level overview layout that feels like a calm internal command center
- [x] Load the signed-in session and active organization context safely
- [x] Load the project list through the shared projects API layer
- [x] Derive dashboard summary metrics from existing project-safe internal data
- [x] Show a summary row for total projects, setup-needed projects, stale or never-synced projects, and ready-to-share projects
- [x] Add a role-aware next-steps section based on the documented workflow order
- [x] Add a project health list with project name, client name, progress signal, sync freshness, and open-project actions
- [x] Keep the dashboard useful when there are zero projects through a strong empty state
- [x] Ensure team leaders see create/manage actions while read-only roles see only safe read paths

Dashboard intent:

- overview first
- priorities second
- navigation into real work third

Dashboard must not:

- duplicate the dense ticket review workspace
- become a second project detail page
- expose client-unsafe data outside internal rules

---

## Phase C - Tickets Route Upgrade

- [x] Replace the placeholder tickets screen at `/tickets`
- [x] Make `/tickets` a project-first workspace rather than a cross-project aggregation page
- [x] Load the available projects through the shared projects API layer
- [x] Add a project selector that determines which project ticket data is shown
- [x] Persist the selected project in the URL query string when practical so the page can be revisited directly
- [x] Reuse the existing ticket review feature for the selected project instead of rebuilding assignment logic
- [x] Keep ticket filters for feature, mapped status, unassigned, and missing states
- [x] Keep ticket-to-feature assign and unassign flows in this page for authorized roles
- [x] Keep read-only roles able to inspect tickets while omitting assignment controls from the DOM
- [x] Add strong empty states for no projects, no sync yet, and no tickets matching filters
- [x] Add a clear shortcut from the tickets page back to the selected project command center

Tickets intent:

- this is where the internal team maps raw synced tickets into client-facing features
- this is the focused assignment workspace
- this should feel analytical and efficient, not broad or ambiguous

Tickets must not:

- imply that tickets are managed across all projects if the API is project-scoped
- bypass RBAC for assignment interactions
- duplicate API logic directly inside the route component

---

## Phase D - Shared UX And Architecture Pass

- [x] Keep route components compositional and move async orchestration into feature-local hooks where needed
- [x] Reuse shared feedback states for loading, error, and empty conditions
- [x] Preserve the Stone + Forest Green token system and current internal-shell visual language
- [x] Ensure mobile and desktop behavior stay readable and usable
- [x] Keep files reasonably focused; split helpers if route files become too large

---

## Phase E - Docs Alignment

- [x] Update `TODOLIST.md` if the original checklist wording should better reflect the implemented route behavior
- [x] Update `CONTEXT.md` with the newly stable dashboard and tickets-route behavior
- [x] Update `AGENTS.md` only if workflow guardrails or route expectations need to change

---

## Phase F - Verification

- [x] Verify route behavior with signed-in users that have an active organization
- [x] Verify the no-active-org experience still routes users into onboarding rather than broken pages
- [x] Verify RBAC for dashboard actions and ticket assignment controls
- [x] Verify `/tickets` works for both editable and read-only roles
- [x] Verify project selection and ticket filtering behavior
- [x] Verify typecheck passes
- [x] Verify build passes
- [x] Run any configured linting or route-level sanity checks available in the environment
- [x] Do a final safety pass for client-safety, organization scoping, and Zustand usage

Definition of done for this pass:

- `/dashboard` is a real internal overview page
- `/tickets` is a real project-first ticket mapping workspace
- existing project detail functionality continues to work
- RBAC remains correct
- verification results are recorded honestly

Verification notes:

- `npm run typecheck` passed
- `npm run build` passed
- no lint script is currently configured in `package.json`
- route behavior, no-active-org handling, RBAC, organization scoping, and Zustand usage were verified through code-path audit against the implemented guards, permission helpers, and shared API/query structure
