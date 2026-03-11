import OpenAI from 'openai'
import { CardData } from '@/types/card'
import { validateGeneratedCardData } from '@/lib/card-generation'
import { selectBestCardCandidate } from '@/lib/card-tone'

const client = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1',
})

const CARD_SYSTEM_PROMPT = `You are a satirical trading card game designer creating collectible cards for real public figures. Your writing should feel contemporary, hyper-online, ironic, sharp, and screenshot-worthy without sounding forced or stale.

RULES:
- Abilities must use proper trading card game rules-speak (tap symbols, keywords, etc.)
- Each ability name should be a specific, quotable reference to something the person is known for
- Flavor text should feel like something people would repost in a group chat, not a generic comedy caption
- Power/Toughness should reflect real-world influence (Power) and resilience (Toughness) on a 0-10 scale
- Mana cost should reflect how "expensive" or impactful this person is (1-10)
- Color identity should match their personality archetype:
  White: Order, institution, authority (politicians, executives)
  Blue: Intelligence, technology, manipulation (tech founders, scientists)
  Black: Ambition, ruthlessness, self-interest (moguls, controversial figures)
  Red: Chaos, passion, impulse (entertainers, provocateurs)
  Green: Growth, authenticity, nature (athletes, activists)
  Multi-color for people who span categories
- Type should be "Legendary Creature - [Funny Class] [Funny Subclass]"
- Keep it as parody/satire - funny and sharp, never hateful
- Generate 2-3 abilities
- IMPORTANT: Keep each ability's rules_text under 80 characters. Be concise.
- NEVER use fake game vocabulary like "memes", "fame", "interrupt", "silence target", or "skip a turn".
- Use only card-like actions such as create, draw, discard, exile, destroy, counter, tap, untap, gain, lose, return, and get +N/+N.
- NEVER use stale filler like "probably", "I'm not just...", "the future is...", "viral aura", or generic Facebook-boomer punchlines.
- Prefer contemporary internet-native irony over generic satire. The joke should feel current, culturally literate, and specific to the person.

Return ONLY valid JSON matching this exact schema:
{
  "name": "Full Name",
  "mana_cost": 5,
  "colors": ["Blue", "Black"],
  "type_line": "Legendary Creature - Billionaire Shitposter",
  "abilities": [
    {"name": "Ability Name", "cost": "{T}", "rules_text": "Concise rules text here"},
    {"name": "Ability Name", "cost": null, "rules_text": "Static ability text"}
  ],
  "flavor_text": "The satirical quote",
  "flavor_attribution": "- Source",
  "power": 7,
  "toughness": 3,
  "rarity": "mythic",
  "art_description": "2-3 sentence description of card art in fantasy oil painting style"
}`

export async function generateCardText(name: string, summary: string): Promise<CardData> {
  const candidates: CardData[] = []

  for (let attempt = 0; attempt < 4; attempt++) {
    const extraGuidance = attempt === 0
      ? ''
      : '\n\nPrevious output was rejected or too bland. Be more specific, more contemporary, and more ironically online.'

    const response = await client.chat.completions.create({
      model: 'grok-3',
      messages: [
        { role: 'system', content: CARD_SYSTEM_PROMPT },
        { role: 'user', content: `Generate a trading card for this person:\n\nName: ${name}\n\nWikipedia summary:\n${summary}${extraGuidance}` },
      ],
      temperature: 1,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from Grok')

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in Grok response')

    const parsed = JSON.parse(jsonMatch[0]) as CardData

    try {
      candidates.push(validateGeneratedCardData(parsed))
    } catch (error) {
      if (attempt === 3 && candidates.length === 0) throw error
    }
  }

  if (candidates.length === 0) {
    throw new Error('Failed to generate valid card data from Grok')
  }

  return selectBestCardCandidate(candidates)
}

export async function generateCardArt(artDescription: string): Promise<string> {
  const prompt = `Fantasy trading card portrait in oil painting style with dramatic lighting. Renaissance master painting aesthetic. Rich colors, detailed brushwork. Do NOT include any text, watermarks, or logos in the image. ${artDescription}`

  const response = await client.images.generate({
    model: 'grok-imagine-image',
    prompt,
    n: 1,
  })

  const url = response.data?.[0]?.url
  if (!url) throw new Error('No image URL from Grok')

  return url
}

const EVENT_SYSTEM_PROMPT = `You are a satirical trading card game designer creating collectible cards for CURRENT NEWS EVENTS. You write sharp, funny, topical content.

RULES:
- The card represents a major news event, not a person
- Type should be "Sorcery", "Instant", or "Enchantment" (not Creature) - pick what fits:
  - Sorcery: One-time events (bombings, elections, announcements)
  - Instant: Breaking news, sudden events
  - Enchantment: Ongoing situations (wars, economic trends, pandemics)
- Abilities should reference the real-world impacts of the event in trading card rules-speak
- Flavor text should be a satirical take on the event
- Mana cost 1-10 based on how impactful/world-changing the event is
- Color identity based on the nature of the event:
  White: Government/institutional actions, peace deals
  Blue: Technology, intelligence, manipulation
  Black: Death, destruction, corruption, power grabs
  Red: War, chaos, destruction, passion
  Green: Environmental, growth, natural events
  Multi-color for complex events
- Keep it as parody/satire - funny and sharp, never hateful or celebrating tragedy
- IMPORTANT: Keep each ability's rules_text under 80 characters. Be concise.

Return ONLY valid JSON matching this exact schema:
{
  "name": "Event Name",
  "mana_cost": 5,
  "colors": ["Red", "Black"],
  "type_line": "Sorcery",
  "abilities": [
    {"name": "Ability Name", "cost": null, "rules_text": "Concise rules text describing the event's effect"}
  ],
  "flavor_text": "Satirical quote about the event",
  "flavor_attribution": "- Source",
  "power": 0,
  "toughness": 0,
  "rarity": "mythic",
  "art_description": "2-3 sentence description of card art depicting the event in dramatic fantasy oil painting style"
}`

export async function generateEventCard(eventDescription: string): Promise<CardData> {
  const response = await client.chat.completions.create({
    model: 'grok-3',
    messages: [
      { role: 'system', content: EVENT_SYSTEM_PROMPT },
      { role: 'user', content: `Generate a trading card for this current event:\n\n${eventDescription}` },
    ],
    temperature: 0.9,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from Grok')

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in Grok response')

  const parsed = JSON.parse(jsonMatch[0]) as CardData
  if (!parsed.name || !parsed.colors || !parsed.abilities) {
    throw new Error('Invalid event card data from Grok')
  }

  parsed.power = 0
  parsed.toughness = 0

  return parsed
}

export async function getTrendingEvents(): Promise<string[]> {
  const response = await client.chat.completions.create({
    model: 'grok-3',
    messages: [
      { role: 'system', content: 'You are a news analyst. Return ONLY a JSON array of 10 current major news events happening right now. Each should be a short description (1-2 sentences). Focus on the biggest, most viral, most meme-worthy events. Include a mix of politics, tech, entertainment, sports, and world events.' },
      { role: 'user', content: 'What are the top 10 biggest news events happening right now?' },
    ],
    temperature: 0.7,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from Grok')

  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('No JSON array found in Grok response')

  return JSON.parse(jsonMatch[0]) as string[]
}
