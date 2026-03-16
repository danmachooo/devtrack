# DevTrack Context

This document captures the product and backend context the frontend should treat as stable.

It grounds implementation decisions in the underlying model rather than in UI assumptions alone.

Read it alongside:

- `AGENTS.md`
- `PROJECT-FLOW.md`
- `UI-UX-STORY.md`
- `SKILL.md`
- `ENDPOINTS.md`

When contract rules or scoping rules conflict with UI assumptions, the contract and scoping rules win.

---

## Product Summary

DevTrack transforms internal delivery data into a client-safe progress experience.

It has two product surfaces:

1. Internal team workspace
2. Public client dashboard

The internal workspace is for authenticated organization members.

The client dashboard is token-based and intentionally limited to client-safe project visibility.

---

## Core Domain Model

The system centers on these entities:

- `User`
- `Session`
- `Organization`
- `OrganizationInvitation`
- `OrganizationMember`
- `Project`
- `NotionConnection`
- `StatusMapping`
- `Ticket`
- `Feature`
- `SyncLog`
- `ClientAccess`

### User

Represents an internal authenticated person.

Relevant identity fields:

- `id`
- `name`
- `email`

The user's effective permissions depend on their active organization role.

### Session

Authentication is session-based.

Frontend session bootstrap happens through:

- `GET /api/auth/session`

Returned shape:

```ts
{
  session: {
    expiresAt: string;
    activeOrganizationId: string | null;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: "TEAM_LEADER" | "BUSINESS_ANALYST" | "QUALITY_ASSURANCE" | "DEVELOPER";
  } | null;
}
```

Important consequences:

- `session` may be `null`
- `user` may be `null`
- a user may be signed in without belonging to an active organization
- almost all internal data depends on `activeOrganizationId`
- the frontend currently redirects no-session users away from internal routes and into `/sign-in`
- signed-in users without an active organization are intentionally treated as onboarding users and guided into `/organization`

### Organization

Organizations are the primary security boundary for protected data.

Everything below is organization-scoped:

- projects
- members
- invitations
- tickets
- features
- sync logs

Cross-organization access must fail.

Current frontend organization behavior:

- `/organization` is both the onboarding destination and the active organization management screen
- team leaders can create the first organization directly from the frontend
- successful organization creation activates the organization in the current session

### OrganizationInvitation

Invitations are used to join an organization by email.

Important behavior:

- the invited email must match the authenticated user email
- accepting an invitation activates that organization in the current session
- invitation IDs are non-UUID strings where documented
- the frontend supports personal invitation listing plus accept and reject actions
- outgoing invitation management is shown only for `TEAM_LEADER`

### OrganizationMember

Represents a user inside an organization with a role.

Role enum:

- `TEAM_LEADER`
- `BUSINESS_ANALYST`
- `QUALITY_ASSURANCE`
- `DEVELOPER`

Current frontend member management:

- the organization route includes a members view
- team leaders can update member roles and remove members
- non-team-leader users can view membership but do not see management controls

### Project

A project represents a client engagement inside one organization.

Common fields and concepts:

- project name
- client name
- client email
- `syncInterval`
- `lastSyncedAt`
- `ClientAccess`

Important behavior:

- projects are org-scoped
- project creation is team-leader-only
- `syncInterval` must stay within `5-60`
- project creation also creates client access metadata

### NotionConnection

Stores the Notion integration details for a project.

Important behavior:

- the token is encrypted at rest
- the token is never returned in API responses
- the connection can be tested before saving

### StatusMapping

Maps project-specific Notion statuses into DevTrack ticket statuses.

Internal ticket status enum:

- `NOT_STARTED`
- `IN_DEV`
- `APPROVED`
- `RELEASED`

This mapping directly affects progress calculation.

### Ticket

Tickets are synced into DevTrack from Notion.

Important behavior:

- sync upserts tickets
- missing source items are marked, not deleted
- tickets can be assigned to features
- unassigned tickets do not affect progress

### Feature

Features are manually curated, client-facing groupings of work inside a project.

Important behavior:

- features belong to a project
- feature ordering is stable and backend-managed
- deleting a feature sets related ticket `featureId` values to `null`

Client-facing feature status enum:

- `NO_WORK_LOGGED`
- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETED`

### SyncLog

Captures one sync attempt for a project.

Status enum:

- `SUCCESS`
- `FAILED`
- `RATE_LIMITED`

Sync logs are diagnostic and internal.

### ClientAccess

Represents public dashboard access for a project.

Important behavior:

- it is created automatically with the project
- access is token-based, not session-based
- the raw token must not be exposed in normal frontend payloads
- the safe field is `clientAccessLink`

---

## Authorization Model

DevTrack uses RBAC in both backend enforcement and frontend visibility.

| Action | TEAM_LEADER | BUSINESS_ANALYST | QUALITY_ASSURANCE | DEVELOPER |
| --- | :---: | :---: | :---: | :---: |
| Create or manage org | yes | no | no | no |
| Invite or manage members | yes | no | no | no |
| Create, edit, delete projects | yes | no | no | no |
| Notion test, connect, mapping | yes | no | no | no |
| Trigger manual sync | yes | yes | no | no |
| Create, edit, delete features | yes | yes | no | no |
| Assign tickets to features | yes | yes | no | no |
| Get client access link | yes | yes | no | no |
| Read internal project data | yes | yes | yes | yes |

Frontend implication:

- unauthorized action controls should be hidden
- for read-only roles, action controls should usually be omitted rather than merely disabled

---

## Organization Scoping Rules

These rules are foundational:

- protected internal data is always resolved through the active organization
- a project belongs to one organization
- a feature belongs to one project
- a ticket belongs to one project
- a sync log belongs to one project
- a ticket can only be assigned to a feature in the same project

Frontend implications:

- do not request internal data without an active organization
- do not attempt cross-org requests
- do not attempt cross-project ticket assignment
- treat no-active-org as an onboarding state, not a crash state

---

## Authentication Model

Internal UI auth:

- session-based
- restored with `GET /api/auth/session`
- users sign up, sign in, and sign out through custom `/api/auth/*` routes
- sign-in and sign-up forms are implemented with React Hook Form and Zod
- sign-out is available from the internal shell header

Client dashboard access:

- no session
- no user account
- tokenized route via `/client/:token`
- validated through dedicated client middleware

---

## Notion Integration Model

Notion is the external source of raw ticket data.

Typical sequence:

1. Test connection
2. Save connection
3. Save status mapping
4. Trigger sync
5. Review imported tickets

Important behavior:

- sync may be manual or scheduled
- sync can return `202` when newly queued
- sync can return `200` when already queued
- the frontend should inspect `alreadyQueued`
- every sync attempt creates a sync log
- successful sync updates `lastSyncedAt`

---

## Progress Model

Progress is derived, not manually entered.

### Ticket Completion Logic

These ticket statuses count as complete:

- `APPROVED`
- `RELEASED`

### Feature Progress

Feature progress is based on assigned, non-missing tickets.

### Project Progress

Project progress is the average of feature progress values.

### Implications

- unassigned tickets do not contribute to feature or project progress
- inaccurate status mapping produces inaccurate progress
- stale sync data makes progress look unreliable

---

## Data Exposure Rules

These rules are absolute.

### Safe For Internal UI

- project metadata
- feature organization
- ticket details
- sync diagnostics
- org and member data, subject to role

### Never Expose In Client UI

- internal user names
- org data
- membership data
- raw ticket IDs
- Notion page IDs
- Notion tokens
- sync log internals
- raw client tokens

### Safe For Client UI

- `projectName`
- `overallProgress`
- `lastSyncedAt`
- feature summaries
- recent safe activity summaries

---

## API Contract Conventions

Successful responses generally use:

```json
{
  "statusCode": 200,
  "message": "Human-readable message",
  "data": {}
}
```

Important known contract rules:

- invitation and member IDs are non-UUID strings where documented
- most project resource IDs are UUIDs
- `PATCH /api/features/:id` requires at least one of `name` or `order`
- `GET /api/projects/:id/tickets` rejects `featureId` with `unassigned=true`
- sync log `limit` must stay within `1-50`

Always defer to `endpoints.md` for exact request and response details.

---

## Frontend Build Implications

The frontend should map closely to the backend domain:

- `auth`
- `organization`
- `projects`
- `notion`
- `features-management`
- `tickets`
- `progress`
- `sync-logs`
- `client-dashboard`

Recommended flow:

```text
API function -> React Query hook -> feature component
```

State ownership:

- React Query for server state
- Zustand for global UI state only
- local component state for temporary interactions

Current implementation note:

- the repo is still configured with `useMockApi: true`, so the completed auth and organization flows are verified through the shared API layer in mock mode as well as through typecheck and production build validation
- the internal workspace shell now includes a top header that surfaces active organization context, the signed-in user's role and account menu, and a theme toggle backed by the shared token system
- internal scaffold pages use a shared permission helper so role-limited page actions are omitted from the DOM when the current role is not authorized
- the project list now loads through the shared projects API module, supports team-leader-only project creation, shows sync freshness and `lastSyncedAt`, and uses a zero-project empty state that respects RBAC visibility
- the project detail route now loads through the shared projects API module, supports a team-leader-only metadata editor, surfaces readiness and `lastSyncedAt`, and keeps the six-step setup checklist plus next-step guidance visible so the command center stays intentional before later phases land
- the project command center now includes a Notion integration panel that lets team leaders test and save a connection, review connected database details, define status mappings through the shared API layer, and keeps those setup actions hidden from non-team-leader roles
- the project command center now includes a sync panel that supports the documented queued and already-queued responses, shows distinct idle/queued/syncing/completed UI states, keeps `lastSyncedAt` prominent, and restricts manual sync actions to team leaders and business analysts
- the project command center now includes a feature management panel that lists project features through the shared API layer, supports add/rename/reorder/delete flows for team leaders and business analysts, and shows ticket counts plus placeholder progress until ticket assignment is built
- the project command center now includes a ticket review panel that loads through the shared tickets API module, shows mapped status, source status, assignment, assignee, missing state, and sync time, supports feature/status/unassigned/missing filters, prevents invalid `featureId + unassigned=true` combinations in the UI, and restricts inline assignment to team leaders and business analysts
- the project command center now includes progress and sync diagnostics that derive aggregate and per-feature progress from assigned non-missing tickets, show status chips and progress bars, and list recent sync log outcomes through the shared sync API layer with explicit `SUCCESS`, `FAILED`, and `RATE_LIMITED` states
- the project command center now includes a client access panel that loads the safe `clientAccessLink` and `lastViewedAt` fields through the shared client API module, supports copy-link interaction, hides the panel from unauthorized roles, and keeps raw token values out of the UI
- the tickets, progress, and client-access features now follow a split frontend structure where panel files compose feature-local hooks, pure utility helpers, and small presentational subcomponents instead of mixing React Query setup, formatting helpers, and rendering concerns in a single file
- the project-detail Notion, sync, feature-management, tickets, progress, and client-access surfaces now consistently keep TanStack Query orchestration in feature-local hooks while panel files focus on composition, form rendering, and role-aware presentation

---

## Product Principle

DevTrack is not just a project tracker.

Its purpose is to translate raw internal delivery work into a trustworthy client progress narrative:

1. work enters from Notion
2. internal teams organize it into features
3. DevTrack calculates progress
4. clients receive a safe, simplified view

That translation is the heart of the product.
