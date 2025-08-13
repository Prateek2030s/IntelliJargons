//pop-out window carrying the definitions
import React, { useState, useRef, useEffect } from 'react'

interface WordDefinitionProps {
  children: string
  definition: string
}

interface TooltipState {
  visible: boolean
  content: string
  x: number
  y: number
}

const WordDefinition: React.FC<WordDefinitionProps> = ({
  children,
  definition
}) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    content: definition,
    x: 0,
    y: 0
  })

  const timeoutRef = useRef<number | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const showTooltip = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
    }

    // position next to cursor
    const x = e.clientX
    const y = e.clientY - 40

    setTooltip({
      visible: true,
      content: definition,
      x,
      y
    })
  }

  const hideTooltip = () => {
    timeoutRef.current = window.setTimeout(() => {
      setTooltip(t => ({ ...t, visible: false }))
    }, 100)
  }

  return (
    <span
      style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {tooltip.visible && (
        <div
          ref={tooltipRef}
          style={{
              position: 'absolute',
              zIndex: 100,
              background: '#f9eca8ff',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '8px 12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              whiteSpace: 'normal', // allow wrapping
              minWidth: 120,        // optional: minimum width
              maxWidth: 320,        // optional: maximum width
              wordBreak: 'break-word', // allow long words to wrap
          }}
        >
          {tooltip.content}
        </div>
      )}
    </span>
  )
}


export default WordDefinition
