import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'

export const todayISO = () => format(new Date(), 'yyyy-MM-dd')

export const toISODate = (d: Date) => format(d, 'yyyy-MM-dd')

export const fromISODate = (s: string) => parseISO(s)

export const formatLong = (s: string) => format(parseISO(s), "EEEE d 'de' MMMM", { locale: es })

export const formatShort = (s: string) => format(parseISO(s), 'd MMM', { locale: es })

export const formatWeekdayShort = (s: string) => format(parseISO(s), 'EEE', { locale: es })

export const capitalize = (s: string) => (s.length ? s[0].toUpperCase() + s.slice(1) : s)

// --- time-of-day helpers, working in minutes since midnight ---

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(mins: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, Math.round(mins)))
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatDurationMinutes(mins: number): string {
  if (mins <= 0) return '0 min'
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

export function getWeekday(dateISO: string): number {
  return fromISODate(dateISO).getDay()
}

export function isDateWithinRange(dateISO: string, startISO: string, endISO: string): boolean {
  const d = fromISODate(dateISO)
  return isWithinInterval(d, { start: fromISODate(startISO), end: fromISODate(endISO) })
}

export function daysBetween(fromISO: string, toISO: string): number {
  return differenceInCalendarDays(fromISODate(toISO), fromISODate(fromISO))
}

export function listDatesBetween(fromISO: string, toISO: string): string[] {
  if (daysBetween(fromISO, toISO) < 0) return []
  return eachDayOfInterval({ start: fromISODate(fromISO), end: fromISODate(toISO) }).map(toISODate)
}

export function getMonthGrid(monthAnchorISO: string): string[] {
  const anchor = fromISODate(monthAnchorISO)
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end }).map(toISODate)
}

export function getWeekGrid(anchorISO: string): string[] {
  const anchor = fromISODate(anchorISO)
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  const end = endOfWeek(anchor, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end }).map(toISODate)
}

export function isSameMonthISO(a: string, b: string) {
  return isSameMonth(fromISODate(a), fromISODate(b))
}

export function isSameDayISO(a: string, b: string) {
  return isSameDay(fromISODate(a), fromISODate(b))
}

export function addDaysISO(dateISO: string, n: number) {
  return toISODate(addDays(fromISODate(dateISO), n))
}

export function addMonthsISO(dateISO: string, n: number) {
  return toISODate(addMonths(fromISODate(dateISO), n))
}

export function nowTimeString(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
