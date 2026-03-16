# AGENTS.md

This document defines how AI coding agents should work in the DevTrack frontend codebase.

The priority is not just shipping UI. It is shipping UI that respects the product model, API contracts, the two-surface architecture, and client-safety rules.

Agents should prefer small, safe, incremental changes over wide refactors.

---

## Product Summary

DevTrack has two distinct UI domains:

1. Internal team UI for authenticated organization members
2. Public client dashboard for token-based client access

Agents must preserve the separation between these domains in code, data exposure, and UX.

---

## Source Of Truth Files

Treat these files as authoritative:

- `CONTEXT.md`
- `PROJECT-FLOW.md`
- `UI-UX-STORY.md`
- `SKILL.md`
- `ENDPOINTS.md`

If these files conflict with assumptions in code, the docs win.

After completing a phase, agents must update:

- `TODOLIST.md` to reflect checklist progress
- `CONTEXT.md` to capture the newly stable frontend behavior
- `AGENTS.md` when agent workflow or guardrails should change because of the completed phase

---

## Core Technical Rules

- use Next.js, TypeScript, Tailwind, shadcn/ui, TanStack Query, Zustand, React Hook Form, Zod, and Axios
- keep API logic in shared API modules
- do not call APIs directly inside components
- use React Query for server state
- use Zustand only for global UI state
- do not store server data in Zustand
- use Tailwind utility classes instead of CSS modules or styled-components
- avoid `any` in application types; prefer explicit domain types, generics, unions, discriminated unions, or `unknown` with narrowing
- keep code modular and reasonably small; split long files before they become difficult to scan or maintain
- prefer simple, clear abstractions over clever or overly dense implementations
- follow current best practices for accessibility, maintainability, and readability

Correct data flow:

```text
API function -> React Query hook -> component
```

---

## RBAC Rules

Frontend visibility must match backend authorization.

| Action | TEAM_LEADER | BUSINESS_ANALYST | QUALITY_ASSURANCE | DEVELOPER |
| --- | :---: | :---: | :---: | :---: |
| Create or manage org | yes | no | no | no |
| Invite or manage members | yes | no | no | no |
| Create, edit, delete projects | yes | no | no | no |
| Notion connect, test, mapping | yes | no | no | no |
| Trigger manual sync | yes | yes | no | no |
| Create, edit, delete features | yes | yes | no | no |
| Assign tickets to features | yes | yes | no | no |
| Get client access link | yes | yes | no | no |
| Read projects, features, tickets, logs | yes | yes | yes | yes |

Rules:

- do not rely on API rejections as the only enforcement
- hide unauthorized actions from the UI
- for read-only roles, omit action controls from the DOM instead of only disabling them

---

## Auth And Organization Rules

- auth is session-based
- restore session with `GET /api/auth/session`
- sign-in and sign-up use React Hook Form with Zod validation
- sign-out uses `POST /api/auth/sign-out`
- internal routes redirect unauthenticated users to `/sign-in`
- handle signed-in but no-active-org state as onboarding, not failure
- allow `/organization` to render for signed-in users who still need to activate an organization
- do not allow internal product flows without an active organization
- do not attempt cross-org requests

Current implemented organization behaviors:

- the organization route handles both onboarding and active organization management
- team leaders can create organizations, invite teammates, review outgoing invitations, update member roles, and remove members
- invited users can review personal invitations and accept or reject them from the organization screen
- organization flows should keep using shared API modules and React Query rather than inline request logic

---

## Client Safety Rules

The client dashboard must never expose:

- internal user data
- org data
- raw ticket IDs
- Notion IDs
- sync log internals
- raw client tokens

Only `clientAccessLink` is safe to display for sharing.

---

## UX Rules

Agents should align implementation with `UI-UX-STORY.md`.

Key expectations:

- auth feels simple and confidence-building
- no-active-org state feels guided, not broken
- project detail feels like a command center
- Notion setup feels careful and explicit
- sync has clear status feedback
- ticket views feel analytical
- client sharing feels intentional
- the client dashboard feels calm, simple, and safe

---

## Styling Rules

- support dark mode
- customize shadcn/ui rather than shipping defaults
- use the project palette direction: `Stone + Forest Green`
- preserve semantic meaning across all styling decisions

Official palette reference:

```text
background:         #F6F4EF
surface:            #FFFCF7
surface-muted:      #EAE4D9
foreground:         #1F2930
foreground-muted:   #667074
border:             #D8D1C4
primary:            #2F6B57
primary-foreground: #F7FBF9
success:            #3F8A57
warning:            #C58A2B
danger:             #B5523B
neutral:            #7A8580
```

---

## Agent Editing Rules

Agents must not:

- break existing pages
- refactor the entire app casually
- introduce new frameworks casually
- use `any` where proper types should exist
- leave a phase or task marked complete without meaningful verification
- mix internal and client component trees
- expose sensitive data in the client dashboard
- render actions for roles that cannot use them

Agents must:

- reuse existing patterns
- match API contracts exactly
- enforce RBAC in the UI
- make safe, incremental changes
- verify work before calling it complete
- be confident that a completed phase is actually functional, not just scaffolded
- use proper types throughout and keep code maintainable
- keep the repo docs aligned with completed phases instead of letting code and docs drift apart

## Verification Rules

Before marking a task or phase complete, agents should verify the work as far as the current environment allows.

Preferred verification includes:

- typechecking
- production build verification
- linting, if configured
- route or feature-level sanity checks
- confirming that changed code paths still align with the documented contracts and RBAC rules

If full verification is not possible, agents must say what was verified, what could not be verified, and what residual risk remains.

Do not claim completion based only on file creation if the result has not been meaningfully checked.

## Definition Of Done

A task or phase is done only when all of the following are true:

- the implementation matches the documented product flow, UX intent, and API contract
- types are explicit and no unnecessary `any` usage was introduced
- the code is reasonably modular, readable, and not unnecessarily long
- relevant verification has been run and passed, or the remaining gap has been clearly stated
- RBAC, client-safety, and organization-scoping rules are still respected
- the result is strong enough that the agent can confidently stand behind calling it complete

---

## Working Sequence

Before implementing a change:

1. Read `PROJECT-FLOW.md` for workflow context.
2. Read `UI-UX-STORY.md` for the intended screen behavior.
3. Read `CONTEXT.md` for domain and permission rules.
4. Read `SKILL.md` for implementation structure.
5. Read `ENDPOINTS.md` for exact request and response contracts.
6. Reuse existing patterns before inventing new ones.
