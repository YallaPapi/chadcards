# Card Quality Repair Design

## Goal
Fix the live card experience end-to-end by repairing broken art rendering, improving category detection, tightening generated rules text quality, and backfilling the current production cards so the live site reflects the improved generator.

## Verified Problems
- Card art is broken in the browser because the app requests x.ai images with `crossOrigin="anonymous"` but x.ai does not return permissive CORS headers.
- Category detection is too naive and mislabels multiple seeded cards.
- Generated rules text can still contain non-sensical or non-card-like phrases.
- The current 20 production cards contain bad categories and low-quality text from the older generator behavior.

## Recommended Approach

### 1. Fix art delivery at the app boundary
- Add a same-origin image proxy route that fetches remote card art server-side and re-serves it from the app domain.
- Update the card renderer to use proxied art URLs for external images.
- Keep the PNG download feature using the same rendered DOM so it benefits automatically.

This fixes both visible art rendering and canvas capture without requiring local art rehosting first.

### 2. Move category detection into a dedicated utility and improve heuristics
- Extract category classification into a testable utility.
- Prefer more specific creator/media keywords before broad political/government terms.
- Add explicit vocabulary for internet creators, tech founders, athletes, and entertainers.

This makes the route testable and makes the backfill script reuse the same logic.

### 3. Add rules-text validation with retry
- Add a validator that rejects obviously broken card text patterns.
- Use that validator inside generation with a bounded retry loop instead of trusting the first LLM response.
- Strengthen the prompt with explicit “never write” constraints and concise examples.

This does not make the model perfect, but it removes the worst outputs reliably enough for the current app.

### 4. Backfill existing production cards
- Add a repair script that:
  - loads all current cards from the database
  - fetches current Wikipedia summaries
  - recalculates category with the improved classifier
  - regenerates card text with validation/retry
  - preserves the existing art URL unless art needs a later curated refresh
- Run the repair script against the current production deck.

## Alternatives Considered

### Remove `crossOrigin` and leave hotlinked art as-is
Pros:
- Fastest visual fix

Cons:
- PNG download remains unreliable because the canvas becomes tainted
- Still depends on third-party browser behavior

### Download and permanently store every art asset locally
Pros:
- Strongest long-term control

Cons:
- More invasive storage change
- Not required for this repair pass

## Success Criteria
- Live gallery/detail pages show art instead of black boxes.
- Downloaded PNGs include visible art.
- Known bad category examples are corrected.
- New generation rejects obvious garbage rules text patterns.
- Current production cards are repaired in the database and visible on the live site.
