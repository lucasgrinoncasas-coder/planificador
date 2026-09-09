import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { AppData, AvailabilityOverride, AvailabilityTemplate, EventItem, Goal, TaskItem } from '../types'
import { defaultData, loadData, saveData } from '../lib/db'

interface DataContextValue {
  data: AppData
  setData: React.Dispatch<React.SetStateAction<AppData>>
  addEvent: (e: EventItem) => void
  updateEvent: (id: string, patch: Partial<EventItem>) => void
  deleteEvent: (id: string) => void
  addTask: (t: TaskItem) => void
  updateTask: (id: string, patch: Partial<TaskItem>) => void
  deleteTask: (id: string) => void
  addTasks: (ts: TaskItem[]) => void
  removeTasksLinkedTo: (eventId: string) => void
  addGoal: (g: Goal) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  setAvailabilityTemplate: (t: AvailabilityTemplate) => void
  setAvailabilityOverride: (o: AvailabilityOverride) => void
  removeAvailabilityOverride: (date: string) => void
  updateSettings: (patch: Partial<AppData['settings']>) => void
  markNotificationsRead: () => void
  replaceAll: (d: AppData) => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    saveData(data)
  }, [data])

  const addEvent = useCallback((e: EventItem) => setData((d) => ({ ...d, events: [...d.events, e] })), [])
  const updateEvent = useCallback(
    (id: string, patch: Partial<EventItem>) =>
      setData((d) => ({ ...d, events: d.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
    []
  )
  const deleteEvent = useCallback(
    (id: string) =>
      setData((d) => ({
        ...d,
        events: d.events.filter((e) => e.id !== id),
        tasks: d.tasks.filter((t) => t.linkedEventId !== id),
      })),
    []
  )

  const addTask = useCallback((t: TaskItem) => setData((d) => ({ ...d, tasks: [...d.tasks, t] })), [])
  const addTasks = useCallback((ts: TaskItem[]) => setData((d) => ({ ...d, tasks: [...d.tasks, ...ts] })), [])
  const updateTask = useCallback(
    (id: string, patch: Partial<TaskItem>) =>
      setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
    []
  )
  const deleteTask = useCallback((id: string) => setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) })), [])
  const removeTasksLinkedTo = useCallback(
    (eventId: string) => setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.linkedEventId !== eventId) })),
    []
  )

  const addGoal = useCallback((g: Goal) => setData((d) => ({ ...d, goals: [...d.goals, g] })), [])
  const updateGoal = useCallback(
    (id: string, patch: Partial<Goal>) => setData((d) => ({ ...d, goals: d.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
    []
  )
  const deleteGoal = useCallback((id: string) => setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) })), [])

  const setAvailabilityTemplate = useCallback((t: AvailabilityTemplate) => setData((d) => ({ ...d, availabilityTemplate: t })), [])
  const setAvailabilityOverride = useCallback(
    (o: AvailabilityOverride) =>
      setData((d) => ({
        ...d,
        availabilityOverrides: [...d.availabilityOverrides.filter((x) => x.date !== o.date), o],
      })),
    []
  )
  const removeAvailabilityOverride = useCallback(
    (date: string) => setData((d) => ({ ...d, availabilityOverrides: d.availabilityOverrides.filter((x) => x.date !== date) })),
    []
  )

  const updateSettings = useCallback(
    (patch: Partial<AppData['settings']>) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
    []
  )

  const markNotificationsRead = useCallback(
    () => setData((d) => ({ ...d, notificationLog: d.notificationLog.map((n) => ({ ...n, read: true })) })),
    []
  )

  const replaceAll = useCallback((d: AppData) => setData(d), [])

  const value: DataContextValue = {
    data,
    setData,
    addEvent,
    updateEvent,
    deleteEvent,
    addTask,
    updateTask,
    deleteTask,
    addTasks,
    removeTasksLinkedTo,
    addGoal,
    updateGoal,
    deleteGoal,
    setAvailabilityTemplate,
    setAvailabilityOverride,
    removeAvailabilityOverride,
    updateSettings,
    markNotificationsRead,
    replaceAll,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData debe usarse dentro de DataProvider')
  return ctx
}

export { defaultData }
