import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CardGrid from '../CardGrid'
import type { Card } from '@/types/card'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('../Card', () => ({
  default: ({ card }: { card: Card }) => (
    <div data-testid={`card-${card.id}`}>Card render</div>
  ),
}))

const card: Card = {
  id: 'card-1',
  name: 'Taylor Swift',
  mana_cost: 5,
  colors: ['Red'],
  type_line: 'Legendary Creature — Pop Icon',
  abilities: [],
  flavor_text: 'Test flavor text',
  flavor_attribution: '— Test',
  power: 4,
  toughness: 4,
  rarity: 'mythic',
  art_description: 'Test art',
  art_url: 'https://example.com/art.png',
  category: 'entertainer',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('CardGrid', () => {
  it('renders readable metadata above each gallery card', () => {
    render(<CardGrid cards={[card]} />)

    expect(screen.getByText('Taylor Swift')).toBeTruthy()
    expect(
      screen.getByText('Entertainer • Legendary Creature — Pop Icon')
    ).toBeTruthy()
  })
})
