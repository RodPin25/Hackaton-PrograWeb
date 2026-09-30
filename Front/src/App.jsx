import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import DetalleEnvio from './pages/DetalleEnvio'
import Login from './pages/Login'
import NuevoPedidoModal from './components/NuevoPedidoModal'
import RegistroUsuarioModal from './components/RegistroUsuarioModal'
import TrackingModal from './components/TrackingModal'
import { api } from './services/api'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [tab, setTab] = useState('Detalle de envío');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("Token");
      if (token) {
        setIsAuthenticated(true);
        // Opcional: Obtener datos del usuario logueado
        // const res = await api.getMe();
        // if(res.success) setUser(res.data);
        setUser({ nombres: 'Usuario', apellidos: '', nombre_rol: 'Autenticado' });
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setUser({ nombres: 'Usuario', apellidos: '', nombre_rol: 'Autenticado' });
  };

  const handleLogout = () => {
    localStorage.removeItem("Token");
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Navbar
        activeTab={tab}
        onNavigate={setTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {tab === 'Detalle de envío' && (
          // mapSlot: aquí se inyecta el mapa (quien lo implemente solo pasa su componente)
          <DetalleEnvio mapSlot={null} />
        )}
      </main>
    </div>
  )
}

export default App
