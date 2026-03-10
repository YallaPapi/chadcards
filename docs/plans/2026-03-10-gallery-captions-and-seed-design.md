# Gallery Captions and Launch Seed Design

## Goal
Make the gallery scannable without opening each card by adding a readable header above every thumbnail, then run the existing 20-card launch seed so the gallery has enough celebrity cards to browse.

## Context
- The gallery currently renders raw small cards in `src/components/CardGrid.tsx`.
- Small cards intentionally prioritize the card frame over legibility, so names are hard to scan at thumbnail size.
- The 20-card launch deck is already wired in `scripts/seed.ts` and exposed through `npm run seed`.

## Recommended Approach
Wrap each gallery card in a tile with a compact metadata header above the image.

Header content:
- Line 1: card name, prominent and readable
- Line 2: category plus full type line, muted but still legible

This keeps the card art and frame unchanged while making the gallery usable at a glance.

## Alternatives Considered

### 1. Overlay text on top of the card
Pros:
- More compact

Cons:
- Obscures art
- Fights the card design
- Harder to keep readable across frame colors

### 2. Increase gallery card size
Pros:
- Improves card text legibility

Cons:
- Fewer cards per row
- Still slower to scan than a separate label
- Changes the gallery density much more than requested

## UX Details
- The full tile stays clickable, not just the card image.
- The header uses a fixed minimum height so rows align cleanly.
- The secondary line should truncate gracefully instead of wrapping the grid into uneven heights.

## Files In Scope
- `src/components/CardGrid.tsx`
- `src/app/page.tsx` (only if the surrounding layout needs spacing tweaks)
- `src/components/__tests__/CardGrid.test.tsx`

## Out of Scope
- Changing the card renderer itself
- Changing gallery card size
- Reworking the seed script

## Verification
- Add a component test proving the gallery renders readable metadata above cards.
- Run the targeted test, then the full test suite, then a production build.
- Run `npm run seed` with the local app server available so the 20 launch cards are generated or skipped if already present.
