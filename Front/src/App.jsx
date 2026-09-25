import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import MapComponent from './components/MapComponent'
import LoginModal from './components/LoginModal'
import NuevoPedidoModal from './components/NuevoPedidoModal'
import RegistroUsuarioModal from './components/RegistroUsuarioModal'
import TrackingModal from './components/TrackingModal'
import { api } from './services/api'
import './App.css'

function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const [user, setUser] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [destinos, setDestinos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterEstado, setFilterEstado] = useState('ALL')

  // Modales
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isNuevoPedidoOpen, setIsNuevoPedidoOpen] = useState(false)
  const [isRegistroUsuarioOpen, setIsRegistroUsuarioOpen] = useState(false)
  const [trackingPedido, setTrackingPedido] = useState(null)

  useEffect(() => {
    checkMe()
    cargarDatos()
  }, [])

  const checkMe = async () => {
    try {
      const res = await api.getMe()
      if (res.success && res.user) {
        setUser(res.user)
      }
    } catch (e) {
      console.log('Sin usuario activo en sesión', e)
    }
  }

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [resPed, resDest] = await Promise.all([
        api.getPedidos(),
        api.getDestinos()
      ])
      if (resPed.data) setPedidos(resPed.data)
      if (resDest.data) setDestinos(resDest.data)
    } catch (e) {
      console.error('Error al cargar datos del backend:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
  }

  const filteredPedidos = pedidos.filter(p => {
    if (filterEstado === 'ALL') return true
    return p.estado_actual === filterEstado
  })

  return (
    <div className="app-layout">
      <Navbar
        user={user}
        onOpenNuevoPedido={() => setIsNuevoPedidoOpen(true)}
        onOpenRegistroUsuario={() => setIsRegistroUsuarioOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      <main className="app-main-content">
        {/* Sección Superior: Mapa interactivo de Geolocalización */}
        <section className="section-map">
          <div className="section-header">
            <h2>🗺️ Geolocalización en Tiempo Real</h2>
            <p>Monitoreo GPS de la posición actual de cada pedido en tránsito</p>
          </div>
          <MapComponent
            apiKey={apiKey}
            pedidos={pedidos}
            destinos={destinos}
            onSelectPedido={(p) => setTrackingPedido(p)}
          />
        </section>

        {/* Sección Inferior: Lista de Pedidos */}
        <section className="section-pedidos">
          <div className="pedidos-header">
            <div>
              <h2>📦 Gestión de Pedidos Hospitalarios</h2>
              <p>Conectado a PostgreSQL DB (`pedidos`, `pedidos_tracking` y `destinos`)</p>
            </div>

            <div className="pedidos-controls">
              <select
                className="form-control select-filter"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="ALL">🔍 Todos los Estados</option>
                <option value="CREADO">CREADO</option>
                <option value="ASIGNADO">ASIGNADO</option>
                <option value="EN_CAMINO">EN_CAMINO</option>
                <option value="EN_ENTREGA">EN_ENTREGA</option>
                <option value="ENTREGADO">ENTREGADO</option>
              </select>

              <button className="btn btn-outline" onClick={cargarDatos}>
                🔄 Recargar
              </button>

              <button className="btn btn-primary" onClick={() => setIsNuevoPedidoOpen(true)}>
                ➕ Nuevo Pedido
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <p>Cargando pedidos de la base de datos...</p>
            </div>
          ) : filteredPedidos.length === 0 ? (
            <div className="empty-card">
              <p>No hay pedidos registrados con el filtro seleccionado.</p>
            </div>
          ) : (
            <div className="pedidos-table-container">
              <table className="pedidos-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Hospital Destino</th>
                    <th>Estado</th>
                    <th>Repartidor</th>
                    <th>Insumos</th>
                    <th>Total</th>
                    <th>Última Coord. GPS</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPedidos.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong className="pedido-code">{p.codigo}</strong>
                        <div className="fecha-sm">{new Date(p.fecha_creacion).toLocaleDateString()}</div>
                      </td>
                      <td>
                        <div className="hospital-title">🏥 {p.destino_nombre}</div>
                      </td>
                      <td>
                        <span className={`status-badge status-${p.estado_actual}`}>
                          {p.estado_actual}
                        </span>
                      </td>
                      <td>🚚 {p.repartidor_nombre || 'Sin Asignar'}</td>
                      <td>
                        <div className="items-preview">
                          {p.items && p.items.map((it, idx) => (
                            <span key={idx} className="item-chip">
                              {it.producto_nombre} (x{it.cantidad})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <strong className="total-text">Q{parseFloat(p.total).toFixed(2)}</strong>
                      </td>
                      <td>
                        {p.ultima_latitud && p.ultima_longitud ? (
                          <small className="gps-text">
                            📍 {parseFloat(p.ultima_latitud).toFixed(4)}, {parseFloat(p.ultima_longitud).toFixed(4)}
                          </small>
                        ) : (
                          <small className="text-muted">Sin GPS</small>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => setTrackingPedido(p)}
                        >
                          📍 Geolocalización
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Modales */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(loggedUser) => setUser(loggedUser)}
      />

      <RegistroUsuarioModal
        isOpen={isRegistroUsuarioOpen}
        onClose={() => setIsRegistroUsuarioOpen(false)}
        onUsuarioRegistrado={() => cargarDatos()}
      />

      <NuevoPedidoModal
        isOpen={isNuevoPedidoOpen}
        onClose={() => setIsNuevoPedidoOpen(false)}
        onPedidoCreado={() => cargarDatos()}
        currentUser={user}
      />

      <TrackingModal
        isOpen={!!trackingPedido}
        onClose={() => setTrackingPedido(null)}
        pedido={trackingPedido}
        onTrackingUpdated={() => cargarDatos()}
        currentUser={user}
        apiKey={apiKey}
      />
    </div>
  )
}

export default App
