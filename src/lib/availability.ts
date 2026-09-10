import type { AppData, EventItem, TaskItem } from '../types'
import { getWeekday, isDateWithinRange, nowTimeString, timeToMinutes, todayISO, weeksBetweenAligned } from './dateUtils'
import { mergeIntervals, subtractIntervals, totalMinutes, type Interval } from './intervals'

export function getBaseBlocksForDate(data: AppData, dateISO: string): Interval[] {
  const override = data.availabilityOverrides.find((o) => o.date === dateISO)
  const blocks = override ? override.blocks : data.availabilityTemplate[getWeekday(dateISO)] ?? []
  return mergeIntervals(blocks.map((b) => ({ start: timeToMinutes(b.start), end: timeToMinutes(b.end) })))
}

// Does this event occur on the given date? (handles multi-day + weekly recurrence)
export function eventOccursOnDate(event: EventItem, dateISO: string): boolean {
  if (event.excludedDates?.includes(dateISO)) return false
  if (event.recurrence?.freq === 'weekly') {
    if (event.recurrence.until && dateISO > event.recurrence.until) return false
    if (dateISO < event.date) return false
    if (!event.recurrence.daysOfWeek.includes(getWeekday(dateISO))) return false
    const interval = event.recurrence.interval ?? 1
    if (interval <= 1) return true
    return weeksBetweenAligned(event.date, dateISO) % interval === 0
  }
  const end = event.endDate ?? event.date
  return isDateWithinRange(dateISO, event.date, end)
}

export function getEventsForDate(events: EventItem[], dateISO: string): EventItem[] {
  return events.filter((e) => eventOccursOnDate(e, dateISO))
}

// Busy intervals contributed by timed events on this date, including travel buffer before start.
export function getBusyBlocksFromEvents(events: EventItem[], dateISO: string): Interval[] {
  const todays = getEventsForDate(events, dateISO)
  const blocks: Interval[] = []
  for (const e of todays) {
    if (!e.startTime) continue // all-day events (e.g. viaje) don't block hourly slots
    const travel = e.travelMinutes ?? 0
    const start = Math.max(0, timeToMinutes(e.startTime) - travel)
    const end = e.endTime ? timeToMinutes(e.endTime) : timeToMinutes(e.startTime) + 60
    blocks.push({ start, end })
  }
  return blocks
}

// Busy intervals contributed by tasks already scheduled to a specific time on this date.
export function getBusyBlocksFromScheduledTasks(tasks: TaskItem[], dateISO: string, excludeTaskId?: string): Interval[] {
  return tasks
    .filter((t) => t.scheduledDate === dateISO && t.scheduledStart && t.scheduledEnd && t.id !== excludeTaskId && t.status !== 'completada')
    .map((t) => ({ start: timeToMinutes(t.scheduledStart!), end: timeToMinutes(t.scheduledEnd!) }))
}

export interface FreeBlocksOptions {
  excludeTaskId?: string
}

export function getFreeBlocksForDate(data: AppData, dateISO: string, opts: FreeBlocksOptions = {}): Interval[] {
  const base = getBaseBlocksForDate(data, dateISO)
  if (base.length === 0) return []
  const busy = [
    ...getBusyBlocksFromEvents(data.events, dateISO),
    ...getBusyBlocksFromScheduledTasks(data.tasks, dateISO, opts.excludeTaskId),
  ]
  let free = subtractIntervals(base, busy)
  if (dateISO === todayISO()) {
    const nowMinutes = timeToMinutes(nowTimeString())
    free = free.map((b) => ({ start: Math.max(b.start, nowMinutes), end: b.end })).filter((b) => b.end > b.start)
  }
  return free
}

export function getFreeMinutesForDate(data: AppData, dateISO: string, opts: FreeBlocksOptions = {}): number {
  return totalMinutes(getFreeBlocksForDate(data, dateISO, opts))
}
