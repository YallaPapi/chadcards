# Infamous Cards — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web app that generates MTG-style trading cards for celebrities using Grok AI + Wikipedia data.

**Architecture:** Monolithic Next.js 14 (App Router) with API routes for Grok calls, Prisma + SQLite for persistence, html2canvas for PNG export. All AI calls server-side to protect API keys.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma (SQLite), OpenAI SDK (Grok-compatible), Vitest

---

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`, `.env`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`

**Step 1: Initialize project**

```bash
cd /c/Users/asus/Desktop/projects/chadcards
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. This creates the full Next.js scaffold.

**Step 2: Install dependencies**

```bash
npm install openai prisma @prisma/client html2canvas
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- `openai` — Grok API is OpenAI-compatible, use this SDK with custom base_url
- `prisma` + `@prisma/client` — SQLite ORM
- `html2canvas` — Card-to-PNG export
- `vitest` + testing libs — Test runner

**Step 3: Create `.env`**

```
GROK_API_KEY=your-xai-api-key-here
```

**Step 4: Update `.gitignore`**

Ensure `.env` is listed (create-next-app should include it, but verify).

**Step 5: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 6: Add test script to `package.json`**

Add to `"scripts"`: `"test": "vitest run", "test:watch": "vitest"`

**Step 7: Init git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js project with deps"
```

---

### Task 2: Prisma Schema + Database

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`

**Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider sqlite
```

**Step 2: Write schema**

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Card {
  id                 String   @id @default(cuid())
  name               String   @unique
  manaCost           Int
  colors             String   // JSON array: ["Blue","Black"]
  typeLine           String
  abilities          String   // JSON array of {name, cost, rules_text}
  flavorText         String
  flavorAttribution  String
  power              Int
  toughness          Int
  rarity             String   // mythic, rare, uncommon
  artUrl             String   // path in public/cards/ or external URL
  artDescription     String
  category           String   // politician, tech, entertainer, athlete, internet
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

**Step 3: Generate client + migrate**

```bash
npx prisma migrate dev --name init
```

**Step 4: Create `src/lib/db.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema and SQLite database"
```

---

### Task 3: TypeScript Types

**Files:**
- Create: `src/types/card.ts`

**Step 1: Define types**

```typescript
export interface CardAbility {
  name: string
  cost: string | null // "{T}", "{2}{U}", or null for static
  rules_text: string
}

export interface CardData {
  name: string
  mana_cost: number
  colors: string[]
  type_line: string
  abilities: CardAbility[]
  flavor_text: string
  flavor_attribution: string
  power: number
  toughness: number
  rarity: 'mythic' | 'rare' | 'uncommon'
  art_description: string
}

export interface Card extends CardData {
  id: string
  art_url: string
  category: string
  created_at: string
  updated_at: string
}

// Color identity mapping
export const MTG_COLORS = {
  White: { bg: '#F9FAF4', border: '#F0E68C', symbol: 'W' },
  Blue: { bg: '#0E68AB', border: '#0E68AB', symbol: 'U' },
  Black: { bg: '#150B00', border: '#2B1B17', symbol: 'B' },
  Red: { bg: '#D3202A', border: '#D3202A', symbol: 'R' },
  Green: { bg: '#00733E', border: '#00733E', symbol: 'G' },
} as const

export type MtgColor = keyof typeof MTG_COLORS

export function getCardFrameColor(colors: string[]): string {
  if (colors.length === 0) return '#8B8B8B' // colorless
  if (colors.length > 1) return '#C9A94E'   // gold/multi
  return MTG_COLORS[colors[0] as MtgColor]?.border ?? '#8B8B8B'
}
```

**Step 2: Commit**

```bash
git add src/types/card.ts
git commit -m "feat: add card type definitions"
```

---

### Task 4: Wikipedia API Client

**Files:**
- Create: `src/lib/wikipedia.ts`
- Create: `src/lib/__tests__/wikipedia.test.ts`

**Step 1: Write the test**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { getPersonSummary } from '../wikipedia'

describe('getPersonSummary', () => {
  it('returns summary for a valid person', async () => {
    const result = await getPersonSummary('Elon Musk')
    expect(result).toBeDefined()
    expect(result.title).toBeTruthy()
    expect(result.extract).toBeTruthy()
    expect(result.extract.length).toBeGreaterThan(50)
  })

  it('throws for nonexistent person', async () => {
    await expect(getPersonSummary('Xyzzy Nonexistent Person 12345'))
      .rejects.toThrow()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- src/lib/__tests__/wikipedia.test.ts
```

Expected: FAIL — module not found.

**Step 3: Implement**

```typescript
interface WikiSummary {
  title: string
  extract: string
  description?: string
  thumbnail?: { source: string }
}

export async function getPersonSummary(name: string): Promise<WikiSummary> {
  const encoded = encodeURIComponent(name.replace(/ /g, '_'))
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'InfamousCards/1.0 (trading card game)' },
  })

  if (!res.ok) {
    throw new Error(`Wikipedia API error: ${res.status} for "${name}"`)
  }

  const data = await res.json()
  return {
    title: data.title,
    extract: data.extract,
    description: data.description,
    thumbnail: data.thumbnail,
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- src/lib/__tests__/wikipedia.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/wikipedia.ts src/lib/__tests__/wikipedia.test.ts
git commit -m "feat: add Wikipedia API client"
```

---

### Task 5: Grok Text Generation Client

**Files:**
- Create: `src/lib/grok.ts`
- Create: `src/lib/__tests__/grok.test.ts`

**Step 1: Write the test**

```typescript
import { describe, it, expect } from 'vitest'
import { generateCardText } from '../grok'

describe('generateCardText', () => {
  it('generates valid card data from a Wikipedia summary', async () => {
    const result = await generateCardText(
      'Elon Musk',
      'Elon Musk is a businessman known for SpaceX and Tesla.'
    )
    expect(result.name).toBe('Elon Musk')
    expect(result.mana_cost).toBeGreaterThanOrEqual(1)
    expect(result.mana_cost).toBeLessThanOrEqual(10)
    expect(result.colors.length).toBeGreaterThan(0)
    expect(result.abilities.length).toBeGreaterThanOrEqual(2)
    expect(result.power).toBeGreaterThanOrEqual(0)
    expect(result.toughness).toBeGreaterThanOrEqual(0)
    expect(result.rarity).toMatch(/^(mythic|rare|uncommon)$/)
    expect(result.art_description).toBeTruthy()
  }, 30000) // 30s timeout for API call
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- src/lib/__tests__/grok.test.ts
```

**Step 3: Implement `src/lib/grok.ts`**

```typescript
import OpenAI from 'openai'
import { CardData } from '@/types/card'

const client = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1',
})

const CARD_SYSTEM_PROMPT = `You are a satirical trading card game designer creating Magic: The Gathering-style cards for real public figures. You write sharp, funny, but not cruel content.

RULES:
- Abilities must be written in authentic MTG rules-speak (tap symbols, keywords, etc.)
- Each ability name should be a clever reference to something the person is known for
- Flavor text should be either a real quote twisted satirically, or an original satirical quote
- Power/Toughness should reflect real-world influence (Power) and resilience (Toughness) on a 0-10 scale
- Mana cost should reflect how "expensive" or impactful this person is (1-10)
- Color identity should match their personality archetype:
  White: Order, institution, authority (politicians, executives)
  Blue: Intelligence, technology, manipulation (tech founders, scientists)
  Black: Ambition, ruthlessness, self-interest (moguls, controversial figures)
  Red: Chaos, passion, impulse (entertainers, provocateurs)
  Green: Growth, authenticity, nature (athletes, activists)
  Multi-color for people who span categories
- Type should be "Legendary Creature — [Funny Class] [Funny Subclass]"
- Keep it as parody/satire — funny and sharp, never hateful

Return ONLY valid JSON matching this exact schema:
{
  "name": "Full Name",
  "mana_cost": 5,
  "colors": ["Blue", "Black"],
  "type_line": "Legendary Creature — Billionaire Shitposter",
  "abilities": [
    {"name": "Ability Name", "cost": "{T}" or "{2}{U}" or null, "rules_text": "MTG rules text"}
  ],
  "flavor_text": "The satirical quote",
  "flavor_attribution": "— Source",
  "power": 7,
  "toughness": 3,
  "rarity": "mythic",
  "art_description": "2-3 sentence description of card art in fantasy oil painting style"
}`

export async function generateCardText(name: string, summary: string): Promise<CardData> {
  const response = await client.chat.completions.create({
    model: 'grok-3-fast',
    messages: [
      { role: 'system', content: CARD_SYSTEM_PROMPT },
      { role: 'user', content: `Generate a trading card for this person:\n\nName: ${name}\n\nWikipedia summary:\n${summary}` },
    ],
    temperature: 0.9,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from Grok')

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in Grok response')

  const parsed = JSON.parse(jsonMatch[0]) as CardData

  // Validate required fields
  if (!parsed.name || !parsed.colors || !parsed.abilities) {
    throw new Error('Invalid card data from Grok')
  }

  return parsed
}

export async function generateCardArt(artDescription: string): Promise<string> {
  const prompt = `Fantasy trading card portrait in oil painting style with dramatic lighting. MTG card art aesthetic. Rich colors, detailed brushwork. ${artDescription}`

  const response = await client.images.generate({
    model: 'grok-2-image',
    prompt,
    n: 1,
    size: '1024x1024',
  })

  const url = response.data[0]?.url
  if (!url) throw new Error('No image URL from Grok')

  return url
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- src/lib/__tests__/grok.test.ts
```

Expected: PASS (requires valid GROK_API_KEY in .env)

**NOTE:** If `grok-3-fast` doesn't work, try `grok-4-1-fast-reasoning`. If `grok-2-image` doesn't work for image gen, try `grok-imagine-image`. Check the xAI docs at https://docs.x.ai/docs/models for current model names.

**Step 5: Commit**

```bash
git add src/lib/grok.ts src/lib/__tests__/grok.test.ts
git commit -m "feat: add Grok text and image generation client"
```

---

### Task 6: Card Generation API Route

**Files:**
- Create: `src/app/api/generate/route.ts`

**Step 1: Implement the route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPersonSummary } from '@/lib/wikipedia'
import { generateCardText, generateCardArt } from '@/lib/grok'

// Category detection based on Wikipedia description
function detectCategory(description: string, summary: string): string {
  const text = `${description} ${summary}`.toLowerCase()
  if (text.match(/politician|president|senator|congress|governor|minister|political/)) return 'politician'
  if (text.match(/entrepreneur|ceo|founder|technology|software|computer|engineer/)) return 'tech'
  if (text.match(/actor|actress|singer|musician|rapper|entertainer|comedian|director|artist|model/)) return 'entertainer'
  if (text.match(/athlete|player|football|basketball|soccer|tennis|boxer|mma|fighter/)) return 'athlete'
  if (text.match(/youtuber|influencer|streamer|internet|tikto|podcast/)) return 'internet'
  return 'other'
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const trimmedName = name.trim()

    // Check cache
    const existing = await prisma.card.findUnique({ where: { name: trimmedName } })
    if (existing) {
      return NextResponse.json({
        ...existing,
        colors: JSON.parse(existing.colors),
        abilities: JSON.parse(existing.abilities),
      })
    }

    // 1. Fetch Wikipedia data
    const wiki = await getPersonSummary(trimmedName)

    // 2. Generate card text via Grok
    const cardData = await generateCardText(wiki.title, wiki.extract)

    // 3. Generate card art via Grok
    const artUrl = await generateCardArt(cardData.art_description)

    // 4. Detect category
    const category = detectCategory(wiki.description ?? '', wiki.extract)

    // 5. Save to database
    const card = await prisma.card.create({
      data: {
        name: cardData.name,
        manaCost: cardData.mana_cost,
        colors: JSON.stringify(cardData.colors),
        typeLine: cardData.type_line,
        abilities: JSON.stringify(cardData.abilities),
        flavorText: cardData.flavor_text,
        flavorAttribution: cardData.flavor_attribution,
        power: cardData.power,
        toughness: cardData.toughness,
        rarity: cardData.rarity,
        artUrl: artUrl,
        artDescription: cardData.art_description,
        category,
      },
    })

    return NextResponse.json({
      ...card,
      colors: cardData.colors,
      abilities: cardData.abilities,
    })
  } catch (error: any) {
    console.error('Card generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate card' },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/generate/route.ts
git commit -m "feat: add card generation API route"
```

---

### Task 7: Cards Listing API Route

**Files:**
- Create: `src/app/api/cards/route.ts`

**Step 1: Implement**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const color = searchParams.get('color')
  const rarity = searchParams.get('rarity')
  const sort = searchParams.get('sort') || 'createdAt'
  const order = searchParams.get('order') || 'desc'

  const where: any = {}
  if (category) where.category = category
  if (rarity) where.rarity = rarity
  if (color) where.colors = { contains: color }

  const orderBy: any = {}
  if (sort === 'power') orderBy.power = order
  else if (sort === 'toughness') orderBy.toughness = order
  else if (sort === 'manaCost') orderBy.manaCost = order
  else orderBy.createdAt = order

  const cards = await prisma.card.findMany({ where, orderBy })

  return NextResponse.json(
    cards.map((c) => ({
      ...c,
      colors: JSON.parse(c.colors),
      abilities: JSON.parse(c.abilities),
    }))
  )
}
```

**Step 2: Commit**

```bash
git add src/app/api/cards/route.ts
git commit -m "feat: add cards listing API route with filters"
```

---

### Task 8: Card Component (The Big One)

**Files:**
- Create: `src/components/Card.tsx`
- Create: `src/components/Card.css`

This is the visual centerpiece. Must look like a real MTG card.

**Step 1: Create `src/components/Card.tsx`**

```tsx
'use client'

import { Card as CardType, getCardFrameColor, MTG_COLORS, MtgColor } from '@/types/card'
import './Card.css'

interface CardProps {
  card: CardType
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
}

function ManaCost({ cost, colors }: { cost: number; colors: string[] }) {
  const symbols: string[] = []
  const colorCost = Math.min(colors.length, cost)
  const genericCost = cost - colorCost

  if (genericCost > 0) symbols.push(String(genericCost))
  colors.forEach((c) => {
    const sym = MTG_COLORS[c as MtgColor]?.symbol
    if (sym) symbols.push(sym)
  })

  return (
    <div className="mana-cost">
      {symbols.map((s, i) => (
        <span key={i} className={`mana-symbol mana-${s.toLowerCase()}`}>{s}</span>
      ))}
    </div>
  )
}

function AbilityText({ ability }: { ability: { name: string; cost: string | null; rules_text: string } }) {
  return (
    <div className="ability">
      {ability.cost && <span className="ability-cost">{ability.cost}</span>}
      <span className="ability-name">{ability.name}</span>
      <span className="ability-dash"> — </span>
      <span className="ability-rules">{ability.rules_text}</span>
    </div>
  )
}

export default function Card({ card, size = 'medium', onClick }: CardProps) {
  const frameColor = getCardFrameColor(card.colors)
  const isMulti = card.colors.length > 1

  return (
    <div
      className={`mtg-card mtg-card-${size} ${card.rarity === 'mythic' ? 'mythic-glow' : ''}`}
      style={{ '--frame-color': frameColor } as React.CSSProperties}
      onClick={onClick}
    >
      {/* Card border/frame */}
      <div className="card-frame">
        {/* Header: Name + Mana */}
        <div className="card-header">
          <span className="card-name">{card.name}</span>
          <ManaCost cost={card.mana_cost} colors={card.colors} />
        </div>

        {/* Art window */}
        <div className="card-art">
          <img src={card.art_url} alt={card.name} loading="lazy" />
        </div>

        {/* Type line */}
        <div className="card-type">
          <span>{card.type_line}</span>
          <span className="rarity-symbol">{card.rarity === 'mythic' ? '★' : card.rarity === 'rare' ? '◆' : '●'}</span>
        </div>

        {/* Text box */}
        <div className="card-text-box">
          <div className="abilities">
            {card.abilities.map((a, i) => (
              <AbilityText key={i} ability={a} />
            ))}
          </div>
          <div className="flavor-text">
            <p className="flavor-quote">"{card.flavor_text}"</p>
            <p className="flavor-attribution">{card.flavor_attribution}</p>
          </div>
        </div>

        {/* Footer: P/T + URL */}
        <div className="card-footer">
          <span className="card-url">infamouscards.com</span>
          <div className="card-pt">
            <span>{card.power}/{card.toughness}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Create `src/components/Card.css`**

```css
/* MTG Card Styles */
.mtg-card {
  --frame-color: #8B8B8B;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.mtg-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.mtg-card-small { width: 240px; font-size: 10px; }
.mtg-card-medium { width: 320px; font-size: 13px; }
.mtg-card-large { width: 440px; font-size: 16px; }

.card-frame {
  background: #1a1a1a;
  border: 6px solid var(--frame-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
}

/* Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.08), transparent);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.card-name {
  font-weight: 700;
  color: #e8e8e8;
  font-size: 1.15em;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

/* Mana symbols */
.mana-cost {
  display: flex;
  gap: 3px;
}

.mana-symbol {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85em;
  font-weight: 700;
  border: 1px solid rgba(0,0,0,0.4);
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.mana-symbol { background: #CBC2BF; color: #333; } /* generic */
.mana-w { background: #F9FAF4; color: #333; }
.mana-u { background: #0E68AB; color: #fff; }
.mana-b { background: #150B00; color: #ddd; border-color: #555; }
.mana-r { background: #D3202A; color: #fff; }
.mana-g { background: #00733E; color: #fff; }

/* Art */
.card-art {
  margin: 4px 8px;
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 4/3;
  background: #111;
}

.card-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Type line */
.card-type {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.05), transparent);
  border-top: 1px solid rgba(255,255,255,0.1);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  font-size: 0.9em;
  color: #ccc;
}

.rarity-symbol {
  color: var(--frame-color);
  font-size: 1.2em;
}

/* Text box */
.card-text-box {
  padding: 10px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;
  background: rgba(0,0,0,0.2);
}

.ability {
  margin-bottom: 8px;
  line-height: 1.4;
  color: #ddd;
}

.ability-cost {
  font-weight: 700;
  color: #f0c040;
  margin-right: 4px;
}

.ability-name {
  font-weight: 700;
  color: #e8e8e8;
}

.ability-dash {
  color: #888;
}

.ability-rules {
  color: #ccc;
}

.flavor-text {
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 8px;
  margin-top: 8px;
}

.flavor-quote {
  font-style: italic;
  color: #999;
  font-size: 0.9em;
  line-height: 1.4;
  margin: 0 0 2px 0;
}

.flavor-attribution {
  color: #777;
  font-size: 0.85em;
  text-align: right;
  margin: 0;
}

/* Footer */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.card-url {
  font-size: 0.7em;
  color: #555;
  letter-spacing: 0.5px;
}

.card-pt {
  background: var(--frame-color);
  color: #111;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 1.1em;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

/* Mythic glow effect */
.mythic-glow .card-frame {
  box-shadow: 0 0 20px rgba(255, 140, 0, 0.3), 0 4px 15px rgba(0, 0, 0, 0.6);
}

.mythic-glow:hover .card-frame {
  box-shadow: 0 0 30px rgba(255, 140, 0, 0.5), 0 8px 25px rgba(0, 0, 0, 0.5);
}
```

**Step 3: Commit**

```bash
git add src/components/Card.tsx src/components/Card.css
git commit -m "feat: add MTG-style card component with full CSS"
```

---

### Task 9: Root Layout + Dark Theme

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Step 1: Update `src/app/globals.css`**

Replace the default Tailwind content with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --bg-card: #1a1a1a;
  --text-primary: #e8e8e8;
  --text-secondary: #999;
  --accent: #c9a94e;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
}

h1, h2, h3 {
  font-family: 'Cinzel', serif;
}
```

**Step 2: Update `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Infamous Cards — Celebrity Trading Card Game',
  description: 'AI-generated Magic: The Gathering-style trading cards for real public figures.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <nav className="border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <a href="/" className="text-2xl font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#c9a94e' }}>
              INFAMOUS CARDS
            </a>
            <div className="flex gap-6">
              <a href="/" className="text-gray-400 hover:text-white transition-colors">Gallery</a>
              <a href="/generate" className="text-gray-400 hover:text-white transition-colors">Generate</a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: add dark theme layout with Cinzel font"
```

---

### Task 10: Gallery Page (Home)

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/CardGrid.tsx`

**Step 1: Create `src/components/CardGrid.tsx`**

```tsx
'use client'

import { Card as CardType } from '@/types/card'
import Card from './Card'
import { useRouter } from 'next/navigation'

interface CardGridProps {
  cards: CardType[]
}

export default function CardGrid({ cards }: CardGridProps) {
  const router = useRouter()

  if (cards.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-xl">No cards yet.</p>
        <p className="mt-2">
          <a href="/generate" className="text-[#c9a94e] hover:underline">Generate your first card</a>
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          size="medium"
          onClick={() => router.push(`/card/${card.id}`)}
        />
      ))}
    </div>
  )
}
```

**Step 2: Update `src/app/page.tsx`**

```tsx
import CardGrid from '@/components/CardGrid'
import { prisma } from '@/lib/db'

async function getCards(searchParams: { category?: string; color?: string; rarity?: string; sort?: string }) {
  const where: any = {}
  if (searchParams.category) where.category = searchParams.category
  if (searchParams.rarity) where.rarity = searchParams.rarity
  if (searchParams.color) where.colors = { contains: searchParams.color }

  const orderBy: any = {}
  const sort = searchParams.sort || 'createdAt'
  if (sort === 'power') orderBy.power = 'desc'
  else if (sort === 'toughness') orderBy.toughness = 'desc'
  else if (sort === 'manaCost') orderBy.manaCost = 'desc'
  else orderBy.createdAt = 'desc'

  const cards = await prisma.card.findMany({ where, orderBy })
  return cards.map((c) => ({
    ...c,
    colors: JSON.parse(c.colors),
    abilities: JSON.parse(c.abilities),
    created_at: c.createdAt.toISOString(),
    updated_at: c.updatedAt.toISOString(),
  }))
}

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams
  const cards = await getCards(params)

  const categories = ['all', 'politician', 'tech', 'entertainer', 'athlete', 'internet']
  const currentCategory = params.category || 'all'

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#c9a94e' }}>
          The Gallery
        </h1>
        <p className="text-gray-500">AI-generated trading cards for the world's most infamous public figures</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((cat) => (
          <a
            key={cat}
            href={cat === 'all' ? '/' : `/?category=${cat}`}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              currentCategory === cat
                ? 'bg-[#c9a94e] text-black font-semibold'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </a>
        ))}
      </div>

      <CardGrid cards={cards} />

      {/* Disclaimer */}
      <p className="text-center text-gray-600 text-xs mt-16">
        This is a parody. Not affiliated with Wizards of the Coast, Hasbro, or any depicted individual.
        All art is AI-generated. For entertainment purposes only.
      </p>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/page.tsx src/components/CardGrid.tsx
git commit -m "feat: add gallery home page with category filters"
```

---

### Task 11: Card Detail Page

**Files:**
- Create: `src/app/card/[id]/page.tsx`

**Step 1: Implement**

```tsx
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Card from '@/components/Card'

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const dbCard = await prisma.card.findUnique({ where: { id } })
  if (!dbCard) notFound()

  const card = {
    ...dbCard,
    colors: JSON.parse(dbCard.colors),
    abilities: JSON.parse(dbCard.abilities),
    created_at: dbCard.createdAt.toISOString(),
    updated_at: dbCard.updatedAt.toISOString(),
  }

  return (
    <div className="flex flex-col items-center">
      <Card card={card} size="large" />

      <div className="mt-8 flex gap-4">
        <button
          className="px-6 py-3 bg-[#c9a94e] text-black font-semibold rounded-lg hover:bg-[#d4b85a] transition-colors"
          id="download-btn"
        >
          Download as PNG
        </button>
        <a
          href="/"
          className="px-6 py-3 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
        >
          Back to Gallery
        </a>
      </div>

      {/* Card stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 max-w-md w-full">
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-gray-500 text-sm">Category</p>
          <p className="text-lg capitalize">{card.category}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-gray-500 text-sm">Rarity</p>
          <p className="text-lg capitalize">{card.rarity}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-gray-500 text-sm">Power / Toughness</p>
          <p className="text-lg">{card.power} / {card.toughness}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-gray-500 text-sm">Mana Cost</p>
          <p className="text-lg">{card.mana_cost}</p>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/card/
git commit -m "feat: add card detail page"
```

---

### Task 12: Card Generator Page

**Files:**
- Create: `src/app/generate/page.tsx`
- Create: `src/components/GenerateForm.tsx`

**Step 1: Create `src/components/GenerateForm.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Card as CardType } from '@/types/card'
import Card from './Card'
import { useRouter } from 'next/navigation'

export default function GenerateForm() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [card, setCard] = useState<CardType | null>(null)
  const router = useRouter()

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)
    setCard(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate card')
      }

      setCard({
        ...data,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <form onSubmit={handleGenerate} className="w-full max-w-md mb-10">
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter any public figure's name..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a94e] transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-6 py-3 bg-[#c9a94e] text-black font-semibold rounded-lg hover:bg-[#d4b85a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-[#c9a94e] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Summoning card from the void...</p>
          <p className="text-gray-600 text-sm mt-2">This takes ~15 seconds (Wikipedia + AI text + AI art)</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {card && (
        <div className="flex flex-col items-center">
          <Card card={card} size="large" />
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => router.push(`/card/${card.id}`)}
              className="px-6 py-3 bg-[#c9a94e] text-black font-semibold rounded-lg hover:bg-[#d4b85a] transition-colors"
            >
              View Full Card
            </button>
            <button
              onClick={() => { setCard(null); setName('') }}
              className="px-6 py-3 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Create `src/app/generate/page.tsx`**

```tsx
import GenerateForm from '@/components/GenerateForm'

export default function GeneratePage() {
  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#c9a94e' }}>
          Card Generator
        </h1>
        <p className="text-gray-500">Type any public figure's name and we'll generate their card</p>
      </div>
      <GenerateForm />
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/generate/ src/components/GenerateForm.tsx
git commit -m "feat: add card generator page"
```

---

### Task 13: Seed Script (20 Premade Cards)

**Files:**
- Create: `scripts/seed.ts`

**Step 1: Implement**

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const LAUNCH_DECK = [
  { name: 'Donald Trump', category: 'politician' },
  { name: 'Joe Biden', category: 'politician' },
  { name: 'Barack Obama', category: 'politician' },
  { name: 'Alexandria Ocasio-Cortez', category: 'politician' },
  { name: 'Ron DeSantis', category: 'politician' },
  { name: 'Elon Musk', category: 'tech' },
  { name: 'Mark Zuckerberg', category: 'tech' },
  { name: 'Sam Altman', category: 'tech' },
  { name: 'Jeff Bezos', category: 'tech' },
  { name: 'Jensen Huang', category: 'tech' },
  { name: 'Kim Kardashian', category: 'entertainer' },
  { name: 'Kanye West', category: 'entertainer' },
  { name: 'Joe Rogan', category: 'entertainer' },
  { name: 'Jake Paul', category: 'entertainer' },
  { name: 'Taylor Swift', category: 'entertainer' },
  { name: 'Conor McGregor', category: 'athlete' },
  { name: 'LeBron James', category: 'athlete' },
  { name: 'Cristiano Ronaldo', category: 'athlete' },
  { name: 'Andrew Tate', category: 'internet' },
  { name: 'MrBeast', category: 'internet' },
]

async function seed() {
  console.log('Starting seed — generating 20 cards...')
  console.log('This will make 40 API calls (text + image per card).')
  console.log('Estimated time: ~5-10 minutes.\n')

  for (let i = 0; i < LAUNCH_DECK.length; i++) {
    const { name, category } = LAUNCH_DECK[i]

    // Skip if already exists
    const existing = await prisma.card.findUnique({ where: { name } })
    if (existing) {
      console.log(`[${i + 1}/20] SKIP: ${name} (already exists)`)
      continue
    }

    try {
      console.log(`[${i + 1}/20] Generating: ${name}...`)

      // Call our own API route
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const card = await res.json()
      console.log(`  ✓ ${card.name} — ${card.typeLine} (${card.rarity})`)

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 2000))
    } catch (error: any) {
      console.error(`  ✗ FAILED: ${name} — ${error.message}`)
    }
  }

  console.log('\nSeed complete!')
  await prisma.$disconnect()
}

seed()
```

**Step 2: Add seed script to `package.json`**

Add to `"scripts"`: `"seed": "npx tsx scripts/seed.ts"`

**Step 3: Commit**

```bash
git add scripts/seed.ts package.json
git commit -m "feat: add seed script for 20 launch deck cards"
```

---

### Task 14: Manual Smoke Test

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Test the generator**

Open `http://localhost:3000/generate`, type "Elon Musk", click Generate. Verify:
- Wikipedia data is fetched (no errors in console)
- Card appears with stats, art, abilities
- Card is visible in the gallery at `http://localhost:3000`
- Card detail page works at `http://localhost:3000/card/{id}`

**Step 3: If Grok model names are wrong**

Check the error message. The xAI model names may have changed. Visit https://docs.x.ai/docs/models and update `src/lib/grok.ts` with the correct model names.

**Step 4: Run the seed script** (after generator works)

```bash
npm run seed
```

Wait for all 20 cards. Verify gallery shows them all.

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: MVP complete — gallery, generator, 20 premade cards"
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Scaffold project | package.json, configs |
| 2 | Prisma + SQLite | prisma/schema.prisma, src/lib/db.ts |
| 3 | TypeScript types | src/types/card.ts |
| 4 | Wikipedia client | src/lib/wikipedia.ts + test |
| 5 | Grok client | src/lib/grok.ts + test |
| 6 | Generate API route | src/app/api/generate/route.ts |
| 7 | Cards listing API | src/app/api/cards/route.ts |
| 8 | Card component | src/components/Card.tsx + CSS |
| 9 | Layout + theme | src/app/layout.tsx, globals.css |
| 10 | Gallery page | src/app/page.tsx, CardGrid.tsx |
| 11 | Card detail page | src/app/card/[id]/page.tsx |
| 12 | Generator page | src/app/generate/page.tsx, GenerateForm.tsx |
| 13 | Seed script | scripts/seed.ts |
| 14 | Smoke test | Manual verification |
