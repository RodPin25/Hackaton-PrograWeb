import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';
import { api } from '../services/api';
import './Dashboard.css';
import TrackingModal from '../components/TrackingModal';

export default function Dashboard({ user, onLogout }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const [pedidos, setPedidos] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

const cargarPedidos = async () => {
  const res = await api.getPedidos();
  if (res.success && res.data && res.data.length > 0) {
    setPedidos(res.data);
  } else {
    setPedidos(PEDIDOS_DEMO);
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
  return (
    <div className="dashboard-page">
      <Navbar 
        user={user} 
        onLogout={onLogout} 
        onOpenNuevoPedido={() => console.log('Abrir Nuevo Pedido')}
        onOpenRegistroUsuario={() => console.log('Abrir Registro')}
      />
      <TrackingModal
        isOpen={!!pedidoSeleccionado}
        onClose={() => setPedidoSeleccionado(null)}
        pedido={pedidoSeleccionado}
        onTrackingUpdated={cargarPedidos}
        currentUser={user}
        apiKey={apiKey}
      />
      
      <div className="dashboard-layout">
        <div className="dashboard-grid">
          
          {/* Lado Izquierdo: Pedidos */}
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
                      <tr key={p.id}>
                        <td className="pedido-code">#{p.codigo}</td>
                        <td className="hospital-title">{p.destino_nombre || 'Destino Desconocido'}</td>
                        <td>
                          <span className={`status-badge status-${p.estado_actual}`}>
                            {p.estado_actual}
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

          {/* Lado Derecho: Mapa */}
          <div className="section-map">
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>Mapa de Distribución</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#777' }}>Vista en tiempo real de los envíos</p>
            </div>
            <MapComponent 
            apiKey={apiKey}
            pedidos={pedidos} 
            destinos={destinos} 
            onSelectPedido={setPedidoSeleccionado}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
