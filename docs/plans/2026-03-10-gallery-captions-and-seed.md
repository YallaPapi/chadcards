# Gallery Captions and Launch Seed Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add readable gallery captions above each card thumbnail and then run the existing 20-card launch seed.

**Architecture:** Keep the `Card` component unchanged and make the gallery more scannable by wrapping each thumbnail in a higher-level tile that displays metadata above it. Validate the new gallery behavior with a focused component test, then run the existing operational seed script against the local app server.

**Tech Stack:** Next.js App Router, React 19, Vitest, Testing Library, Prisma, existing `/api/generate` route, existing `scripts/seed.ts`

---

### Task 1: Add a failing gallery metadata test

**Files:**
- Create: `src/components/__tests__/CardGrid.test.tsx`
- Reference: `src/components/CardGrid.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import CardGrid from '../CardGrid'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('../Card', () => ({
  default: ({ card }: { card: { name: string } }) => <div data-testid="card">{card.name}</div>,
}))

test('renders name and metadata above each gallery card', () => {
  render(
    <CardGrid
      cards={[
        {
          id: '1',
          name: 'Taylor Swift',
          mana_cost: 5,
          colors: ['Red'],
          type_line: 'Legendary Creature — Pop Icon',
          abilities: [],
          flavor_text: null,
          flavor_attribution: null,
          power: 4,
          toughness: 4,
          rarity: 'mythic',
          art_url: 'https://example.com/art.png',
          art_description: 'art',
          category: 'entertainer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]}
    />
  )

  expect(screen.getByText('Taylor Swift')).toBeInTheDocument()
  expect(screen.getByText('Entertainer • Legendary Creature — Pop Icon')).toBeInTheDocument()
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/__tests__/CardGrid.test.tsx`

Expected: FAIL because the metadata header does not exist yet.

**Step 3: Commit**

```bash
git add src/components/__tests__/CardGrid.test.tsx
git commit -m "test: cover gallery card captions"
```

### Task 2: Implement the gallery tile header

**Files:**
- Modify: `src/components/CardGrid.tsx`

**Step 1: Write minimal implementation**

```tsx
<button className="...">
  <div className="...">
    <p>{card.name}</p>
    <p>{formatCategory(card.category)} • {card.type_line}</p>
  </div>
  <Card ... />
</button>
```

**Step 2: Run targeted test to verify it passes**

Run: `npm test -- src/components/__tests__/CardGrid.test.tsx`

Expected: PASS

**Step 3: Run the full suite**

Run: `npm test`

Expected: PASS

**Step 4: Commit**

```bash
git add src/components/CardGrid.tsx src/components/__tests__/CardGrid.test.tsx
git commit -m "feat: add readable gallery card captions"
```

### Task 3: Verify production build

**Files:**
- No code changes required

**Step 1: Run the build**

Run: `npm run build`

Expected: PASS

**Step 2: Commit**

No commit if no file changes are introduced here.

### Task 4: Run the 20-card launch seed

**Files:**
- Use existing: `scripts/seed.ts`

**Step 1: Start the local app**

Run in one shell: `npm run dev`

Expected: local app available on `http://localhost:3000`

**Step 2: Run the seed**

Run in another shell: `npm run seed`

Expected:
- Existing names print `SKIP`
- Missing names generate through `/api/generate`
- Script ends with `Seed complete!`

**Step 3: Verify gallery data**

Run: `curl http://localhost:3000/api/cards`

Expected: at least the launch deck names are present in the returned JSON.

**Step 4: Commit**

No commit required unless code changes are made while debugging the seed flow.
