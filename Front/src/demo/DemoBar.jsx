import React from 'react'
import { ESCENARIOS_DEMO } from './mockEnvio'
import './DemoBar.css'

// Barra flotante para cambiar de escenario y probar todos los estados del tracker.
export default function DemoBar({ pedidoId, onChange }) {
  return (
    <div className="demo-bar">
      <span className="demo-bar-tag">MODO DEMO</span>
      {ESCENARIOS_DEMO.map((e) => (
        <button
          key={e.id}
          type="button"
          className={`demo-bar-btn ${pedidoId === e.id ? 'is-active' : ''}`}
          onClick={() => onChange(e.id)}
        >
          {e.etiqueta}
        </button>
      ))}
    </div>
  )
}

// Reemplazo temporal del mapa real (se pasa como mapSlot; recibe { actual, destino }).
export function DemoMapa({ actual, destino }) {
  const fmt = (p) => (p ? `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}` : '—')
  return (
    <div className="demo-mapa">
      <strong>Aquí va el mapa (mapSlot)</strong>
      <span>Actual: {fmt(actual)}</span>
      <span>Destino: {fmt(destino)}</span>
    </div>
  )
}
