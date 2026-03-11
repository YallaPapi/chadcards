import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateEventCard, generateCardArt, getTrendingEvents } from '@/lib/grok'

export async function POST(request: NextRequest) {
  try {
    const { event } = await request.json()
    if (!event || typeof event !== 'string') {
      return NextResponse.json({ error: 'Event description is required' }, { status: 400 })
    }

    // Check cache by name (events might have similar names)
    const trimmedEvent = event.trim()

    // 1. Generate event card via Grok
    const cardData = await generateEventCard(trimmedEvent)

    // Check if already exists
    const existing = await prisma.card.findUnique({ where: { name: cardData.name } })
    if (existing) {
      return NextResponse.json({
        ...existing,
        colors: JSON.parse(existing.colors),
        abilities: JSON.parse(existing.abilities),
        flavorText: existing.flavorText || null,
        flavorAttribution: existing.flavorAttribution || null,
      })
    }

    // 2. Generate card art
    const artUrl = await generateCardArt(cardData.art_description)

    // 3. Save to database
    const card = await prisma.card.create({
      data: {
        name: cardData.name,
        manaCost: cardData.mana_cost,
        colors: JSON.stringify(cardData.colors),
        typeLine: cardData.type_line,
        abilities: JSON.stringify(cardData.abilities),
        flavorText: cardData.flavor_text ?? '',
        flavorAttribution: cardData.flavor_attribution ?? '',
        power: cardData.power,
        toughness: cardData.toughness,
        rarity: cardData.rarity,
        artUrl: artUrl,
        artDescription: cardData.art_description,
        category: 'event',
      },
    })

    return NextResponse.json({
      ...card,
      colors: cardData.colors,
      abilities: cardData.abilities,
    })
  } catch (error: any) {
    console.error('Event card generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate event card' },
      { status: 500 }
    )
  }
}

// GET: Return trending events from Grok
export async function GET() {
  try {
    const events = await getTrendingEvents()
    return NextResponse.json({ events })
  } catch (error: any) {
    console.error('Trending events error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trending events' },
      { status: 500 }
    )
  }
}
