import { mockGetPedidos, mockGetHistorial } from '../demo/mockEnvio'

const DEMO = import.meta.env.VITE_DEMO === 'true' // npm run demo
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = {
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return await res.json()
    } catch (e) {
      return { success: false, message: 'No se pudo conectar con el servidor backend' }
    }
  },

  async registrarUsuario(usuarioData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioData)
      })
      return await res.json()
    } catch (e) {
      return { success: false, message: 'No se pudo conectar con el servidor backend' }
    }
  },

  async getRoles() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/roles`)
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getMe() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`)
      return await res.json()
    } catch (e) {
      return { success: false }
    }
  },

  async getDestinos() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalogos/destinos`)
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getProductos() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalogos/productos`)
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getRepartidores() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalogos/repartidores`)
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getProveedores() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalogos/proveedores`)
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getPedidos() {
    if (DEMO) return mockGetPedidos()
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos`)
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async crearPedido(pedidoData) {
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData)
      })
      return await res.json()
    } catch (e) {
      return { success: false, message: 'No se pudo conectar con el servidor backend' }
    }
  },

  async actualizarTracking(pedidoId, trackingData) {
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      })
      return await res.json()
    } catch (e) {
      return { success: false, message: 'No se pudo conectar con el servidor backend' }
    }
  },

  async getHistorialTracking(pedidoId) {
    if (DEMO) return mockGetHistorial(pedidoId)
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/tracking`)
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  }
}
