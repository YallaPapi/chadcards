import type { CardAbility, CardData } from '@/types/card'

const RULES_LINE_WIDTH = 38
const FLAVOR_LINE_WIDTH = 34
const TEXT_BOX_CAPACITY = 10
const MAX_NAMED_LINES = 2
const BANNED_FLAVOR_ATTRIBUTION_PATTERNS = [
  /\bprobably\b/i,
  /\boverheard\b/i,
  /\bsource:\b/i,
]

function estimateRulesLines(ability: CardAbility): number {
  const rules = ability.rules_text.trim()
  const baseLines = Math.max(1, Math.ceil(rules.length / RULES_LINE_WIDTH))
  const nameLines = ability.name?.trim() ? 0.7 : 0
  const costLines = ability.cost ? 0.5 : 0

  if (ability.kind === 'keyword' && !ability.cost && !ability.name && rules.length <= 18) {
    return 1
  }

  return baseLines + nameLines + costLines
}

function estimateFlavorLines(card: Pick<CardData, 'flavor_text' | 'flavor_attribution'>): number {
  if (!card.flavor_text?.trim()) return 0

  const quoteLines = Math.max(1, Math.ceil(card.flavor_text.trim().length / FLAVOR_LINE_WIDTH))
  const attributionLines = card.flavor_attribution?.trim() ? 1 : 0
  return quoteLines + attributionLines
}

export function estimateTextBoxDensity(card: Pick<CardData, 'abilities' | 'flavor_text' | 'flavor_attribution'>): number {
  const rulesLines = card.abilities.reduce((total, ability) => total + estimateRulesLines(ability), 0)
  const flavorLines = estimateFlavorLines(card)
  return (rulesLines + flavorLines) / TEXT_BOX_CAPACITY
}

export function getMtgTextStructureIssues(card: Pick<CardData, 'abilities' | 'flavor_text' | 'flavor_attribution'>): string[] {
  const issues: string[] = []
  const flavorText = card.flavor_text?.trim() ?? ''
  const flavorAttribution = card.flavor_attribution?.trim() ?? ''
  const namedAbilityCount = card.abilities.filter((ability) => ability.name?.trim()).length
  const density = estimateTextBoxDensity(card)

  if (!card.abilities.length) {
    issues.push('Card must have at least one rules entry.')
  }

  if (!flavorText && flavorAttribution) {
    issues.push('Flavor attribution requires flavor text.')
  }

  if (flavorAttribution && BANNED_FLAVOR_ATTRIBUTION_PATTERNS.some((pattern) => pattern.test(flavorAttribution))) {
    issues.push('Flavor attribution uses banned filler and does not read like printed flavor text.')
  }

  if (namedAbilityCount > MAX_NAMED_LINES) {
    issues.push('Too many bespoke named abilities for a single card.')
  }

  if (density > 1 && flavorText) {
    issues.push('Text-heavy cards should omit flavor text.')
  }

  return issues
}

export function validateMtgTextStructure<T extends Pick<CardData, 'abilities' | 'flavor_text' | 'flavor_attribution'>>(card: T): T {
  const issues = getMtgTextStructureIssues(card)

  if (issues.length > 0) {
    throw new Error(issues.join(' '))
  }

  return card
}
