import React, { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function RegistroUsuarioModal({ isOpen, onClose, onUsuarioRegistrado }) {
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [correo, setCorreo] = useState('')
  const [numero, setNumero] = useState('')
  const [dpi, setDpi] = useState('')
  const [rolId, setRolId] = useState('2') // Default Repartidor
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      cargarRoles()
    }
  }, [isOpen])

  const cargarRoles = async () => {
    try {
      const res = await api.getRoles()
      if (res.data) setRoles(res.data)
    } catch (err) {
      console.error('Error al cargar roles', err)
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      const payload = {
        nombres,
        apellidos,
        correo,
        numero: numero || null,
        dpi: dpi || null,
        rol_id: parseInt(rolId),
        username,
        password
      }

      const res = await api.registrarUsuario(payload)
      if (res.success) {
        setSuccessMsg(`✅ ${res.message}`)
        setTimeout(() => {
          onUsuarioRegistrado()
          onClose()
        }, 1200)
      } else {
        setError(res.detail || res.message || 'Error al registrar usuario')
      }
    } catch (err) {
      setError('Error al conectar con la base de datos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <div className="modal-header">
          <h2>👤 Registrar Nuevo Usuario en DB</h2>
          <p>Crea usuarios con credenciales y rol (ADMIN, REPARTIDOR, ENCARGADO_HOSPITAL)</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nombres</label>
              <input
                type="text"
                className="form-control"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="Ej. Juan Pedro"
                required
              />
            </div>

            <div className="form-group">
              <label>Apellidos</label>
              <input
                type="text"
                className="form-control"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej. Pérez Gómez"
                required
              />
            </div>

            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="juan.perez@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Número Telefónico</label>
              <input
                type="text"
                className="form-control"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ej. 55123456"
              />
            </div>

            <div className="form-group">
              <label>DPI / Documento</label>
              <input
                type="text"
                className="form-control"
                value={dpi}
                onChange={(e) => setDpi(e.target.value)}
                placeholder="Ej. 2745995970101"
              />
            </div>

            <div className="form-group">
              <label>Rol del Usuario</label>
              <select
                className="form-control"
                value={rolId}
                onChange={(e) => setRolId(e.target.value)}
                required
              >
                {roles.length > 0 ? (
                  roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.nombre_rol}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">ADMIN</option>
                    <option value="2">REPARTIDOR</option>
                    <option value="3">ENCARGADO_HOSPITAL</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Nombre de Usuario (Username)</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. jperez"
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando en DB...' : '💾 Registrar Usuario en DB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
