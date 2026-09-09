import React, { createContext, useContext, useEffect, useRef } from 'react'
import { useData } from './DataContext'
import { applyDueReminders, computeDueReminders, pushBrowserNotification, requestNotificationPermission } from '../lib/reminders'

interface NotificationContextValue {
  unreadCount: number
  askPermission: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

const CHECK_INTERVAL_MS = 60 * 1000

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data, setData, updateSettings } = useData()
  const dataRef = useRef(data)
  dataRef.current = data

  useEffect(() => {
    const check = () => {
      const now = new Date()
      const due = computeDueReminders(dataRef.current, now)
      if (due.length === 0) return
      const { events, tasks, notificationLog, fresh } = applyDueReminders(dataRef.current, due)
      setData((d) => ({ ...d, events, tasks, notificationLog }))
      if (dataRef.current.settings.notificationsEnabled) {
        for (const f of fresh) pushBrowserNotification(f.message)
      }
    }
    check()
    const id = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [setData])

  const askPermission = () => {
    requestNotificationPermission().then((perm) => {
      updateSettings({ notificationsEnabled: perm === 'granted' })
    })
  }

  const unreadCount = data.notificationLog.filter((n) => !n.read).length

  return <NotificationContext.Provider value={{ unreadCount, askPermission }}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications debe usarse dentro de NotificationProvider')
  return ctx
}
