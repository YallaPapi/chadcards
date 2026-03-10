# MTG Card Redesign — Full Accuracy

## Goal
Redesign the Card component to look like a real M15-frame Magic: The Gathering card, based on pixel measurements from actual Scryfall card images.

## Current vs Target

| Aspect | Current | Target (Real MTG) |
|--------|---------|-------------------|
| Text box BG | Dark overlay, white text | Light colored parchment, dark text |
| Art size | 42% | 41% (keep close) |
| Text box size | Whatever's left (~35%) | 39% guaranteed |
| Frame color | Single gray for all | Per-color: cream/blue/dark/red/green/gold |
| Mana symbols | Brand colors (deep saturated) | Pastel MTG colors from Scryfall SVGs |
| P/T box | Frame color fill | Darker shade + black border |
| Flavor separator | CSS border-top | Centered decorative rule (~50% width) |
| Font scaling | auto-text-size (keep) | Keep auto-text-size, adjust min/max |
| Text color | White/light gray | Dark `#1A1A1A` on parchment |
| Card name color | White | Dark on light frames, white on dark frames (Black cards) |

## Color System

### Frame Colors (per card color)
```
White:     #F4F0CE
Blue:      #0E68AB
Black:     #393135
Red:       #D3482A
Green:     #1B6B3C
Artifact:  #9DA2A6
Gold:      #C9A54A
Colorless: #A8A4A0
```

### Text Box Parchment Colors (per card color)
```
White:     #F5F0D8
Blue:      #D6DEE6
Black:     #B5ADA6
Red:       #D8C8B8
Green:     #C4CCBB
Artifact:  #D0CCC8
Gold:      #D8CCA8
Colorless: #D0CCC8
```

### Mana Symbol Colors (Scryfall SVG exact)
```
W: bg #F8F6D8, icon #0D0F0F
U: bg #C1D7E9, icon #0D0F0F
B: bg #CAC5C0, icon #0D0F0F
R: bg #E49977, icon #0D0F0F
G: bg #A3C095, icon #0D0F0F
C: bg #CAC5C0, icon #0D0F0F
Generic: bg #CAC5C0, icon #0D0F0F
```

### Rarity Colors
```
Common:   #1A1718
Uncommon: #707883
Rare:     #A58E4A
Mythic:   #BF4427
```

### P/T Box (per card color)
```
White:     bg #F0EACC, text #1A1A1A
Blue:      bg #175D9A, text #FFFFFF
Black:     bg #38302E, text #FFFFFF
Red:       bg #C7402A, text #FFFFFF
Green:     bg #1A6838, text #FFFFFF
Artifact:  bg #90979C, text #1A1A1A
Gold:      bg #C5A044, text #1A1A1A
Colorless: bg #90979C, text #1A1A1A
```

## Layout Proportions

Based on average of 5 measured cards:
```
Title bar:   4.5%   (flex: 0 0 auto)
Art box:     41%    (flex: 0 0 41%)
Type line:   4.3%   (flex: 0 0 auto)
Text box:    39%    (flex: 1, at least 35%)
Footer:      4.2%   (flex: 0 0 auto)
Border:      ~3.4%  of width on each side
```

## Typography

All sizes relative to rules text baseline:
- Card name: 1.55x rules text, bold
- Type line: 1.22x rules text, bold
- Rules text: 1.0x (baseline) — controlled by auto-text-size
- Flavor text: 1.0x, italic
- P/T: 1.67x rules text, bold
- Collector/URL: 0.56x rules text

Text color: `#1A1A1A` on all light-parchment backgrounds.
Exception: Black-frame cards use lighter text for name/type (`#E8E8E8`).

## Font Limits for auto-text-size

| Size | Min (px) | Max (px) | Notes |
|------|----------|----------|-------|
| Small (280px) | 4 | 8 | Gallery thumbnail |
| Medium (420px) | 6 | 12 | — |
| Large (504px) | 7 | 14 | Detail view |

## Flavor Text Separator

- Horizontal line, centered, ~50% of text box width
- Color: `#8B8580`
- 1px height
- ~4px vertical padding above and below

## Ability Spacing

- Between abilities: margin-bottom of ~0.5em (half a line)
- Between rules and flavor: separator line (above)

## Text Content Guidelines (for Grok prompt)

Based on real card analysis:
- Average card: 34 words, 198 chars rules text
- Average ability: 13 words, 75 chars
- Max 3 abilities recommended for cards with flavor text
- Text-heavy cards (4+ abilities): no flavor text
- Target ~33 chars per line at standard font

## Files to Change

1. `src/types/card.ts` — Full color system with frame, textbox, mana, PT colors per card color
2. `src/components/Card.css` — Rewrite: parchment backgrounds, dark text, proper proportions, flavor separator
3. `src/components/Card.tsx` — Use new color system, pass CSS variables for per-color theming

## What NOT to Change

- Card dimensions (200x280, 300x420, 360x504) — already correct 5:7
- auto-text-size approach — keep it, just tune the limits
- Card data model / database schema
- API routes
- Page layouts
