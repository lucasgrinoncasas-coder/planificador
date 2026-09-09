import React from 'react'
import type { AppData } from '../../types'
import { getMonthGrid, isSameDayISO, isSameMonthISO, todayISO } from '../../lib/dateUtils'
import { dayDots } from './DayAgenda'

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function MonthView({
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
  const grid = getMonthGrid(anchor)
  const today = todayISO()

  return (
    <div>
      <div className="weekday-header">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {grid.map((d) => {
          const dots = dayDots(data, d)
          const dayNum = Number(d.slice(8, 10))
          const classes = [
            'calendar-cell',
            !isSameMonthISO(d, anchor) ? 'faded' : '',
            isSameDayISO(d, today) ? 'today' : '',
            isSameDayISO(d, selected) ? 'selected' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button key={d} className={classes} onClick={() => onSelect(d)} style={{ cursor: 'pointer' }}>
              <span style={{ fontWeight: 600 }}>{dayNum}</span>
              <div className="calendar-dot-row">
                {dots.map((c, i) => (
                  <span key={i} className="calendar-dot" style={{ background: c }} />
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
