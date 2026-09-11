import React, { useRef, useState } from 'react'
import { useData } from '../context/DataContext'
import { MonthView } from '../components/calendar/MonthView'
import { WeekView } from '../components/calendar/WeekView'
import { DayAgenda } from '../components/calendar/DayAgenda'
import { addDaysISO, addMonthsISO, capitalize, formatLong, todayISO } from '../lib/dateUtils'
import type { EventItem, TaskItem } from '../types'
import { Modal } from '../components/common/Modal'
import { EventForm } from '../components/forms/EventForm'
import { TaskForm } from '../components/forms/TaskForm'
import { useToast } from '../context/ToastContext'

type ViewMode = 'mes' | 'semana' | 'dia'

const SWIPE_THRESHOLD = 52

export function CalendarScreen() {
  const { data, updateTask } = useData()
  const { showToast } = useToast()
  const [view, setView] = useState<ViewMode>('mes')
  const [selected, setSelected] = useState(todayISO())
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null)
  const [creatingEvent, setCreatingEvent] = useState(false)

  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [paneKey, setPaneKey] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

  const step = (dir: 'next' | 'prev') => {
    setDirection(dir)
    setPaneKey((k) => k + 1)
    const delta = dir === 'next' ? 1 : -1
    setSelected((s) => (view === 'mes' ? addMonthsISO(s, delta) : addDaysISO(s, view === 'semana' ? delta * 7 : delta)))
  }

  const goPrev = () => step('prev')
  const goNext = () => step('next')
  const goToday = () => setSelected(todayISO())

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    dragStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    if (!isDragging) {
      if (Math.abs(dx) < 10) return
      if (Math.abs(dy) > Math.abs(dx)) {
        dragStartRef.current = null
        return
      }
      setIsDragging(true)
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
    }
    setDragOffset(dx)
  }

  const handlePointerUp = () => {
    if (!dragStartRef.current && !isDragging) return
    dragStartRef.current = null
    if (isDragging && Math.abs(dragOffset) > SWIPE_THRESHOLD) {
      if (dragOffset < 0) goNext()
      else goPrev()
    }
    setIsDragging(false)
    setDragOffset(0)
  }

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

      {view !== 'dia' && (
        <div
          className="cal-swipe-area"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            key={paneKey}
            className={`cal-pane${direction === 'prev' ? ' dir-prev' : ''}`}
            style={{
              transform: dragOffset ? `translateX(${dragOffset * 0.4}px)` : undefined,
              transition: isDragging ? 'none' : 'transform 220ms cubic-bezier(.2,.8,.2,1)',
            }}
          >
            {view === 'mes' && <MonthView data={data} anchor={selected} selected={selected} onSelect={setSelected} />}
            {view === 'semana' && <WeekView data={data} anchor={selected} selected={selected} onSelect={setSelected} />}
          </div>
        </div>
      )}

      <div className="section-title">Agenda del día</div>
      <DayAgenda
        data={data}
        dateISO={selected}
        onEditEvent={setEditingEvent}
        onEditTask={setEditingTask}
        onCompleteTask={(t) => {
          const previousStatus = t.status
          updateTask(t.id, { status: 'completada', completedDate: todayISO() })
          showToast({
            message: '✓ Tarea completada',
            actionLabel: 'Deshacer',
            onAction: () => updateTask(t.id, { status: previousStatus, completedDate: undefined }),
          })
        }}
      />

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
          <EventForm
            initial={editingEvent}
            occurrenceDate={selected}
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
