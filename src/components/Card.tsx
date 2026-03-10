'use client'

import { Card as CardType, getCardFrameColor, MTG_COLORS, MtgColor } from '@/types/card'
import './Card.css'

interface CardProps {
  card: CardType
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
}

function ManaCost({ cost, colors }: { cost: number; colors: string[] }) {
  const symbols: string[] = []
  const colorCost = Math.min(colors.length, cost)
  const genericCost = cost - colorCost

  if (genericCost > 0) symbols.push(String(genericCost))
  colors.forEach((c) => {
    const sym = MTG_COLORS[c as MtgColor]?.symbol
    if (sym) symbols.push(sym)
  })

  return (
    <div className="mana-cost">
      {symbols.map((s, i) => (
        <span key={i} className={`mana-symbol mana-${s.toLowerCase()}`}>{s}</span>
      ))}
    </div>
  )
}

function AbilityText({ ability }: { ability: { name: string; cost: string | null; rules_text: string } }) {
  return (
    <div className="ability">
      {ability.cost && <span className="ability-cost">{ability.cost}</span>}
      <span className="ability-name">{ability.name}</span>
      <span className="ability-dash"> — </span>
      <span className="ability-rules">{ability.rules_text}</span>
    </div>
  )
}

export default function Card({ card, size = 'medium', onClick }: CardProps) {
  const frameColor = getCardFrameColor(card.colors)

  return (
    <div
      className={`mtg-card mtg-card-${size} ${card.rarity === 'mythic' ? 'mythic-glow' : ''}`}
      style={{ '--frame-color': frameColor } as React.CSSProperties}
      onClick={onClick}
    >
      <div className="card-frame">
        {/* Header: Name + Mana */}
        <div className="card-header">
          <span className="card-name">{card.name}</span>
          <ManaCost cost={card.mana_cost} colors={card.colors} />
        </div>

        {/* Art window */}
        <div className="card-art">
          <img src={card.art_url} alt={card.name} loading="lazy" />
        </div>

        {/* Type line */}
        <div className="card-type">
          <span>{card.type_line}</span>
          <span className="rarity-symbol">{card.rarity === 'mythic' ? '★' : card.rarity === 'rare' ? '◆' : '●'}</span>
        </div>

        {/* Text box */}
        <div className="card-text-box">
          <div className="abilities">
            {card.abilities.map((a, i) => (
              <AbilityText key={i} ability={a} />
            ))}
          </div>
          <div className="flavor-text">
            <p className="flavor-quote">&ldquo;{card.flavor_text}&rdquo;</p>
            <p className="flavor-attribution">{card.flavor_attribution}</p>
          </div>
        </div>

        {/* Footer: P/T + URL */}
        <div className="card-footer">
          <span className="card-url">infamouscards.com</span>
          <div className="card-pt">
            <span>{card.power}/{card.toughness}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
