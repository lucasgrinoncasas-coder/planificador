import React, { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { addDaysISO, formatDurationMinutes, formatShort, getWeekGrid, todayISO } from '../lib/dateUtils'
import { planDay, suggestGoalSlots, getUnmetGoalsForWeek, type ScheduleBlock } from '../lib/scheduler'
import { typeColorVar } from '../components/common/TypeChip'
import { Modal } from '../components/common/Modal'
import { StudyPlanForm } from '../components/forms/StudyPlanForm'
import { makeId } from '../lib/id'
import type { EventItem, TaskItem } from '../types'

function BlockRow({ block }: { block: ScheduleBlock }) {
  const color = block.type === 'event' || block.type === 'task' ? typeColorVar((block.itemType as any) ?? 'otro') : 'var(--border)'
  return (
    <div className="timeline-item">
      <div className="timeline-time">
        {block.start}
        <br />
        {block.end}
      </div>
      <div className="timeline-bar" style={{ background: color }} />
      <div className={`timeline-content${block.type === 'free' ? ' free' : ''}`}>
        <div style={{ fontWeight: block.type === 'free' ? 400 : 700 }}>{block.title}</div>
      </div>
    </div>
  )
}

export function PlanScreen() {
  const { data, addTasks } = useData()
  const [date, setDate] = useState(todayISO())
  const [planned, setPlanned] = useState<ReturnType<typeof planDay> | null>(null)
  const [studyEvent, setStudyEvent] = useState<EventItem | null>(null)

  const examEvents = useMemo(
    () => data.events.filter((e) => (e.type === 'examen' || e.type === 'entrega') && e.date >= todayISO()).sort((a, b) => (a.date < b.date ? -1 : 1)),
    [data.events]
  )

  const weekDates = getWeekGrid(todayISO())
  const unmetGoals = getUnmetGoalsForWeek(data, weekDates)

  const handleOrganize = () => {
    setPlanned(planDay(data, date))
  }

  const acceptGoalSuggestions = (goalId: string) => {
    const g = data.goals.find((x) => x.id === goalId)
    if (!g) return
    const met = unmetGoals.find((u) => u.goal.id === goalId)
    const suggestions = suggestGoalSlots(data, g, weekDates, met ? met.sessionsSoFar : g.timesPerWeek)
    if (suggestions.length === 0) return
    const tasks: TaskItem[] = suggestions.map((s) => ({
      id: makeId(),
      kind: 'task',
      title: g.title,
      category: g.category,
      estimatedMinutes: g.sessionDurationMinutes,
      priority: 2,
      status: 'pendiente',
      scheduledDate: s.date,
      scheduledStart: s.start,
      scheduledEnd: s.end,
      goalId: g.id,
      createdAt: new Date().toISOString(),
    }))
    addTasks(tasks)
  }

  return (
    <div>
      <div className="topbar" style={{ position: 'static', padding: 0, marginBottom: 12 }}>
        <h1>Planificar</h1>
      </div>

      <div className="section-title">Organizar mi día</div>
      <div className="card">
        <div className="wrap-chips" style={{ marginBottom: 12 }}>
          <button className={`pill-btn${date === todayISO() ? ' selected' : ''}`} onClick={() => setDate(todayISO())}>
            Hoy
          </button>
          <button className={`pill-btn${date === addDaysISO(todayISO(), 1) ? ' selected' : ''}`} onClick={() => setDate(addDaysISO(todayISO(), 1))}>
            Mañana
          </button>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ flex: 1, minWidth: 140 }} />
        </div>
        <button className="btn btn-primary" onClick={handleOrganize}>
          Organizar {formatShort(date)}
        </button>
      </div>

      {planned && (
        <div style={{ marginTop: 16 }}>
          <div className="list-gap">
            {planned.blocks.map((b, i) => (
              <BlockRow key={i} block={b} />
            ))}
          </div>
          {planned.unplaced.length > 0 && (
            <div className="warning-box" style={{ marginTop: 12 }}>
              {planned.unplaced.map((u, i) => (
                <div key={i}>{u.reason}</div>
              ))}
            </div>
          )}
          <div className="muted" style={{ marginTop: 8, fontSize: '0.85rem' }}>
            Tiempo libre restante: {formatDurationMinutes(planned.freeMinutesLeft)}
          </div>
        </div>
      )}

      <div className="section-title">📚 Planificar estudio para un examen o entrega</div>
      {examEvents.length === 0 ? (
        <div className="empty-state">No tienes exámenes o entregas próximas. Créalos desde el calendario.</div>
      ) : (
        <div className="list-gap">
          {examEvents.map((e) => (
            <button key={e.id} className="card" style={{ width: '100%', textAlign: 'left', border: 'none' }} onClick={() => setStudyEvent(e)}>
              <div style={{ fontWeight: 700 }}>{e.title}</div>
              <div className="muted" style={{ fontSize: '0.8rem' }}>{formatShort(e.date)}</div>
            </button>
          ))}
        </div>
      )}

      <div className="section-title">🏃 Objetivos: huecos disponibles esta semana</div>
      {unmetGoals.length === 0 ? (
        <div className="empty-state">Todos tus objetivos van al día esta semana.</div>
      ) : (
        <div className="list-gap">
          {unmetGoals.map(({ goal, sessionsSoFar, needed }) => {
            const suggestions = suggestGoalSlots(data, goal, weekDates, sessionsSoFar)
            return (
              <div key={goal.id} className="card">
                <div style={{ fontWeight: 700 }}>{goal.title}</div>
                <div className="muted" style={{ fontSize: '0.8rem', marginBottom: 8 }}>
                  Faltan {needed} sesión(es) esta semana
                </div>
                {suggestions.length === 0 ? (
                  <div className="muted" style={{ fontSize: '0.85rem' }}>No se han encontrado huecos libres esta semana.</div>
                ) : (
                  <>
                    <div className="wrap-chips" style={{ marginBottom: 10 }}>
                      {suggestions.map((s, i) => (
                        <span key={i} className="chip">
                          {formatShort(s.date)} {s.start}
                        </span>
                      ))}
                    </div>
                    <button className="btn btn-secondary btn-small" onClick={() => acceptGoalSuggestions(goal.id)}>
                      Aceptar propuesta
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {studyEvent && (
        <Modal title={`Estudio para "${studyEvent.title}"`} onClose={() => setStudyEvent(null)}>
          <StudyPlanForm event={studyEvent} onDone={() => setStudyEvent(null)} />
        </Modal>
      )}
    </div>
  )
}
