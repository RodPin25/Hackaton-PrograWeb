import React from 'react';
import './Navbar.css';

const TABS = ['Dashboard de envíos', 'Registrar medicina', 'Detalle de envío', 'Asistente IA'];

const iniciales = (user) =>
  `${(user?.nombres || 'U')[0]}${(user?.apellidos || '')[0] || ''}`.toUpperCase();

export default function Navbar({
  activeTab = 'Detalle de envío',
  onNavigate = () => {},
  user = { nombres: 'María', apellidos: 'Pérez' },
  onLogout = () => {}
}) {
  const nombre = `${user?.nombres || ''} ${user?.apellidos || ''}`.trim();

  return (
    <header className="meditrack-navbar">
      <div className="meditrack-nav-left">
        <a href="#dashboard" className="meditrack-nav-logo-box" onClick={() => onNavigate(TABS[0])}>
          <span className="meditrack-nav-logo-mt">MT</span>
          <span className="meditrack-nav-logo-divider"></span>
          <div className="meditrack-nav-logo-text-group">
            <span className="meditrack-nav-logo-title">MEDITRACK</span>
            <span className="meditrack-nav-logo-subtitle">MINSALUD GT</span>
          </div>
        </a>
      </div>

      <nav className="meditrack-nav-center">
        {TABS.map((tab) => (
          <a
            key={tab}
            href="#"
            className={`meditrack-nav-link ${activeTab === tab ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate(tab); }}
          >
            {tab}
          </a>
        ))}
      </nav>

      <div className="meditrack-nav-right">
        <div className="meditrack-search-wrapper">
          <span className="meditrack-search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input type="text" placeholder="Buscar medicamento..." className="meditrack-search-input" />
        </div>

        <div className="meditrack-user-profile">
          <span className="meditrack-user-avatar">{iniciales(user)}</span>
          <div className="meditrack-user-info">
            <span className="meditrack-user-name">{nombre}</span>
            <button type="button" className="meditrack-user-role meditrack-logout" onClick={onLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
