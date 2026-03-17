# Feature Drag And Drop Todo List

This checklist tracked the drag-and-drop exploration for feature ordering. The final product decision was to prefer explicit reorder controls plus direct position selection over drag-and-drop because that fit the workflow more reliably and felt less fussy in practice.

Status key:

- `[ ]` not started
- `[~]` in progress
- `[x]` done

Outcome:

- drag-and-drop was explored but not kept as the stable UX direction
- the workspace now favors explicit move controls plus a direct "move to position" selector
- fallback ordering is no longer secondary; it is the preferred ordering interaction

---

## Phase 1 - Discovery And Constraints

- [x] Review the current feature ordering behavior and backend contract for `PATCH /api/features/:id`
- [x] Confirm whether drag-and-drop should commit on every hover move or only on drop
- [x] Confirm how the backend expects order updates when many features move during one reorder action
- [x] Confirm acceptable mobile behavior for drag handles and touch interactions
- [x] Confirm accessibility expectations for keyboard users and fallback controls

---

## Phase 2 - Interaction Model

- [x] Define how drag start, hover, drop, and cancel states should look in the feature list
- [x] Define whether the whole feature row or a dedicated drag handle should initiate dragging
- [x] Define how the selected-feature state should behave while dragging
- [x] Define how optimistic reordering should appear before the backend confirms
- [x] Define how reorder failures should recover without confusing the user

---

## Phase 3 - Technical Approach

- [x] Choose the drag-and-drop implementation approach that fits the current stack and maintenance goals
- [x] Keep dependencies minimal and avoid introducing a heavy or brittle solution casually
- [x] Decide where temporary drag state should live so server data remains in React Query rather than Zustand
- [x] Define how to reconcile the dragged local order with the persisted backend order after mutation success
- [x] Preserve the existing move-to-top, move-up, move-down, and move-to-bottom controls as a non-drag fallback

---

## Phase 4 - Hook And Mutation Support

- [x] Extend feature-management state to support temporary reordered list presentation during drag interactions
- [x] Add a reorder action that can translate drag results into backend `order` updates safely
- [x] Minimize unnecessary refetch churn while still keeping the final order trustworthy
- [x] Ensure reorder interactions still invalidate the correct project, feature, ticket, and project-list queries
- [x] Make sure drag-and-drop does not break selection or feature-editor focus state

---

## Phase 5 - UI Implementation

- [x] Add a dedicated drag handle to feature list rows
- [x] Add clear visual states for draggable, dragging, drop-target, and selected rows
- [x] Keep the list readable and stable while items move
- [x] Prevent drag affordances from making the list feel noisy or cluttered
- [x] Keep mobile and narrow-layout behavior usable and predictable

---

## Phase 6 - Accessibility And Fallbacks

- [x] Preserve keyboard-accessible fallback ordering controls in the detail pane
- [ ] Ensure drag handles and reordered rows remain screen-reader understandable as far as the chosen library allows
- [x] Verify focus handling does not become confusing during or after reorder interactions
- [x] Make sure users who cannot or do not want to drag can still manage order effectively
- [x] Avoid making drag the only path to feature ordering

---

## Phase 7 - Safety Pass

- [x] Verify drag-and-drop ordering remains limited to `TEAM_LEADER` and `BUSINESS_ANALYST`
- [x] Verify read-only roles do not receive drag handles or reorder affordances in the DOM
- [x] Verify reordering remains project-scoped and does not affect other data boundaries
- [x] Verify no client-route or client-dashboard code paths import internal drag-and-drop feature-management logic
- [x] Verify Zustand remains unused for server data and reorder persistence

---

## Phase 8 - Docs Alignment

- [x] Update `TODOLIST.md` if the feature-management wording should explicitly mention drag-and-drop ordering
- [x] Update `CONTEXT.md` with the newly stable drag-and-drop ordering behavior once implemented
- [x] Update `AGENTS.md` only if the new ordering workflow introduces permanent guardrails worth documenting
- [x] Keep this file updated as the source of truth for the drag-and-drop pass

---

## Phase 9 - Verification

- [x] Verify drag-and-drop ordering works on realistic feature counts
- [x] Verify reorder persistence stays correct after refresh
- [x] Verify the selected feature remains predictable before and after reordering
- [x] Verify fallback move controls still work
- [x] Verify typecheck passes
- [x] Verify production build passes
- [x] Run any configured linting or sanity checks available in the environment

---

## Decision

- [x] The team decided not to keep drag-and-drop as the stable feature-ordering UX
- [x] The preferred permanent direction is explicit ordering controls plus direct position selection in the detail pane
- [x] No further drag-and-drop implementation work is planned unless product direction changes again

---

## Verification Notes

- [x] Drag-and-drop behavior was removed after evaluation
- [x] Explicit move controls in the detail pane remain available
- [x] A direct "move to position" selector now supports larger jumps cleanly
- [x] `npm.cmd run typecheck` passed
- [x] `npm.cmd run build` passed
- [x] Accessibility relies on the explicit ordering controls rather than a drag interaction
