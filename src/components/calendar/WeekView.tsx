import React from 'react'
import type { AppData } from '../../types'
import { capitalize, formatWeekdayShort, getWeekGrid, isSameDayISO, todayISO } from '../../lib/dateUtils'
import { dayDots } from './DayAgenda'

export function WeekView({
  data,
  anchor,
  selected,
  onSelect,
}: {
  data: AppData
  anchor: string
  selected: string
  onSelect: (d: string) => void
}) {
  const grid = getWeekGrid(anchor)
  const today = todayISO()

  return (
    <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
      {grid.map((d) => {
        const dots = dayDots(data, d)
        const dayNum = Number(d.slice(8, 10))
        const isSel = isSameDayISO(d, selected)
        return (
          <button
            key={d}
            onClick={() => onSelect(d)}
            className="card"
            style={{
              flex: '1 1 12%',
              minWidth: 40,
              textAlign: 'center',
              border: isSameDayISO(d, today) ? '2px solid var(--primary)' : undefined,
              background: isSel ? 'var(--surface-2)' : undefined,
              padding: '10px 4px',
            }}
          >
            <div className="muted" style={{ fontSize: '0.68rem' }}>
              {capitalize(formatWeekdayShort(d))}
            </div>
            <div style={{ fontWeight: 700, margin: '4px 0' }}>{dayNum}</div>
            <div className="calendar-dot-row" style={{ justifyContent: 'center' }}>
              {dots.map((c, i) => (
                <span key={i} className="calendar-dot" style={{ background: c }} />
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}
