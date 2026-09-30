import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Navbar.css';

const TABS = ['Dashboard de Envíos','Registrar Medicina', 'Detalles de Ruta' ]

export default function Navbar({ 
  activeTab = 'Dashboard de Envíos', 
  avatarUrl = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
  onNavigate = () => {}, 
  onLogout 
}) {
  const [userName, setUserName] = useState('Cargando...');
  const [userRole, setUserRole] = useState('...');
  const iniciales = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUserName(`${res.user.nombres} ${res.user.apellidos}`);
        setUserRole(res.user.nombre_rol);
      } else {
        setUserName('Usuario');
        setUserRole('Autenticado');
      }
    };
    fetchUser();
  }, []);

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
          <span className="meditrack-user-avatar">{iniciales}</span>
          <div className="meditrack-user-info">
            <span className="meditrack-user-name">{userName}</span>
            <button type="button" className="meditrack-user-role meditrack-logout" onClick={onLogout}>
              Cerrar sesión
            </button>
          </div>
          <button 
            onClick={onLogout}
            className="meditrack-logout-btn"
            title="Cerrar Sesión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
