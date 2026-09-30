import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';
import { api } from '../services/api';
import './Dashboard.css';
import NuevoPedidoModal from '../components/NuevoPedidoModal';
import DetalleEnvio from './DetalleEnvio';

export default function Dashboard({ user, onLogout }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [pedidos, setPedidos] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  
  // Estado para la navegación del Navbar
  const [activeTab, setActiveTab] = useState('Dashboard de Envíos');

  const cargarPedidos = async () => {
    const res = await api.getPedidos();
    if (res.success && res.data && res.data.length > 0) {
      setPedidos(res.data);
    } else {
      setPedidos([]);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  useEffect(() => {
    const fetchDestinos = async () => {
      const res = await api.getDestinos();
      if (res.success && res.data) setDestinos(res.data);
    };
    fetchDestinos();
  }, []);

  const renderContent = () => {
    if (activeTab === 'Detalles de Ruta') {
      const selectedId = pedidoSeleccionado?.id || pedidoSeleccionado?.id_pedido;
      const defaultId = pedidos.length > 0 ? (pedidos[0].id || pedidos[0].id_pedido) : null;
      
      return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <DetalleEnvio 
            pedidoId={selectedId || defaultId} 
            onVerMapa={() => setActiveTab('Dashboard de Envíos')}
            mapSlot={(coords) => (
              <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                <MapComponent 
                  apiKey={apiKey}
                  pedidos={pedidos} 
                  destinos={destinos}
                  onSelectPedido={(p) => {
                    setPedidoSeleccionado(p);
                  }}
                />
              </div>
            )}
          />
        </div>
      );
    }

    return (
      <div className="dashboard-layout">
        <div className="dashboard-grid">
          
          <div className="section-pedidos">
            <div className="pedidos-header">
              <h2>Pedidos Recientes</h2>
              <p>Listado de los pedidos en curso y su estado actual</p>
            </div>
            
            <div className="pedidos-table-container">
              <table className="pedidos-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Hospital / Destino</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.length > 0 ? (
                    pedidos.map(p => (
                      <tr 
                        key={p.id || p.id_pedido} 
                        onClick={() => {
                          setPedidoSeleccionado(p);
                          setActiveTab('Detalles de Ruta');
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="pedido-code">#{p.codigo || p.id_pedido}</td>
                        <td className="hospital-title">{p.destino_nombre || p.nombre_destino || 'Destino Desconocido'}</td>
                        <td>
                          <span className={`status-badge status-${p.estado_actual || p.estado}`}>
                            {p.estado_actual || p.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: '#777' }}>
                        No hay pedidos registrados en el sistema.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section-map">
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>Mapa de Distribución</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#777' }}>Vista en tiempo real de los envíos</p>
            </div>
            <MapComponent 
              apiKey={apiKey}
              pedidos={pedidos} 
              destinos={destinos} 
              onSelectPedido={(p) => {
                setPedidoSeleccionado(p);
                setActiveTab('Detalles de Ruta');
              }}
            />
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <Navbar 
        activeTab={activeTab}
        onNavigate={setActiveTab}
        user={user} 
        onLogout={onLogout} 
      />
      
      <NuevoPedidoModal 
        isOpen={activeTab === 'Registrar Medicina'} 
        onClose={() => setActiveTab('Dashboard de Envíos')}
        onPedidoCreado={cargarPedidos}
        currentUser={user}
      />

      {renderContent()}
    </div>
  );
}
