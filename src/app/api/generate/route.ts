import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPersonSummary } from '@/lib/wikipedia'
import { generateCardText, generateCardArt } from '@/lib/grok'
import { detectCategory } from '@/lib/card-generation'

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const trimmedName = name.trim()

    // Check cache
    const existing = await prisma.card.findUnique({ where: { name: trimmedName } })
    if (existing) {
      return NextResponse.json({
        ...existing,
        colors: JSON.parse(existing.colors),
        abilities: JSON.parse(existing.abilities),
      })
    }

    // 1. Fetch Wikipedia data
    const wiki = await getPersonSummary(trimmedName)

    // 2. Generate card text via Grok
    const cardData = await generateCardText(wiki.title, wiki.extract)

    // 3. Generate card art via Grok
    const artUrl = await generateCardArt(cardData.art_description)

    // 4. Detect category
    const category = detectCategory(wiki.description ?? '', wiki.extract)

    // 5. Save to database
    const card = await prisma.card.create({
      data: {
        name: cardData.name,
        manaCost: cardData.mana_cost,
        colors: JSON.stringify(cardData.colors),
        typeLine: cardData.type_line,
        abilities: JSON.stringify(cardData.abilities),
        flavorText: cardData.flavor_text,
        flavorAttribution: cardData.flavor_attribution,
        power: cardData.power,
        toughness: cardData.toughness,
        rarity: cardData.rarity,
        artUrl: artUrl,
        artDescription: cardData.art_description,
        category,
      },
    })

    return NextResponse.json({
      ...card,
      colors: cardData.colors,
      abilities: cardData.abilities,
    })
  } catch (error: any) {
    console.error('Card generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate card' },
      { status: 500 }
    )
  }
}
