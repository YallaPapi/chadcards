# MTG Card Zone & Text Analysis

Research analysis of real Magic: The Gathering card images downloaded from Scryfall.
All measurements taken from official 745x1040 PNG card images.

**Date:** 2026-03-10
**Source:** Scryfall API (cards/named endpoint)
**Method:** Visual inspection + PIL/numpy pixel boundary detection with edge refinement

---

## Card Selection

Five cards chosen to represent different text density levels:

| Card | Set | Colors | Type | Text Density |
|------|-----|--------|------|-------------|
| Questing Beast | ELD | Green | Legendary Creature | Heavy (4 abilities) |
| Lightning Bolt | CLU | Red | Instant | Minimal (1 ability + flavor) |
| Cryptic Command | IMA | Blue | Instant | Medium-heavy (4 modal choices) |
| Tarmogoyf | TSR | Green | Creature | Medium (1 ability + flavor) |
| Omnath, Locus of Creation | ZNR | RGWU | Legendary Creature | Heavy (2 abilities, long text) |

---

## Task 2: Zone Measurements

### Pixel Boundaries (on 745x1040 cards)

All cards share the same 745x1040 pixel dimensions (5:7 aspect ratio).

| Card | Title Bar | Art Box | Type Line | Text Box | Footer | Border (top+bottom) |
|------|-----------|---------|-----------|----------|--------|---------------------|
| Questing Beast | y=42-89 (47px) | y=89-485 (396px) | y=485-530 (45px) | y=530-960 (430px) | y=960-1006 (46px) | ~76px |
| Lightning Bolt | y=30-93 (63px) | y=93-530 (437px) | y=530-578 (48px) | y=578-960 (382px) | y=960-1005 (45px) | ~65px |
| Cryptic Command | y=29-72 (43px) | y=72-530 (458px) | y=530-588 (58px) | y=588-961 (373px) | y=961-1007 (46px) | ~62px |
| Tarmogoyf | y=29-71 (42px) | y=71-487 (416px) | y=487-535 (48px) | y=535-963 (428px) | y=963-1008 (45px) | ~61px |
| Omnath | y=31-69 (38px) | y=69-508 (439px) | y=508-533 (25px) | y=533-966 (433px) | y=966-1006 (40px) | ~65px |

### Zone Percentages of Total Card Height (1040px)

| Card | Title % | Art % | Type % | Text % | Footer % | Border % |
|------|---------|-------|--------|--------|----------|----------|
| Questing Beast | 4.5% | 38.1% | 4.3% | 41.3% | 4.4% | 7.3% |
| Lightning Bolt | 6.1% | 42.0% | 4.6% | 36.7% | 4.3% | 6.3% |
| Cryptic Command | 4.1% | 44.0% | 5.6% | 35.9% | 4.4% | 6.0% |
| Tarmogoyf | 4.0% | 40.0% | 4.6% | 41.2% | 4.3% | 5.9% |
| Omnath | 3.7% | 42.2% | 2.4% | 41.6% | 3.8% | 6.3% |
| **AVERAGE** | **4.5%** | **41.3%** | **4.3%** | **39.3%** | **4.2%** | **6.4%** |

### Key Findings - Zone Layout

- **Art box dominates**: Averages 41.3% of card height (~430px on a 1040px card)
- **Text box is nearly equal to art**: Averages 39.3% (~409px)
- **Title bar is compact**: Averages 4.5% (~47px), just enough for name + mana cost
- **Type line is thin**: Averages 4.3% (~45px), single line for type info + set symbol
- **Footer is minimal**: Averages 4.2% (~44px), collector number + artist credit
- **Borders consume ~6.4%**: Top and bottom combined (~66px)
- **Art + Text = ~80.6% of card**: These two zones are the visual core

---

## Task 3: Summary Table

| Card | Abilities | Words | Chars | Art % | Text % | Title % | Type % | Footer % |
|------|-----------|-------|-------|-------|--------|---------|--------|----------|
| Questing Beast | 4 | 48 | 305 | 38.1% | 41.3% | 4.5% | 4.3% | 4.4% |
| Lightning Bolt | 1 | 8 | 44 | 42.0% | 36.7% | 6.1% | 4.6% | 4.3% |
| Cryptic Command | 5 | 26 | 142 | 44.0% | 35.9% | 4.1% | 5.6% | 4.4% |
| Tarmogoyf | 1 | 25 | 134 | 40.0% | 41.2% | 4.0% | 4.6% | 4.3% |
| Omnath, Locus of Creation | 2 | 63 | 363 | 42.2% | 41.6% | 3.7% | 2.4% | 3.8% |
| **AVERAGE** | **2.6** | **34.0** | **197.6** | **41.3%** | **39.3%** | **4.5%** | **4.3%** | **4.2%** |

### Text Content Statistics

| Card | Oracle Words | Oracle Chars | Flavor Words | Flavor Chars | Total Chars |
|------|-------------|-------------|-------------|-------------|-------------|
| Questing Beast | 48 | 305 | 0 | 0 | 305 |
| Lightning Bolt | 8 | 44 | 29 | 160 | 204 |
| Cryptic Command | 26 | 142 | 0 | 0 | 142 |
| Tarmogoyf | 25 | 134 | 10 | 59 | 193 |
| Omnath, Locus of Creation | 63 | 363 | 0 | 0 | 363 |

---

## Task 4: Real MTG Text Analysis

### Characters Per Printed Line

Measured by reading exact line breaks from the card images:

| Printed Line (from card image) | Char Count | Card |
|-------------------------------|-----------|------|
| "Lightning Bolt deals 3 damage to" | 32 | Lightning Bolt |
| "* Return target permanent to its" | 31 | Cryptic Command |
| "* Tap all creatures your opponents" | 33 | Cryptic Command |
| "Tarmogoyf's power is equal to the" | 33 | Tarmogoyf |
| "number of card types among cards" | 31 | Tarmogoyf |
| "The sparkmage shrieked, calling on" | 33 | Lightning Bolt |
| "To his surprise, the sky responded" | 33 | Lightning Bolt |
| "with a fierce energy he'd never" | 31 | Lightning Bolt |
| "the rage of the storms of his youth." | 35 | Lightning Bolt |
| "Combat damage that would be dealt by" | 36 | Questing Beast |
| "When Omnath, Locus of Creation enters" | 36 | Omnath |
| "in all graveyards and its toughness is" | 38 | Tarmogoyf |
| "to each opponent and each planeswalker" | 38 | Omnath |

**Best estimate for characters per printed line: 31-36 characters** (based on lines that clearly fill the available width and wrap to the next line).

Cards with more text (Questing Beast, Omnath) appear to use a slightly smaller font, fitting up to ~38 characters per line. Cards with less text (Lightning Bolt, Tarmogoyf) use standard sizing at ~31-35 chars per line.

### Words Per Ability Line

| Metric | Value |
|--------|-------|
| Total ability lines analyzed | 13 |
| Average words per ability | 13.1 |
| Average chars per ability | 75.4 |
| Shortest ability | 12 chars ("Choose two --") |
| Longest ability | 295 chars (Omnath's Landfall) |
| Median ability length | ~66 chars |

### Ability Length Distribution

| Char Range | Count | Examples |
|-----------|-------|---------|
| 0-20 | 2 | "Choose two --" (12), "* Draw a card." (14) |
| 21-50 | 4 | "* Counter target spell." (23), "Vigilance, deathtouch, haste" (28), "Lightning Bolt deals 3 damage to any target." (44) |
| 51-100 | 4 | "Questing Beast can't be blocked..." (66), "Combat damage that would be dealt..." (78) |
| 100-150 | 2 | "Whenever Questing Beast deals..." (130), "Tarmogoyf's power is equal..." (134) |
| 150+ | 1 | Omnath's Landfall ability (295) |

### Lines of Text in Text Box

Counted precisely from the card images:

| Card | Rules Lines | Flavor Lines | Ability Gaps | Total Visual Lines | Text Box Height |
|------|------------|-------------|-------------|-------------------|----------------|
| Questing Beast | 8 | 0 | 3 | ~9.5 effective | 430px |
| Lightning Bolt | 2 | 5 | 0 (+separator) | ~7.7 effective | 382px |
| Cryptic Command | 7 | 0 | 0 | 7.0 effective | 373px |
| Tarmogoyf | 4 | 2 | 0 (+separator) | ~6.7 effective | 428px |
| Omnath | 9 | 0 | 1 | ~9.5 effective | 433px |
| **AVERAGE** | **6.0** | **1.4** | -- | **~8.1 effective** | **~409px** |

"Effective" lines account for ability gaps (~0.5 line height each) and rules/flavor separators (~0.7 line height each).

**Maximum lines that fit in a standard text box:**
- At standard font size (~50px line height): **~8 lines** in a ~410px text box
- At smaller font size (~43px line height, used on text-heavy cards): **~9-10 lines**
- Absolute maximum observed: **9.5 effective lines** (Questing Beast, Omnath)

### Rules Text vs Flavor Text Ratio

| Metric | Value |
|--------|-------|
| Cards with flavor text | 2 out of 5 (40%) |
| Total rules text | 988 chars |
| Total flavor text | 219 chars |
| Rules:Flavor ratio | 4.5:1 |

Note: Text-heavy cards (Questing Beast, Omnath, Cryptic Command) have NO flavor text -- there simply isn't room. Flavor text only appears on cards with shorter rules text (Lightning Bolt, Tarmogoyf).

### Font Size Scaling

An important observation: **MTG cards dynamically scale their font size based on text volume.**

| Text Volume | Approximate Line Height | Chars/Line | Example Cards |
|------------|------------------------|-----------|--------------|
| Light (< 100 chars) | ~50-55px | 31-33 | Lightning Bolt, Cryptic Command |
| Medium (100-200 chars) | ~45-50px | 33-35 | Tarmogoyf |
| Heavy (200-400 chars) | ~40-45px | 35-38 | Questing Beast, Omnath |

This is why the text box can accommodate both Lightning Bolt's 2 lines of rules text AND Omnath's 9 lines -- the font shrinks to fit.

---

## Design Implications for ChadCards

### Zone Layout Ratios (recommended)

Based on this analysis, a faithful MTG-style card should use these proportions:

```
Total card height: 100%

Border (top):     ~3%
Title bar:        ~4.5%     (name + mana cost)
Art box:          ~41%      (main illustration)
Type line:        ~4.3%     (creature type + set symbol)
Text box:         ~39%      (rules text + flavor text)
Footer:           ~4.3%     (collector info)
Border (bottom):  ~3.5%
```

### Text Fitting Guidelines

- **Target ~33 chars per line** at standard font size
- **Allow 8 lines maximum** at standard size in the text box
- **Scale font down** for text-heavy cards (4+ abilities or 200+ chars)
- **At smallest readable size**, fit up to 10 lines / 38 chars per line
- **Separate abilities** with ~half-line-height gaps
- **Separate rules from flavor** with a horizontal divider taking ~0.7 line heights
- **Flavor text in italics** uses slightly wider character spacing (~32 chars/line vs 34)

### Text Box Capacity Limits

| Scenario | Max Lines | Max Chars | Example |
|----------|----------|----------|---------|
| Single short ability + long flavor | 2 + 5 = 7 | ~250 total | Lightning Bolt |
| Multiple modal choices | 7 | ~150 rules | Cryptic Command |
| Heavy rules, no flavor | 8-10 | ~350 rules | Questing Beast, Omnath |
| Medium rules + short flavor | 4 + 2 = 6 | ~200 total | Tarmogoyf |

---

## Raw Data

### Oracle Text (exact from Scryfall)

**Questing Beast** (305 chars, 48 words):
> Vigilance, deathtouch, haste
> Questing Beast can't be blocked by creatures with power 2 or less.
> Combat damage that would be dealt by creatures you control can't be prevented.
> Whenever Questing Beast deals combat damage to an opponent, it deals that much damage to target planeswalker that player controls.

**Lightning Bolt** (44 chars, 8 words):
> Lightning Bolt deals 3 damage to any target.

**Cryptic Command** (142 chars, 26 words):
> Choose two --
> * Counter target spell.
> * Return target permanent to its owner's hand.
> * Tap all creatures your opponents control.
> * Draw a card.

**Tarmogoyf** (134 chars, 25 words):
> Tarmogoyf's power is equal to the number of card types among cards in all graveyards and its toughness is equal to that number plus 1.

**Omnath, Locus of Creation** (363 chars, 63 words):
> When Omnath, Locus of Creation enters the battlefield, draw a card.
> Landfall -- Whenever a land enters the battlefield under your control, you gain 4 life if this is the first time this ability has resolved this turn. If it's the second time, add {R}{G}{W}{U}. If it's the third time, Omnath deals 4 damage to each opponent and each planeswalker you don't control.

### Image Sources

All images downloaded from Scryfall (745x1040 PNG format):
- Questing Beast: `cards.scryfall.io/png/front/e/4/e41cf82d-3213-47ce-a015-6e51a8b07e4f.png`
- Lightning Bolt: `cards.scryfall.io/png/front/7/7/77c6fa74-5543-42ac-9ead-0e890b188e99.png`
- Cryptic Command: `cards.scryfall.io/png/front/3/0/30f6fca9-003b-4f6b-9d6e-1e88adda4155.png`
- Tarmogoyf: `cards.scryfall.io/png/front/6/9/69daba76-96e8-4bcc-ab79-2f00189ad8fb.png`
- Omnath: `cards.scryfall.io/png/front/4/e/4e4fb50c-a81f-44d3-93c5-fa9a0b37f617.png`
