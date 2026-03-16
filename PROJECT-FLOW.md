# DevTrack Project Flow

This document describes how DevTrack is intended to work from end to end.

DevTrack has two product surfaces:

1. Internal team UI
2. Client dashboard UI

The internal UI is for authenticated organization members managing projects, syncing, features, tickets, and client access.

The client dashboard is a limited public surface opened through a project-specific magic link.

---

## High-Level Lifecycle

At a high level, the product flow is:

1. A user creates an account.
2. A team leader creates an organization.
3. The team leader invites teammates.
4. A project is created for a client.
5. The project is connected to Notion.
6. The Notion status mapping is saved.
7. Tickets are synced into DevTrack.
8. Client-facing features are created.
9. Tickets are assigned into those features.
10. DevTrack calculates progress.
11. The client share link is retrieved.
12. The client opens the public dashboard.

---

## Internal Team Workflow

### 1. Authentication

Internal users begin by signing up or signing in.

Endpoints:

- `POST /api/auth/sign-up`
- `POST /api/auth/sign-in`
- `GET /api/auth/session`
- `POST /api/auth/sign-out`

Important behavior:

- auth is session-based
- a user can exist before belonging to any organization
- session restore may also restore an active organization when appropriate

### 2. Organization Setup

All protected business data is organization-scoped, so this is the first real setup step after auth.

#### Path A: Create An Organization

Handled by the team leader.

Endpoints:

- `POST /api/org`
- `GET /api/org`

Outcome:

- the organization is created
- the session gains an active organization

#### Path B: Accept An Invitation

Handled by invited teammates.

Endpoints:

- `GET /api/org/invitations/me`
- `POST /api/org/invitations/:id/accept`
- `POST /api/org/invitations/:id/reject`

Important behavior:

- the invited email must match the authenticated user email
- accepting an invitation activates that organization in session state

### 3. Team Management

Handled by the team leader.

Endpoints:

- `POST /api/org/invite`
- `GET /api/org/invitations`
- `POST /api/org/invitations/:id/cancel`
- `GET /api/org/members`
- `PATCH /api/org/members/:id`
- `DELETE /api/org/members/:id`

### 4. Role Boundaries

Roles shape internal access:

- `TEAM_LEADER` handles organization setup, project administration, and Notion setup
- `BUSINESS_ANALYST` helps organize and present work
- `QUALITY_ASSURANCE` has read access to internal project data
- `DEVELOPER` has read access to internal project data

Key permissions:

- project create, update, delete: `TEAM_LEADER`
- Notion connect, test, mapping: `TEAM_LEADER`
- manual sync: `TEAM_LEADER`, `BUSINESS_ANALYST`
- feature create, update, delete: `TEAM_LEADER`, `BUSINESS_ANALYST`
- ticket assignment: `TEAM_LEADER`, `BUSINESS_ANALYST`
- client link retrieval: `TEAM_LEADER`, `BUSINESS_ANALYST`

### 5. Project Creation

Once the organization is active, the team leader creates a project for a client.

Project setup includes:

- project name
- client name
- client email

Endpoints:

- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`

Important behavior:

- projects are organization-scoped
- cross-organization access is rejected
- project creation also creates a `ClientAccess` record

### 6. Notion Connection

Once the project exists, the team leader configures Notion.

#### Test Connection

- `POST /api/projects/:id/notion/test`

#### Save Connection

- `POST /api/projects/:id/notion/connect`

#### List Databases

- `GET /api/projects/:id/notion/databases`

Important behavior:

- Notion tokens are encrypted at rest
- Notion tokens must never be returned to the frontend

### 7. Status Mapping

The team leader maps Notion statuses into DevTrack statuses.

Endpoint:

- `POST /api/projects/:id/notion/mapping`

This mapping directly affects progress calculation.

### 8. Sync

After connection and mapping are ready, DevTrack can import tickets.

Manual sync endpoint:

- `POST /api/projects/:id/notion/sync`

Allowed roles:

- `TEAM_LEADER`
- `BUSINESS_ANALYST`

Important behavior:

- sync jobs upsert tickets
- missing source tickets are marked as missing, not deleted
- successful sync updates `lastSyncedAt`
- every sync creates a sync log

### 9. Feature Creation

Features are the client-facing buckets that make project progress understandable.

Endpoints:

- `GET /api/projects/:projectId/features`
- `POST /api/projects/:projectId/features`
- `PATCH /api/features/:id`
- `DELETE /api/features/:id`

Important behavior:

- features belong to a project
- feature order is stable and backend-managed
- deleting a feature clears related ticket `featureId`

### 10. Ticket Review

Internal users inspect synced tickets within the project.

Endpoint:

- `GET /api/projects/:id/tickets`

Supported filtering:

- by feature
- by status
- unassigned only
- include missing tickets

### 11. Ticket Assignment

Internal users map tickets into client-facing features.

Endpoint:

- `PATCH /api/tickets/:id/feature`

Allowed roles:

- `TEAM_LEADER`
- `BUSINESS_ANALYST`

Important behavior:

- the ticket and feature must belong to the same project
- `{ featureId: null }` unassigns a ticket

### 12. Progress Tracking

Progress is calculated from synced status plus ticket assignment.

Current logic:

- feature progress uses assigned, non-missing tickets
- `APPROVED` and `RELEASED` count as complete
- project progress is the average of feature progress values
- unassigned tickets do not contribute to progress

### 13. Sync History

Internal users can inspect recent sync activity.

Endpoint:

- `GET /api/projects/:id/sync/logs`

### 14. Client Link Retrieval

When the project is ready to share, internal users retrieve the public client link.

Endpoint:

- `GET /api/projects/:id/client-access`

Allowed roles:

- `TEAM_LEADER`
- `BUSINESS_ANALYST`

Safe response fields:

- `projectId`
- `clientAccessLink`
- `lastViewedAt`

---

## Client Workflow

### 1. Receive The Link

The client does not sign up and does not use internal auth.

They receive a share link from the internal team.

### 2. Open The Dashboard

Endpoint:

- `GET /api/client/:token`

Important behavior:

- the token is validated by dedicated middleware
- invalid tokens are rejected
- successful access updates `lastViewedAt`

### 3. View Client-Safe Progress

The client dashboard should show:

- project name
- overall progress
- feature progress
- recent safe activity
- `lastSyncedAt`

It must not show:

- internal users
- raw tickets
- Notion IDs
- sync diagnostics
- org or membership data

### 4. Revisit Over Time

As the internal team continues syncing and organizing work, the same client link reflects the evolving project state.

---

## Recommended Starting Order

1. Create a user account.
2. Sign in.
3. Create an organization.
4. Invite teammates.
5. Accept invitations.
6. Create a project.
7. Test the Notion connection.
8. Save the Notion connection.
9. Save the status mapping.
10. Trigger the first sync.
11. Create client-facing features.
12. Review synced tickets.
13. Assign tickets to features.
14. Review progress.
15. Retrieve the client link.
16. Share the dashboard.

---

## Operating Principle

The core DevTrack rhythm is:

1. sync the raw work
2. organize it into features
3. review calculated progress
4. share that progress outward
