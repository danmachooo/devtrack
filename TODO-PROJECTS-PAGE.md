# Project Detail Page Redesign Todo

This checklist tracks the redesign of `/projects/[id]` so project setup feels more linear, guided, and easier to manage with less scrolling.

Status key:

- `[ ]` not started
- `[~]` in progress
- `[x]` done

Guiding intent:

- keep the page aligned with `PROJECT-FLOW.md`, `UI-UX-STORY.md`, `CONTEXT.md`, `SKILL.md`, and `ENDPOINTS.md`
- preserve the internal command-center value without forcing every workflow into one long scroll
- make setup feel sequential and confidence-building
- keep RBAC, organization scoping, and client-safety rules intact
- reuse existing API modules, React Query hooks, and feature panels where practical

---

## Phase 1 - Discovery And Framing

- [x] Review the current `/projects/[id]` route structure and identify the heaviest scroll and decision points
- [x] Inventory which existing sections are setup tasks versus ongoing operational tools
- [x] Confirm which current panels can be reused inside a more linear flow without widening API contracts
- [x] Confirm RBAC expectations for setup, sync, feature editing, ticket assignment, and client access
- [x] Confirm which data must remain visible on the main page even when setup is condensed

---

## Phase 2 - UX Direction

- [x] Define the target information architecture for the project page
- [x] Decide which setup actions belong in a linear flow versus persistent page sections
- [x] Decide whether the guided flow should use modal, drawer, stepper, tabs, accordion, or hybrid patterns
- [x] Define the primary CTA behavior for continuing the next incomplete step
- [x] Define how users can still reach advanced tools without feeling trapped in the guided flow

Desired outcome:

- setup feels sequential
- the page has fewer full-height sections competing for attention
- operational tools stay accessible after setup

---

## Phase 3 - Interaction Model

- [x] Design a "current step" experience for connect Notion, map statuses, sync, create features, assign tickets, and share link
- [x] Define success transitions between steps so the next action becomes obvious
- [x] Define empty, loading, and error behavior for the guided flow
- [x] Define how read-only roles experience the page without setup controls appearing in the DOM
- [x] Define how completed setup states collapse into lightweight summaries

---

## Phase 4 - Implementation Plan

- [x] Introduce a focused page shell that separates overview, guided setup, and advanced workspace areas
- [x] Build a reusable guided-step container for project setup
- [x] Reuse or adapt existing Notion, sync, feature, ticket, and client-access panels inside the new structure
- [x] Reduce duplicated explanatory content that currently expands page height
- [x] Keep project metadata editing available without disrupting the setup flow

---

## Phase 5 - Safety And Verification

- [x] Verify all role-limited actions remain hidden or gated correctly
- [x] Verify no internal-only data is exposed outside current rules
- [x] Verify the linear flow still respects the documented project sequence
- [x] Verify typecheck passes
- [x] Verify production build passes
- [x] Verify the page still works well when the project is partially configured
- [x] Verify the page still works well when setup is complete and the project is in active use

---

## Phase 6 - Docs Alignment

- [x] Update `TODOLIST.md` if the new project-page behavior changes the original wording materially
- [x] Update `CONTEXT.md` with the newly stable project-page behavior once implemented
- [x] Update `AGENTS.md` only if project-page workflow guardrails need to change

---

## Product Decisions

- [x] Move ticket assignment behind a secondary workspace area so the main page stays focused on setup momentum
- [x] Include first-feature creation in the guided setup flow so the user can complete early setup without hunting through separate sections
- [x] Move progress and sync logs into a lower-priority area during setup so trust signals remain available without dominating the page
- [x] Scope the guided flow around first-share readiness, then let the page behave more like an operational workspace afterward

---

## Verification Notes

- [x] `npm run typecheck` passed
- [x] `npm run build` passed after rerunning outside the sandbox because the initial sandboxed build hit `spawn EPERM`
- [x] RBAC and client-safety behavior were rechecked against the new project-page structure and existing panel guards
- [x] Follow-up polish pass completed for modal animation, tooltip rendering inside modals, compact sync signal placement, Notion step staging, and dedicated tickets-workspace handoff
