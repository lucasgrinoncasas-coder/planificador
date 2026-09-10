import React, { useState } from 'react'
import type { EventItem, Importance, ItemType } from '../../types'
import { ITEM_TYPES, REMINDER_OPTIONS } from '../../types'
import { makeId } from '../../lib/id'
import { addDaysISO, addMonthsISO, formatLong, todayISO } from '../../lib/dateUtils'
import { useData } from '../../context/DataContext'

const WEEKDAY_LETTERS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

const DURATION_PRESETS: { label: string; compute: (from: string) => string }[] = [
  { label: '1 semana', compute: (from) => addDaysISO(from, 7) },
  { label: '2 semanas', compute: (from) => addDaysISO(from, 14) },
  { label: '1 mes', compute: (from) => addMonthsISO(from, 1) },
  { label: '3 meses', compute: (from) => addMonthsISO(from, 3) },
  { label: '6 meses', compute: (from) => addMonthsISO(from, 6) },
  { label: '1 año', compute: (from) => addMonthsISO(from, 12) },
  { label: 'Sin fin', compute: () => '' },
]

function defaultRemindersFor(type: ItemType, settings: { defaultExamReminders: number[]; defaultTaskReminders: number[] }) {
  if (type === 'examen' || type === 'entrega') return settings.defaultExamReminders
  return [1440]
}

export function EventForm({
  initial,
  presetType,
  initialDate,
  occurrenceDate,
  onSaved,
  onCancel,
  onDelete,
}: {
  initial?: EventItem
  presetType?: ItemType
  initialDate?: string
  /** When editing an occurrence of a recurring event, the specific date being viewed. */
  occurrenceDate?: string
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
  const [repeatEvery, setRepeatEvery] = useState(initial?.recurrence?.interval ?? 1)
  const [until, setUntil] = useState(initial?.recurrence?.until ?? '')
  const [customAmount, setCustomAmount] = useState('1')
  const [customUnit, setCustomUnit] = useState<'semanas' | 'meses'>('meses')
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
      recurrence: recurrent ? { freq: 'weekly', daysOfWeek: days, interval: repeatEvery, until: until || undefined } : undefined,
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
            <label>Frecuencia</label>
            <div className="wrap-chips">
              {[1, 2, 3, 4].map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`pill-btn${repeatEvery === n ? ' selected' : ''}`}
                  onClick={() => setRepeatEvery(n)}
                >
                  {n === 1 ? 'Cada semana' : `Cada ${n} semanas`}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Repetir durante</label>
            <div className="wrap-chips" style={{ marginBottom: 10 }}>
              {DURATION_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  className={`pill-btn${until === p.compute(date) ? ' selected' : ''}`}
                  onClick={() => setUntil(p.compute(date))}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="row" style={{ alignItems: 'center', marginBottom: 10 }}>
              <input
                type="number"
                min={1}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                onBlur={() => setCustomAmount((v) => String(Math.max(1, parseInt(v, 10) || 1)))}
              />
              <select value={customUnit} onChange={(e) => setCustomUnit(e.target.value as 'semanas' | 'meses')}>
                <option value="semanas">Semanas</option>
                <option value="meses">Meses</option>
              </select>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => {
                  const amount = Math.max(1, parseInt(customAmount, 10) || 1)
                  setUntil(customUnit === 'semanas' ? addDaysISO(date, amount * 7) : addMonthsISO(date, amount))
                }}
              >
                Aplicar
              </button>
            </div>
            <label>O elige una fecha de fin concreta (opcional)</label>
            <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} min={date} />
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

      {isEdit && initial && initial.recurrence && occurrenceDate ? (
        <>
          <button
            type="button"
            className="btn btn-danger"
            style={{ marginTop: 10 }}
            onClick={() => {
              updateEvent(initial.id, { excludedDates: [...(initial.excludedDates ?? []), occurrenceDate] })
              onDelete?.(initial.id)
            }}
          >
            Eliminar solo este día ({formatLong(occurrenceDate)})
          </button>
          <button
            type="button"
            className="btn btn-danger"
            style={{ marginTop: 10 }}
            onClick={() => {
              deleteEvent(initial.id)
              onDelete?.(initial.id)
            }}
          >
            Eliminar todos los eventos de esta serie
          </button>
        </>
      ) : (
        isEdit &&
        initial && (
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
        )
      )}
    </form>
  )
}
