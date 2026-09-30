import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NuevoPedidoModal from './components/NuevoPedidoModal'
import RegistroUsuarioModal from './components/RegistroUsuarioModal'
import TrackingModal from './components/TrackingModal'
import { api } from './services/api'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("Token");
      if (token) {
        setIsAuthenticated(true);
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
    <>
      <Dashboard user={user} onLogout={handleLogout} />
      {/* Aquí podrías renderizar condicionalmente los modales, pasándoles las props necesarias */}
    </>
  )
}

export default App
