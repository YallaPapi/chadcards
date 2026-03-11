import { CardData } from '@/types/card'
import { validateMtgTextStructure } from '@/lib/mtg-text-structure'

const CATEGORY_KEYWORDS: Array<{ category: string; keywords: string[] }> = [
  {
    category: 'internet',
    keywords: [
      'youtuber',
      'youtube',
      'streamer',
      'podcast',
      'podcaster',
      'influencer',
      'content creator',
      'creator',
      'twitch',
      'tiktok',
      'media personality',
      'internet personality',
    ],
  },
  {
    category: 'athlete',
    keywords: [
      'athlete',
      'fighter',
      'mixed martial artist',
      'boxer',
      'ufc',
      'football',
      'soccer',
      'basketball',
      'tennis',
      'champion',
      'goal',
      'nba',
      'nfl',
      'mlb',
    ],
  },
  {
    category: 'entertainer',
    keywords: [
      'rapper',
      'singer',
      'musician',
      'actor',
      'actress',
      'comedian',
      'director',
      'record producer',
      'pop',
      'artist',
      'fashion designer',
      'socialite',
    ],
  },
  {
    category: 'tech',
    keywords: [
      'founder',
      'co-founder',
      'ceo',
      'technology',
      'tech',
      'software',
      'computer',
      'engineer',
      'electrical engineer',
      'nvidia',
      'tesla',
      'openai',
      'amazon',
      'meta',
      'businessman',
      'entrepreneur',
    ],
  },
  {
    category: 'politician',
    keywords: [
      'politician',
      'president',
      'senator',
      'congress',
      'governor',
      'minister',
      'prime minister',
      'white house',
      'campaign',
      'administration',
    ],
  },
]

const INVALID_RULES_PATTERNS = [
  /\bmemes?\b/i,
  /\binterrupt target spell\b/i,
  /\bskips? a turn\b/i,
  /\bsilence target\b/i,
  /^\s*fame\b/i,
]

function normalizeNullableText(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? ''
  return normalized ? normalized : null
}

function inferAbilityKind(ability: CardData['abilities'][number]): NonNullable<CardData['abilities'][number]['kind']> {
  const rulesText = ability.rules_text.trim()

  if (ability.cost) return 'activated'
  if (/^(when|whenever|at)\b/i.test(rulesText)) return 'triggered'
  if (!ability.name?.trim() && rulesText.length <= 18 && !/[.,]/.test(rulesText)) return 'keyword'
  if (ability.name?.trim()) return 'named'
  return 'static'
}

export function detectCategory(description: string, summary: string): string {
  const text = `${description} ${summary}`.toLowerCase()

  let bestCategory = 'other'
  let bestScore = 0

  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    const score = keywords.reduce((total, keyword) => (
      text.includes(keyword) ? total + 1 : total
    ), 0)

    if (score > bestScore) {
      bestCategory = category
      bestScore = score
    }
  }

  return bestCategory
}

export function hasInvalidRulesText(rulesText: string): boolean {
  const normalized = rulesText.trim()

  if (!normalized) return true

  return INVALID_RULES_PATTERNS.some((pattern) => pattern.test(normalized))
}

export function validateGeneratedCardData(cardData: CardData): CardData {
  if (!cardData.name || !cardData.colors?.length || !cardData.abilities?.length) {
    throw new Error('Generated card data is missing required fields')
  }

  const normalizedCardData: CardData = {
    ...cardData,
    flavor_text: normalizeNullableText(cardData.flavor_text),
    flavor_attribution: normalizeNullableText(cardData.flavor_attribution),
    abilities: cardData.abilities.map((ability) => ({
      ...ability,
      kind: ability.kind ?? inferAbilityKind(ability),
      name: normalizeNullableText(ability.name),
      cost: normalizeNullableText(ability.cost),
      rules_text: ability.rules_text.trim(),
    })),
  }

  if (!normalizedCardData.flavor_text) {
    normalizedCardData.flavor_attribution = null
  }

  for (const ability of normalizedCardData.abilities) {
    if (hasInvalidRulesText(ability.rules_text)) {
      throw new Error(`Generated rules text failed validation: ${ability.rules_text}`)
    }
  }

  validateMtgTextStructure(normalizedCardData)

  return normalizedCardData
}
