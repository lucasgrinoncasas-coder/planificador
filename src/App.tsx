import React, { useState } from 'react'
import { TodayScreen } from './screens/TodayScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { TasksScreen } from './screens/TasksScreen'
import { PlanScreen } from './screens/PlanScreen'
import { MoreScreen } from './screens/MoreScreen'
import { QuickAddMenu, type QuickAddChoice } from './components/common/QuickAddMenu'
import { Modal } from './components/common/Modal'
import { EventForm } from './components/forms/EventForm'
import { TaskForm } from './components/forms/TaskForm'
import { GoalForm } from './components/forms/GoalForm'
import { StudyPlanForm } from './components/forms/StudyPlanForm'
import type { EventItem, ItemType } from './types'

type Tab = 'hoy' | 'calendario' | 'tareas' | 'planificar' | 'mas'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'hoy', label: 'Hoy', icon: '☀️' },
  { key: 'calendario', label: 'Calendario', icon: '📅' },
  { key: 'tareas', label: 'Tareas', icon: '✅' },
  { key: 'planificar', label: 'Planificar', icon: '🧭' },
  { key: 'mas', label: 'Más', icon: '⋯' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('hoy')
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [activeForm, setActiveForm] = useState<{ kind: QuickAddChoice } | null>(null)
  const [createdExam, setCreatedExam] = useState<EventItem | null>(null)

  const handleChoose = (choice: QuickAddChoice) => {
    setQuickAddOpen(false)
    setActiveForm({ kind: choice })
  }

  const closeForm = () => setActiveForm(null)

  const formTitle: Record<QuickAddChoice, string> = {
    evento: 'Nuevo evento',
    tarea: 'Nueva tarea',
    examen: 'Nuevo examen',
    entrega: 'Nueva entrega',
    objetivo: 'Nuevo objetivo',
  }

  const presetTypeFor: Partial<Record<QuickAddChoice, ItemType>> = { examen: 'examen', entrega: 'entrega' }

  return (
    <div className="app-shell">
      <div className="app-content">
        {tab === 'hoy' && <TodayScreen onNavigatePlan={() => setTab('planificar')} />}
        {tab === 'calendario' && <CalendarScreen />}
        {tab === 'tareas' && <TasksScreen />}
        {tab === 'planificar' && <PlanScreen />}
        {tab === 'mas' && <MoreScreen />}
      </div>

      <button className="fab" onClick={() => setQuickAddOpen(true)} aria-label="Añadir">
        +
      </button>

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button key={t.key} className={`nav-item${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            <span className="nav-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {quickAddOpen && <QuickAddMenu onClose={() => setQuickAddOpen(false)} onChoose={handleChoose} />}

      {activeForm && (activeForm.kind === 'evento' || activeForm.kind === 'examen' || activeForm.kind === 'entrega') && (
        <Modal title={formTitle[activeForm.kind]} onClose={closeForm}>
          <EventForm
            presetType={presetTypeFor[activeForm.kind]}
            onSaved={(e) => {
              closeForm()
              if (e.type === 'examen' || e.type === 'entrega') setCreatedExam(e)
            }}
            onCancel={closeForm}
          />
        </Modal>
      )}

      {activeForm?.kind === 'tarea' && (
        <Modal title={formTitle.tarea} onClose={closeForm}>
          <TaskForm onSaved={closeForm} onCancel={closeForm} />
        </Modal>
      )}

      {activeForm?.kind === 'objetivo' && (
        <Modal title={formTitle.objetivo} onClose={closeForm}>
          <GoalForm onSaved={closeForm} onCancel={closeForm} />
        </Modal>
      )}

      {createdExam && (
        <Modal title="¿Planificar horas de estudio?" onClose={() => setCreatedExam(null)}>
          <StudyPlanForm event={createdExam} onDone={() => setCreatedExam(null)} />
        </Modal>
      )}
    </div>
  )
}
