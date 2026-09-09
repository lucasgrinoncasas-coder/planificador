import React, { useMemo, useState } from 'react'
import type { EventItem } from '../../types'
import { useData } from '../../context/DataContext'
import { buildStudyPlan } from '../../lib/scheduler'
import { formatDurationMinutes, formatShort } from '../../lib/dateUtils'

export function StudyPlanForm({ event, onDone }: { event: EventItem; onDone: () => void }) {
  const { data, addTasks, removeTasksLinkedTo } = useData()
  const [hours, setHours] = useState(12)
  const [confirmed, setConfirmed] = useState(false)

  const preview = useMemo(() => buildStudyPlan(data, { event, totalHours: hours }), [data, event, hours])

  const handleConfirm = () => {
    removeTasksLinkedTo(event.id)
    addTasks(preview.tasks)
    setConfirmed(true)
  }

  if (confirmed) {
    return (
      <div>
        <p style={{ marginBottom: 16 }}>
          ✅ Se han creado {preview.tasks.length} sesiones de estudio repartidas hasta el {formatShort(event.date)}.
        </p>
        <button className="btn btn-primary" onClick={onDone}>
          Listo
        </button>
      </div>
    )
  }

  return (
    <div>
      <p className="muted" style={{ marginBottom: 14 }}>
        ¿Cuántas horas quieres estudiar en total antes de <strong>{event.title}</strong> ({formatShort(event.date)})?
      </p>
      <div className="field">
        <label>Horas totales</label>
        <div className="wrap-chips">
          {[4, 6, 8, 10, 12, 16, 20].map((h) => (
            <button type="button" key={h} className={`pill-btn${hours === h ? ' selected' : ''}`} onClick={() => setHours(h)}>
              {h} h
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value) || 0)}
          style={{ marginTop: 10 }}
        />
      </div>

      {preview.warning && <div className="warning-box" style={{ marginBottom: 14 }}>{preview.warning}</div>}

      {preview.tasks.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Reparto propuesto</div>
          <div className="list-gap">
            {preview.tasks.map((t) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span>{formatShort(t.scheduledDate!)}</span>
                <span className="muted">{formatDurationMinutes(t.estimatedMinutes)}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: '0.85rem' }} className="muted">
            Total repartido: {formatDurationMinutes(preview.tasks.reduce((s, t) => s + t.estimatedMinutes, 0))}
          </div>
        </div>
      )}

      <button className="btn btn-primary" onClick={handleConfirm} disabled={preview.tasks.length === 0}>
        Confirmar plan de estudio
      </button>
    </div>
  )
}
