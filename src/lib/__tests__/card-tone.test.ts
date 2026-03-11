import { describe, expect, it } from 'vitest'
import { CardData } from '@/types/card'
import { scoreCardCandidate, selectBestCardCandidate } from '../card-tone'

const blandCandidate: CardData = {
  name: 'Joe Rogan',
  mana_cost: 6,
  colors: ['Red', 'Green'],
  type_line: 'Legendary Creature — Podcaster Meathead',
  abilities: [
    { name: 'Podcast Power', cost: '{T}', rules_text: 'Draw a card.' },
    { name: 'Big Idea', cost: '{2}{R}', rules_text: 'Target creature gets +2/+0 until end of turn.' },
    { name: 'Viral Aura', cost: null, rules_text: 'Creatures you control get +1/+0.' },
  ],
  flavor_text: 'Bro, have you ever thought about the future? — Joe Rogan, probably',
  flavor_attribution: '— Joe Rogan, probably',
  power: 6,
  toughness: 5,
  rarity: 'mythic',
  art_description: 'Test art',
}

const sharpCandidate: CardData = {
  name: 'Joe Rogan',
  mana_cost: 6,
  colors: ['Red', 'Green'],
  type_line: 'Legendary Creature — Podcast Elk Oracle',
  abilities: [
    { name: 'Three-Hour Cold Open', cost: '{T}', rules_text: 'Draw two cards, then discard a card.' },
    { name: 'For the Clip', cost: '{2}{R}', rules_text: 'Create a 1/1 red Audience token with haste.' },
    { name: 'Timeline Discourse', cost: null, rules_text: 'Whenever you discard a card, each opponent loses 1 life.' },
  ],
  flavor_text: 'This absolutely should have stayed in the group chat.',
  flavor_attribution: '— everyone with a podcast mic',
  power: 6,
  toughness: 5,
  rarity: 'mythic',
  art_description: 'Test art',
}

describe('scoreCardCandidate', () => {
  it('scores sharper, more contemporary candidates above bland ones', () => {
    expect(scoreCardCandidate(sharpCandidate)).toBeGreaterThan(scoreCardCandidate(blandCandidate))
  })

  it('heavily penalizes stale filler like probably and viral aura', () => {
    expect(scoreCardCandidate(blandCandidate)).toBeLessThan(0)
  })

  it('penalizes lazy podcast-bro voice and overheard-attribution filler', () => {
    expect(
      scoreCardCandidate({
        ...blandCandidate,
        flavor_text: 'Bro, have you even tried elk meat on a carnivore diet?',
        flavor_attribution: '- Overheard in the sauna',
        abilities: [
          { name: 'DMT Epiphany', cost: '{T}', rules_text: 'Draw a card, then discard a card.' },
          { name: 'Alpha Brain Stack', cost: '{2}{R}', rules_text: 'Joe Rogan gets +2/+2 until end of turn.' },
          { name: 'Fear Factor Flashback', cost: null, rules_text: 'Creatures you control have haste.' },
        ],
      })
    ).toBeLessThan(0)
  })
})

describe('selectBestCardCandidate', () => {
  it('returns the strongest candidate from a list', () => {
    expect(selectBestCardCandidate([blandCandidate, sharpCandidate])).toEqual(sharpCandidate)
  })
})
