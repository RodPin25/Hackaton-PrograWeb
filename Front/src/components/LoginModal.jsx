import React, { useState } from 'react'
import { api } from '../services/api'

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('arturo.maldonado@gmail.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.login(username, password)
      if (res.success && res.user) {
        onLoginSuccess(res.user)
        onClose()
      } else {
        setError(res.detail || res.message || 'Credenciales inválidas')
      }
    } catch (err) {
      setError('Error de conexión con el servidor backend.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoUser = (demoUsername) => {
    setUsername(demoUsername)
    setPassword('admin123')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <div className="modal-header">
          <h2>🔐 Iniciar Sesión</h2>
          <p>Conéctate al sistema de rastreo de pedidos</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Usuario / Correo</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: arturo.maldonado@gmail.com"
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

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="demo-accounts">
          <p className="demo-title">Acceso rápido con usuarios demo de DB:</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => handleDemoUser('arturo.maldonado@gmail.com')}
            >
              👑 Admin (Arturo)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => handleDemoUser('carlos.repartidor@gmail.com')}
            >
              🚚 Repartidor (Carlos)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => handleDemoUser('maria.gonzalez@hospital.gob.gt')}
            >
              🏥 Encargada Hospital
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
