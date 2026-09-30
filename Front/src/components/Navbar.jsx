import React from 'react';
import './Navbar.css';

export default function Navbar({ 
  activeTab = 'Dashboard de Envíos', 
  userName = 'Dra. María Flores', 
  userRole = 'Admin Guatemala', 
  avatarUrl = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80' 
}) {
  return (
    <header className="meditrack-navbar">
      {/* Sección Izquierda: Logotipo */}
      <div className="meditrack-nav-left">
        <a href="#dashboard" className="meditrack-nav-logo-box">
          <span className="meditrack-nav-logo-mt">MT</span>
          <span className="meditrack-nav-logo-divider"></span>
          <div className="meditrack-nav-logo-text-group">
            <span className="meditrack-nav-logo-title">MEDITRACK</span>
            <span className="meditrack-nav-logo-subtitle">MINSALUD GT</span>
          </div>
        </a>
      </div>

      {/* Sección Central: Enlaces de Navegación */}
      <nav className="meditrack-nav-center">
        <a 
          href="#dashboard" 
          className={`meditrack-nav-link ${activeTab === 'Dashboard de Envíos' ? 'active' : ''}`}
        >
          Dashboard de Envíos
        </a>
        <a 
          href="#registrar" 
          className={`meditrack-nav-link ${activeTab === 'Registrar Medicina' ? 'active' : ''}`}
        >
          Registrar Medicina
        </a>
        <a 
          href="#detalles" 
          className={`meditrack-nav-link ${activeTab === 'Detalles de Ruta' ? 'active' : ''}`}
        >
          Detalles de Ruta
        </a>
      </nav>

      {/* Sección Derecha: Buscador y Perfil de Usuario */}
      <div className="meditrack-nav-right">
        <div className="meditrack-search-wrapper">
          <span className="meditrack-search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="Buscar envíos o lotes..." 
            className="meditrack-search-input"
          />
        </div>

        <div className="meditrack-user-profile">
          <img 
            src={avatarUrl} 
            alt={userName} 
            className="meditrack-user-avatar" 
          />
          <div className="meditrack-user-info">
            <span className="meditrack-user-name">{userName}</span>
            <span className="meditrack-user-role">{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
}