import OpenAI from 'openai'

import type { CardData } from '@/types/card'
import { validateGeneratedCardData } from '@/lib/card-generation'
import { MIN_TONE_SCORE, scoreCardCandidate, selectBestCardCandidate } from '@/lib/card-tone'

function getClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: 'https://api.x.ai/v1',
  })
}

const CARD_SYSTEM_PROMPT = `You are a satirical trading card game designer creating collectible cards for real public figures.

Your output should read like a real printed trading card, not a custom-card meme template.

TEXT BOX ANATOMY:
- Build the text box out of 1-3 total rules entries.
- A rules entry can be one of:
  - keyword/static line
  - activated ability
  - triggered ability
  - named ability line, but only when it genuinely adds something
- Do NOT force every rules entry to have a bespoke title.
- Flavor text is optional.
- Flavor text is a separate italic quote/tagline at the bottom of the box. It is never rules text.
- Text-heavy cards should omit flavor text entirely.
- Never use fake attribution filler like "probably", "source:", or "overheard in the group chat".

TONE:
- Contemporary, internet-literate, ironic, sharp, and specific.
- The joke should feel current and shareable, not like a stale Facebook caption.
- Avoid generic "bro", "hot takes", "the future", "viral aura", or other boomer-slop phrasing.
- Be specific to the person.

CARD RULES:
- Use proper trading card game rules-speak.
- NEVER use fake rules vocabulary like "memes", "fame", "interrupt", "silence target", or "skip a turn".
- Use card-like actions such as create, draw, discard, exile, destroy, counter, tap, untap, gain, lose, return, mill, surveil, and get +N/+N.
- Keep each rules_text under 95 characters.
- Mana cost should reflect how impactful the person feels, from 1-10.
- Power/Toughness should reflect influence and resilience, from 0-10.
- Color identity should match the person's archetype.
- Type should be "Legendary Creature - [Class] [Subclass]".
- Keep it sharp, satirical, and non-hateful.

Return ONLY valid JSON matching this exact schema:
{
  "name": "Full Name",
  "mana_cost": 5,
  "colors": ["Blue", "Black"],
  "type_line": "Legendary Creature - Platform Tyrant",
  "abilities": [
    {"kind": "keyword", "name": null, "cost": null, "rules_text": "Menace"},
    {"kind": "triggered", "name": null, "cost": null, "rules_text": "Whenever you draw your second card each turn, each opponent loses 1 life."},
    {"kind": "activated", "name": null, "cost": "{2}{U}", "rules_text": "Draw a card, then discard a card."}
  ],
  "flavor_text": null,
  "flavor_attribution": null,
  "power": 5,
  "toughness": 4,
  "rarity": "mythic",
  "art_description": "2-3 sentence description of fantasy oil painting card art"
}

If the card is light enough for flavor text, use:
- "flavor_text": a separate quote/tagline
- "flavor_attribution": a clean attribution or null

BAD STRUCTURE EXAMPLE:
- Three named abilities plus flavor text on a dense creature.

GOOD STRUCTURE EXAMPLE:
- One keyword line, one triggered ability, one activated ability, and no flavor text.`

function extractJsonObject(content: string): CardData {
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in Grok response')
  }

  return JSON.parse(jsonMatch[0]) as CardData
}

export async function generateCardText(name: string, summary: string): Promise<CardData> {
  const candidates: CardData[] = []
  const client = getClient()

  for (let attempt = 0; attempt < 6; attempt++) {
    const extraGuidance = attempt === 0
      ? ''
      : '\n\nPrevious output failed validation or felt structurally wrong. Use fewer named abilities, omit flavor on dense cards, and make the copy more specific.'

    const response = await client.chat.completions.create({
      model: 'grok-3',
      messages: [
        { role: 'system', content: CARD_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Generate a collectible card for this person.\n\nName: ${name}\n\nWikipedia summary:\n${summary}${extraGuidance}`,
        },
      ],
      temperature: 1,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from Grok')
    }

    try {
      const parsed = extractJsonObject(content)
      const validated = validateGeneratedCardData(parsed)

      if (scoreCardCandidate(validated) >= MIN_TONE_SCORE) {
        candidates.push(validated)
      }
    } catch (error) {
      if (attempt === 5 && candidates.length === 0) {
        throw error
      }
    }
  }

  if (candidates.length === 0) {
    throw new Error('Failed to generate valid card data from Grok')
  }

  return selectBestCardCandidate(candidates)
}

export async function generateCardArt(artDescription: string): Promise<string> {
  const client = getClient()
  const prompt = `Fantasy trading card portrait in oil painting style with dramatic lighting. Renaissance master painting aesthetic. Rich colors, detailed brushwork. Do NOT include any text, watermarks, or logos in the image. ${artDescription}`

  const response = await client.images.generate({
    model: 'grok-imagine-image',
    prompt,
    n: 1,
  })

  const url = response.data?.[0]?.url
  if (!url) {
    throw new Error('No image URL from Grok')
  }

  return url
}

const EVENT_SYSTEM_PROMPT = `You are a satirical trading card game designer creating collectible cards for current news events.

Build event cards with 1-2 rules entries total. Keep the text box structurally clean.
- Use "Instant", "Sorcery", or "Enchantment" as the type.
- Rules text should describe the event's impact in card-like language.
- Flavor text is optional and should be omitted on dense cards.
- No fake attribution filler.

Return ONLY valid JSON matching this exact schema:
{
  "name": "Event Name",
  "mana_cost": 5,
  "colors": ["Red", "Black"],
  "type_line": "Sorcery",
  "abilities": [
    {"kind": "static", "name": null, "cost": null, "rules_text": "Each opponent sacrifices a creature."}
  ],
  "flavor_text": null,
  "flavor_attribution": null,
  "power": 0,
  "toughness": 0,
  "rarity": "mythic",
  "art_description": "2-3 sentence description of dramatic fantasy oil painting card art"
}`

export async function generateEventCard(eventDescription: string): Promise<CardData> {
  const client = getClient()
  const response = await client.chat.completions.create({
    model: 'grok-3',
    messages: [
      { role: 'system', content: EVENT_SYSTEM_PROMPT },
      { role: 'user', content: `Generate a trading card for this current event:\n\n${eventDescription}` },
    ],
    temperature: 0.9,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from Grok')
  }

  const parsed = validateGeneratedCardData(extractJsonObject(content))
  parsed.power = 0
  parsed.toughness = 0

  return parsed
}

export async function getTrendingEvents(): Promise<string[]> {
  const client = getClient()
  const response = await client.chat.completions.create({
    model: 'grok-3',
    messages: [
      {
        role: 'system',
        content: 'You are a news analyst. Return ONLY a JSON array of 10 current major news events happening right now. Each should be a short description (1-2 sentences). Focus on the biggest, most viral, most meme-worthy events. Include a mix of politics, tech, entertainment, sports, and world events.',
      },
      { role: 'user', content: 'What are the top 10 biggest news events happening right now?' },
    ],
    temperature: 0.7,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from Grok')
  }

  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    throw new Error('No JSON array found in Grok response')
  }

  return JSON.parse(jsonMatch[0]) as string[]
}
