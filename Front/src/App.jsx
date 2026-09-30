import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import DetalleEnvio from './pages/DetalleEnvio'
import Login from './pages/Login'
import NuevoPedidoModal from './components/NuevoPedidoModal'
import RegistroUsuarioModal from './components/RegistroUsuarioModal'
import TrackingModal from './components/TrackingModal'
import { api } from './services/api'
import DemoBar, { DemoMapa } from './demo/DemoBar'
import './App.css'

// Modo demo (npm run demo): sin login ni backend, solo el tracker con datos de ejemplo
const DEMO = import.meta.env.VITE_DEMO === 'true';
const USUARIO_DEMO = { nombres: 'María', apellidos: 'Pérez', nombre_rol: 'Demo' };

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(DEMO);
  const [user, setUser] = useState(DEMO ? USUARIO_DEMO : null);
  const [pedidoDemo, setPedidoDemo] = useState(1);

  const [tab, setTab] = useState('Detalle de envío');

  useEffect(() => {
    const checkAuth = async () => {
      if (DEMO) return;
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
          <DetalleEnvio
            key={DEMO ? pedidoDemo : 'real'}
            pedidoId={DEMO ? pedidoDemo : undefined}
            mapSlot={DEMO ? DemoMapa : null}
          />
        )}
      </main>

      {DEMO && <DemoBar pedidoId={pedidoDemo} onChange={setPedidoDemo} />}
    </div>
  )
}

export default App
