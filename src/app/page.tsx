import CardGrid from '@/components/CardGrid'
import { prisma } from '@/lib/db'

async function getCards(searchParams: { category?: string; color?: string; rarity?: string; sort?: string }) {
  const where: any = {}
  if (searchParams.category) where.category = searchParams.category
  if (searchParams.rarity) where.rarity = searchParams.rarity
  if (searchParams.color) where.colors = { contains: searchParams.color }

  const orderBy: any = {}
  const sort = searchParams.sort || 'createdAt'
  if (sort === 'power') orderBy.power = 'desc'
  else if (sort === 'toughness') orderBy.toughness = 'desc'
  else if (sort === 'manaCost') orderBy.manaCost = 'desc'
  else orderBy.createdAt = 'desc'

  const cards = await prisma.card.findMany({ where, orderBy })
  return cards.map((c) => ({
    id: c.id,
    name: c.name,
    mana_cost: c.manaCost,
    colors: JSON.parse(c.colors),
    type_line: c.typeLine,
    abilities: JSON.parse(c.abilities),
    flavor_text: c.flavorText,
    flavor_attribution: c.flavorAttribution,
    power: c.power,
    toughness: c.toughness,
    rarity: c.rarity as 'mythic' | 'rare' | 'uncommon',
    art_url: c.artUrl,
    art_description: c.artDescription,
    category: c.category,
    created_at: c.createdAt.toISOString(),
    updated_at: c.updatedAt.toISOString(),
  }))
}

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams
  const cards = await getCards(params)

  const categories = ['all', 'politician', 'tech', 'entertainer', 'athlete', 'internet', 'event']
  const currentCategory = params.category || 'all'

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#c9a94e' }}>
          The Gallery
        </h1>
        <p className="text-gray-500">AI-generated trading cards for the world&apos;s most infamous public figures</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((cat) => (
          <a
            key={cat}
            href={cat === 'all' ? '/' : `/?category=${cat}`}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              currentCategory === cat
                ? 'bg-[#c9a94e] text-black font-semibold'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </a>
        ))}
      </div>

      <CardGrid cards={cards} />

      {/* Disclaimer */}
      <p className="text-center text-gray-600 text-xs mt-16">
        This is a parody. Not affiliated with Wizards of the Coast, Hasbro, or any depicted individual.
        All art is AI-generated. For entertainment purposes only.
      </p>
    </div>
  )
}
