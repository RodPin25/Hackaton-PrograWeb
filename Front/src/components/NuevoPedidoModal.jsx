import React, { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function NuevoPedidoModal({ isOpen, onClose, onPedidoCreado, currentUser }) {
  const [destinos, setDestinos] = useState([])
  const [productos, setProductos] = useState([])
  const [repartidores, setRepartidores] = useState([])
  const [proveedores, setProveedores] = useState([])

  const [destinoId, setDestinoId] = useState('1')
  const [repartidorId, setRepartidorId] = useState('2')
  const [proveedorId, setProveedorId] = useState('1')
  const [notas, setNotas] = useState('')

  // Coordenadas GPS iniciales del pedido (por defecto Trébol/Ciudad Guatemala)
  const [latitudInicial, setLatitudInicial] = useState('14.615000')
  const [longitudInicial, setLongitudInicial] = useState('-90.535000')

  // Lista de items seleccionados
  const [selectedItems, setSelectedItems] = useState([
    { producto_id: 1, cantidad: 10, precio_unitario: 45.00 }
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      cargarCatalogos()
    }
  }, [isOpen])

  const cargarCatalogos = async () => {
    try {
      const [resDest, resProd, resRep, resProv] = await Promise.all([
        api.getDestinos(),
        api.getProductos(),
        api.getRepartidores(),
        api.getProveedores()
      ])

      if (resDest.data && resDest.data.length > 0) {
        setDestinos(resDest.data)
        setDestinoId(resDest.data[0].id.toString())
        if (resDest.data[0].latitud) setLatitudInicial(resDest.data[0].latitud.toString())
        if (resDest.data[0].longitud) setLongitudInicial(resDest.data[0].longitud.toString())
      }
      if (resProd.data && resProd.data.length > 0) {
        setProductos(resProd.data)
      }
      if (resRep.data && resRep.data.length > 0) {
        setRepartidores(resRep.data)
        setRepartidorId(resRep.data[0].id.toString())
      }
      if (resProv.data && resProv.data.length > 0) {
        setProveedores(resProv.data)
        setProveedorId(resProv.data[0].id.toString())
      }
    } catch (err) {
      setError('Error al cargar catálogos desde el servidor.')
    }
  }

  const handleDestinoChange = (idStr) => {
    setDestinoId(idStr)
    const dest = destinos.find(d => d.id.toString() === idStr)
    if (dest && dest.latitud && dest.longitud) {
      setLatitudInicial(dest.latitud.toString())
      setLongitudInicial(dest.longitud.toString())
    }
  }

  if (!isOpen) return null

  const handleAddItem = () => {
    if (productos.length > 0) {
      const prod = productos[0]
      setSelectedItems([
        ...selectedItems,
        { producto_id: prod.id, cantidad: 1, precio_unitario: parseFloat(prod.precio) }
      ])
    }
  }

  const handleRemoveItem = (index) => {
    if (selectedItems.length > 1) {
      setSelectedItems(selectedItems.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...selectedItems]
    if (field === 'producto_id') {
      const prod = productos.find(p => p.id.toString() === value.toString())
      newItems[index].producto_id = parseInt(value)
      if (prod) {
        newItems[index].precio_unitario = parseFloat(prod.precio)
      }
    } else if (field === 'cantidad') {
      newItems[index].cantidad = Math.max(1, parseInt(value) || 1)
    }
    setSelectedItems(newItems)
  }

  const calcularTotal = () => {
    return selectedItems.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        destino_id: parseInt(destinoId),
        usuario_id: currentUser ? currentUser.id : 1,
        repartidor_id: parseInt(repartidorId),
        proveedor_id: parseInt(proveedorId),
        notas_finales: notas,
        items: selectedItems,
        latitud_inicial: parseFloat(latitudInicial),
        longitud_inicial: parseFloat(longitudInicial)
      }

      const res = await api.crearPedido(payload)
      if (res.success) {
        onPedidoCreado()
        onClose()
      } else {
        setError(res.message || 'Error al crear el pedido')
      }
    } catch (err) {
      setError('Error al registrar pedido en la base de datos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <div className="modal-header">
          <h2>📦 Registrar Nuevo Pedido con Coordenadas GPS</h2>
          <p>Define el destino e ingresa las coordenadas iniciales de la entrega</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Hospital / Destino</label>
              <select
                className="form-control"
                value={destinoId}
                onChange={(e) => handleDestinoChange(e.target.value)}
                required
              >
                {destinos && destinos.length > 0 ? (
                  destinos.map(d => (
                    <option key={d.id} value={d.id}>
                      🏥 {d.nombre_hospital} ({d.municipio})
                    </option>
                  ))
                ) : (
                  <option value="1">🏥 Hospital General San Juan de Dios</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Repartidor Asignado</label>
              <select
                className="form-control"
                value={repartidorId}
                onChange={(e) => setRepartidorId(e.target.value)}
                required
              >
                {repartidores && repartidores.length > 0 ? (
                  repartidores.map(r => (
                    <option key={r.id} value={r.id}>
                      🚚 {r.nombres} {r.apellidos} ({r.nombre_rol || 'Usuario'})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="2">🚚 Carlos López (Repartidor)</option>
                    <option value="1">👑 Arturo Maldonado (Admin)</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Coordenadas Iniciales (Latitud, Longitud)</label>
              <div className="coord-inputs">
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="Latitud (ej. 14.6150)"
                  value={latitudInicial}
                  onChange={(e) => setLatitudInicial(e.target.value)}
                  required
                />
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="Longitud (ej. -90.5350)"
                  value={longitudInicial}
                  onChange={(e) => setLongitudInicial(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Proveedor</label>
              <select
                className="form-control"
                value={proveedorId}
                onChange={(e) => setProveedorId(e.target.value)}
              >
                {proveedores && proveedores.length > 0 ? (
                  proveedores.map(p => (
                    <option key={p.id} value={p.id}>
                      🏬 {p.nombre}
                    </option>
                  ))
                ) : (
                  <option value="1">🏬 Farmacéutica de Guatemala S.A. (FARMAGUA)</option>
                )}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Notas / Instrucciones de Entrega</label>
              <input
                type="text"
                className="form-control"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej. Prioridad alta en área de emergencia"
              />
            </div>
          </div>

          <div className="items-section">
            <div className="items-header">
              <h3>💊 Insumos del Pedido</h3>
              <button type="button" className="btn btn-sm btn-outline" onClick={handleAddItem}>
                ➕ Agregar Insumo
              </button>
            </div>

            {selectedItems.map((item, idx) => (
              <div key={idx} className="item-row">
                <select
                  className="form-control"
                  value={item.producto_id}
                  onChange={(e) => handleItemChange(idx, 'producto_id', e.target.value)}
                >
                  {productos && productos.length > 0 ? (
                    productos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} (Q{parseFloat(p.precio).toFixed(2)})
                      </option>
                    ))
                  ) : (
                    <option value="1">Paracetamol 500mg (Caja 100 tabletas) (Q45.00)</option>
                  )}
                </select>

                <input
                  type="number"
                  min="1"
                  className="form-control qty-input"
                  value={item.cantidad}
                  onChange={(e) => handleItemChange(idx, 'cantidad', e.target.value)}
                />

                <span className="subtotal-span">
                  Subtotal: Q{(item.cantidad * item.precio_unitario).toFixed(2)}
                </span>

                {selectedItems.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger-outline"
                    onClick={() => handleRemoveItem(idx)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}

            <div className="total-summary">
              <strong>Total del Pedido: Q{calcularTotal().toFixed(2)}</strong>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando en DB...' : '💾 Crear Pedido y Guardar en DB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
