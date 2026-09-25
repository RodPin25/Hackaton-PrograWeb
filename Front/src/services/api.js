const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const cleanUrl = rawUrl.replace(/\/+$/, '')
const API_BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`

const defaultHeaders = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
}

export const api = {
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({ username, password })
      })
      return await res.json()
    } catch (e) {
      return { success: false, message: 'No se pudo conectar con el servidor backend' }
    }
  },

  async registrarUsuario(usuarioData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(usuarioData)
      })
      return await res.json()
    } catch (e) {
      return { success: false, message: 'No se pudo conectar con el servidor backend' }
    }
  },

  async getRoles() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/roles`, { headers: defaultHeaders })
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getMe() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: defaultHeaders })
      return await res.json()
    } catch (e) {
      return { success: false }
    }
  },

  async getDestinos() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalogos/destinos`, { headers: defaultHeaders })
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getProductos() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalogos/productos`, { headers: defaultHeaders })
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getRepartidores() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalogos/repartidores`, { headers: defaultHeaders })
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getProveedores() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalogos/proveedores`, { headers: defaultHeaders })
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getPedidos() {
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos`, { headers: defaultHeaders })
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async crearPedido(pedidoData) {
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos`, {
        method: 'POST',
        headers: defaultHeaders,
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
        headers: defaultHeaders,
        body: JSON.stringify(trackingData)
      })
      return await res.json()
    } catch (e) {
      return { success: false, message: 'No se pudo conectar con el servidor backend' }
    }
  },

  async getHistorialTracking(pedidoId) {
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/tracking`, { headers: defaultHeaders })
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  }
}
