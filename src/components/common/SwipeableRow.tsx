import React, { useRef, useState } from 'react'

const THRESHOLD = 84
const MAX_DRAG = 112

export function SwipeableRow({
  onComplete,
  disabled,
  children,
}: {
  onComplete: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const movedRef = useRef(false)

  if (disabled) return <>{children}</>

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    startRef.current = { x: e.clientX, y: e.clientY }
    movedRef.current = false
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startRef.current) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    if (!dragging) {
      if (Math.abs(dx) < 8) return
      if (Math.abs(dy) > Math.abs(dx)) {
        startRef.current = null
        return
      }
      setDragging(true)
      movedRef.current = true
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
    }
    if (dx <= 0) {
      setDragX(0)
      return
    }
    setDragX(Math.min(dx, MAX_DRAG))
  }

  const finish = () => {
    if (!startRef.current && !dragging) return
    startRef.current = null
    if (dragging && dragX >= THRESHOLD) {
      setDragging(false)
      setDragX(2000)
      setTimeout(onComplete, 190)
    } else {
      setDragging(false)
      setDragX(0)
    }
  }

  const progress = Math.min(1, dragX / THRESHOLD)

  return (
    <div className="swipe-row" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={finish} onPointerCancel={finish}>
      <div className="swipe-row-back" style={{ opacity: progress }}>
        <span style={{ display: 'inline-block', transform: `scale(${0.6 + 0.4 * progress})`, transition: dragging ? 'none' : 'transform 200ms' }}>
          ✓ Completar
        </span>
      </div>
      <div
        className="swipe-row-content"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? 'none' : 'transform 220ms cubic-bezier(.2,.8,.2,1)',
        }}
        onClickCapture={(e) => {
          if (movedRef.current) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        {children}
      </div>
    </div>
  )
}
