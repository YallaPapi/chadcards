# Card Quality Repair Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Repair the live card experience by fixing art delivery, improving category detection, validating generated text, and backfilling the current production cards.

**Architecture:** Route all external art through a same-origin proxy, move classification and content validation into testable utilities, then use the same utilities in both live generation and a one-off repair script for the existing cards. Keep the repair logic server-side and reuse the production generator path instead of creating a second inconsistent rules engine.

**Tech Stack:** Next.js App Router, React 19, Vitest, Prisma + Turso/libsql, Wikipedia API, Grok API

---

### Task 1: Add failing tests for category classification and text validation

**Files:**
- Create: `src/lib/__tests__/card-generation.test.ts`
- Create: `src/lib/card-generation.ts`

**Step 1: Write the failing tests**
- Add category expectations for `MrBeast`, `Jensen Huang`, `Jeff Bezos`, `Conor McGregor`, and `Kanye West`.
- Add rules-text validation expectations that reject phrases like:
  - `Your memes cost {1} less to cast`
  - `Interrupt target spell, gain control of it`
  - `Tap target creature. It skips a turn.`
- Add validation expectations that accept short, coherent card text.

**Step 2: Run the targeted test to verify it fails**

Run: `npm.cmd test -- src/lib/__tests__/card-generation.test.ts`

Expected: FAIL because the utility module and logic do not exist yet.

### Task 2: Implement generation utilities and route integration

**Files:**
- Create: `src/lib/card-generation.ts`
- Modify: `src/app/api/generate/route.ts`
- Modify: `src/lib/grok.ts`

**Step 1: Implement minimal utilities**
- Extract category detection into a reusable function.
- Add rules-text/content validation helpers.
- Add a bounded retry wrapper around card text generation.

**Step 2: Re-run targeted tests**

Run: `npm.cmd test -- src/lib/__tests__/card-generation.test.ts`

Expected: PASS

### Task 3: Add failing test for art proxy behavior

**Files:**
- Create: `src/lib/__tests__/card-art.test.ts`
- Create: `src/lib/card-art.ts`

**Step 1: Write the failing test**
- Verify an external art URL is converted into a same-origin proxy path.
- Verify a local or already-proxied path is preserved.

**Step 2: Run the targeted test to verify it fails**

Run: `npm.cmd test -- src/lib/__tests__/card-art.test.ts`

Expected: FAIL because the helper does not exist yet.

### Task 4: Implement the art proxy path

**Files:**
- Create: `src/lib/card-art.ts`
- Create: `src/app/api/card-art/route.ts`
- Modify: `src/components/Card.tsx`

**Step 1: Implement the proxy helper and route**
- Generate proxy URLs for external art sources.
- Fetch remote images server-side and return the binary payload with cache headers.
- Update the card renderer to use the proxy helper instead of hotlinking the raw x.ai URL in the browser.

**Step 2: Re-run the targeted art test**

Run: `npm.cmd test -- src/lib/__tests__/card-art.test.ts`

Expected: PASS

### Task 5: Verify the full app locally

**Files:**
- No new files required

**Step 1: Run the full suite**

Run: `npm.cmd test`

Expected: PASS

**Step 2: Run the build**

Run: `npm.cmd run build`

Expected: PASS

### Task 6: Backfill the live cards

**Files:**
- Create: `scripts/repair-cards.ts`

**Step 1: Implement the repair script**
- Load env
- Query existing cards
- Fetch Wikipedia summaries
- Recompute category
- Regenerate validated card text
- Update the existing rows in place

**Step 2: Run the repair script against the current deck**

Run: `npx tsx scripts/repair-cards.ts`

Expected: current production cards are updated in Turso without creating duplicates.

**Step 3: Verify live data**

Run: `curl https://chadcards.vercel.app/api/cards`

Expected: repaired categories and cleaner rules text appear in the returned JSON.

### Task 7: Deploy and smoke test production

**Files:**
- No new files required

**Step 1: Deploy**

Run: `npx vercel --prod --yes`

Expected: production deployment succeeds.

**Step 2: Smoke-test live pages**

Verify:
- gallery shows art
- detail page shows art
- download button still works
- `/api/cards` still returns the repaired deck
