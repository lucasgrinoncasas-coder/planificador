import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import { TimeRangesEditor } from '../components/common/TimeRangesEditor'
import { todayISO } from '../lib/dateUtils'
import type { TimeRange } from '../types'

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function AvailabilityScreen({ onBack }: { onBack: () => void }) {
  const { data, setAvailabilityTemplate, setAvailabilityOverride, removeAvailabilityOverride } = useData()
  const [overrideDate, setOverrideDate] = useState(todayISO())

  const updateDay = (weekday: number, ranges: TimeRange[]) => {
    setAvailabilityTemplate({ ...data.availabilityTemplate, [weekday]: ranges })
  }

  const currentOverride = data.availabilityOverrides.find((o) => o.date === overrideDate)

  return (
    <div>
      <div className="topbar" style={{ position: 'static', padding: 0, marginBottom: 12 }}>
        <button className="link-btn" onClick={onBack}>
          ‹ Más
        </button>
      </div>
      <h1 style={{ marginBottom: 16 }}>Disponibilidad</h1>

      <div className="section-title">Horario semanal habitual</div>
      <div className="list-gap">
        {WEEKDAYS.map((name, idx) => (
          <div key={idx} className="card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{name}</div>
            <TimeRangesEditor ranges={data.availabilityTemplate[idx] ?? []} onChange={(r) => updateDay(idx, r)} />
          </div>
        ))}
      </div>

      <div className="section-title">Excepciones por fecha</div>
      <div className="card">
        <div className="field">
          <label>Fecha</label>
          <input type="date" value={overrideDate} onChange={(e) => setOverrideDate(e.target.value)} />
        </div>
        <div className="wrap-chips" style={{ marginBottom: 12 }}>
          <button className="pill-btn" onClick={() => setAvailabilityOverride({ date: overrideDate, blocks: [] })}>
            Marcar como no disponible
          </button>
          <button className="pill-btn" onClick={() => setAvailabilityOverride({ date: overrideDate, blocks: [{ start: '00:00', end: '23:59' }] })}>
            Día libre completo
          </button>
          {currentOverride && (
            <button className="pill-btn" onClick={() => removeAvailabilityOverride(overrideDate)}>
              Quitar excepción
            </button>
          )}
        </div>
        {currentOverride ? (
          <TimeRangesEditor
            ranges={currentOverride.blocks}
            onChange={(r) => setAvailabilityOverride({ date: overrideDate, blocks: r })}
          />
        ) : (
          <div className="muted" style={{ fontSize: '0.85rem' }}>
            Este día usa el horario habitual. Añade un rango para crear una excepción personalizada.
          </div>
        )}
      </div>

      {data.availabilityOverrides.length > 0 && (
        <>
          <div className="section-title">Excepciones guardadas</div>
          <div className="list-gap">
            {data.availabilityOverrides
              .sort((a, b) => (a.date < b.date ? -1 : 1))
              .map((o) => (
                <div key={o.date} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{o.date}</div>
                    <div className="muted" style={{ fontSize: '0.8rem' }}>
                      {o.blocks.length === 0 ? 'No disponible' : o.blocks.map((b) => `${b.start}-${b.end}`).join(', ')}
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-small" onClick={() => removeAvailabilityOverride(o.date)}>
                    Quitar
                  </button>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
}
