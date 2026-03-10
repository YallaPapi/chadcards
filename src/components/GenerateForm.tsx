'use client'

import { useState } from 'react'
import { Card as CardType } from '@/types/card'
import Card from './Card'
import { useRouter } from 'next/navigation'

export default function GenerateForm() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [card, setCard] = useState<CardType | null>(null)
  const router = useRouter()

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)
    setCard(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate card')
      }

      setCard({
        ...data,
        mana_cost: data.manaCost,
        type_line: data.typeLine,
        flavor_text: data.flavorText,
        flavor_attribution: data.flavorAttribution,
        art_url: data.artUrl,
        art_description: data.artDescription,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <form onSubmit={handleGenerate} className="w-full max-w-md mb-10">
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter any public figure's name..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a94e] transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-6 py-3 bg-[#c9a94e] text-black font-semibold rounded-lg hover:bg-[#d4b85a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-[#c9a94e] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Summoning card from the void...</p>
          <p className="text-gray-600 text-sm mt-2">This takes ~15 seconds (Wikipedia + AI text + AI art)</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {card && (
        <div className="flex flex-col items-center">
          <Card card={card} size="large" />
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => router.push(`/card/${card.id}`)}
              className="px-6 py-3 bg-[#c9a94e] text-black font-semibold rounded-lg hover:bg-[#d4b85a] transition-colors"
            >
              View Full Card
            </button>
            <button
              onClick={() => { setCard(null); setName('') }}
              className="px-6 py-3 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
