import React, { useState, useCallback, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '520px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
}

const defaultCenter = {
  lat: 14.615000,
  lng: -90.535000
}

export default function MapComponent({ apiKey, pedidos = [], destinos = [], onSelectPedido }) {
  const isKeyProvided = Boolean(apiKey && apiKey !== 'TU_GOOGLE_MAPS_API_KEY' && apiKey.trim() !== '')

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: isKeyProvided ? apiKey : ''
  })

  const [map, setMap] = useState(null)
  const [activeInfoWindow, setActiveInfoWindow] = useState(null)
  const [showHospitales, setShowHospitales] = useState(false)

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance)
  }, [])

  const onUnmount = useCallback(function callback() {
    setMap(null)
  }, [])

  useEffect(() => {
  if (!map) return
  const puntos = pedidos
    .map(p => ({
      lat: parseFloat(p.ultima_latitud ?? p.destino_latitud),
      lng: parseFloat(p.ultima_longitud ?? p.destino_longitud)
    }))
    .filter(pt => !isNaN(pt.lat) && !isNaN(pt.lng))

  if (puntos.length === 0) return

  const bounds = new window.google.maps.LatLngBounds()
  puntos.forEach(pt => bounds.extend(pt))
  map.fitBounds(bounds)

  if (puntos.length === 1) map.setZoom(15)
}, [map, pedidos])

  if (!isKeyProvided) {
    return (
      <div className="map-warning-card">
        <div className="warning-icon">⚠️</div>
        <h2>API Key de Google Maps no configurada</h2>
        <p>Abre el archivo <code>Front/.env</code> y coloca tu API Key de Google Maps:</p>
        <pre>VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui</pre>
        <p style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
          *(El resto de la aplicación y la tabla de pedidos con geolocalización sigue funcionando normalmente abajo).*
        </p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="map-error-card">
        <h2>Error al cargar Google Maps</h2>
        <p>{loadError.message}</p>
      </div>
    )
  }

  return isLoaded ? (
    <div className="map-wrapper">
      <div className="map-controls-bar">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={showHospitales}
            onChange={(e) => setShowHospitales(e.target.checked)}
          />
          Mostrar Hospitales Destino (🏥)
        </label>
        <span className="map-hint-text">
          📍 Mostrando únicamente la ubicación GPS actual por pedido ({pedidos.length})
        </span>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true
        }}
      >
        {/* Marcadores Opcionales de Hospitales */}
        {showHospitales && destinos.map(d => (
          d.latitud && d.longitud ? (
            <MarkerF
              key={`dest-${d.id}`}
              position={{ lat: parseFloat(d.latitud), lng: parseFloat(d.longitud) }}
              title={`🏥 ${d.nombre_hospital}`}
              onClick={() => setActiveInfoWindow({ type: 'hospital', data: d })}
            />
          ) : null
        ))}

        {/* Marcadores de Coordenada Única Actual por Pedido */}
        {pedidos.map(p => {
          const lat = p.ultima_latitud ? parseFloat(p.ultima_latitud) : (p.destino_latitud ? parseFloat(p.destino_latitud) : null)
          const lng = p.ultima_longitud ? parseFloat(p.ultima_longitud) : (p.destino_longitud ? parseFloat(p.destino_longitud) : null)
          if (!lat || !lng) return null

          return (
            <MarkerF
              key={`ped-${p.id}`}
              position={{ lat, lng }}
              title={`📍 Pedido ${p.codigo} (${p.estado_actual})`}
              onClick={() => setActiveInfoWindow({ type: 'pedido', data: p, lat, lng })}
            />
          )
        })}

        {/* InfoWindow Desplegable */}
        {activeInfoWindow && (
          <InfoWindowF
            position={{
              lat: activeInfoWindow.lat || defaultCenter.lat,
              lng: activeInfoWindow.lng || defaultCenter.lng
            }}
            onCloseClick={() => setActiveInfoWindow(null)}
          >
            <div className="info-window-content">
              {activeInfoWindow.type === 'hospital' ? (
                <div>
                  <h4 style={{ margin: '0 0 6px 0', color: '#1a73e8' }}>🏥 {activeInfoWindow.data.nombre_hospital}</h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>📍 {activeInfoWindow.data.direccion}</p>
                  <small style={{ color: '#666' }}>Municipio: {activeInfoWindow.data.municipio}</small>
                </div>
              ) : (
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#dc3545' }}>📦 Pedido: {activeInfoWindow.data.codigo}</h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>🏥 Destino: <strong>{activeInfoWindow.data.destino_nombre}</strong></p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Estado: <span className={`status-badge status-${activeInfoWindow.data.estado_actual}`}>{activeInfoWindow.data.estado_actual}</span></p>
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px' }}>Coordenada GPS Actual: <code>{activeInfoWindow.lat.toFixed(4)}, {activeInfoWindow.lng.toFixed(4)}</code></p>
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ width: '100%', padding: '6px 8px', fontSize: '12px', marginTop: '6px' }}
                    onClick={() => {
                      onSelectPedido(activeInfoWindow.data)
                      setActiveInfoWindow(null)
                    }}
                  >
                    📍 Mover Marcador en Mapa
                  </button>
                </div>
              )}
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  ) : (
    <div className="map-loading">
      <p>Cargando Google Maps...</p>
    </div>
  )
}
