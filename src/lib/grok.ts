import OpenAI from 'openai'
import { CardData } from '@/types/card'

const client = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1',
})

const CARD_SYSTEM_PROMPT = `You are a satirical trading card game designer creating Magic: The Gathering-style cards for real public figures. You write sharp, funny, but not cruel content.

RULES:
- Abilities must be written in authentic MTG rules-speak (tap symbols, keywords, etc.)
- Each ability name should be a clever reference to something the person is known for
- Flavor text should be either a real quote twisted satirically, or an original satirical quote
- Power/Toughness should reflect real-world influence (Power) and resilience (Toughness) on a 0-10 scale
- Mana cost should reflect how "expensive" or impactful this person is (1-10)
- Color identity should match their personality archetype:
  White: Order, institution, authority (politicians, executives)
  Blue: Intelligence, technology, manipulation (tech founders, scientists)
  Black: Ambition, ruthlessness, self-interest (moguls, controversial figures)
  Red: Chaos, passion, impulse (entertainers, provocateurs)
  Green: Growth, authenticity, nature (athletes, activists)
  Multi-color for people who span categories
- Type should be "Legendary Creature — [Funny Class] [Funny Subclass]"
- Keep it as parody/satire — funny and sharp, never hateful
- Generate 2-3 abilities

Return ONLY valid JSON matching this exact schema:
{
  "name": "Full Name",
  "mana_cost": 5,
  "colors": ["Blue", "Black"],
  "type_line": "Legendary Creature — Billionaire Shitposter",
  "abilities": [
    {"name": "Ability Name", "cost": "{T}", "rules_text": "MTG rules text"},
    {"name": "Ability Name", "cost": null, "rules_text": "Static ability text"}
  ],
  "flavor_text": "The satirical quote",
  "flavor_attribution": "— Source",
  "power": 7,
  "toughness": 3,
  "rarity": "mythic",
  "art_description": "2-3 sentence description of card art in fantasy oil painting style"
}`

export async function generateCardText(name: string, summary: string): Promise<CardData> {
  const response = await client.chat.completions.create({
    model: 'grok-3',
    messages: [
      { role: 'system', content: CARD_SYSTEM_PROMPT },
      { role: 'user', content: `Generate a trading card for this person:\n\nName: ${name}\n\nWikipedia summary:\n${summary}` },
    ],
    temperature: 0.9,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from Grok')

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in Grok response')

  const parsed = JSON.parse(jsonMatch[0]) as CardData

  // Validate required fields
  if (!parsed.name || !parsed.colors || !parsed.abilities) {
    throw new Error('Invalid card data from Grok')
  }

  return parsed
}

export async function generateCardArt(artDescription: string): Promise<string> {
  const prompt = `Fantasy trading card portrait in oil painting style with dramatic lighting. MTG card art aesthetic. Rich colors, detailed brushwork. ${artDescription}`

  const response = await client.images.generate({
    model: 'grok-imagine-image',
    prompt,
    n: 1,
  })

  const url = response.data?.[0]?.url
  if (!url) throw new Error('No image URL from Grok')

  return url
}
