//creates in-text highlights. when cursor hovers over the highlights, the explanations window pops up
import React, { useEffect, useState } from 'react'
import { pdfjs } from 'react-pdf'
import WordDefinition from './WordDefinition'

export interface JargonItem {
  term: string
  explanation: string
}

export interface TextLayerProps {
  page: pdfjs.PDFPageProxy
  jargons: JargonItem[]
  width: number
}

const escapeRegex = (text: string) =>
  text.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')

const TextLayer: React.FC<TextLayerProps> = ({ page, jargons, width }) => {
  const [items, setItems] = useState<any[]>([])
  const [viewport, setViewport] = useState<any>(null)

  useEffect(() => {
    ;(async () => {
      const unscaledVP = page.getViewport({ scale: 1 })
      const scale = width / unscaledVP.width
      const scaledVP = page.getViewport({ scale })
      setViewport(scaledVP)

      const content = await page.getTextContent()
      setItems(content.items)
    })()
  }, [page, width])

  if (!viewport) return null

  // 1. Build full text and map item ranges
  let fullText = ''
  const itemRanges: { start: number; end: number; item: any; idx: number }[] = []
  items.forEach((item, idx) => {
    const start = fullText.length
    if (fullText.length > 0) fullText += ' ' // Add a space between items
    fullText += item.str
    const end = fullText.length
    itemRanges.push({ start, end, item, idx })
  })

  // 2. Find all jargon matches in the full text
  const sortedJargons = [...jargons].sort((a, b) => b.term.length - a.term.length)
  type Match = {
    term: string
    explanation: string
    start: number
    end: number
    jIdx: number
  }
  const matches: Match[] = []

function pluralInsensitiveRegex(term: string) {
  // Escape and join words, then allow optional "s" at the end of the whole phrase
  return (
    term
      .split(/\s+/)
      .map(word => escapeRegex(word))
      .join('\\s+') + 's?'
  )
}

  sortedJargons.forEach((jargon, jIdx) => {
    const regex = new RegExp(pluralInsensitiveRegex(jargon.term), 'gi')
    let match: RegExpExecArray | null
    while ((match = regex.exec(fullText)) !== null) {
      matches.push({
        term: jargon.term,
        explanation: jargon.explanation,
        start: match.index,
        end: match.index + match[0].length,
        jIdx,
      })
    }
  })

  // for each match, determine which item(s) it overlaps and render overlays
  const overlays: JSX.Element[] = []
  matches.forEach(({ start, end, explanation, jIdx, term }) => {
    itemRanges.forEach(({ start: itemStart, end: itemEnd, item, idx }) => {
      // If the match overlaps this item
      const overlapStart = Math.max(start, itemStart)
      const overlapEnd = Math.min(end, itemEnd)
      if (overlapStart < overlapEnd) {
        // Calculate substring indices within this item
        const localStart = overlapStart - itemStart
        const localLength = overlapEnd - overlapStart

        // PDF.js transform: [a, b, c, d, e, f]
        const [a, b, c, d, e, f] = item.transform
        const fontSize = Math.abs(a)
        const scale = viewport.scale || 1
        const left = e * scale
        const top = viewport.height - (f * scale)
        const totalWidth = (item.width || (item.str.length * fontSize)) * scale
        const matchLeft = left + totalWidth * (localStart / item.str.length)
        const matchWidth = totalWidth * (localLength / item.str.length)

        overlays.push(
          <span
            key={`${jIdx}-${idx}-${localStart}`}
            style={{
              position: 'absolute',
              left: matchLeft,
              top: top - fontSize * scale,
              width: matchWidth,
              height: fontSize * scale,
              fontSize: fontSize * scale,
              fontFamily: (item.fontName || '') as string,
              background: 'rgba(255,255,0,0.2)',
              borderRadius: 3,
              padding: '0 2px',
              pointerEvents: 'auto',
              zIndex: 20,
              whiteSpace: 'pre',
              color: 'inherit',
              boxSizing: 'border-box',
              maxWidth: 'none',
            }}
          >
            <WordDefinition definition={explanation}>
              {'\u00A0'.repeat(localLength)}
            </WordDefinition>
          </span>
        )
      }
    })
  })

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: viewport.width,
        height: viewport.height,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {overlays}
    </div>
  )
}

export default TextLayer


