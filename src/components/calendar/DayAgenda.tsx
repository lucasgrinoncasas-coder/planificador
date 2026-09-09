import React from 'react'
import type { AppData, EventItem, TaskItem } from '../../types'
import { getEventsForDate } from '../../lib/availability'
import { formatDurationMinutes, timeToMinutes } from '../../lib/dateUtils'
import { typeColorVar, typeInfo } from '../common/TypeChip'

interface AgendaEntry {
  key: string
  time: string
  timeSort: number
  title: string
  subtitle?: string
  color: string
  onClick: () => void
}

export function DayAgenda({
  data,
  dateISO,
  onEditEvent,
  onEditTask,
}: {
  data: AppData
  dateISO: string
  onEditEvent: (e: EventItem) => void
  onEditTask: (t: TaskItem) => void
}) {
  const events = getEventsForDate(data.events, dateISO)
  const tasks = data.tasks.filter((t) => t.scheduledDate === dateISO)

  const entries: AgendaEntry[] = [
    ...events.map((e) => ({
      key: `e-${e.id}`,
      time: e.startTime ?? 'Todo el día',
      timeSort: e.startTime ? timeToMinutes(e.startTime) : -1,
      title: e.title,
      subtitle: [e.startTime && e.endTime ? `${e.startTime}-${e.endTime}` : undefined, e.location].filter(Boolean).join(' · '),
      color: typeColorVar(e.type),
      onClick: () => onEditEvent(e),
    })),
    ...tasks.map((t) => ({
      key: `t-${t.id}`,
      time: t.scheduledStart ?? 'Sin hora',
      timeSort: t.scheduledStart ? timeToMinutes(t.scheduledStart) : 1440,
      title: t.title,
      subtitle: `${formatDurationMinutes(t.estimatedMinutes)}${t.status === 'completada' ? ' · Completada' : ''}`,
      color: typeColorVar(t.category),
      onClick: () => onEditTask(t),
    })),
  ].sort((a, b) => a.timeSort - b.timeSort)

  if (entries.length === 0) {
    return <div className="empty-state">Nada planeado este día.</div>
  }

  return (
    <div className="list-gap">
      {entries.map((entry) => (
        <button
          key={entry.key}
          className="card"
          style={{ display: 'flex', gap: 12, width: '100%', textAlign: 'left', border: 'none', alignItems: 'center' }}
          onClick={entry.onClick}
        >
          <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, background: entry.color }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{entry.title}</div>
            {entry.subtitle && (
              <div className="muted" style={{ fontSize: '0.78rem' }}>
                {entry.subtitle}
              </div>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right', minWidth: 44 }}>{entry.time}</div>
        </button>
      ))}
    </div>
  )
}

export function dayDots(data: AppData, dateISO: string): string[] {
  const events = getEventsForDate(data.events, dateISO)
  const tasks = data.tasks.filter((t) => t.scheduledDate === dateISO)
  const types = new Set<string>()
  events.forEach((e) => types.add(typeInfo(e.type).value))
  tasks.forEach((t) => types.add(typeInfo(t.category).value))
  return Array.from(types).slice(0, 4).map((t) => `var(--c-${t})`)
}
