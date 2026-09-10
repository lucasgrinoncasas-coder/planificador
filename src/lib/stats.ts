import type { AppData, EventItem, ItemType } from '../types'
import { getMonthRange, getWeekGrid, listDatesBetween, timeToMinutes, todayISO } from './dateUtils'
import { getEventsForDate } from './availability'

export type StatsPeriod = 'dia' | 'semana' | 'mes'

export function getPeriodRange(period: StatsPeriod, anchor: string = todayISO()): { start: string; end: string } {
  if (period === 'dia') return { start: anchor, end: anchor }
  if (period === 'semana') {
    const week = getWeekGrid(anchor)
    return { start: week[0], end: week[week.length - 1] }
  }
  return getMonthRange(anchor)
}

// Scheduled duration of an event on the calendar (end - start), handling
// overnight spans like a sleep block that crosses midnight (e.g. 23:00-07:00).
function scheduledMinutes(e: EventItem): number {
  if (!e.startTime || !e.endTime) return 0
  const start = timeToMinutes(e.startTime)
  let end = timeToMinutes(e.endTime)
  if (end <= start) end += 24 * 60
  return end - start
}

// Best-known duration for an event: for sleep, prefer the logged real value,
// then the planned estimate, then whatever is scheduled on the calendar.
function bestKnownMinutes(e: EventItem): number {
  if (e.type === 'sueno') return e.actualMinutes ?? e.plannedMinutes ?? scheduledMinutes(e)
  return scheduledMinutes(e)
}

export type CategoryTotals = Partial<Record<ItemType, number>>

// Total minutes per category across every day in the period, combining
// calendar events (all types) with task durations (mainly 'estudio').
export function getCategoryTotals(data: AppData, period: StatsPeriod, anchor: string = todayISO()): CategoryTotals {
  const { start, end } = getPeriodRange(period, anchor)
  const dates = listDatesBetween(start, end)
  const totals: CategoryTotals = {}

  for (const date of dates) {
    for (const e of getEventsForDate(data.events, date)) {
      totals[e.type] = (totals[e.type] ?? 0) + bestKnownMinutes(e)
    }
  }
  for (const t of data.tasks) {
    if (t.scheduledDate && dates.includes(t.scheduledDate)) {
      totals[t.category] = (totals[t.category] ?? 0) + t.estimatedMinutes
    }
  }
  return totals
}

export interface SleepDayComparison {
  date: string
  plannedMinutes: number
  actualMinutes: number | null
}

export interface SleepComparison {
  plannedMinutes: number
  actualMinutes: number
  loggedDays: number
  totalDays: number
  days: SleepDayComparison[]
}

// Planned vs. real sleep for the period. `actualMinutes` in the totals only
// counts days that were actually logged, so it's a fair average/comparison
// rather than being dragged down by days with no data yet.
export function getSleepComparison(data: AppData, period: StatsPeriod, anchor: string = todayISO()): SleepComparison {
  const { start, end } = getPeriodRange(period, anchor)
  const dates = listDatesBetween(start, end)
  const days: SleepDayComparison[] = []
  let plannedMinutes = 0
  let actualMinutes = 0
  let loggedDays = 0

  for (const date of dates) {
    const sleepEvents = getEventsForDate(data.events, date).filter((e) => e.type === 'sueno')
    const planned = sleepEvents.reduce((sum, e) => sum + (e.plannedMinutes ?? scheduledMinutes(e)), 0)
    const loggedEvents = sleepEvents.filter((e) => e.actualMinutes != null)
    const actual = loggedEvents.length > 0 ? loggedEvents.reduce((sum, e) => sum + (e.actualMinutes ?? 0), 0) : null

    plannedMinutes += planned
    if (actual != null) {
      actualMinutes += actual
      loggedDays += 1
    }
    days.push({ date, plannedMinutes: planned, actualMinutes: actual })
  }

  return { plannedMinutes, actualMinutes, loggedDays, totalDays: dates.length, days }
}
