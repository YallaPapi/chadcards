// Regenerate art for a card using the updated prompt (no watermarks)
import { prisma } from '../src/lib/db'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1',
})

async function main() {
  const cardId = process.argv[2]
  if (!cardId) {
    console.error('Usage: npx tsx scripts/regen-art.ts <card-id>')
    process.exit(1)
  }

  const card = await prisma.card.findUnique({ where: { id: cardId } })
  if (!card) {
    console.error(`Card ${cardId} not found`)
    process.exit(1)
  }

  console.log(`Regenerating art for: ${card.name}`)
  console.log(`Art description: ${card.artDescription}`)

  const prompt = `Fantasy trading card portrait in oil painting style with dramatic lighting. Renaissance master painting aesthetic. Rich colors, detailed brushwork. Do NOT include any text, watermarks, or logos in the image. ${card.artDescription}`

  console.log('Generating new art...')
  const response = await client.images.generate({
    model: 'grok-imagine-image',
    prompt,
    n: 1,
  })

  const url = response.data?.[0]?.url
  if (!url) {
    console.error('No image URL returned')
    process.exit(1)
  }

  console.log(`New art URL: ${url}`)

  await prisma.card.update({
    where: { id: cardId },
    data: { artUrl: url },
  })

  console.log('Card updated successfully')
}

main().catch(console.error).finally(() => process.exit(0))
