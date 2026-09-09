import React from 'react'
import { Modal } from './Modal'

export type QuickAddChoice = 'evento' | 'tarea' | 'examen' | 'entrega' | 'objetivo'

const OPTIONS: { value: QuickAddChoice; label: string; emoji: string; desc: string }[] = [
  { value: 'evento', label: 'Evento', emoji: '🗓️', desc: 'Algo con fecha y hora' },
  { value: 'tarea', label: 'Tarea', emoji: '✅', desc: 'Algo por hacer, sin hora fija' },
  { value: 'examen', label: 'Examen', emoji: '📝', desc: 'Con opción de plan de estudio' },
  { value: 'entrega', label: 'Entrega', emoji: '📤', desc: 'Fecha límite de una entrega' },
  { value: 'objetivo', label: 'Objetivo', emoji: '🏃', desc: 'Algo recurrente cada semana' },
]

export function QuickAddMenu({ onClose, onChoose }: { onClose: () => void; onChoose: (c: QuickAddChoice) => void }) {
  return (
    <Modal title="Añadir" onClose={onClose}>
      <div className="list-gap">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className="card"
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', border: 'none' }}
            onClick={() => onChoose(opt.value)}
          >
            <span style={{ fontSize: '1.6rem' }}>{opt.emoji}</span>
            <span>
              <div style={{ fontWeight: 700 }}>{opt.label}</div>
              <div className="muted" style={{ fontSize: '0.8rem' }}>
                {opt.desc}
              </div>
            </span>
          </button>
        ))}
      </div>
    </Modal>
  )
}
