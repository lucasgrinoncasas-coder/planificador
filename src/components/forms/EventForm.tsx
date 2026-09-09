import React, { useState } from 'react'
import type { EventItem, Importance, ItemType } from '../../types'
import { ITEM_TYPES, REMINDER_OPTIONS } from '../../types'
import { makeId } from '../../lib/id'
import { todayISO } from '../../lib/dateUtils'
import { useData } from '../../context/DataContext'

const WEEKDAY_LETTERS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

function defaultRemindersFor(type: ItemType, settings: { defaultExamReminders: number[]; defaultTaskReminders: number[] }) {
  if (type === 'examen' || type === 'entrega') return settings.defaultExamReminders
  return [1440]
}

export function EventForm({
  initial,
  presetType,
  initialDate,
  onSaved,
  onCancel,
  onDelete,
}: {
  initial?: EventItem
  presetType?: ItemType
  initialDate?: string
  onSaved: (e: EventItem) => void
  onCancel: () => void
  onDelete?: (id: string) => void
}) {
  const { data, addEvent, updateEvent, deleteEvent } = useData()
  const isEdit = !!initial

  const [title, setTitle] = useState(initial?.title ?? '')
  const [type, setType] = useState<ItemType>(initial?.type ?? presetType ?? 'universidad')
  const [date, setDate] = useState(initial?.date ?? initialDate ?? todayISO())
  const [multiDay, setMultiDay] = useState(!!initial?.endDate)
  const [endDate, setEndDate] = useState(initial?.endDate ?? initial?.date ?? todayISO())
  const [allDay, setAllDay] = useState(initial ? !initial.startTime : false)
  const [startTime, setStartTime] = useState(initial?.startTime ?? '09:00')
  const [endTime, setEndTime] = useState(initial?.endTime ?? '10:00')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [travelMinutes, setTravelMinutes] = useState(initial?.travelMinutes?.toString() ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [importance, setImportance] = useState<Importance>(initial?.importance ?? 2)
  const [recurrent, setRecurrent] = useState(!!initial?.recurrence)
  const [days, setDays] = useState<number[]>(initial?.recurrence?.daysOfWeek ?? [])
  const [until, setUntil] = useState(initial?.recurrence?.until ?? '')
  const [reminders, setReminders] = useState<number[]>(initial?.reminders ?? defaultRemindersFor(presetType ?? 'universidad', data.settings))

  const toggleDay = (d: number) => setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()))
  const toggleReminder = (v: number) => setReminders((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))

  const handleTypeChange = (t: ItemType) => {
    setType(t)
    if (!isEdit) setReminders(defaultRemindersFor(t, data.settings))
  }

  const canSave = title.trim().length > 0 && (!recurrent || days.length > 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    const event: EventItem = {
      id: initial?.id ?? makeId(),
      kind: 'event',
      title: title.trim(),
      type,
      date,
      endDate: multiDay ? endDate : undefined,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      location: location.trim() || undefined,
      travelMinutes: travelMinutes ? Number(travelMinutes) : undefined,
      notes: notes.trim() || undefined,
      recurrence: recurrent ? { freq: 'weekly', daysOfWeek: days, until: until || undefined } : undefined,
      importance,
      reminders,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      remindersFired: initial?.remindersFired ?? [],
    }
    if (isEdit) updateEvent(event.id, event)
    else addEvent(event)
    onSaved(event)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Nombre</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="p. ej. Examen de Física" autoFocus />
      </div>

      <div className="field">
        <label>Tipo</label>
        <div className="wrap-chips">
          {ITEM_TYPES.map((t) => (
            <button
              type="button"
              key={t.value}
              className={`pill-btn${type === t.value ? ' selected' : ''}`}
              onClick={() => handleTypeChange(t.value)}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={multiDay} onChange={(e) => setMultiDay(e.target.checked)} /> Dura varios días (p. ej. viaje)
        </label>
      </div>

      <div className="row">
        <div className="field">
          <label>{multiDay ? 'Fecha de inicio' : 'Fecha'}</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {multiDay && (
          <div className="field">
            <label>Fecha de fin</label>
            <input type="date" value={endDate} min={date} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        )}
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} /> Todo el día (sin hora)
        </label>
      </div>

      {!allDay && (
        <div className="row">
          <div className="field">
            <label>Hora inicio</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="field">
            <label>Hora fin</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
      )}

      <div className="row">
        <div className="field">
          <label>Ubicación (opcional)</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Aula 3, gimnasio..." />
        </div>
        <div className="field">
          <label>Desplazamiento (min)</label>
          <input type="number" min={0} value={travelMinutes} onChange={(e) => setTravelMinutes(e.target.value)} placeholder="0" />
        </div>
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={recurrent} onChange={(e) => setRecurrent(e.target.checked)} /> Se repite cada semana
        </label>
      </div>

      {recurrent && (
        <>
          <div className="field">
            <label>Días de la semana</label>
            <div className="wrap-chips">
              {WEEKDAY_LETTERS.map((letter, idx) => (
                <button
                  type="button"
                  key={idx}
                  className={`pill-btn${days.includes(idx) ? ' selected' : ''}`}
                  onClick={() => toggleDay(idx)}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Repetir hasta (opcional)</label>
            <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
          </div>
        </>
      )}

      <div className="field">
        <label>Importancia</label>
        <div className="wrap-chips">
          {([1, 2, 3, 4] as Importance[]).map((imp) => (
            <button
              type="button"
              key={imp}
              className={`pill-btn${importance === imp ? ' selected' : ''}`}
              onClick={() => setImportance(imp)}
            >
              {{ 1: 'Baja', 2: 'Media', 3: 'Alta', 4: 'Crítica' }[imp]}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Recordatorios</label>
        <div className="wrap-chips">
          {REMINDER_OPTIONS.map((r) => (
            <button
              type="button"
              key={r.value}
              className={`pill-btn${reminders.includes(r.value) ? ' selected' : ''}`}
              onClick={() => toggleReminder(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Notas</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas opcionales" />
      </div>

      <button className="btn btn-primary" type="submit" disabled={!canSave}>
        {isEdit ? 'Guardar cambios' : 'Crear evento'}
      </button>

      {isEdit && initial && (
        <button
          type="button"
          className="btn btn-danger"
          style={{ marginTop: 10 }}
          onClick={() => {
            deleteEvent(initial.id)
            onDelete?.(initial.id)
          }}
        >
          Eliminar evento
        </button>
      )}
    </form>
  )
}
