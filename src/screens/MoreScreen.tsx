import React, { useState } from 'react'
import { AvailabilityScreen } from './AvailabilityScreen'
import { GoalsScreen } from './GoalsScreen'
import { SettingsScreen } from './SettingsScreen'
import { StatsScreen } from './StatsScreen'

type SubScreen = 'menu' | 'availability' | 'goals' | 'settings' | 'stats'

export function MoreScreen() {
  const [sub, setSub] = useState<SubScreen>('menu')

  if (sub === 'availability') return <AvailabilityScreen onBack={() => setSub('menu')} />
  if (sub === 'goals') return <GoalsScreen onBack={() => setSub('menu')} />
  if (sub === 'settings') return <SettingsScreen onBack={() => setSub('menu')} />
  if (sub === 'stats') return <StatsScreen onBack={() => setSub('menu')} />

  const items: { key: SubScreen; label: string; emoji: string; desc: string }[] = [
    { key: 'stats', label: 'Estadísticas', emoji: '📊', desc: 'Horas por categoría y sueño previsto vs. real' },
    { key: 'availability', label: 'Disponibilidad', emoji: '🕒', desc: 'Tu horario semanal y excepciones' },
    { key: 'goals', label: 'Objetivos', emoji: '🎯', desc: 'Metas recurrentes semanales' },
    { key: 'settings', label: 'Ajustes y copia de seguridad', emoji: '⚙️', desc: 'Notificaciones, exportar/importar' },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Más</h1>
      <div className="list-gap">
        {items.map((it) => (
          <button key={it.key} className="more-list-item" style={{ width: '100%' }} onClick={() => setSub(it.key)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <span style={{ fontSize: '1.4rem' }}>{it.emoji}</span>
              <span>
                <div style={{ fontWeight: 700 }}>{it.label}</div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>
                  {it.desc}
                </div>
              </span>
            </span>
            <span className="muted">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
