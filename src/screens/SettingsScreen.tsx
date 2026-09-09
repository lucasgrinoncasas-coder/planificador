import React, { useRef, useState } from 'react'
import { useData } from '../context/DataContext'
import { useNotifications } from '../context/NotificationContext'
import { exportDataToFile, parseImportedFile } from '../lib/db'

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { data, updateSettings, replaceAll } = useData()
  const { askPermission } = useNotifications()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState<string | null>(null)

  const handleImportFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = parseImportedFile(String(reader.result))
        replaceAll(imported)
        setImportMsg('✅ Datos importados correctamente.')
      } catch (err) {
        setImportMsg('❌ No se pudo importar el archivo. Comprueba que es una copia de seguridad válida.')
      }
    }
    reader.readAsText(file)
  }

  const notifSupported = typeof Notification !== 'undefined'
  const notifPermission = notifSupported ? Notification.permission : 'unsupported'

  return (
    <div>
      <div className="topbar" style={{ position: 'static', padding: 0, marginBottom: 12 }}>
        <button className="link-btn" onClick={onBack}>
          ‹ Más
        </button>
      </div>
      <h1 style={{ marginBottom: 16 }}>Ajustes</h1>

      <div className="section-title">Notificaciones</div>
      <div className="card">
        {!notifSupported ? (
          <p className="muted">Este navegador no admite notificaciones. Los avisos se mostrarán dentro de la app.</p>
        ) : notifPermission === 'granted' ? (
          <p>✅ Notificaciones del navegador activadas.</p>
        ) : (
          <>
            <p className="muted" style={{ marginBottom: 10 }}>
              Activa las notificaciones para recibir avisos aunque la app esté en segundo plano (mientras esté abierta en una pestaña).
              Si no las activas, los avisos aparecerán igualmente en la app.
            </p>
            <button className="btn btn-primary" onClick={askPermission}>
              Activar notificaciones
            </button>
          </>
        )}
      </div>

      <div className="section-title">Planificación</div>
      <div className="card">
        <div className="field">
          <label>Descanso entre tareas planificadas (min)</label>
          <input
            type="number"
            min={0}
            value={data.settings.breakMinutes}
            onChange={(e) => updateSettings({ breakMinutes: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Máximo de estudio por día para un mismo examen (min)</label>
          <input
            type="number"
            min={15}
            step={15}
            value={data.settings.maxDailyStudyMinutesPerTask}
            onChange={(e) => updateSettings({ maxDailyStudyMinutesPerTask: Number(e.target.value) || 15 })}
          />
        </div>
      </div>

      <div className="section-title">Copia de seguridad</div>
      <div className="card list-gap">
        <button className="btn btn-secondary" onClick={() => exportDataToFile(data)}>
          Exportar datos
        </button>
        <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
          Importar datos
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImportFile(file)
            e.target.value = ''
          }}
        />
        {importMsg && <p className="muted">{importMsg}</p>}
        <p className="muted" style={{ fontSize: '0.78rem' }}>
          Importar reemplaza todos los datos actuales por los del archivo.
        </p>
      </div>
    </div>
  )
}
