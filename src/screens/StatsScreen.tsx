import React, { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { getCategoryTotals, getPeriodRange, getSleepComparison, type StatsPeriod } from '../lib/stats'
import { capitalize, formatDurationMinutes, formatShort, todayISO } from '../lib/dateUtils'
import { typeColorVar, typeInfo } from '../components/common/TypeChip'
import type { ItemType } from '../types'

const PERIOD_LABELS: [StatsPeriod, string][] = [
  ['dia', 'Día'],
  ['semana', 'Semana'],
  ['mes', 'Mes'],
]

export function StatsScreen({ onBack }: { onBack: () => void }) {
  const { data } = useData()
  const [period, setPeriod] = useState<StatsPeriod>('semana')
  const today = todayISO()

  const range = useMemo(() => getPeriodRange(period, today), [period, today])
  const totals = useMemo(() => getCategoryTotals(data, period, today), [data, period, today])
  const sleep = useMemo(() => getSleepComparison(data, period, today), [data, period, today])

  const totalMinutesAll = Object.values(totals).reduce((s, m) => s + (m ?? 0), 0)
  const sortedCategories = (Object.entries(totals) as [ItemType, number][])
    .filter(([, minutes]) => minutes > 0)
    .sort((a, b) => b[1] - a[1])

  const maxMinutes = sortedCategories[0]?.[1] ?? 1
  const sleepMax = Math.max(sleep.plannedMinutes, sleep.actualMinutes, 1)
  const avgPlanned = sleep.totalDays > 0 ? sleep.plannedMinutes / sleep.totalDays : 0
  const avgActual = sleep.loggedDays > 0 ? sleep.actualMinutes / sleep.loggedDays : null

  return (
    <div>
      <div className="topbar" style={{ position: 'static', padding: 0, marginBottom: 12 }}>
        <button className="link-btn" onClick={onBack}>
          ‹ Más
        </button>
      </div>
      <h1 style={{ marginBottom: 16 }}>Estadísticas</h1>

      <div className="top-tabs">
        {PERIOD_LABELS.map(([v, label]) => (
          <button key={v} className={`pill-btn${period === v ? ' selected' : ''}`} onClick={() => setPeriod(v)}>
            {label}
          </button>
        ))}
      </div>

      <div className="muted" style={{ fontSize: '0.8rem', marginBottom: 16 }}>
        {range.start === range.end ? capitalize(formatShort(range.start)) : `${formatShort(range.start)} – ${formatShort(range.end)}`}
      </div>

      <div className="section-title">😴 Sueño: previsto vs. real</div>
      <div className="card" style={{ marginBottom: 4 }}>
        <div className="row" style={{ marginBottom: 12 }}>
          <div>
            <div className="muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Previsto
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{formatDurationMinutes(sleep.plannedMinutes)}</div>
            {sleep.totalDays > 1 && (
              <div className="muted" style={{ fontSize: '0.76rem' }}>
                Media {formatDurationMinutes(avgPlanned)}/día
              </div>
            )}
          </div>
          <div>
            <div className="muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Real registrado
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              {sleep.loggedDays > 0 ? formatDurationMinutes(sleep.actualMinutes) : '—'}
            </div>
            {avgActual != null && sleep.totalDays > 1 && (
              <div className="muted" style={{ fontSize: '0.76rem' }}>
                Media {formatDurationMinutes(avgActual)}/día
              </div>
            )}
          </div>
        </div>

        <div className="muted" style={{ fontSize: '0.72rem', marginBottom: 4 }}>
          Previsto
        </div>
        <div className="progress-bar" style={{ marginBottom: 10 }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(100, (sleep.plannedMinutes / sleepMax) * 100)}%`, background: 'var(--c-sueno)' }}
          />
        </div>
        <div className="muted" style={{ fontSize: '0.72rem', marginBottom: 4 }}>
          Real
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(100, (sleep.actualMinutes / sleepMax) * 100)}%`, background: 'var(--success-gradient)' }}
          />
        </div>

        {sleep.loggedDays === 0 ? (
          <div className="muted" style={{ fontSize: '0.8rem', marginTop: 12 }}>
            Aún no has registrado horas reales de sueño en este periodo. Edita un evento de tipo Sueño para añadirlas.
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', marginTop: 12, fontWeight: 600 }}>
            {sleep.actualMinutes >= sleep.plannedMinutes
              ? '✅ Vas igual o por encima de lo previsto.'
              : `⚠️ Te faltan ${formatDurationMinutes(sleep.plannedMinutes - sleep.actualMinutes)} respecto a lo previsto.`}
          </div>
        )}
      </div>

      <div className="section-title">📊 Horas por categoría</div>
      {sortedCategories.length === 0 ? (
        <div className="empty-state">No hay eventos ni tareas registrados en este periodo.</div>
      ) : (
        <div className="list-gap">
          {sortedCategories.map(([category, minutes]) => {
            const info = typeInfo(category)
            const pct = totalMinutesAll > 0 ? Math.round((minutes / totalMinutesAll) * 100) : 0
            return (
              <div key={category} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700 }}>
                    {info.emoji} {info.label}
                  </span>
                  <span className="muted" style={{ fontSize: '0.82rem' }}>
                    {formatDurationMinutes(minutes)} · {pct}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(minutes / maxMinutes) * 100}%`, background: typeColorVar(category) }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
