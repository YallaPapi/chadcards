import { describe, expect, it } from 'vitest'

import type { CardData } from '@/types/card'
import { estimateTextBoxDensity, validateMtgTextStructure } from '@/lib/mtg-text-structure'

function buildCard(overrides: Partial<CardData> = {}): CardData {
  return {
    name: 'Joe Rogan',
    mana_cost: 4,
    colors: ['Red'],
    type_line: 'Legendary Creature - Podcaster',
    abilities: [
      {
        kind: 'triggered',
        name: null,
        cost: null,
        rules_text: 'Whenever you draw your second card each turn, discard a card.',
      },
      {
        kind: 'activated',
        name: null,
        cost: '{2}{R}',
        rules_text: 'Exile the top card of your library. You may play it this turn.',
      },
    ],
    flavor_text: null,
    flavor_attribution: null,
    power: 4,
    toughness: 4,
    rarity: 'mythic',
    art_description: 'Test art',
    ...overrides,
  }
}

describe('MTG text structure', () => {
  it('allows text-heavy creatures to omit flavor text', () => {
    const card = buildCard({
      abilities: [
        {
          kind: 'triggered',
          name: null,
          cost: null,
          rules_text: 'Ward - Discard a card.',
        },
        {
          kind: 'triggered',
          name: null,
          cost: null,
          rules_text: 'Whenever one or more opponents cast their second spell each turn, draw a card.',
        },
        {
          kind: 'activated',
          name: null,
          cost: '{T}',
          rules_text: 'Target player mills three cards. Activate only as a sorcery.',
        },
      ],
      flavor_text: null,
      flavor_attribution: null,
    })

    expect(() => validateMtgTextStructure(card)).not.toThrow()
  })

  it('treats flavor text as separate non-rules text', () => {
    const card = buildCard({
      flavor_text: 'This somehow became group-chat canon.',
      flavor_attribution: 'probably',
    })

    expect(() => validateMtgTextStructure(card)).toThrow(/flavor attribution/i)
  })

  it('does not require a named ability on every rules line', () => {
    const card = buildCard({
      abilities: [
        {
          kind: 'static',
          name: null,
          cost: null,
          rules_text: 'Menace',
        },
        {
          kind: 'triggered',
          name: null,
          cost: null,
          rules_text: 'Whenever an opponent loses life, surveil 1.',
        },
      ],
    })

    expect(() => validateMtgTextStructure(card)).not.toThrow()
  })

  it('rejects overloaded custom-card style text boxes', () => {
    const card = buildCard({
      abilities: [
        {
          kind: 'named',
          name: 'Timeline Poisoning',
          cost: null,
          rules_text: 'Whenever you cast a noncreature spell, each opponent discards a card.',
        },
        {
          kind: 'named',
          name: 'Platform Capture',
          cost: '{1}{R}',
          rules_text: 'Gain control of target artifact or creature until end of turn. Untap it. It gains haste until end of turn.',
        },
        {
          kind: 'named',
          name: 'Clip Farm',
          cost: '{T}',
          rules_text: 'Create a 1/1 red Fan creature token with haste and "Sacrifice this creature: Add {R}."',
        },
      ],
      flavor_text: 'This somehow did numbers with every subgroup of the internet.',
      flavor_attribution: 'A reply guy with a blue check',
    })

    expect(estimateTextBoxDensity(card)).toBeGreaterThan(1)
    expect(() => validateMtgTextStructure(card)).toThrow(/text-heavy cards should omit flavor text/i)
  })
})
