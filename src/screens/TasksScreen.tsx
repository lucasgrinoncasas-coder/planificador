import React, { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import type { TaskItem, TaskStatus } from '../types'
import { Modal } from '../components/common/Modal'
import { TaskForm } from '../components/forms/TaskForm'
import { TypeChip, ImportanceChip } from '../components/common/TypeChip'
import { findNextAvailableSlot, weekdayName } from '../lib/scheduler'
import { formatDurationMinutes, formatShort } from '../lib/dateUtils'

type Filter = 'pendiente' | 'en_progreso' | 'completada' | 'todas'

export function TasksScreen() {
  const { data, updateTask } = useData()
  const [filter, setFilter] = useState<Filter>('pendiente')
  const [editing, setEditing] = useState<TaskItem | null>(null)
  const [creating, setCreating] = useState(false)
  const [reorganizing, setReorganizing] = useState<{ task: TaskItem; suggestion: ReturnType<typeof findNextAvailableSlot> } | null>(null)

  const tasks = useMemo(() => {
    let list = data.tasks
    if (filter !== 'todas') list = list.filter((t) => t.status === filter)
    return [...list].sort((a, b) => {
      const ad = a.dueDate ?? a.scheduledDate ?? '9999'
      const bd = b.dueDate ?? b.scheduledDate ?? '9999'
      if (ad !== bd) return ad < bd ? -1 : 1
      return b.priority - a.priority
    })
  }, [data.tasks, filter])

  const setStatus = (task: TaskItem, status: TaskStatus) => {
    updateTask(task.id, { status })
    if (status === 'no_hecha') {
      const suggestion = findNextAvailableSlot(data, task)
      setReorganizing({ task, suggestion })
    }
  }

  const acceptReorganize = () => {
    if (!reorganizing?.suggestion) return
    const { task, suggestion } = reorganizing
    updateTask(task.id, {
      status: 'pendiente',
      scheduledDate: suggestion.date,
      scheduledStart: suggestion.start,
      scheduledEnd: suggestion.end,
    })
    setReorganizing(null)
  }

  return (
    <div>
      <div className="topbar" style={{ position: 'static', padding: 0, marginBottom: 12 }}>
        <h1>Tareas</h1>
        <button className="icon-btn" onClick={() => setCreating(true)} aria-label="Añadir tarea">
          +
        </button>
      </div>

      <div className="top-tabs">
        {(
          [
            ['pendiente', 'Pendientes'],
            ['en_progreso', 'En progreso'],
            ['completada', 'Completadas'],
            ['todas', 'Todas'],
          ] as [Filter, string][]
        ).map(([v, label]) => (
          <button key={v} className={`pill-btn${filter === v ? ' selected' : ''}`} onClick={() => setFilter(v)}>
            {label}
          </button>
        ))}
      </div>

      {tasks.length === 0 && <div className="empty-state">No hay tareas aquí.</div>}

      <div className="list-gap">
        {tasks.map((task) => (
          <div key={task.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <button
                style={{ textAlign: 'left', border: 'none', background: 'none', flex: 1, padding: 0 }}
                onClick={() => setEditing(task)}
              >
                <div style={{ fontWeight: 700, textDecoration: task.status === 'completada' ? 'line-through' : undefined }}>
                  {task.title}
                </div>
                <div className="wrap-chips" style={{ marginTop: 6 }}>
                  <TypeChip type={task.category} />
                  <ImportanceChip importance={task.priority} />
                  <span className="chip">{formatDurationMinutes(task.estimatedMinutes)}</span>
                  {task.dueDate && <span className="chip">Límite: {formatShort(task.dueDate)}</span>}
                  {task.scheduledDate && <span className="chip">📅 {weekdayName(task.scheduledDate)} {formatShort(task.scheduledDate)}</span>}
                </div>
              </button>
            </div>
            {task.status !== 'completada' && (
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn btn-secondary btn-small" onClick={() => setStatus(task, 'completada')}>
                  ✅ Hecho
                </button>
                {task.status !== 'en_progreso' && (
                  <button className="btn btn-secondary btn-small" onClick={() => setStatus(task, 'en_progreso')}>
                    ▶ En progreso
                  </button>
                )}
                <button className="btn btn-secondary btn-small" onClick={() => setStatus(task, 'no_hecha')}>
                  ✕ No lo he hecho
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {creating && (
        <Modal title="Nueva tarea" onClose={() => setCreating(false)}>
          <TaskForm onSaved={() => setCreating(false)} onCancel={() => setCreating(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar tarea" onClose={() => setEditing(null)}>
          <TaskForm initial={editing} onSaved={() => setEditing(null)} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {reorganizing && (
        <Modal title="Reorganizar tarea" onClose={() => setReorganizing(null)}>
          <p style={{ marginBottom: 16 }}>
            Marcaste <strong>{reorganizing.task.title}</strong> como no hecha.
            {reorganizing.suggestion ? (
              <>
                {' '}
                ¿Quieres moverla al siguiente hueco disponible: <strong>{weekdayName(reorganizing.suggestion.date)} {formatShort(reorganizing.suggestion.date)} {reorganizing.suggestion.start}-{reorganizing.suggestion.end}</strong>?
              </>
            ) : (
              ' No se ha encontrado ningún hueco libre disponible en las próximas semanas.'
            )}
          </p>
          <div className="row">
            {reorganizing.suggestion && (
              <button className="btn btn-primary" onClick={acceptReorganize}>
                Sí, mover
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => setReorganizing(null)}>
              No, dejar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
