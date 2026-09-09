export interface Interval {
  start: number // minutes since midnight
  end: number
}

export function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return []
  const sorted = [...intervals].sort((a, b) => a.start - b.start)
  const out: Interval[] = [{ ...sorted[0] }]
  for (const cur of sorted.slice(1)) {
    const last = out[out.length - 1]
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end)
    } else {
      out.push({ ...cur })
    }
  }
  return out
}

// Subtract `busy` intervals from `base` intervals, returning what's left free.
export function subtractIntervals(base: Interval[], busy: Interval[]): Interval[] {
  const mergedBusy = mergeIntervals(busy)
  let result: Interval[] = base.map((b) => ({ ...b }))
  for (const b of mergedBusy) {
    const next: Interval[] = []
    for (const r of result) {
      if (b.end <= r.start || b.start >= r.end) {
        next.push(r)
        continue
      }
      if (b.start > r.start) next.push({ start: r.start, end: Math.min(b.start, r.end) })
      if (b.end < r.end) next.push({ start: Math.max(b.end, r.start), end: r.end })
    }
    result = next.filter((i) => i.end - i.start > 0)
  }
  return result.sort((a, b) => a.start - b.start)
}

export function totalMinutes(intervals: Interval[]): number {
  return intervals.reduce((sum, i) => sum + (i.end - i.start), 0)
}
