# Feature Management Redesign Todo List

This checklist tracks the permanent redesign of feature management into a split-pane editor so client-facing feature curation stays clear, scalable, and maintainable as projects grow.

Status key:

- `[ ]` not started
- `[~]` in progress
- `[x]` done

Guiding intent:

- keep feature management aligned with `PROJECT-FLOW.md`, `UI-UX-STORY.md`, `CONTEXT.md`, `SKILL.md`, and `ENDPOINTS.md`
- preserve RBAC, organization scoping, and client-safety rules
- redesign the current stacked CRUD list into an editorial workspace that scales better for many features
- keep the experience focused on shaping a client-facing progress story, not just maintaining a database list
- reuse the shared API layer, React Query hooks, and current internal-shell visual language

---

## Phase 1 - Discovery And Framing

- [x] Review the current feature-management panel and identify the scaling pain points in layout, ordering, and action density
- [x] Confirm the stable backend contracts for feature creation, update, reorder, and delete flows
- [x] Confirm how progress and ticket counts should continue to appear in the redesigned workspace
- [x] Confirm RBAC expectations for editable and read-only roles in the new split-pane layout
- [x] Confirm which interactions must remain available on mobile versus desktop

---

## Phase 2 - Information Architecture

- [x] Define the split-pane layout for desktop and the stacked fallback for mobile
- [x] Define the left-pane responsibilities for feature browsing, ordering context, and selection
- [x] Define the right-pane responsibilities for rename, ordering controls, progress context, and delete actions
- [x] Define the empty-editor state when no feature is selected or when no features exist yet
- [x] Define how feature creation fits into the new editor flow without reintroducing list clutter

---

## Phase 3 - State And Hook Refactor

- [x] Extend the feature-management hook with selected-feature state
- [x] Add actions for selecting a feature and preserving selection during list updates where practical
- [x] Keep create, rename, move, and delete mutations centralized in the feature-management hook
- [x] Add any lightweight derived state needed for list status signals such as empty, active, or completed
- [x] Make sure mutation success paths continue to invalidate the right project, feature, ticket, and project-list queries

---

## Phase 4 - Split-Pane UI Implementation

- [x] Refactor the main feature-management panel into a two-pane workspace shell
- [x] Build a compact ordered feature list pane for the left side
- [x] Build a selected-feature detail pane for the right side
- [x] Move rename and destructive controls out of repeated list rows and into the detail pane
- [x] Keep progress, ticket count, and ordering context visible without making the list visually heavy
- [x] Preserve read-only visibility while omitting edit and delete controls from the DOM for unauthorized roles

---

## Phase 5 - Ordering And Scale Support

- [x] Replace or improve the current one-step move controls so reordering scales better with larger feature sets
- [x] Add list density and hierarchy that remain readable when many features exist
- [x] Add feature search or lightweight filtering if the list becomes hard to scan at scale
- [x] Keep the selected feature visually obvious as the user moves through the list
- [x] Ensure the list pane can remain scrollable while the detail pane stays stable on larger screens

---

## Phase 6 - Creation And Delete Safety

- [x] Improve feature creation guidance so names read clearly in the client-facing progress story
- [x] Add stronger instructional copy that encourages deliverable-style naming rather than internal team buckets
- [x] Make delete behavior explicitly warn that related ticket assignments will be cleared
- [x] Ensure delete confirmation is deliberate and hard to trigger accidentally
- [x] Keep first-feature creation approachable when a project has synced tickets but no feature groups yet

---

## Phase 7 - Presentation And UX Polish

- [x] Align the redesigned feature workspace with the existing polished internal-shell look and feel
- [x] Use stronger visual hierarchy between the compact list and the editing pane
- [x] Keep the interface calm and editorial instead of CRUD-heavy
- [x] Make progress, ticket count, and status signals easy to compare at a glance
- [x] Preserve responsive behavior and avoid making the editor feel cramped on smaller screens

---

## Phase 8 - Safety Pass

- [x] Verify feature creation, rename, reorder, and delete controls remain limited to `TEAM_LEADER` and `BUSINESS_ANALYST`
- [x] Verify read-only roles can inspect the workspace without management controls appearing in the DOM
- [x] Verify deleting a feature still respects the documented ticket-unassignment behavior
- [x] Verify no client-route or client-dashboard code paths import internal feature-management editor logic
- [x] Verify Zustand remains unused for server data in this redesign pass
- [x] Verify no sensitive internal-only data is introduced beyond the documented internal feature and ticket context

---

## Phase 9 - Docs Alignment

- [x] Update `TODOLIST.md` if the baseline feature-management wording should reflect the split-pane editor behavior
- [x] Update `CONTEXT.md` with the newly stable feature-management workspace behavior
- [x] Update `AGENTS.md` only if the redesign introduces permanent workflow guardrails worth codifying
- [x] Keep this file updated as the source of truth for the feature-management redesign pass

---

## Phase 10 - Verification

- [x] Verify the redesigned workspace works for projects with zero, few, and many features
- [x] Verify create, rename, reorder, and delete flows still work correctly
- [x] Verify progress and ticket-count context still render correctly
- [x] Verify the selected-feature state behaves predictably when features are created, reordered, or deleted
- [x] Verify mobile and desktop layouts both remain usable
- [x] Verify no-active-org handling still prevents internal data requests cleanly
- [x] Verify typecheck passes
- [x] Verify production build passes
- [x] Run any configured linting or sanity checks available in the environment

---

## Definition Of Done

This pass is done only when:

- feature management has been redesigned into a split-pane editor that scales better than the current stacked-card list
- the workspace still matches the documented product flow, RBAC rules, and project-scoped data model
- feature creation, editing, reordering, and deletion feel intentional and safe
- the implementation remains modular and maintainable
- verification has been run honestly and any remaining gaps are stated clearly

---

## Verification Notes

- [x] `npm.cmd run typecheck` passed
- [x] `npm.cmd run build` passed
- [x] No dedicated lint script is currently configured in `package.json`, so verification relied on typecheck, production build, and code-path review of RBAC plus internal-route boundaries
