import { describe, expect, it } from 'vitest'
import { getCardArtUrl } from '../card-art'

describe('getCardArtUrl', () => {
  it('proxies external art URLs through the app', () => {
    expect(getCardArtUrl('https://imgen.x.ai/xai-imgen/example.jpeg')).toBe(
      '/api/card-art?src=https%3A%2F%2Fimgen.x.ai%2Fxai-imgen%2Fexample.jpeg'
    )
  })

  it('preserves local and already-proxied paths', () => {
    expect(getCardArtUrl('/cards/local.png')).toBe('/cards/local.png')
    expect(getCardArtUrl('/api/card-art?src=https%3A%2F%2Fimgen.x.ai%2Fexample.jpeg')).toBe(
      '/api/card-art?src=https%3A%2F%2Fimgen.x.ai%2Fexample.jpeg'
    )
  })
})
