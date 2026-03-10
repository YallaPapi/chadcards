'use client'

import { Card as CardType } from '@/types/card'
import Card from './Card'
import { useRouter } from 'next/navigation'

interface CardGridProps {
  cards: CardType[]
}

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

export default function CardGrid({ cards }: CardGridProps) {
  const router = useRouter()

  function openCard(id: string) {
    router.push(`/card/${id}`)
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-xl">No cards yet.</p>
        <p className="mt-2">
          <a href="/generate" className="text-[#c9a94e] hover:underline">Generate your first card</a>
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 justify-items-center">
      {cards.map((card) => (
        <div
          key={card.id}
          role="button"
          tabIndex={0}
          className="w-[200px] cursor-pointer rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a94e] focus:ring-offset-2 focus:ring-offset-black"
          onClick={() => openCard(card.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openCard(card.id)
            }
          }}
        >
          <div className="mb-3 min-h-[56px] rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <p className="truncate text-sm font-semibold text-white">{card.name}</p>
            <p className="truncate text-xs text-gray-400">
              {formatCategory(card.category)} • {card.type_line}
            </p>
          </div>
          <Card
            card={card}
            size="small"
          />
        </div>
      ))}
    </div>
  )
}
