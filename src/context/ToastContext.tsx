import React, { createContext, useCallback, useContext, useRef, useState } from 'react'

export interface ToastOptions {
  message: string
  actionLabel?: string
  onAction?: () => void
  durationMs?: number
}

interface ToastState extends ToastOptions {
  id: number
  closing: boolean
}

interface ToastContextValue {
  showToast: (opts: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION = 4200
const EXIT_ANIM_MS = 200

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idRef = useRef(0)

  const dismiss = useCallback(() => {
    setToast((t) => (t ? { ...t, closing: true } : t))
    setTimeout(() => setToast(null), EXIT_ANIM_MS)
  }, [])

  const showToast = useCallback(
    (opts: ToastOptions) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      const id = ++idRef.current
      setToast({ ...opts, id, closing: false })
      timerRef.current = setTimeout(() => {
        setToast((t) => (t && t.id === id ? { ...t, closing: true } : t))
        setTimeout(() => setToast((t) => (t && t.id === id ? null : t)), EXIT_ANIM_MS)
      }, opts.durationMs ?? DEFAULT_DURATION)
    },
    []
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-host">
        {toast && (
          <div className={`toast${toast.closing ? ' closing' : ''}`}>
            <span>{toast.message}</span>
            {toast.actionLabel && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  toast.onAction?.()
                  dismiss()
                }}
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
