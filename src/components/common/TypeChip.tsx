import React from 'react'
import { IMPORTANCE_LABELS, ITEM_TYPES, type Importance, type ItemType } from '../../types'

export function typeInfo(type: ItemType) {
  return ITEM_TYPES.find((t) => t.value === type) ?? ITEM_TYPES[ITEM_TYPES.length - 1]
}

export function typeColorVar(type: ItemType) {
  return `var(--c-${type})`
}

export function TypeChip({ type }: { type: ItemType }) {
  const info = typeInfo(type)
  return (
    <span className="chip">
      <span className="chip-dot" style={{ background: typeColorVar(type) }} />
      {info.emoji} {info.label}
    </span>
  )
}

const IMPORTANCE_COLORS: Record<Importance, string> = {
  1: 'var(--text-muted)',
  2: 'var(--primary)',
  3: 'var(--warning)',
  4: 'var(--danger)',
}

export function ImportanceChip({ importance }: { importance: Importance }) {
  return (
    <span className="chip" style={{ color: IMPORTANCE_COLORS[importance] }}>
      {IMPORTANCE_LABELS[importance]}
    </span>
  )
}
