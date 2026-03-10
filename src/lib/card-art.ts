export function getCardArtUrl(artUrl: string): string {
  if (!artUrl.startsWith('http://') && !artUrl.startsWith('https://')) {
    return artUrl
  }

  if (artUrl.startsWith('/api/card-art')) {
    return artUrl
  }

  return `/api/card-art?src=${encodeURIComponent(artUrl)}`
}
