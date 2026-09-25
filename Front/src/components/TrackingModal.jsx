import React, { useState, useEffect, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF } from '@react-google-maps/api'
import { api } from '../services/api'

const mapContainerStyle = {
  width: '100%',
  height: '320px',
  borderRadius: '12px',
  marginBottom: '12px'
}

export default function TrackingModal({ isOpen, onClose, pedido, onTrackingUpdated, currentUser, apiKey }) {
  const [historial, setHistorial] = useState([])
  const [estado, setEstado] = useState('EN_CAMINO')
  const [notas, setNotas] = useState('')
  const [latitud, setLatitud] = useState('14.615000')
  const [longitud, setLongitud] = useState('-90.535000')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const isKeyProvided = Boolean(apiKey && apiKey !== 'TU_GOOGLE_MAPS_API_KEY' && apiKey.trim() !== '')

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: isKeyProvided ? apiKey : ''
  })

  useEffect(() => {
    if (isOpen && pedido) {
      setEstado(pedido.estado_actual || 'EN_CAMINO')
      const initialLat = pedido.ultima_latitud ? parseFloat(pedido.ultima_latitud) : (pedido.destino_latitud ? parseFloat(pedido.destino_latitud) : 14.6150)
      const initialLng = pedido.ultima_longitud ? parseFloat(pedido.ultima_longitud) : (pedido.destino_longitud ? parseFloat(pedido.destino_longitud) : -90.5350)
      setLatitud(initialLat.toFixed(6))
      setLongitud(initialLng.toFixed(6))
      cargarHistorial()
    }
  }, [isOpen, pedido])

  const cargarHistorial = async () => {
    if (!pedido) return
    try {
      const res = await api.getHistorialTracking(pedido.id)
      if (res.data) setHistorial(res.data)
    } catch (err) {
      console.error('Error al cargar historial', err)
    }
  }

  // Al hacer clic en el mapa del modal, mover el marcador y actualizar las coordenadas
  const handleMapClick = useCallback((e) => {
    if (e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      setLatitud(lat.toFixed(6))
      setLongitud(lng.toFixed(6))
    }
  }, [])

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por el navegador.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitud(pos.coords.latitude.toFixed(6))
        setLongitud(pos.coords.longitude.toFixed(6))
      },
      (err) => setError(`Error GPS: ${err.message}`),
      { enableHighAccuracy: true }
    )
  }

  if (!isOpen || !pedido) return null

  const selectedPos = {
    lat: parseFloat(latitud) || 14.6150,
    lng: parseFloat(longitud) || -90.5350
  }

  const destPos = pedido.destino_latitud && pedido.destino_longitud ? {
    lat: parseFloat(pedido.destino_latitud),
    lng: parseFloat(pedido.destino_longitud)
  } : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      const payload = {
        usuario_id: currentUser ? currentUser.id : 2,
        estado: estado,
        notas: notas || `Ubicación actualizada en mapa`,
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud)
      }

      const res = await api.actualizarTracking(pedido.id, payload)
      if (res.success) {
        setSuccessMsg('✅ Geolocalización enviada y guardada en PostgreSQL DB')
        setNotas('')
        cargarHistorial()
        onTrackingUpdated()
      } else {
        setError(res.message || 'Error al actualizar geolocalización')
      }
    } catch (err) {
      setError('Error al conectar con la base de datos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <div className="modal-header">
          <h2>📍 Geolocalización por Pedido — {pedido.codigo}</h2>
          <p>Destino: 🏥 <strong>{pedido.destino_nombre}</strong></p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <div className="tracking-grid">
          {/* Columna Izquierda: Mapa Interactivo para Colocar Marcador */}
          <div className="tracking-form-card">
            <h3>👇 Haz clic en el mapa para colocar la ubicación exacta</h3>
            
            {isKeyProvided && isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={selectedPos}
                zoom={14}
                onClick={handleMapClick}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false
                }}
              >
                {/* Marcador Seleccionado (Camión de Entrega) */}
                <MarkerF
                  position={selectedPos}
                  title="Ubicación Seleccionada"
                  draggable={true}
                  onDragEnd={(e) => {
                    if (e.latLng) {
                      setLatitud(e.latLng.lat().toFixed(6))
                      setLongitud(e.latLng.lng().toFixed(6))
                    }
                  }}
                />

                {/* Marcador del Hospital Destino */}
                {destPos && (
                  <MarkerF
                    position={destPos}
                    title={`🏥 Hospital: ${pedido.destino_nombre}`}
                  />
                )}

                {/* Línea conectando la ubicación actual con el hospital */}
                {destPos && (
                  <PolylineF
                    path={[selectedPos, destPos]}
                    options={{
                      strokeColor: '#1a73e8',
                      strokeOpacity: 0.8,
                      strokeWeight: 4
                    }}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="map-loading">
                <p>{isKeyProvided ? 'Cargando mapa interactivo...' : '⚠️ Ingresa tu VITE_GOOGLE_MAPS_API_KEY en .env'}</p>
              </div>
            )}

            <div className="selected-coords-banner">
              📍 <strong>Ubicación colocada:</strong> Lat: {latitud}, Lng: {longitud}
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: '12px' }}>
              <div className="form-group">
                <label>Estado del Pedido</label>
                <select className="form-control" value={estado} onChange={(e) => setEstado(e.target.value)}>
                  <option value="CREADO">CREADO</option>
                  <option value="ASIGNADO">ASIGNADO</option>
                  <option value="EN_CAMINO">EN_CAMINO</option>
                  <option value="EN_ENTREGA">EN_ENTREGA</option>
                  <option value="ENTREGADO">ENTREGADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notas de la Ubicación</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Paquete en garita / En tránsito por Calzada Roosevelt"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleGetGPS}
                  style={{ flex: 1 }}
                >
                  📡 GPS del Navegador
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                  {loading ? 'Guardando...' : '💾 Guardar Geolocalización'}
                </button>
              </div>
            </form>
          </div>

          {/* Columna Derecha: Historial de Seguimiento */}
          <div className="tracking-history-card">
            <h3>📜 Historial en Base de Datos</h3>
            {historial.length === 0 ? (
              <p className="no-history">No hay registros de seguimiento aún.</p>
            ) : (
              <div className="timeline">
                {historial.map((h, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-badge">📍</div>
                    <div className="timeline-content">
                      <div className="timeline-top">
                        <span className={`status-badge status-${h.estado}`}>{h.estado}</span>
                        <small>{new Date(h.fecha_actualizacion).toLocaleTimeString()}</small>
                      </div>
                      <p className="timeline-notes">{h.notas || 'Sin notas'}</p>
                      <div className="timeline-coords">
                        GPS: <code>{h.latitud}, {h.longitud}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
