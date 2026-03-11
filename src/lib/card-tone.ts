import { CardData } from '@/types/card'
import { estimateTextBoxDensity, getMtgTextStructureIssues } from '@/lib/mtg-text-structure'

const BORING_PATTERNS = [
  /\bprobably\b/i,
  /\bi'?m not just\b/i,
  /\bviral aura\b/i,
  /\bmarket dominance\b/i,
  /\bmedia magnet\b/i,
  /\bpodcast power\b/i,
  /\bbig idea\b/i,
  /\bthe future\b/i,
  /\bbro\b/i,
  /\bhot takes?\b/i,
  /\boverheard\b/i,
  /\bsauna\b/i,
  /\bzero filter\b/i,
  /\bpromo code\b/i,
  /\bflashback\b/i,
  /\bstack\b/i,
  /\bmode\b/i,
  /\bmagnet\b/i,
  /\bepiphany\b/i,
]

const SHARP_SIGNALS = [
  /\bgroup chat\b/i,
  /\btimeline\b/i,
  /\bclip\b/i,
  /\balgorithm\b/i,
  /\breceipts\b/i,
  /\bmain character\b/i,
  /\bside quest\b/i,
  /\bfor the content\b/i,
  /\bfor the clip\b/i,
  /\bdiscourse\b/i,
  /\bposting\b/i,
]

export function scoreCardCandidate(card: CardData): number {
  let score = 0

  const flavorText = card.flavor_text ?? ''
  const flavorAttribution = card.flavor_attribution ?? ''
  const flavor = `${flavorText} ${flavorAttribution}`.trim()
  const abilityNames = card.abilities.map((ability) => ability.name ?? '').join(' ')
  const rules = card.abilities.map((ability) => ability.rules_text).join(' ')
  const combined = `${card.type_line} ${abilityNames} ${rules} ${flavor}`
  const structureIssues = getMtgTextStructureIssues(card)
  const density = estimateTextBoxDensity(card)
  const namedAbilityCount = card.abilities.filter((ability) => ability.name?.trim()).length

  for (const pattern of BORING_PATTERNS) {
    if (pattern.test(combined)) score -= 8
  }

  for (const pattern of SHARP_SIGNALS) {
    if (pattern.test(combined)) score += 4
  }

  for (const ability of card.abilities) {
    const abilityName = ability.name?.trim() ?? ''

    if (abilityName.split(/\s+/).filter(Boolean).length >= 2) score += 1
    if (abilityName && /[A-Z]/.test(abilityName)) score += 1
    if (ability.rules_text.length >= 28 && ability.rules_text.length <= 85) score += 1
    if (!abilityName && ability.kind && ability.kind !== 'named') score += 2
    if (ability.kind === 'keyword' && ability.rules_text.length <= 18) score += 2
  }

  if (flavorText.length >= 35 && flavorText.length <= 110) score += 3
  if (/[.!?]/.test(flavorText)) score += 1
  if (card.type_line.split(/\s+/).length >= 4) score += 1
  if (density <= 1 && !flavorText) score += 2
  if (namedAbilityCount > 2) score -= (namedAbilityCount - 2) * 6
  if (namedAbilityCount === card.abilities.length && namedAbilityCount >= 3) score -= 8
  if (structureIssues.length === 0) score += 3
  if (structureIssues.length > 0) score -= structureIssues.length * 4

  return score
}

export const MIN_TONE_SCORE = 6

export function selectBestCardCandidate(candidates: CardData[]): CardData {
  if (candidates.length === 0) {
    throw new Error('No card candidates to select from')
  }

  return [...candidates].sort((left, right) => scoreCardCandidate(right) - scoreCardCandidate(left))[0]
}
