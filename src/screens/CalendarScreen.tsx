import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import { MonthView } from '../components/calendar/MonthView'
import { WeekView } from '../components/calendar/WeekView'
import { DayAgenda } from '../components/calendar/DayAgenda'
import { addDaysISO, addMonthsISO, capitalize, formatLong, todayISO } from '../lib/dateUtils'
import type { EventItem, TaskItem } from '../types'
import { Modal } from '../components/common/Modal'
import { EventForm } from '../components/forms/EventForm'
import { TaskForm } from '../components/forms/TaskForm'

type ViewMode = 'mes' | 'semana' | 'dia'

export function CalendarScreen() {
  const { data } = useData()
  const [view, setView] = useState<ViewMode>('mes')
  const [selected, setSelected] = useState(todayISO())
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null)
  const [creatingEvent, setCreatingEvent] = useState(false)

  const goPrev = () => setSelected((s) => (view === 'mes' ? addMonthsISO(s, -1) : addDaysISO(s, view === 'semana' ? -7 : -1)))
  const goNext = () => setSelected((s) => (view === 'mes' ? addMonthsISO(s, 1) : addDaysISO(s, view === 'semana' ? 7 : 1)))
  const goToday = () => setSelected(todayISO())

  return (
    <div>
      <div className="topbar" style={{ position: 'static', padding: 0, marginBottom: 12 }}>
        <h1>Calendario</h1>
        <button className="icon-btn" onClick={() => setCreatingEvent(true)} aria-label="Añadir evento">
          +
        </button>
      </div>

      <div className="top-tabs">
        {(
          [
            ['mes', 'Mes'],
            ['semana', 'Semana'],
            ['dia', 'Día'],
          ] as [ViewMode, string][]
        ).map(([v, label]) => (
          <button key={v} className={`pill-btn${view === v ? ' selected' : ''}`} onClick={() => setView(v)}>
            {label}
          </button>
        ))}
        <button className="pill-btn" onClick={goToday}>
          Hoy
        </button>
      </div>

      <div className="row" style={{ alignItems: 'center', marginBottom: 12 }}>
        <button className="icon-btn" onClick={goPrev} aria-label="Anterior" style={{ flex: 'none' }}>
          ‹
        </button>
        <div style={{ textAlign: 'center', fontWeight: 700 }}>{capitalize(formatLong(selected))}</div>
        <button className="icon-btn" onClick={goNext} aria-label="Siguiente" style={{ flex: 'none' }}>
          ›
        </button>
      </div>

      {view === 'mes' && <MonthView data={data} anchor={selected} selected={selected} onSelect={setSelected} />}
      {view === 'semana' && <WeekView data={data} anchor={selected} selected={selected} onSelect={setSelected} />}

      <div className="section-title">Agenda del día</div>
      <DayAgenda data={data} dateISO={selected} onEditEvent={setEditingEvent} onEditTask={setEditingTask} />

      {creatingEvent && (
        <Modal title="Nuevo evento" onClose={() => setCreatingEvent(false)}>
          <EventForm
            initialDate={selected}
            onSaved={() => setCreatingEvent(false)}
            onCancel={() => setCreatingEvent(false)}
          />
        </Modal>
      )}

      {editingEvent && (
        <Modal title="Editar evento" onClose={() => setEditingEvent(null)}>
          <EventForm initial={editingEvent} onSaved={() => setEditingEvent(null)} onCancel={() => setEditingEvent(null)} onDelete={() => setEditingEvent(null)} />
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
