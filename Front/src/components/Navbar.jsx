import React from 'react'

export default function Navbar({ user, onOpenNuevoPedido, onOpenRegistroUsuario, onLogout, onOpenLogin }) {
  return (
    <header className="main-navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🚚📍</span>
        <div className="brand-text">
          <h1>TrackMed Guatemala</h1>
          <p>Rastreo y Geolocalización de Pedidos Hospitalarios</p>
        </div>
      </div>

      <div className="navbar-actions">
        {user ? (
          <>
            <button className="btn btn-primary" onClick={onOpenNuevoPedido}>
              ➕ Nuevo Pedido
            </button>
            <button className="btn btn-outline" onClick={onOpenRegistroUsuario}>
              👤 Nuevo Usuario
            </button>
            <div className="user-profile-badge">
              <span className="user-avatar">👤</span>
              <div className="user-info">
                <span className="user-name">{user.nombres} {user.apellidos}</span>
                <span className="user-role">{user.nombre_rol || 'Usuario'}</span>
              </div>
            </div>
            <button className="btn btn-outline" onClick={onLogout} title="Cerrar sesión">
              🚪 Salir
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-outline" onClick={onOpenRegistroUsuario}>
              👤 Crear Cuenta
            </button>
            <button className="btn btn-primary" onClick={onOpenLogin}>
              🔐 Iniciar Sesión
            </button>
          </>
        )}
      </div>
    </header>
  )
}
