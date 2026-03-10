import { describe, it, expect } from 'vitest'
import { getPersonSummary } from '../wikipedia'

describe('getPersonSummary', () => {
  it('returns summary for a valid person', async () => {
    const result = await getPersonSummary('Elon Musk')
    expect(result).toBeDefined()
    expect(result.title).toBeTruthy()
    expect(result.extract).toBeTruthy()
    expect(result.extract.length).toBeGreaterThan(50)
  })

  it('throws for nonexistent person', async () => {
    await expect(getPersonSummary('Xyzzy Nonexistent Person 12345'))
      .rejects.toThrow()
  })
})
