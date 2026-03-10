'use client'

import { Card as CardType, getCardTheme, MANA_SYMBOL_COLORS, RARITY_COLORS, MTG_COLOR_THEMES, MtgColor } from '@/types/card'
import { AutoTextSize } from 'auto-text-size'
import './Card.css'

interface CardProps {
  card: CardType
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
}

const FONT_LIMITS = {
  small:  { min: 5, max: 12 },
  medium: { min: 7, max: 16 },
  large:  { min: 9, max: 20 },
}

function ManaCost({ cost, colors }: { cost: number; colors: string[] }) {
  const symbols: string[] = []
  const colorCost = Math.min(colors.length, cost)
  const genericCost = cost - colorCost

  if (genericCost > 0) symbols.push(String(genericCost))
  colors.forEach((c) => {
    const key = MTG_COLOR_THEMES[c as MtgColor]?.symbol
    if (key) symbols.push(key)
  })

  return (
    <div className="mana-cost">
      {symbols.map((s, i) => {
        const colors = MANA_SYMBOL_COLORS[s] ?? MANA_SYMBOL_COLORS.generic
        return (
          <span
            key={i}
            className="mana-symbol"
            style={{ background: colors.bg, color: colors.fg }}
          >
            {s}
          </span>
        )
      })}
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
  const theme = getCardTheme(card.colors)
  const limits = FONT_LIMITS[size]
  const rarityClass = `rarity-${card.rarity}`

  const cssVars = {
    '--frame-color': theme.frame,
    '--textbox-color': theme.textbox,
    '--text-color': theme.textColor,
    '--name-color': theme.nameColor,
    '--pt-bg': theme.ptBox,
    '--pt-text': theme.ptText,
  } as React.CSSProperties

  return (
    <div
      className={`mtg-card mtg-card-${size} ${card.rarity === 'mythic' ? 'mythic-glow' : ''}`}
      style={cssVars}
      onClick={onClick}
    >
      <div className="card-frame">
        <div className="card-inner">
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
            <span className={`rarity-symbol ${rarityClass}`}>
              {card.rarity === 'mythic' ? '★' : card.rarity === 'rare' ? '◆' : '●'}
            </span>
          </div>

          {/* Text box — parchment background, auto-scaled text */}
          <div className="card-text-box">
            <AutoTextSize mode="box" minFontSizePx={limits.min} maxFontSizePx={limits.max}>
              <div className="card-text-box-inner">
                <div className="abilities">
                  {card.abilities.map((a, i) => (
                    <AbilityText key={i} ability={a} />
                  ))}
                </div>
                {card.flavor_text && (
                  <>
                    <hr className="flavor-separator" />
                    <div className="flavor-text">
                      <p className="flavor-quote">&ldquo;{card.flavor_text}&rdquo;</p>
                      <p className="flavor-attribution">{card.flavor_attribution}</p>
                    </div>
                  </>
                )}
              </div>
            </AutoTextSize>
          </div>

          {/* Footer: URL + P/T */}
          <div className="card-footer">
            <span className="card-url">infamouscards.com</span>
            <div className="card-pt">
              <span>{card.power}/{card.toughness}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
