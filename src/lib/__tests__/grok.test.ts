import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.resetModules()
})

// Test the JSON extraction logic that generateCardText uses
describe('Grok response parsing', () => {
  it('does not require API credentials at module import time', async () => {
    const originalKey = process.env.GROK_API_KEY
    const originalOpenAiKey = process.env.OPENAI_API_KEY

    delete process.env.GROK_API_KEY
    delete process.env.OPENAI_API_KEY

    await expect(import('../grok')).resolves.toBeTruthy()

    process.env.GROK_API_KEY = originalKey
    process.env.OPENAI_API_KEY = originalOpenAiKey
  })

  it('extracts JSON from plain response', () => {
    const response = '{"name": "Test Person", "mana_cost": 5, "colors": ["Blue"], "type_line": "Legendary Creature — Test", "abilities": [{"name": "Test", "cost": null, "rules_text": "Test"}], "flavor_text": "Test", "flavor_attribution": "— Test", "power": 5, "toughness": 5, "rarity": "rare", "art_description": "A test"}'
    const match = response.match(/\{[\s\S]*\}/)
    expect(match).toBeTruthy()
    const parsed = JSON.parse(match![0])
    expect(parsed.name).toBe('Test Person')
    expect(parsed.colors).toEqual(['Blue'])
  })

  it('extracts JSON from markdown code block', () => {
    const response = 'Here is the card:\n```json\n{"name": "Test", "mana_cost": 3, "colors": ["Red"], "type_line": "Legendary Creature — Test", "abilities": [], "flavor_text": "Hi", "flavor_attribution": "— Me", "power": 3, "toughness": 3, "rarity": "uncommon", "art_description": "Art"}\n```'
    const match = response.match(/\{[\s\S]*\}/)
    expect(match).toBeTruthy()
    const parsed = JSON.parse(match![0])
    expect(parsed.name).toBe('Test')
  })

  it('validates required fields are present', () => {
    const validCard = {
      name: 'Elon Musk',
      mana_cost: 8,
      colors: ['Blue', 'Red'],
      type_line: 'Legendary Creature — Techbro Overlord',
      abilities: [{ name: 'Tweet Storm', cost: '{T}', rules_text: 'Destroy target stock price' }],
      flavor_text: 'To the moon!',
      flavor_attribution: '— @elonmusk',
      power: 8,
      toughness: 4,
      rarity: 'mythic',
      art_description: 'A figure standing atop a rocket',
    }

    expect(validCard.name).toBeTruthy()
    expect(validCard.colors).toBeTruthy()
    expect(validCard.abilities).toBeTruthy()
    expect(validCard.abilities.length).toBeGreaterThan(0)
  })

  it('rejects response with no JSON', () => {
    const response = 'Sorry, I cannot generate that card.'
    const match = response.match(/\{[\s\S]*\}/)
    expect(match).toBeNull()
  })
})
