import type { Metadata } from 'next'
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand'
import './globals.css'

export const metadata: Metadata = {
  title: `${BRAND_NAME} - Celebrity Trading Card Game`,
  description: BRAND_TAGLINE,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <nav className="border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <a href="/" className="text-2xl font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#c9a94e' }}>
              CHADCARDS
            </a>
            <div className="flex gap-6">
              <a href="/" className="text-gray-400 hover:text-white transition-colors">Gallery</a>
              <a href="/generate" className="text-gray-400 hover:text-white transition-colors">Generate</a>
              <a href="/events" className="text-gray-400 hover:text-white transition-colors">Events</a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
