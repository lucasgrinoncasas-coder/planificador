import React, { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { capitalize, formatDurationMinutes, formatLong, todayISO } from '../lib/dateUtils'
import { getEventsForDate, getFreeMinutesForDate } from '../lib/availability'
import { getUnmetGoalsForWeek } from '../lib/scheduler'
import { getWeekGrid } from '../lib/dateUtils'
import { TypeChip } from '../components/common/TypeChip'
import type { EventItem, TaskItem } from '../types'
import { Modal } from '../components/common/Modal'
import { EventForm } from '../components/forms/EventForm'
import { TaskForm } from '../components/forms/TaskForm'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export function TodayScreen({ onNavigatePlan }: { onNavigatePlan: () => void }) {
  const { data, updateTask, markNotificationsRead } = useData()
  const today = todayISO()
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null)

  const events = useMemo(
    () => getEventsForDate(data.events, today).sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? '')),
    [data.events, today]
  )
  const studyTasks = data.tasks.filter((t) => t.scheduledDate === today && t.category === 'estudio' && t.status !== 'completada')
  const otherTasks = data.tasks.filter((t) => t.scheduledDate === today && t.category !== 'estudio' && t.status !== 'completada')
  const freeMinutes = getFreeMinutesForDate(data, today)

  const weekDates = getWeekGrid(today)
  const unmetGoals = getUnmetGoalsForWeek(data, weekDates)

  const importantNotifications = data.notificationLog.slice(0, 6)

  return (
    <div>
      <div className="topbar" style={{ position: 'static', padding: 0, marginBottom: 4 }}>
        <div>
          <div className="muted" style={{ fontSize: '0.85rem' }}>
            {greeting()}
          </div>
          <h1>{capitalize(formatLong(today))}</h1>
        </div>
      </div>

      {importantNotifications.length > 0 && (
        <>
          <div className="section-title">⚠️ Cosas importantes</div>
          <div className="list-gap">
            {importantNotifications.map((n) => (
              <div key={n.id} className="card" style={{ fontSize: '0.88rem' }}>
                {n.message}
              </div>
            ))}
          </div>
          {data.notificationLog.some((n) => !n.read) && (
            <button className="link-btn" style={{ marginTop: 8 }} onClick={markNotificationsRead}>
              Marcar como leídas
            </button>
          )}
        </>
      )}

      <div className="section-title">📅 Eventos de hoy</div>
      {events.length === 0 ? (
        <div className="empty-state">Sin eventos hoy.</div>
      ) : (
        <div className="list-gap">
          {events.map((e) => (
            <button key={e.id} className="card" style={{ width: '100%', textAlign: 'left', border: 'none' }} onClick={() => setEditingEvent(e)}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{e.title}</div>
                  <div className="muted" style={{ fontSize: '0.8rem' }}>
                    {e.startTime ? `${e.startTime}${e.endTime ? ` - ${e.endTime}` : ''}` : 'Todo el día'}
                    {e.location ? ` · ${e.location}` : ''}
                  </div>
                </div>
                <TypeChip type={e.type} />
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="section-title">📚 Cosas que estudiar</div>
      {studyTasks.length === 0 ? (
        <div className="empty-state">No tienes estudio planificado para hoy.</div>
      ) : (
        <div className="list-gap">
          {studyTasks.map((t) => (
            <button key={t.id} className="card" style={{ width: '100%', textAlign: 'left', border: 'none' }} onClick={() => setEditingTask(t)}>
              <div style={{ fontWeight: 700 }}>{t.title}</div>
              <div className="muted" style={{ fontSize: '0.8rem' }}>{formatDurationMinutes(t.estimatedMinutes)}</div>
            </button>
          ))}
        </div>
      )}

      <div className="section-title">✅ Tareas pendientes</div>
      {otherTasks.length === 0 ? (
        <div className="empty-state">No tienes tareas para hoy.</div>
      ) : (
        <div className="list-gap">
          {otherTasks.map((t) => (
            <div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button style={{ border: 'none', background: 'none', textAlign: 'left', flex: 1, padding: 0 }} onClick={() => setEditingTask(t)}>
                <div style={{ fontWeight: 700 }}>{t.title}</div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>{formatDurationMinutes(t.estimatedMinutes)}</div>
              </button>
              <button className="btn btn-secondary btn-small" onClick={() => updateTask(t.id, { status: 'completada' })}>
                ✅
              </button>
            </div>
          ))}
        </div>
      )}

      {unmetGoals.length > 0 && (
        <>
          <div className="section-title">🏃 Objetivos de la semana</div>
          <div className="list-gap">
            {unmetGoals.map(({ goal, sessionsSoFar, needed }) => (
              <div key={goal.id} className="card">
                <div style={{ fontWeight: 700 }}>{goal.title}</div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>
                  {sessionsSoFar} de {goal.timesPerWeek} esta semana · faltan {needed}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="card" style={{ marginTop: 22, textAlign: 'center' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Te quedan {formatDurationMinutes(freeMinutes)} libres hoy</div>
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={onNavigatePlan}>
          Organizar mi día
        </button>
      </div>

      {editingEvent && (
        <Modal title="Editar evento" onClose={() => setEditingEvent(null)}>
          <EventForm
            initial={editingEvent}
            occurrenceDate={today}
            onSaved={() => setEditingEvent(null)}
            onCancel={() => setEditingEvent(null)}
            onDelete={() => setEditingEvent(null)}
          />
        </Modal>
      )}
      {editingTask && (
        <Modal title="Editar tarea" onClose={() => setEditingTask(null)}>
          <TaskForm initial={editingTask} onSaved={() => setEditingTask(null)} onCancel={() => setEditingTask(null)} />
        </Modal>
      )}
    </div>
  )
}
