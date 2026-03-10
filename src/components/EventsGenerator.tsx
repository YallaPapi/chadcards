'use client'

import { useState, useEffect } from 'react'
import { Card as CardType } from '@/types/card'
import Card from './Card'
import { useRouter } from 'next/navigation'

export default function EventsGenerator() {
  const [events, setEvents] = useState<string[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [customEvent, setCustomEvent] = useState('')
  const [generating, setGenerating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [card, setCard] = useState<CardType | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/generate-event')
      .then(res => res.json())
      .then(data => {
        if (data.events) setEvents(data.events)
      })
      .catch(err => console.error('Failed to fetch events:', err))
      .finally(() => setLoadingEvents(false))
  }, [])

  async function generateCard(eventDesc: string) {
    setGenerating(eventDesc)
    setError(null)
    setCard(null)

    try {
      const res = await fetch('/api/generate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventDesc }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate card')

      setCard({
        ...data,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
        mana_cost: data.manaCost,
        type_line: data.typeLine,
        flavor_text: data.flavorText,
        flavor_attribution: data.flavorAttribution,
        art_url: data.artUrl,
        art_description: data.artDescription,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(null)
    }
  }

  async function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customEvent.trim()) return
    await generateCard(customEvent.trim())
  }

  return (
    <div className="flex flex-col items-center">
      {/* Custom event input */}
      <form onSubmit={handleCustomSubmit} className="w-full max-w-lg mb-10">
        <div className="flex gap-3">
          <input
            type="text"
            value={customEvent}
            onChange={(e) => setCustomEvent(e.target.value)}
            placeholder="Describe any news event..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a94e] transition-colors"
            disabled={!!generating}
          />
          <button
            type="submit"
            disabled={!!generating || !customEvent.trim()}
            className="px-6 py-3 bg-[#c9a94e] text-black font-semibold rounded-lg hover:bg-[#d4b85a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </form>

      {/* Trending events */}
      <div className="w-full max-w-2xl mb-10">
        <h2 className="text-xl font-bold mb-4 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
          Trending Now
        </h2>
        {loadingEvents ? (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-[#c9a94e] border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-gray-500 text-sm">Asking Grok what&apos;s happening...</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {events.map((event, i) => (
              <button
                key={i}
                onClick={() => generateCard(event)}
                disabled={!!generating}
                className="text-left px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-[#c9a94e]/30 transition-colors disabled:opacity-50 group"
              >
                <span className="text-gray-400 group-hover:text-white transition-colors">{event}</span>
                {generating === event && (
                  <span className="ml-2 inline-block w-4 h-4 border-2 border-[#c9a94e] border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md text-center mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Generated card */}
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
              onClick={() => setCard(null)}
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
