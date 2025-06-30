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
            position: 'fixed',
            top: tooltip.y,
            left: tooltip.x,
            background: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            maxWidth: 240,
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          {tooltip.content}
        </div>
      )}
    </span>
  )
}

export default WordDefinition