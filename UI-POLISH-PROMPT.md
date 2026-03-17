## Premium Frontend Design Prompt

Refine the existing DevTrack UI so it feels more cohesive, premium, and intentionally designed, without changing product flow, RBAC behavior, API wiring, or client-safety rules.

This is a polish-and-alignment pass, not a redesign-from-scratch.

### Core Goal

Make the interface feel cleaner, sharper, and more production-ready by improving:

- visual alignment
- title and text wrapping
- Lucide icon usage
- dropdown/select smoothness
- active and selected highlights
- spacing rhythm
- hierarchy and scanability

The result should feel confidently designed, operationally clear, and visually calm.

### Design Direction

Keep the current DevTrack visual identity:

- Stone + Forest Green palette
- customized shadcn/ui foundation
- internal workspace should feel structured, refined, and dense where needed
- client-safe and premium B2B tone
- dark mode must remain supported

Do not make it flashy, playful, or generic. Avoid UI noise. Avoid random decoration. Avoid “AI slop” styling.

### Priority Areas

#### 1. Alignment And Layout Consistency

Fix visual misalignment across:

- page headers
- card headers
- section actions
- filter rows
- pills and badges
- metadata grids
- modal layouts
- form rows
- ticket review cards
- project command-center sections

Spacing should feel deliberate and consistent. Elements that belong together should align clearly.

#### 2. Title Wrapping And Text Stability

Prevent awkward title wrapping wherever possible.

Prioritize stable presentation for:

- page titles
- section titles
- card titles
- setup step titles
- ticket titles when space allows
- filter labels
- important status pills and action labels

Use better width behavior, balancing, truncation, or responsive layout adjustments where appropriate. Titles should not break in ways that make the UI feel loose or unfinished.

#### 3. Lucide Icon Integration

Add Lucide icons where they improve scanability and polish, especially in:

- section headers
- page actions
- empty states
- setup/status areas
- metadata highlights
- tabs or segmented workspace controls
- key buttons where icon support improves meaning

Icons should feel purposeful, not ornamental. Keep sizing and stroke weight consistent with the existing UI language.

#### 4. Smooth Dropdowns And Selects

Improve dropdown/select presentation and feel:

- cleaner trigger alignment
- more polished caret treatment
- smoother open/close feel
- better menu spacing
- clearer hover and selected states
- stronger focus states
- better visual anchoring to the trigger

Dropdowns should feel stable, responsive, and refined rather than abrupt or flat.

#### 5. Highlights And Emphasis

Improve visual emphasis for:

- active tabs
- selected filters
- current setup steps
- active pills
- selected cards or focused controls
- primary actions
- important status states

Active states should feel clearly selected.
Hover states should feel responsive.
Read-only states should feel intentional, not accidentally weak.

### Screens And Components To Prioritize

Start with the areas where polish matters most:

- `/tickets`
- `/projects/[id]`
- `/projects`
- `/organization`
- shared header areas
- shared modal surfaces
- shared select/dropdown treatments
- ticket review cards
- setup rail cards

### Constraints

- Do not change backend contracts.
- Do not change query logic.
- Do not change RBAC behavior.
- Do not change client-safety behavior.
- Do not introduce new frameworks.
- Do not casually replace established shared components unless the improvement is clear and contained.
- Reuse existing patterns where possible.
- Keep changes incremental and maintainable.

### UX Expectations

- Preserve accessibility.
- Preserve keyboard focus clarity.
- Preserve readable contrast.
- Preserve mobile usability.
- Preserve dark mode quality.
- Do not regress responsive behavior.
- Do not regress setup flow clarity.

### Quality Bar

The UI should feel:

- aligned
- deliberate
- polished
- calm
- premium
- easy to scan

It should not feel:

- crowded
- noisy
- inconsistent
- overly animated
- decorative for its own sake
- visually generic

### Deliverables

- Refine spacing, alignment, text wrapping, icon usage, dropdown behavior, and highlight treatments.
- Keep the product architecture and workflows intact.
- Maintain a cohesive visual rhythm across the prioritized screens.
- Verify with typecheck and build.
