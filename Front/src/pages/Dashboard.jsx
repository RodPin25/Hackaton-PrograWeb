import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';
import { api } from '../services/api';
import './Dashboard.css';

export default function Dashboard({ user, onLogout }) {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      const res = await api.getPedidos();
      if (res.success && res.data) {
        setPedidos(res.data);
      }
    };
    fetchPedidos();
  }, []);

  return (
    <div className="dashboard-page">
      <Navbar 
        user={user} 
        onLogout={onLogout} 
        onOpenNuevoPedido={() => console.log('Abrir Nuevo Pedido')}
        onOpenRegistroUsuario={() => console.log('Abrir Registro')}
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
                      <tr key={p.id_pedido}>
                        <td className="pedido-code">#{p.id_pedido}</td>
                        <td className="hospital-title">{p.nombre_destino || 'Destino Desconocido'}</td>
                        <td>
                          <span className={`status-badge status-${p.estado}`}>
                            {p.estado}
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
            <MapComponent pedidos={pedidos} />
          </div>

        </div>
      </div>
    </div>
  );
}
