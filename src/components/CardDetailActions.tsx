'use client'

import { useState } from 'react'
import html2canvas from 'html2canvas'

interface CardDetailActionsProps {
  cardName: string
  targetId?: string
}

function slugifyCardName(cardName: string) {
  const slug = cardName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'card'
}

export default function CardDetailActions({
  cardName,
  targetId = 'card-download-target',
}: CardDetailActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  async function handleDownload() {
    const target = document.getElementById(targetId)
    if (!target || isDownloading) return

    setIsDownloading(true)

    try {
      const canvas = await html2canvas(target, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      })

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `${slugifyCardName(cardName)}-card.png`
      link.click()
    } catch (error) {
      console.error('Failed to download card image', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="mt-8 flex gap-4">
      <button
        className="px-6 py-3 bg-[#c9a94e] text-black font-semibold rounded-lg hover:bg-[#d4b85a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        id="download-btn"
        onClick={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? 'Rendering PNG...' : 'Download as PNG'}
      </button>
      <a
        href="/"
        className="px-6 py-3 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
      >
        Back to Gallery
      </a>
    </div>
  )
}
