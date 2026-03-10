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
