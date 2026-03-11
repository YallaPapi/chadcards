# Brand and Tone Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebrand the visible app to ChadCards and make generated card copy feel more contemporary, ironic, and shareable, then backfill the live deck.

**Architecture:** Move brand strings behind a tiny shared config, move copy-quality logic into deterministic scoring utilities, update Grok prompting to produce stronger candidates, then select the best generated card instead of trusting a single draft. Reuse the same selection logic for both live generation and the repair script.

**Tech Stack:** Next.js App Router, React 19, Vitest, Prisma + Turso/libsql, Grok API

---

### Task 1: Add failing tests for tone scoring and candidate selection

**Files:**
- Create: `src/lib/__tests__/card-tone.test.ts`
- Create: `src/lib/card-tone.ts`

**Step 1: Write the failing tests**
- Assert that a sharp, specific candidate scores higher than a bland generic one.
- Assert that candidates containing `probably` and similar filler are rejected or heavily penalized.
- Assert that `selectBestCardCandidate()` returns the stronger candidate.

**Step 2: Run the targeted test to verify it fails**

Run: `npm.cmd test -- src/lib/__tests__/card-tone.test.ts`

Expected: FAIL because the tone utility does not exist yet.

### Task 2: Implement tone scoring and integrate generation

**Files:**
- Create: `src/lib/card-tone.ts`
- Modify: `src/lib/grok.ts`

**Step 1: Implement minimal utility**
- Add boring/slop patterns
- Add sharpness/specificity reward signals
- Add `scoreCardCandidate()` and `selectBestCardCandidate()`

**Step 2: Update generation**
- Generate multiple candidates
- Validate them
- Select the strongest candidate

**Step 3: Re-run the targeted test**

Run: `npm.cmd test -- src/lib/__tests__/card-tone.test.ts`

Expected: PASS

### Task 3: Apply the visible brand change

**Files:**
- Create: `src/lib/brand.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/Card.tsx`

**Step 1: Centralize brand constants**
- Add brand name, domain, and default metadata strings

**Step 2: Replace visible strings**
- Update navbar/app title/metadata
- Update card footer URL text

### Task 4: Verify the app locally

**Files:**
- No new files required

**Step 1: Run the full suite**

Run: `npm.cmd test`

Expected: PASS

**Step 2: Run the build**

Run: `npm.cmd run build`

Expected: PASS

### Task 5: Backfill the live cards with the new tone

**Files:**
- Modify: `scripts/repair-cards.ts`

**Step 1: Reuse the new selector path**
- Ensure repair uses the same generation path as live requests

**Step 2: Run the repair script**

Run: `npx tsx scripts/repair-cards.ts`

Expected: current live cards update in place with stronger copy and correct branding context.

### Task 6: Deploy and verify production

**Files:**
- No new files required

**Step 1: Deploy**

Run: `npx vercel --prod --yes`

Expected: production deploy succeeds.

**Step 2: Verify**
- homepage shows `ChadCards`
- detail/footer shows `chadcards.com`
- `/api/cards` returns refreshed text for the repaired deck
