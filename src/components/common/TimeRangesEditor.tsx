import React, { useState } from 'react'
import type { TimeRange } from '../../types'

export function TimeRangesEditor({ ranges, onChange }: { ranges: TimeRange[]; onChange: (r: TimeRange[]) => void }) {
  const [newStart, setNewStart] = useState('16:00')
  const [newEnd, setNewEnd] = useState('20:00')

  const addRange = () => {
    if (newStart >= newEnd) return
    onChange([...ranges, { start: newStart, end: newEnd }].sort((a, b) => a.start.localeCompare(b.start)))
  }

  const removeRange = (idx: number) => onChange(ranges.filter((_, i) => i !== idx))

  return (
    <div>
      <div className="wrap-chips" style={{ marginBottom: ranges.length ? 8 : 0 }}>
        {ranges.map((r, i) => (
          <span key={i} className="chip">
            {r.start}-{r.end}
            <button
              type="button"
              onClick={() => removeRange(i)}
              style={{ border: 'none', background: 'none', color: 'var(--danger)', marginLeft: 4, cursor: 'pointer' }}
            >
              ✕
            </button>
          </span>
        ))}
        {ranges.length === 0 && <span className="muted" style={{ fontSize: '0.82rem' }}>Sin disponibilidad</span>}
      </div>
      <div className="row" style={{ alignItems: 'center' }}>
        <input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
        <input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
        <button type="button" className="btn btn-secondary btn-small" onClick={addRange}>
          Añadir
        </button>
      </div>
    </div>
  )
}
