interface WikiSummary {
  title: string
  extract: string
  description?: string
  thumbnail?: { source: string }
}

export async function getPersonSummary(name: string): Promise<WikiSummary> {
  const encoded = encodeURIComponent(name.replace(/ /g, '_'))
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'InfamousCards/1.0 (trading card game)' },
  })

  if (!res.ok) {
    throw new Error(`Wikipedia API error: ${res.status} for "${name}"`)
  }

  const data = await res.json()
  return {
    title: data.title,
    extract: data.extract,
    description: data.description,
    thumbnail: data.thumbnail,
  }
}
