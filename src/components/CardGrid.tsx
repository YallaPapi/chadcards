'use client'

import { Card as CardType } from '@/types/card'
import Card from './Card'
import { useRouter } from 'next/navigation'

interface CardGridProps {
  cards: CardType[]
}

export default function CardGrid({ cards }: CardGridProps) {
  const router = useRouter()

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
        <Card
          key={card.id}
          card={card}
          size="small"
          onClick={() => router.push(`/card/${card.id}`)}
        />
      ))}
    </div>
  )
}
