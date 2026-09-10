import React, { useState } from 'react'
import { createPortal } from 'react-dom'

const CLOSE_ANIM_MS = 190

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const [closing, setClosing] = useState(false)

  const requestClose = () => {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, CLOSE_ANIM_MS)
  }

  return createPortal(
    <div className={`modal-backdrop${closing ? ' closing' : ''}`} onClick={requestClose}>
      <div className={`modal-sheet${closing ? ' closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={requestClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
