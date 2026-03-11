import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Card as CardType } from '@/types/card'

import Card from '../Card'

vi.mock('auto-text-size', () => ({
  AutoTextSize: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const baseCard: CardType = {
  id: 'card_1',
  name: 'Joe Rogan',
  mana_cost: 5,
  colors: ['Red', 'Green'],
  type_line: 'Legendary Creature - Podcaster Brawler',
  abilities: [
    { kind: 'keyword', name: null, cost: null, rules_text: 'Menace' },
    {
      kind: 'triggered',
      name: null,
      cost: null,
      rules_text: 'Whenever you discard a card, draw a card.',
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
  power: 5,
  toughness: 4,
  rarity: 'mythic',
  art_description: 'Test art',
  art_url: 'https://example.com/test.png',
  category: 'internet',
  created_at: '2026-03-11T00:00:00.000Z',
  updated_at: '2026-03-11T00:00:00.000Z',
}

describe('Card', () => {
  it('renders unnamed MTG-style rules lines without a forced dash or flavor block', () => {
    const { container } = render(<Card card={baseCard} size="medium" />)

    expect(screen.getByText('Menace')).toBeTruthy()
    expect(screen.getByText('Whenever you discard a card, draw a card.')).toBeTruthy()
    expect(screen.getByText('Exile the top card of your library. You may play it this turn.')).toBeTruthy()
    expect(container.querySelector('.ability-dash')).toBeNull()
    expect(container.querySelector('.flavor-separator')).toBeNull()
    expect(container.querySelector('.flavor-text')).toBeNull()
  })

  it('renders named rules lines and flavor as distinct blocks when flavor exists', () => {
    const { container } = render(
      <Card
        card={{
          ...baseCard,
          abilities: [
            {
              kind: 'named',
              name: 'For the Clip',
              cost: '{T}',
              rules_text: 'Draw two cards, then discard a card.',
            },
          ],
          flavor_text: 'This absolutely should have stayed in the group chat.',
          flavor_attribution: 'everyone with a podcast mic',
        }}
        size="medium"
      />
    )

    expect(screen.getByText('For the Clip')).toBeTruthy()
    expect(screen.getByText('Draw two cards, then discard a card.')).toBeTruthy()
    expect(screen.getByText(/This absolutely should have stayed in the group chat/i)).toBeTruthy()
    expect(screen.getByText('everyone with a podcast mic')).toBeTruthy()
    expect(container.querySelector('.ability-dash')).toBeTruthy()
    expect(container.querySelector('.flavor-separator')).toBeTruthy()
  })
})
