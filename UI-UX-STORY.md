# DevTrack UI And UX Story

This document describes the intended experience of DevTrack from the user's point of view.

It is a narrative guide for how the product should feel, what each major screen is trying to accomplish, and how the experience turns internal complexity into client-facing clarity.

Visual direction:

- stone-based neutral surfaces
- forest-green brand emphasis
- restrained semantic colors for status and trust

---

## Opening Scene

The product opens on authentication.

This screen is for an internal team member, not a client. It should feel clean, capable, and confidence-building rather than flashy.

After authentication, the product needs to answer one simple question:

Is this person already inside an active organization?

If not, the interface should not feel broken. It should feel directional. The user is in, but not fully set up yet.

The no-organization state should feel like guided onboarding, not a failed dashboard.

---

## The Organization Moment

This is where the product shifts from personal identity to team identity.

### Create An Organization

The first team leader creates the workspace shell.

This screen should feel administrative but important. The product is becoming a shared delivery workspace.

### Accept An Invitation

An invited teammate signs in and sees a pending invitation.

This should feel lightweight and clear. The user should understand:

- which organization invited them
- what role they were given
- what accepting means

Once they accept, the workspace should feel activated. Navigation becomes meaningful and the product starts feeling like a team environment.

---

## The Internal Workspace

The internal UI should feel operational, structured, intentionally dense where it needs to be, and visually grounded by soft stone neutrals with forest-green emphasis.

The user is here to manage delivery, not browse. The navigation should make the product feel reliable and organized.

Route changes should feel responsive and recoverable. Major screens should avoid blank waits, and failures should be contained to the current route with a clear retry path instead of collapsing the whole workspace experience.

Likely core navigation:

- Dashboard
- Projects
- Tickets
- Organization

---

## Project Creation

Project creation should feel different from organization creation.

Organization setup feels administrative.

Project creation feels like the start of actual client work.

When a user creates a project, it should feel like opening a delivery track, not filling in another generic form.

---

## Project Detail As The Command Center

The project detail page is the most important internal screen.

It should feel like the place where the team understands:

- where the project stands
- what setup is still missing
- whether synced data is fresh
- how work is grouped for the client
- whether the dashboard is ready to share

Even when data is sparse, the page should feel intentional rather than empty.

The ideal sequence is:

1. Connect Notion
2. Save status mapping
3. Run first sync
4. Create client-facing features
5. Assign tickets
6. Share client link

That sequence should be obvious in the UI.

---

## Connecting Notion

This is the first technical setup moment.

The UI should reduce anxiety, not increase it. A good interaction supports two clear actions:

- test the connection
- save the connection

Testing matters because it gives the user confidence before they commit anything.

---

## Mapping Statuses

This is one of the most important product moments even if it looks simple.

The user is teaching DevTrack how to interpret their workflow.

The screen should feel explicit and careful. The user is deciding what counts as:

- not started
- in development
- approved
- released

Because this mapping drives progress, the interface should make that consequence clear.

---

## The First Sync

The first sync is the point where the product starts feeling alive.

Before sync, the project is mostly setup.

After sync, the interface can answer real questions:

- are tickets coming in
- how many
- when was the last sync
- is the data trustworthy

The sync interaction should feel stateful. Idle, queued, running, already queued, and complete should all be distinct.

---

## Creating Client-Facing Features

This is where internal work starts becoming a client story.

Notion tickets are raw operational work. Clients should not have to interpret them directly.

The internal team creates features to group that work into meaningful deliverables.

This interface should feel editorial. Naming, grouping, and ordering all matter because they shape the story shown to the client.

---

## Reviewing Tickets

The ticket view is for the internal team, not the client.

It should feel analytical, structured, and efficient. Dense tables are acceptable here as long as they remain readable.

This screen bridges two worlds:

- raw synced work from Notion
- client-facing feature structure in DevTrack

---

## Assigning Tickets To Features

Assignment is where the team translates raw work into client-visible meaning.

Each assignment effectively says:

- this belongs to this feature
- this contributes to this part of the progress story
- this should or should not influence visible progress

The interaction should feel efficient, intentional, and easy to revise.

---

## Watching Progress Emerge

Once features exist and tickets are assigned, the product should start feeling satisfying.

The UI should make progress feel both visible and trustworthy:

- percentages
- progress bars
- status labels
- freshness indicators

That progress should come from one backend-owned source of truth where possible so overview and detail surfaces stay consistent instead of recomputing separate answers in the browser.

A strong internal dashboard helps the team understand:

- which features are active
- which are stalled
- which are complete
- whether sync is fresh
- whether the project is ready to share

---

## Reviewing Sync History

When something looks stale or unexpected, the team checks sync history.

This area should feel diagnostic, not decorative.

A compact list is enough if it clearly communicates:

- success or failure
- tickets added
- tickets updated
- when the sync happened

---

## Generating The Client Link

This moment should feel like publishing.

The user is taking something internal and preparing it for an external audience.

The UI should communicate care here. It is not just a copy-link utility. It is the handoff into the client-facing experience.

---

## The Client Experience

The client should never feel like they are peeking into internal tooling.

Their page should be calmer, simpler, and more presentation-focused than the internal workspace, using the same stone-and-forest-green system with more breathing room and less operational density.

They should see:

- project name
- overall progress
- feature-level progress
- recent safe activity
- `lastSyncedAt`

They should not see:

- internal users
- operational controls
- raw tickets
- org structures
- sync diagnostics
- infrastructure details

The client dashboard should communicate progress, not machinery.

---

## Returning Over Time

The internal team keeps working in a loop:

- sync
- organize
- review
- share

The client returns to the same link and sees the project evolve over time.

That continuity is one of the product's strongest qualities.

---

## Emotional Summary

DevTrack should feel like this:

- for internal users: structured, capable, and operationally clear
- for clients: calm, simple, and high-trust

The core UX promise is straightforward:

Take messy internal delivery work and turn it into a progress story that feels clear and safe to share.
