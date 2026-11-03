<!-- impeccable:direction-contract -->
THESIS: A quiet launchpad that makes the user's destinations the whole new-tab experience; it refuses the generic dashboard chrome and removes the logo/header layer entirely.
OWN-WORLD: Firefox-like graphite or near-white canvas, soft rounded icon squares, centered labels, wide empty space, and one small plus control in the lower-right corner.
STORY: The visitor recognizes the surface instantly, opens a site from its tile, and adds or maintains destinations only when needed.
FIRST VIEWPORT: A centered 8-column field uses a gentle upward optical correction for one or two rows; three or more rows are geometrically centered. The plus action is fixed at bottom-right, matching the reference New Tab affordance.
FORM: Operate / wayfinding field, single-surface launchpad. Staging: existing sites lead; the empty state remains available for the first add action. Seed: inferred from the explicit brief and supplied Firefox reference.

# Design system

## Visual direction

The page follows the supplied Firefox New Tab reference: a pale or graphite canvas, no logo or masthead, soft tile surfaces, generous empty space, and one quiet personalization affordance.

## Tokens

- Type: system UI stack for fast local rendering; compact uppercase labels only for metadata, never as a repeated section grammar.
- Grid: 8 columns at 1280px+, then 6 / 4 / 3 / 2 columns at the required breakpoints.
- Spacing: 4px base, 8px control rhythm, 24px section rhythm, 56px page gutters on wide screens.
- Shape: 14px tile radius, 10px controls, 1px borders; elevation is a soft offset shadow only where needed.
- Color: `#f8f8fb` light page / `#2b2a33` dark page, soft neutral tiles, and system-tinted text. Destructive color appears only inside confirmation UI.

## Components and behavior

- New Tab field: the grid is the primary and nearly sole visible content.
- Site tile: real anchor occupies the content area; action menu is progressive disclosure and never hijacks link behavior.
- Add control: one plus button in the lower-right replaces the visible Add CTA and opens the existing add dialog.
- Menus: native button semantics, explicit `aria-expanded`, Escape/outside close.
- Dialogs: native `<dialog>`, labelled title, inline errors, focus restoration, protected save state.
- Fallback icon: deterministic letter and hue derived locally from the hostname.

## Motion and states

The field stays still; only a restrained tile hover lift remains. Controls have visible hover, active, focus-visible, disabled, loading, error, empty, and success states. No remote or decorative animation.

## Responsive rules

The 8-column desktop grid is explicit and never uses auto-fill. At narrow widths the field reduces to 6 / 4 / 3 / 2 columns, tiles remain uniform, the plus control stays reachable, and the page scrolls vertically without horizontal overflow.
