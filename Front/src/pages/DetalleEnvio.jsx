import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import './DetalleEnvio.css'

// Orden del flujo del paquete
const PASOS = [
  { estado: 'CREADO', label: 'Registrado' },
  { estado: 'ASIGNADO', label: 'Preparado' },
  { estado: 'EN_CAMINO', label: 'En ruta' },
  { estado: 'EN_ENTREGA', label: 'Arribo previsto' },
  { estado: 'ENTREGADO', label: 'Entregado' }
]

// Texto de la etiqueta de estado
const BADGES = {
  CREADO: { texto: 'Registrado', tono: 'info' },
  ASIGNADO: { texto: 'Preparado', tono: 'info' },
  EN_CAMINO: { texto: 'En tránsito', tono: 'info' },
  EN_ENTREGA: { texto: 'Por llegar', tono: 'info' },
  ENTREGADO: { texto: 'Entregado', tono: 'ok' },
  CANCELADO: { texto: 'Cancelado', tono: 'error' }
}

const POLL_MS = 30000 // refresco automático del seguimiento
const SENAL_ACTIVA_MIN = 30 // minutos sin reportes para considerar sin señal

const MESES = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.']

const fechaCorta = (iso) => {
  const d = new Date(iso)
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}

const fechaLarga = (iso) => {
  const d = new Date(iso)
  const mes = MESES[d.getMonth()].replace('.', '')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} de ${mes}, ${hh}:${mm}`
}

const hace = (iso) => {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.floor(h / 24)} d`
}

//tracker
export default function DetalleEnvio({ pedidoId, mapSlot = null, onVerMapa }) {
  const [pedido, setPedido] = useState(null)
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    const cargar = async () => {
      const res = await api.getPedidos()
      if (!activo) return
      const lista = res?.data || []
      const elegido = pedidoId ? lista.find((p) => p.id === pedidoId) : lista[0]

      if (!elegido) {
        setError(res?.success === false ? 'No se pudo conectar con el servidor.' : 'No hay envíos para mostrar.')
        setCargando(false)
        return
      }

      const h = await api.getHistorialTracking(elegido.id)
      if (!activo) return
      setPedido(elegido)
      setHistorial(h?.data || [])
      setError('')
      setCargando(false)
    }

    cargar()
    const timer = setInterval(cargar, POLL_MS)
    return () => {
      activo = false
      clearInterval(timer)
    }
  }, [pedidoId])

  // Paso alcanzado o el estado actual
  const { alcanzado, fechas } = useMemo(() => {
    const fechas = {}
    let max = -1
    historial.forEach((h) => {
      const i = PASOS.findIndex((p) => p.estado === h.estado)
      if (i >= 0) {
        max = Math.max(max, i)
        if (!fechas[h.estado]) fechas[h.estado] = h.fecha_actualizacion
      }
    })
    const iActual = PASOS.findIndex((p) => p.estado === pedido?.estado_actual)
    return { alcanzado: Math.max(max, iActual), fechas }
  }, [historial, pedido])

  if (cargando) return <div className="det-estado">Cargando envío…</div>
  if (error || !pedido) return <div className="det-estado">{error || 'Envío no encontrado.'}</div>

  const ultimo = historial[historial.length - 1]
  const items = pedido.items || []
  const primero = items[0]
  const titulo = primero
    ? `${primero.producto_nombre} (${primero.cantidad} uds.)${items.length > 1 ? ` +${items.length - 1} más` : ''}`
    : pedido.codigo

  const badge = BADGES[pedido.estado_actual] || BADGES.CREADO
  const ultimaAct = ultimo?.fecha_actualizacion || pedido.ultima_actualizacion
  const conSenal = ultimaAct && (Date.now() - new Date(ultimaAct).getTime()) / 60000 <= SENAL_ACTIVA_MIN

  const actual = pedido.ultima_latitud
    ? { lat: parseFloat(pedido.ultima_latitud), lng: parseFloat(pedido.ultima_longitud) }
    : null
  const destino = pedido.destino_latitud
    ? { lat: parseFloat(pedido.destino_latitud), lng: parseFloat(pedido.destino_longitud) }
    : null

  // Campos que todavía no existen en la BD se muestran como "Sin dato"
  const temperatura = ultimo?.temperatura ?? pedido.temperatura
  const condicion = temperatura != null ? `Cadena fría estable · ${Number(temperatura).toFixed(1)} °C` : 'Sin dato'
  const entrega = pedido.fecha_entrega_estimada ? fechaLarga(pedido.fecha_entrega_estimada) : 'Sin dato'
  const responsable = [pedido.repartidor_nombre, pedido.proveedor_nombre].filter(Boolean).join(' · ') || 'Sin asignar'
  const ubicacionTexto = ultimo?.notas || (actual ? `${actual.lat.toFixed(4)}, ${actual.lng.toFixed(4)}` : 'Sin ubicación')

  const filas = [
    ['Nombre comercial', items.map((i) => i.producto_nombre).join(', ') || '—'],
    ['Destino', pedido.destino_nombre],
    ['Responsable', responsable],
    ['Condición de transporte', condicion],
    ['Entrega estimada', entrega]
  ]

  return (
    <div className="det-page">
      <div className="det-header">
        <h1 className="det-title">{titulo}</h1>
        <span className={`det-badge det-badge--${badge.tono}`}>{badge.texto}</span>
      </div>

      {/* Stepper de estado del paquete */}
      <section className="det-card det-stepper">
        {PASOS.map((paso, i) => {
          const hecho = i <= alcanzado
          const lineaHecha = i < alcanzado
          return (
            <div key={paso.estado} className="det-step">
              {i < PASOS.length - 1 && (
                <span className={`det-step-line ${lineaHecha ? 'is-done' : ''}`} />
              )}
              <span className={`det-step-dot ${hecho ? 'is-done' : ''}`}>{hecho ? '✓' : i + 1}</span>
              <span className="det-step-label">{paso.label}</span>
              <span className="det-step-date">{fechas[paso.estado] ? fechaCorta(fechas[paso.estado]) : 'Pendiente'}</span>
            </div>
          )
        })}
      </section>

      <div className="det-grid">
        {/* Ficha de monitoreo */}
        <section className="det-card">
          <div className="det-card-head">
            <h2>Ficha de monitoreo</h2>
            {ultimaAct && <small>Actualizado {hace(ultimaAct)}</small>}
          </div>
          <dl className="det-rows">
            {filas.map(([k, v]) => (
              <div key={k} className="det-row">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Mapa en vivo (solo el espacio; el mapa se inyecta con mapSlot) */}
        <section className="det-card det-map-card">
          <div className="det-map-slot">
            {typeof mapSlot === 'function' ? mapSlot({ actual, destino, historial }) : mapSlot}
          </div>
          <div className="det-map-head">
            <h2>Ubicación actual en vivo</h2>
            <span className={`det-signal ${conSenal ? 'is-on' : 'is-off'}`}>
              {conSenal ? 'Señal activa' : 'Sin señal'}
            </span>
          </div>
          <div className="det-map-foot">
            <p>{ubicacionTexto}</p>
            <button type="button" className="det-btn" onClick={onVerMapa}>
              Ver mapa completo
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
