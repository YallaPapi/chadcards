import 'dotenv/config'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../src/generated/prisma/client'
import { getPersonSummary } from '../src/lib/wikipedia'
import { generateCardText } from '../src/lib/grok'
import { detectCategory } from '../src/lib/card-generation'

function createPrismaClient() {
  const adapter = new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL || 'file:./prisma/dev.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  return new PrismaClient({ adapter })
}

const prisma = createPrismaClient()

async function main() {
  const targetNames = process.argv.slice(2)
  const cards = await prisma.card.findMany({
    where: targetNames.length > 0
      ? { name: { in: targetNames } }
      : undefined,
    orderBy: { createdAt: 'asc' },
  })

  console.log(`Repairing ${cards.length} cards...`)

  for (const [index, card] of cards.entries()) {
    console.log(`[${index + 1}/${cards.length}] Repairing ${card.name}...`)

    try {
      const wiki = await getPersonSummary(card.name)
      const regenerated = await generateCardText(wiki.title, wiki.extract)
      const category = detectCategory(wiki.description ?? '', wiki.extract)

      await prisma.card.update({
        where: { id: card.id },
        data: {
          name: card.name,
          manaCost: regenerated.mana_cost,
          colors: JSON.stringify(regenerated.colors),
          typeLine: regenerated.type_line,
          abilities: JSON.stringify(regenerated.abilities),
          flavorText: regenerated.flavor_text,
          flavorAttribution: regenerated.flavor_attribution,
          power: regenerated.power,
          toughness: regenerated.toughness,
          rarity: regenerated.rarity,
          artDescription: regenerated.art_description,
          category,
        },
      })

      console.log(`  OK: ${card.name} -> ${category}`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
    } catch (error: any) {
      console.error(`  FAILED: ${card.name} -> ${error.message}`)
    }
  }

  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})
