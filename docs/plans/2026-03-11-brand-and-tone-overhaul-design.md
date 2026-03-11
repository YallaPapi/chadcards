# Brand and Tone Overhaul Design

## Goal
Rename the visible product branding from "Infamous Cards" to "ChadCards" and overhaul card writing so abilities and flavor text feel contemporary, ironic, hyper-online, and shareable instead of safe, generic satire.

## Current Problems
- Visible branding is inconsistent with the intended product name:
  - App shell still says `Infamous Cards`
  - Card footer still says `infamouscards.com`
- The generator optimizes for valid card-ish text, but not for strong voice.
- Current prompts produce outputs that are mechanically acceptable but tonally flat:
  - generic ability names
  - generic flavor attributions
  - stale “probably” punchlines
  - broad, mom-Facebook satire instead of current internet-native irony

## Recommended Approach

### 1. Full visible brand pass
- Replace `Infamous Cards` with `ChadCards`
- Replace `infamouscards.com` with `chadcards.com`
- Update metadata/title/description to match

### 2. Add a deterministic tone-selection layer
- Keep Grok as the copy generator
- Generate multiple candidate cards per person
- Score candidates locally for:
  - specificity
  - irony
  - contemporary/culturally literate references
  - anti-slop signals
- Reject bland or boomer-ish candidates
- Select the strongest surviving candidate

### 3. Rewrite the prompt around voice, not just validity
- Explicitly require:
  - hyper-online but readable voice
  - irony over boomer jokes
  - references that feel screenshot-worthy
  - person-specific abilities, not generic TCG filler
- Explicitly ban:
  - `probably`
  - `I’m not just...`
  - generic “future/empire/dominance/aura” filler
  - low-specificity ability names
  - stale “bro have you ever...” tone

### 4. Backfill the current production cards
- Regenerate the live 20-card deck with the new prompt + selector
- Keep existing art unless a future pass decides to refresh visuals too

## Why This Approach
- Prompt-only changes are too inconsistent.
- A deterministic scorer gives the generator a taste layer the current app does not have.
- Backfilling is required because the current deck is already on the live site and already reflects the old tone.
