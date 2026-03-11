import { CardData } from '@/types/card'

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

  const flavor = `${card.flavor_text} ${card.flavor_attribution}`.trim()
  const abilityNames = card.abilities.map((ability) => ability.name).join(' ')
  const rules = card.abilities.map((ability) => ability.rules_text).join(' ')
  const combined = `${card.type_line} ${abilityNames} ${rules} ${flavor}`

  for (const pattern of BORING_PATTERNS) {
    if (pattern.test(combined)) score -= 8
  }

  for (const pattern of SHARP_SIGNALS) {
    if (pattern.test(combined)) score += 4
  }

  for (const ability of card.abilities) {
    if (ability.name.split(/\s+/).length >= 2) score += 1
    if (/[A-Z]/.test(ability.name)) score += 1
    if (ability.rules_text.length >= 28 && ability.rules_text.length <= 85) score += 1
  }

  if (card.flavor_text.length >= 35 && card.flavor_text.length <= 110) score += 3
  if (/[.!?]/.test(card.flavor_text)) score += 1
  if (card.type_line.split(/\s+/).length >= 4) score += 1

  return score
}

export const MIN_TONE_SCORE = 6

export function selectBestCardCandidate(candidates: CardData[]): CardData {
  if (candidates.length === 0) {
    throw new Error('No card candidates to select from')
  }

  return [...candidates].sort((left, right) => scoreCardCandidate(right) - scoreCardCandidate(left))[0]
}
