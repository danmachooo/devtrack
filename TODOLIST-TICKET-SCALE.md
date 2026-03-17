# Ticket Scaling Todo List

This checklist tracks the `/tickets` workspace upgrade so ticket-to-feature mapping stays fast, clear, and reliable even when projects have a large number of synced tickets.

Status key:

- `[ ]` not started
- `[~]` in progress
- `[x]` done

Guiding intent:

- keep the tickets workspace aligned with `PROJECT-FLOW.md`, `UI-UX-STORY.md`, `CONTEXT.md`, `SKILL.md`, and `ENDPOINTS.md`
- preserve RBAC, organization scoping, and client-safety rules
- reuse the shared API layer, React Query hooks, and current internal-shell patterns
- improve mapping throughput without turning the page into a generic spreadsheet
- use the new backend pagination, search, sorting, and bulk-assignment contracts instead of frontend-only workarounds

---

## Phase 1 - Contract Alignment

- [x] Update frontend ticket query types to match the paginated backend contract
- [x] Add types for ticket pagination metadata and server sort state
- [x] Add types for bulk ticket feature assignment request and response payloads
- [x] Update the shared tickets API module to consume paginated ticket responses
- [x] Add shared API support for `PATCH /api/tickets/feature/bulk`
- [x] Confirm the updated frontend types still match the documented single-ticket assignment contract

---

## Phase 2 - Ticket Review Hook Refactor

- [x] Refactor the ticket review hook to consume paginated ticket data instead of a flat array response
- [x] Add query state for `page`, `limit`, `search`, `assignee`, `sortBy`, and `sortOrder`
- [x] Preserve the existing valid filter behavior for `featureId`, `status`, `unassigned`, and `showMissing`
- [x] Keep the invalid `featureId + unassigned=true` combination impossible in the UI
- [x] Add ticket selection state for bulk actions
- [x] Add bulk assign and bulk unassign actions through the new shared API module
- [x] Reset or reconcile selection safely when filters, search, sort, or page changes alter the visible ticket set
- [x] Reduce unnecessary refetch churn after row-level and bulk assignment where practical

---

## Phase 3 - Workspace UX Upgrade

- [x] Add a ticket review summary area that highlights total, unassigned, assigned, and missing counts
- [x] Add a stronger work-remaining message so the page feels like a mapping inbox, not a passive list
- [x] Add search input wired to the backend `search` query param
- [x] Add assignee filter wired to the backend `assignee` query param
- [x] Add sort controls wired to backend `sortBy` and `sortOrder`
- [x] Add page-size control using the backend `limit` query param
- [x] Add pagination controls using the backend pagination metadata
- [x] Keep loading, error, and empty states clear when search or filters produce no results

---

## Phase 4 - Bulk Assignment Flow

- [x] Add per-ticket selection controls for editable roles
- [x] Add a select-all-visible action for the current page of results
- [x] Add a bulk action bar that appears only when one or more tickets are selected
- [x] Add bulk assign to feature interaction
- [x] Add bulk unassign interaction
- [x] Keep row-level assignment available for one-off edits
- [x] Ensure read-only roles can still review tickets while all assignment controls remain omitted from the DOM

---

## Phase 5 - Presentation And Scanability

- [x] Keep the page visually aligned with the current internal-shell polish direction
- [x] Make high-volume review easier to scan without regressing mobile usability
- [x] Tighten ticket row hierarchy so title, status, assignment, and metadata remain readable at scale
- [x] Ensure selection, bulk-action, and pagination states are visually clear
- [x] Keep the project-scoped framing and command-center handoff back to `/projects/[id]`

---

## Phase 6 - Safety Pass

- [x] Verify bulk assignment controls remain limited to `TEAM_LEADER` and `BUSINESS_ANALYST`
- [x] Verify read-only roles do not receive assignment controls in the DOM
- [x] Verify ticket assignment still stays project-scoped in the UI
- [x] Verify no client-route or client-dashboard code paths import this internal workspace logic
- [x] Verify Zustand is still not used for server data in the ticket-scaling pass
- [x] Verify no sensitive fields beyond documented internal ticket data are introduced into the UI

---

## Phase 7 - Docs Alignment

- [x] Update `TODOLIST.md` if the baseline tickets-phase wording should reflect the scalable workspace behavior
- [x] Update `CONTEXT.md` with the newly stable paginated and bulk-assignment ticket workspace behavior
- [x] Update `AGENTS.md` only if new workflow guardrails or ticket-workspace expectations should become permanent
- [x] Keep this file updated as the source of truth for the ticket-scaling pass

---

## Phase 8 - Verification

- [x] Verify ticket review works for projects with multiple pages of results
- [x] Verify search, assignee filtering, sorting, page-size changes, and pagination work together correctly
- [x] Verify single-ticket assignment still works
- [x] Verify bulk assign and bulk unassign work across realistic filtered views
- [x] Verify selection state behaves correctly when the result set changes
- [x] Verify no-active-org handling still prevents internal data requests cleanly
- [x] Verify typecheck passes
- [x] Verify production build passes
- [x] Run any configured linting or sanity checks available in the environment

---

## Definition Of Done

This pass is done only when:

- the `/tickets` workspace supports paginated review, search, assignee filtering, sorting, and bulk feature assignment through the documented backend contracts
- high-volume ticket mapping feels materially faster and clearer than the current row-by-row-only workflow
- RBAC, organization scoping, and client-safety rules remain correct
- the implementation is modular and maintainable
- verification has been run honestly and any remaining gaps are stated clearly

---

## Verification Notes

- [x] `npm.cmd run typecheck` passed
- [x] `npm.cmd run build` passed
- [x] No dedicated lint script is currently configured in `package.json`, so the verification pass relied on typecheck, production build, and code-path review of RBAC and internal-route boundaries
