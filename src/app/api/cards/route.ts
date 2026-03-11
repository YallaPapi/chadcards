import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { CardAbility } from '@/types/card'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const color = searchParams.get('color')
  const rarity = searchParams.get('rarity')
  const sort = searchParams.get('sort') || 'createdAt'
  const order = searchParams.get('order') || 'desc'

  const where: any = {}
  if (category) where.category = category
  if (rarity) where.rarity = rarity
  if (color) where.colors = { contains: color }

  const orderBy: any = {}
  if (sort === 'power') orderBy.power = order
  else if (sort === 'toughness') orderBy.toughness = order
  else if (sort === 'manaCost') orderBy.manaCost = order
  else orderBy.createdAt = order

  try {
    const cards = await prisma.card.findMany({ where, orderBy })

    return NextResponse.json(
      cards.map((c) => ({
        ...c,
        colors: JSON.parse(c.colors),
        abilities: JSON.parse(c.abilities) as CardAbility[],
        flavorText: c.flavorText || null,
        flavorAttribution: c.flavorAttribution || null,
      }))
    )
  } catch (error: any) {
    console.error('Cards API error:', error)
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
