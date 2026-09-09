import React, { useState } from 'react'
import type { Goal, ItemType } from '../../types'
import { ITEM_TYPES } from '../../types'
import { makeId } from '../../lib/id'
import { useData } from '../../context/DataContext'

const DURATION_PRESETS = [30, 45, 60, 90, 120]

export function GoalForm({ initial, onSaved, onCancel }: { initial?: Goal; onSaved: (g: Goal) => void; onCancel: () => void }) {
  const { addGoal, updateGoal, deleteGoal } = useData()
  const isEdit = !!initial

  const [title, setTitle] = useState(initial?.title ?? '')
  const [category, setCategory] = useState<ItemType>(initial?.category ?? 'deporte')
  const [timesPerWeek, setTimesPerWeek] = useState(initial?.timesPerWeek ?? 3)
  const [duration, setDuration] = useState(initial?.sessionDurationMinutes ?? 60)

  const canSave = title.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    const goal: Goal = {
      id: initial?.id ?? makeId(),
      title: title.trim(),
      category,
      timesPerWeek,
      sessionDurationMinutes: duration,
      active: initial?.active ?? true,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    }
    if (isEdit) updateGoal(goal.id, goal)
    else addGoal(goal)
    onSaved(goal)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Objetivo</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="p. ej. Hacer deporte" autoFocus />
      </div>

      <div className="field">
        <label>Categoría</label>
        <div className="wrap-chips">
          {ITEM_TYPES.map((t) => (
            <button type="button" key={t.value} className={`pill-btn${category === t.value ? ' selected' : ''}`} onClick={() => setCategory(t.value)}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Veces por semana</label>
        <div className="wrap-chips">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <button type="button" key={n} className={`pill-btn${timesPerWeek === n ? ' selected' : ''}`} onClick={() => setTimesPerWeek(n)}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Duración de cada sesión</label>
        <div className="wrap-chips">
          {DURATION_PRESETS.map((m) => (
            <button type="button" key={m} className={`pill-btn${duration === m ? ' selected' : ''}`} onClick={() => setDuration(m)}>
              {m < 60 ? `${m} min` : `${m / 60} h`}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" type="submit" disabled={!canSave}>
        {isEdit ? 'Guardar cambios' : 'Crear objetivo'}
      </button>

      {isEdit && initial && (
        <button
          type="button"
          className="btn btn-danger"
          style={{ marginTop: 10 }}
          onClick={() => {
            deleteGoal(initial.id)
            onCancel()
          }}
        >
          Eliminar objetivo
        </button>
      )}
    </form>
  )
}
