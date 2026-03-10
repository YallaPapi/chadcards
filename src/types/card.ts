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

// Full MTG color system — measured from real Scryfall card images (M15 frame)
export type MtgColor = 'White' | 'Blue' | 'Black' | 'Red' | 'Green'

export interface CardColorTheme {
  frame: string       // colored border/frame
  textbox: string     // parchment text box background
  ptBox: string       // power/toughness box background
  ptText: string      // power/toughness text color
  textColor: string   // rules/flavor text color
  nameColor: string   // card name + type line text color
  symbol: string      // mana symbol letter
}

// Per-color themes from real MTG M15 frame measurements
export const MTG_COLOR_THEMES: Record<MtgColor, CardColorTheme> = {
  White: {
    frame: '#F4F0CE',
    textbox: '#F5F0D8',
    ptBox: '#F0EACC',
    ptText: '#1A1A1A',
    textColor: '#1A1A1A',
    nameColor: '#1A1A1A',
    symbol: 'W',
  },
  Blue: {
    frame: '#0E68AB',
    textbox: '#D6DEE6',
    ptBox: '#175D9A',
    ptText: '#FFFFFF',
    textColor: '#1A1A1A',
    nameColor: '#FFFFFF',
    symbol: 'U',
  },
  Black: {
    frame: '#393135',
    textbox: '#B5ADA6',
    ptBox: '#38302E',
    ptText: '#FFFFFF',
    textColor: '#1A1A1A',
    nameColor: '#E8E8E8',
    symbol: 'B',
  },
  Red: {
    frame: '#D3482A',
    textbox: '#D8C8B8',
    ptBox: '#C7402A',
    ptText: '#FFFFFF',
    textColor: '#1A1A1A',
    nameColor: '#FFFFFF',
    symbol: 'R',
  },
  Green: {
    frame: '#1B6B3C',
    textbox: '#C4CCBB',
    ptBox: '#1A6838',
    ptText: '#FFFFFF',
    textColor: '#1A1A1A',
    nameColor: '#FFFFFF',
    symbol: 'G',
  },
}

// Special themes for non-single-color cards
const ARTIFACT_THEME: CardColorTheme = {
  frame: '#9DA2A6',
  textbox: '#D0CCC8',
  ptBox: '#90979C',
  ptText: '#1A1A1A',
  textColor: '#1A1A1A',
  nameColor: '#1A1A1A',
  symbol: '',
}

const GOLD_THEME: CardColorTheme = {
  frame: '#C9A54A',
  textbox: '#D8CCA8',
  ptBox: '#C5A044',
  ptText: '#1A1A1A',
  textColor: '#1A1A1A',
  nameColor: '#1A1A1A',
  symbol: '',
}

const COLORLESS_THEME: CardColorTheme = {
  frame: '#A8A4A0',
  textbox: '#D0CCC8',
  ptBox: '#90979C',
  ptText: '#1A1A1A',
  textColor: '#1A1A1A',
  nameColor: '#1A1A1A',
  symbol: '',
}

// Mana symbol colors — exact from Scryfall SVGs
export const MANA_SYMBOL_COLORS: Record<string, { bg: string; fg: string }> = {
  W: { bg: '#F8F6D8', fg: '#0D0F0F' },
  U: { bg: '#C1D7E9', fg: '#0D0F0F' },
  B: { bg: '#CAC5C0', fg: '#0D0F0F' },
  R: { bg: '#E49977', fg: '#0D0F0F' },
  G: { bg: '#A3C095', fg: '#0D0F0F' },
  C: { bg: '#CAC5C0', fg: '#0D0F0F' },
  generic: { bg: '#CAC5C0', fg: '#0D0F0F' },
}

// Rarity colors — from Keyrune CSS
export const RARITY_COLORS = {
  common: '#1A1718',
  uncommon: '#707883',
  rare: '#A58E4A',
  mythic: '#BF4427',
} as const

// Get the full color theme for a card based on its colors
export function getCardTheme(colors: string[]): CardColorTheme {
  if (colors.length === 0) return COLORLESS_THEME
  if (colors.length > 1) return GOLD_THEME
  return MTG_COLOR_THEMES[colors[0] as MtgColor] ?? ARTIFACT_THEME
}

// Legacy compat — still used by some code
export const MTG_COLORS = {
  White: { bg: '#F8F6D8', border: '#F4F0CE', symbol: 'W' },
  Blue: { bg: '#C1D7E9', border: '#0E68AB', symbol: 'U' },
  Black: { bg: '#CAC5C0', border: '#393135', symbol: 'B' },
  Red: { bg: '#E49977', border: '#D3482A', symbol: 'R' },
  Green: { bg: '#A3C095', border: '#1B6B3C', symbol: 'G' },
} as const

export function getCardFrameColor(colors: string[]): string {
  return getCardTheme(colors).frame
}
