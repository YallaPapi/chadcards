import 'dotenv/config'

const LAUNCH_DECK = [
  { name: 'Donald Trump', category: 'politician' },
  { name: 'Joe Biden', category: 'politician' },
  { name: 'Barack Obama', category: 'politician' },
  { name: 'Alexandria Ocasio-Cortez', category: 'politician' },
  { name: 'Ron DeSantis', category: 'politician' },
  { name: 'Elon Musk', category: 'tech' },
  { name: 'Mark Zuckerberg', category: 'tech' },
  { name: 'Sam Altman', category: 'tech' },
  { name: 'Jeff Bezos', category: 'tech' },
  { name: 'Jensen Huang', category: 'tech' },
  { name: 'Kim Kardashian', category: 'entertainer' },
  { name: 'Kanye West', category: 'entertainer' },
  { name: 'Joe Rogan', category: 'entertainer' },
  { name: 'Jake Paul', category: 'entertainer' },
  { name: 'Taylor Swift', category: 'entertainer' },
  { name: 'Conor McGregor', category: 'athlete' },
  { name: 'LeBron James', category: 'athlete' },
  { name: 'Cristiano Ronaldo', category: 'athlete' },
  { name: 'Andrew Tate', category: 'internet' },
  { name: 'MrBeast', category: 'internet' },
]

async function seed() {
  console.log('Starting seed — generating 20 cards...')
  console.log('This will make 40 API calls (text + image per card).')
  console.log('Estimated time: ~5-10 minutes.\n')

  for (let i = 0; i < LAUNCH_DECK.length; i++) {
    const { name } = LAUNCH_DECK[i]

    try {
      console.log(`[${i + 1}/20] Generating: ${name}...`)

      // Call our own API route (dev server must be running)
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const card = await res.json()
      console.log(`  OK: ${card.name} — ${card.typeLine} (${card.rarity})`)

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 2000))
    } catch (error: any) {
      console.error(`  FAILED: ${name} — ${error.message}`)
    }
  }

  console.log('\nSeed complete!')
}

seed()
