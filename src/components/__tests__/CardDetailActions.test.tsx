import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import html2canvas from 'html2canvas'
import CardDetailActions from '../CardDetailActions'

vi.mock('html2canvas', () => ({
  default: vi.fn(),
}))

describe('CardDetailActions', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('captures the card and downloads it as a png', async () => {
    const target = document.createElement('div')
    target.id = 'card-download-target'
    document.body.appendChild(target)

    const canvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,test'),
    }
    vi.mocked(html2canvas).mockResolvedValue(canvas as never)

    render(<CardDetailActions cardName="Taylor Swift" />)

    const click = vi.fn()
    const anchor = { href: '', download: '', click } as HTMLAnchorElement
    const realCreateElement = document.createElement.bind(document)

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') return anchor
      return realCreateElement(tagName)
    })

    fireEvent.click(screen.getByRole('button', { name: /download as png/i }))

    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalledWith(
        target,
        expect.objectContaining({
          backgroundColor: null,
          scale: 2,
          useCORS: true,
        })
      )
    })

    expect(canvas.toDataURL).toHaveBeenCalledWith('image/png')
    expect(anchor.download).toBe('taylor-swift-card.png')
    expect(anchor.href).toBe('data:image/png;base64,test')
    expect(click).toHaveBeenCalled()
  })
})
