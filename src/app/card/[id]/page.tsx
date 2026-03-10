import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Card from '@/components/Card'
import CardDetailActions from '@/components/CardDetailActions'

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const dbCard = await prisma.card.findUnique({ where: { id } })
  if (!dbCard) notFound()

  const card = {
    id: dbCard.id,
    name: dbCard.name,
    mana_cost: dbCard.manaCost,
    colors: JSON.parse(dbCard.colors) as string[],
    type_line: dbCard.typeLine,
    abilities: JSON.parse(dbCard.abilities) as { name: string; cost: string | null; rules_text: string }[],
    flavor_text: dbCard.flavorText,
    flavor_attribution: dbCard.flavorAttribution,
    power: dbCard.power,
    toughness: dbCard.toughness,
    rarity: dbCard.rarity as 'mythic' | 'rare' | 'uncommon',
    art_url: dbCard.artUrl,
    art_description: dbCard.artDescription,
    category: dbCard.category,
    created_at: dbCard.createdAt.toISOString(),
    updated_at: dbCard.updatedAt.toISOString(),
  }

  return (
    <div className="flex flex-col items-center">
      <div id="card-download-target">
        <Card card={card} size="xlarge" />
      </div>

      <CardDetailActions cardName={card.name} />

      {/* Card stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 max-w-md w-full">
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-gray-500 text-sm">Category</p>
          <p className="text-lg capitalize">{card.category}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-gray-500 text-sm">Rarity</p>
          <p className="text-lg capitalize">{card.rarity}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-gray-500 text-sm">Power / Toughness</p>
          <p className="text-lg">{card.power} / {card.toughness}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-gray-500 text-sm">Mana Cost</p>
          <p className="text-lg">{card.mana_cost}</p>
        </div>
      </div>
    </div>
  )
}
