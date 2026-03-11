import { describe, expect, it } from 'vitest'
import {
  detectCategory,
  hasInvalidRulesText,
  validateGeneratedCardData,
} from '../card-generation'

describe('detectCategory', () => {
  it('classifies creator and influencer figures as internet', () => {
    expect(
      detectCategory(
        'American YouTuber and media personality',
        'MrBeast is a YouTuber known for challenge videos and giveaways.'
      )
    ).toBe('internet')
  })

  it('classifies founders and chip executives as tech', () => {
    expect(
      detectCategory(
        'Taiwanese-American businessman and electrical engineer',
        'Jensen Huang is the co-founder and CEO of Nvidia.'
      )
    ).toBe('tech')
  })

  it('classifies athletes ahead of entertainer-style fame terms', () => {
    expect(
      detectCategory(
        'Irish professional mixed martial artist and boxer',
        'Conor McGregor is a UFC fighter and former champion.'
      )
    ).toBe('athlete')
  })

  it('classifies musicians as entertainers instead of politicians', () => {
    expect(
      detectCategory(
        'American rapper and record producer',
        'Kanye West is a musician, fashion designer, and media figure.'
      )
    ).toBe('entertainer')
  })
})

describe('hasInvalidRulesText', () => {
  it('rejects obviously fake or incoherent rules text', () => {
    expect(hasInvalidRulesText('Your memes cost {1} less to cast')).toBe(true)
    expect(hasInvalidRulesText('Interrupt target spell, gain control of it')).toBe(true)
    expect(hasInvalidRulesText('Tap target creature. It skips a turn.')).toBe(true)
    expect(hasInvalidRulesText('Fame — +1/+1 for each Fan token.')).toBe(true)
  })

  it('accepts short card-like rules text', () => {
    expect(hasInvalidRulesText('Create a 1/1 Fan token with haste.')).toBe(false)
    expect(hasInvalidRulesText('Creatures you control get +1/+1.')).toBe(false)
    expect(hasInvalidRulesText('Draw two cards, then discard a card.')).toBe(false)
  })
})

describe('validateGeneratedCardData', () => {
  it('rejects cards containing invalid rules text', () => {
    expect(() =>
      validateGeneratedCardData({
        name: 'Elon Musk',
        mana_cost: 8,
        colors: ['Blue', 'Black'],
        type_line: 'Legendary Creature — Billionaire Innovator',
        abilities: [
          { name: 'Meme Lord', cost: null, rules_text: 'Your memes cost {1} less to cast' },
        ],
        flavor_text: 'Test',
        flavor_attribution: '— Test',
        power: 8,
        toughness: 5,
        rarity: 'mythic',
        art_description: 'Test art',
      })
    ).toThrow(/rules text/i)
  })

  it('accepts cards with clean abilities', () => {
    expect(() =>
      validateGeneratedCardData({
        name: 'Taylor Swift',
        mana_cost: 6,
        colors: ['Red', 'Green'],
        type_line: 'Legendary Creature — Pop Icon Songweaver',
        abilities: [
          { name: 'Fan Army', cost: null, rules_text: 'Creatures you control get +1/+1.' },
        ],
        flavor_text: 'Test',
        flavor_attribution: '— Test',
        power: 6,
        toughness: 6,
        rarity: 'mythic',
        art_description: 'Test art',
      })
    ).not.toThrow()
  })

  it('accepts MTG-style unnamed rules lines and optional flavor omission', () => {
    expect(() =>
      validateGeneratedCardData({
        name: 'Joe Rogan',
        mana_cost: 5,
        colors: ['Red', 'Green'],
        type_line: 'Legendary Creature - Podcaster Brawler',
        abilities: [
          { kind: 'keyword', name: null, cost: null, rules_text: 'Trample' },
          {
            kind: 'triggered',
            name: null,
            cost: null,
            rules_text: 'Whenever you discard a card, create a 1/1 red Fan creature token.',
          },
        ],
        flavor_text: null,
        flavor_attribution: null,
        power: 5,
        toughness: 4,
        rarity: 'mythic',
        art_description: 'Test art',
      })
    ).not.toThrow()
  })

  it('rejects overloaded cards that cram flavor onto dense bespoke text boxes', () => {
    expect(() =>
      validateGeneratedCardData({
        name: 'Elon Musk',
        mana_cost: 8,
        colors: ['Blue', 'Black', 'Red'],
        type_line: 'Legendary Creature - Platform Owner Chaos Executive',
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
        flavor_text: 'The discourse got worse the second he posted.',
        flavor_attribution: 'a verified reply guy',
        power: 8,
        toughness: 5,
        rarity: 'mythic',
        art_description: 'Test art',
      })
    ).toThrow(/text-heavy cards should omit flavor text/i)
  })

  it('normalizes blank flavor fields and inferred rules kinds', () => {
    const validated = validateGeneratedCardData({
      name: 'MrBeast',
      mana_cost: 5,
      colors: ['White', 'Red'],
      type_line: 'Legendary Creature - Giveaway Showrunner',
      abilities: [
        { name: '', cost: null, rules_text: 'Vigilance' },
        { name: '', cost: '{2}{W}', rules_text: 'Create two 1/1 white Fan creature tokens.' },
      ],
      flavor_text: '   ',
      flavor_attribution: '   ',
      power: 5,
      toughness: 5,
      rarity: 'mythic',
      art_description: 'Test art',
    })

    expect(validated.flavor_text).toBeNull()
    expect(validated.flavor_attribution).toBeNull()
    expect(validated.abilities[0].kind).toBe('keyword')
    expect(validated.abilities[0].name).toBeNull()
    expect(validated.abilities[1].kind).toBe('activated')
  })
})
