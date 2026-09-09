import type { AppData, AvailabilityTemplate } from '../types'

const STORAGE_KEY = 'planificador.data.v1'

const defaultTemplate: AvailabilityTemplate = {
  0: [],
  1: [{ start: '16:00', end: '21:00' }],
  2: [{ start: '18:00', end: '22:00' }],
  3: [{ start: '15:00', end: '20:00' }],
  4: [{ start: '16:00', end: '21:00' }],
  5: [{ start: '16:00', end: '20:00' }],
  6: [{ start: '10:00', end: '14:00' }],
}

export function defaultData(): AppData {
  return {
    version: 1,
    events: [],
    tasks: [],
    goals: [],
    availabilityTemplate: defaultTemplate,
    availabilityOverrides: [],
    settings: {
      defaultExamReminders: [30240, 10080, 1440],
      defaultTaskReminders: [1440, 60],
      notificationsEnabled: false,
      breakMinutes: 10,
      maxDailyStudyMinutesPerTask: 150,
      dayStart: '08:00',
      dayEnd: '23:30',
    },
    notificationLog: [],
  }
}

function migrate(data: any): AppData {
  const base = defaultData()
  return {
    ...base,
    ...data,
    settings: { ...base.settings, ...(data?.settings ?? {}) },
    availabilityTemplate: { ...base.availabilityTemplate, ...(data?.availabilityTemplate ?? {}) },
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    return migrate(JSON.parse(raw))
  } catch (err) {
    console.error('No se pudieron cargar los datos, se usan valores por defecto', err)
    return defaultData()
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportDataToFile(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `planificador-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function parseImportedFile(text: string): AppData {
  const parsed = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object') throw new Error('Archivo no válido')
  return migrate(parsed)
}
