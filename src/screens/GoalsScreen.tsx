import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import type { Goal } from '../types'
import { Modal } from '../components/common/Modal'
import { GoalForm } from '../components/forms/GoalForm'
import { TypeChip } from '../components/common/TypeChip'

export function GoalsScreen({ onBack }: { onBack: () => void }) {
  const { data, updateGoal } = useData()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)

  return (
    <div>
      <div className="topbar" style={{ position: 'static', padding: 0, marginBottom: 12 }}>
        <button className="link-btn" onClick={onBack}>
          ‹ Más
        </button>
        <button className="icon-btn" onClick={() => setCreating(true)}>
          +
        </button>
      </div>
      <h1 style={{ marginBottom: 16 }}>Objetivos recurrentes</h1>

      {data.goals.length === 0 ? (
        <div className="empty-state">Aún no tienes objetivos. Añade uno como "Hacer deporte 3 veces por semana".</div>
      ) : (
        <div className="list-gap">
          {data.goals.map((g) => (
            <div key={g.id} className="card">
              <button style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none' }} onClick={() => setEditing(g)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{g.title}</div>
                  <TypeChip type={g.category} />
                </div>
                <div className="muted" style={{ fontSize: '0.82rem', marginTop: 4 }}>
                  {g.timesPerWeek}x / semana · {g.sessionDurationMinutes} min por sesión
                </div>
              </button>
              <button className="pill-btn" style={{ marginTop: 10 }} onClick={() => updateGoal(g.id, { active: !g.active })}>
                {g.active ? 'Activo' : 'Pausado'}
              </button>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <Modal title="Nuevo objetivo" onClose={() => setCreating(false)}>
          <GoalForm onSaved={() => setCreating(false)} onCancel={() => setCreating(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Editar objetivo" onClose={() => setEditing(null)}>
          <GoalForm initial={editing} onSaved={() => setEditing(null)} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  )
}
