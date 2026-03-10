# Infamous Cards — Design Document

## Overview
Celebrity MTG-style trading card web app. Two modes: browse premade gallery, or generate a card for any person by name.

## Decisions
- **Stack:** Next.js 14 (App Router) + Tailwind + TypeScript
- **DB:** SQLite via Prisma (cache generated cards, unique on name)
- **AI:** Grok API (xAI) — text call for stats, image call for art
- **Data:** Wikipedia API for person summaries (free, no key)
- **Card rendering:** HTML/CSS component, html2canvas for PNG export
- **Payments:** None (MVP). Small URL watermark on card bottom.
- **Deployment:** Local first, Vercel later
- **Premade cards:** Pre-generated via seed script (20 cards)

## Architecture
Monolithic Next.js app. API routes handle Grok calls server-side.

### Pages
- `/` — Gallery grid of all cards, filterable by category/color/rarity
- `/card/[id]` — Full-size card detail + share button
- `/generate` — Input name, generate card, see result

### API Routes
- `POST /api/generate` — name → Wikipedia → Grok text → Grok image → save to DB → return card
- `GET /api/cards` — list cards with optional filters

### Data Model
Single `Card` table: id, name (unique), mana_cost, colors (JSON), type_line, abilities (JSON), flavor_text, flavor_attribution, power, toughness, rarity, art_url, art_description, category, created_at, updated_at.

### Card Component
Pure HTML/CSS MTG layout. Color-coded borders. Dark theme. Beleren-style font (free alternative). Small site URL at bottom.

### Seed Script
`scripts/seed.ts` — loops through 20 names, calls generate API, saves to DB. Run once during dev.
